import { NextResponse } from 'next/server';
import { uploadFileToDrive } from '@/lib/googleService';
import { studentApi } from '@/lib/studentApi';
import { createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const DRIVE_FOLDER_ID = '1Oi0PKnmcT_y0fcAJeFT9hSlkG7YAjV1-';

const sanitize = (s) => String(s || '').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

// Matches the fields in components/Registration/index.jsx's emptyFormData(),
// minus name/nik (handled separately above).
const FORM_FIELDS = [
    'gender', 'birthPlace', 'birthDate', 'nisn', 'religion', 'kip', 'childOrder', 'siblingOf',
    'siblingsCount', 'dailyLanguage', 'height', 'weight', 'studentPhone',
    'schoolName', 'schoolAddress', 'schoolNpsn', 'graduationYear',
    'address', 'city', 'province',
    'parentName', 'whatsapp', 'parentJob',
    'nikAyah', 'fatherName', 'fatherBirthInfo', 'fatherEducation', 'fatherJob', 'fatherIncome', 'fatherPhone', 'fatherStatus',
    'nikIbu', 'motherName', 'motherBirthInfo', 'motherEducation', 'motherJob', 'motherIncome', 'motherPhone', 'motherStatus',
    'year', 'wave',
];

export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ success: false, error: 'Terlalu banyak percobaan, coba lagi nanti.' }, { status: 429 });
        }

        const formData = await req.formData();
        const studentName = formData.get('name') || '';
        const nik = formData.get('nik') || '';
        const file = formData.get('paymentProof');
        const fields = Object.fromEntries(FORM_FIELDS.map(f => [f, formData.get(f) || '']));

        // Duplicate-submission guard: parents re-submitting the whole form
        // after a slow/unclear response created repeat records (same child,
        // same NIK, minutes apart) created repeat records. Treat a
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
            const filename = `${sanitize(studentName)}_${sanitize(fields.parentName)}_${Date.now()}.${ext}`;
            const uploaded = await uploadFileToDrive(DRIVE_FOLDER_ID, filename, file.type || 'application/octet-stream', buffer);
            driveLink = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
        }

        const studentId = `REG-${Date.now().toString().slice(-6)}`;
        // PII lives only here — the school's own self-hosted store, never Sanity.
        await studentApi.create({
            id: studentId,
            name: studentName,
            nik,
            school: fields.schoolName,
            ...fields,
            status: 'Lolos',
            score: 'B',
            paymentProof: driveLink,
            externalImage: driveLink,
            registrationDate: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, driveLink, studentId });
    } catch (err) {
        console.error('register-external error:', err);
        return NextResponse.json({ success: false, error: 'Gagal menyimpan data pendaftaran.' }, { status: 500 });
    }
}
