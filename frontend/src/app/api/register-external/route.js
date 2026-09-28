import { NextResponse } from 'next/server';
import { appendRow, uploadFileToDrive } from '@/lib/googleService';
import { studentApi } from '@/lib/studentApi';

export const runtime = 'nodejs';

const SPREADSHEET_ID = '1Z-cBQ1D8uQQ0lKga-EEj00tnvIdtiByU6VtTgsBCWG0';
const DRIVE_FOLDER_ID = '1Oi0PKnmcT_y0fcAJeFT9hSlkG7YAjV1-';
const SHEET_RANGE = 'Data!A:R';

const sanitize = (s) => String(s || '').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// ponytail: in-memory per-IP limiter, good enough for a single-instance school
// site; swap for a shared store (Redis/Upstash) if this ever runs multi-instance.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitHits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const hits = (rateLimitHits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    hits.push(now);
    rateLimitHits.set(ip, hits);
    return hits.length > RATE_LIMIT_MAX;
}

export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ success: false, error: 'Terlalu banyak percobaan, coba lagi nanti.' }, { status: 429 });
        }

        const formData = await req.formData();
        const studentName = formData.get('name') || '';
        const parentName = formData.get('parentName') || '';
        const nik = formData.get('nik') || '';
        const file = formData.get('paymentProof');

        // Duplicate-submission guard: parents re-submitting the whole form
        // after a slow/unclear response created repeat records (same child,
        // same NIK, minutes apart) in both Sheets and the database. Treat a
        // resubmission as a no-op success instead of creating another one.
        if (nik) {
            const existing = await studentApi.findByNik(nik).catch(() => null);
            if (existing) {
                return NextResponse.json({ success: true, studentId: existing.id, alreadyRegistered: true });
            }
        }

        let driveLink = '';
        if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
            if (file.size > MAX_FILE_BYTES) {
                return NextResponse.json({ success: false, error: 'File bukti bayar maksimal 5MB.' }, { status: 400 });
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json({ success: false, error: 'Format file harus JPG, PNG, atau PDF.' }, { status: 400 });
            }
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = (file.name || '').split('.').pop() || 'jpg';
            const filename = `${sanitize(studentName)}_${sanitize(parentName)}_${Date.now()}.${ext}`;
            const uploaded = await uploadFileToDrive(DRIVE_FOLDER_ID, filename, file.type || 'application/octet-stream', buffer);
            driveLink = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
        }

        const row = [
            new Date().toISOString(),
            studentName,
            formData.get('gender') || '',
            formData.get('birthPlace') || '',
            formData.get('birthDate') || '',
            nik,
            formData.get('nisn') || '',
            formData.get('schoolName') || '',
            formData.get('address') || '',
            formData.get('city') || '',
            formData.get('province') || '',
            parentName,
            formData.get('whatsapp') || '',
            formData.get('parentJob') || '',
            formData.get('year') || '',
            formData.get('wave') || '',
            driveLink,
            driveLink ? 'Terverifikasi' : 'Pending',
        ];
        await appendRow(SPREADSHEET_ID, SHEET_RANGE, row);

        const studentId = `REG-${Date.now().toString().slice(-6)}`;
        // PII lives only here — the school's own self-hosted store, never Sanity.
        await studentApi.create({
            id: studentId,
            name: studentName,
            gender: formData.get('gender') || '',
            birthPlace: formData.get('birthPlace') || '',
            birthDate: formData.get('birthDate') || '',
            nik: nik,
            nisn: formData.get('nisn') || '',
            school: formData.get('schoolName') || '',
            address: formData.get('address') || '',
            city: formData.get('city') || '',
            province: formData.get('province') || '',
            parentName,
            whatsapp: formData.get('whatsapp') || '',
            parentJob: formData.get('parentJob') || '',
            nikAyah: formData.get('nikAyah') || '',
            nikIbu: formData.get('nikIbu') || '',
            year: formData.get('year') || '',
            wave: formData.get('wave') || '',
            status: 'Lolos',
            score: 'B',
            paymentProof: driveLink,
            externalImage: driveLink,
            registrationDate: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, driveLink, studentId });
    } catch (err) {
        console.error('register-external error:', err);
        return NextResponse.json({ success: false, error: 'Gagal menyimpan data ke Sheets/Drive.' }, { status: 500 });
    }
}
