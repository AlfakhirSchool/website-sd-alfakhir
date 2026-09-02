#!/usr/bin/env node
// One-time migration: pulls every `student` document out of Sanity and
// pushes it into the self-hosted student-api. Run this once, after
// student-api is deployed and reachable, then never again (new
// registrations go straight to student-api from that point on).
//
// Usage:
//   SANITY_TOKEN=sk... STUDENT_API_URL=https://... STUDENT_API_KEY=... \
//     node scripts/migrate-students-to-student-api.mjs [--dry-run]
//
// Safe to re-run: existing _id's are skipped (student-api's primary key
// rejects duplicates), so a partial/failed run can just be re-run.

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || 'dkgrjdjy';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN || process.env.NEXT_PUBLIC_SANITY_TOKEN;
const STUDENT_API_URL = process.env.STUDENT_API_URL;
const STUDENT_API_KEY = process.env.STUDENT_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SANITY_TOKEN) throw new Error('Set SANITY_TOKEN (or NEXT_PUBLIC_SANITY_TOKEN)');
if (!DRY_RUN && (!STUDENT_API_URL || !STUDENT_API_KEY)) {
    throw new Error('Set STUDENT_API_URL and STUDENT_API_KEY (or pass --dry-run)');
}

const QUERY = '*[_type == "student"]{_id, id, name, gender, birthPlace, birthDate, nik, nisn, school, schoolName, address, city, province, parentName, whatsapp, parentJob, nikAyah, nikIbu, year, wave, status, score, pdfLink, paymentProof, externalImage, note, registrationDate}';

async function fetchStudents() {
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-03-12/data/query/${SANITY_DATASET}?query=${encodeURIComponent(QUERY)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } });
    if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
    const { result } = await res.json();
    return result;
}

async function pushStudent(doc) {
    const res = await fetch(`${STUDENT_API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STUDENT_API_KEY}` },
        body: JSON.stringify(doc),
    });
    if (res.status === 500) {
        const body = await res.json().catch(() => ({}));
        if (String(body.error || '').includes('UNIQUE constraint')) return 'skipped (already migrated)';
        throw new Error(`student-api rejected ${doc._id}: ${res.status} ${JSON.stringify(body)}`);
    }
    if (!res.ok) throw new Error(`student-api rejected ${doc._id}: ${res.status} ${await res.text()}`);
    return 'migrated';
}

const students = await fetchStudents();
console.log(`Found ${students.length} student documents in Sanity.`);

if (DRY_RUN) {
    console.log('--dry-run: not writing anything. Sample record:', students[0]);
    process.exit(0);
}

let migrated = 0, skipped = 0, failed = 0;
for (const doc of students) {
    try {
        const outcome = await pushStudent(doc);
        if (outcome.startsWith('skipped')) skipped++; else migrated++;
        console.log(`${doc.id || doc._id}: ${outcome}`);
    } catch (err) {
        failed++;
        console.error(`${doc.id || doc._id}: FAILED — ${err.message}`);
    }
}

console.log(`\nDone. migrated=${migrated} skipped=${skipped} failed=${failed} total=${students.length}`);
if (failed > 0) process.exitCode = 1;
