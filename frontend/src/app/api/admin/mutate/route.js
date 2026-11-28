import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';
import { studentApi } from '@/lib/studentApi';
import { nisHash, normalizeNis, seal } from '@/lib/profileCrypto';

export const runtime = 'nodejs';

// studentProfile docs live in a public-read dataset: identifying fields are
// sealed before they reach Sanity (see lib/profileCrypto.js).
function sealProfile(doc) {
    const { nis, nisn, name, pdfLink, ...rest } = doc;
    if (!/^\d{3,25}$/.test(normalizeNis(nis))) throw new Error('NIS harus berupa angka (3-25 digit) untuk setiap profil.');
    if (nisn && !/^\d{3,25}$/.test(normalizeNis(nisn))) throw new Error('NISN harus berupa angka (3-25 digit).');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(rest.period || '')) throw new Error('Periode profil (bulan dan tahun) tidak valid.');
    if (pdfLink && !/^https?:\/\/\S+$/i.test(pdfLink)) throw new Error('Link PDF harus diawali http:// atau https://.');
    // null (not omitted) so a patch clears a removed NISN.
    return { ...rest, nisHash: nisHash(nis), nisnHash: nisn ? nisHash(nisn) : null, blob: seal({ nis: normalizeNis(nis), nisn: nisn ? normalizeNis(nisn) : '', name, pdfLink }) };
}

// Generic batch mutation endpoint for the admin dashboard. Body shape:
//   { deletes?: {type: string, id: string}[], creates?: object[], patches?: {id: string, set: object}[] }
// 'student' items are routed to the self-hosted student-api; everything
// else goes to Sanity. Restricted to known document types so a compromised
// admin session can't be used to write arbitrary Sanity document types.
const SANITY_TYPES = new Set(['gallery', 'teacher', 'yearConfig', 'contactMessage', 'studentProfile']);

export async function POST(req) {
    const session = await requireAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { deletes = [], creates = [], patches = [] } = await req.json();

        for (const doc of creates) {
            if (doc._type !== 'student' && !SANITY_TYPES.has(doc._type)) {
                return NextResponse.json({ error: `Tipe dokumen tidak diizinkan: ${doc._type}` }, { status: 400 });
            }
        }
        for (const p of patches) {
            const type = p.set?._type;
            if (type && type !== 'student' && !SANITY_TYPES.has(type)) {
                return NextResponse.json({ error: `Tipe dokumen tidak diizinkan: ${type}` }, { status: 400 });
            }
        }
        for (const d of deletes) {
            if (d.type !== 'student' && !SANITY_TYPES.has(d.type)) {
                return NextResponse.json({ error: `Tipe dokumen tidak diizinkan: ${d.type}` }, { status: 400 });
            }
        }

        const studentCreates = creates.filter(d => d._type === 'student');
        const toSanity = (doc) => (doc._type === 'studentProfile' ? sealProfile(doc) : doc);
        const sanityCreates = creates.filter(d => d._type !== 'student').map(toSanity);
        const studentPatches = patches.filter(p => p.set?._type === 'student');
        const sanityPatches = patches.filter(p => p.set?._type !== 'student').map(p => ({ ...p, set: toSanity(p.set) }));
        const studentDeletes = deletes.filter(d => d.type === 'student');
        const sanityDeletes = deletes.filter(d => d.type !== 'student');

        await Promise.all([
            ...studentCreates.map(doc => studentApi.create(doc)),
            ...studentPatches.map(p => studentApi.patch(p.id, p.set)),
            ...studentDeletes.map(d => studentApi.remove(d.id)),
        ]);

        let result = null;
        if (sanityCreates.length || sanityPatches.length || sanityDeletes.length) {
            let transaction = serverClient.transaction();
            sanityDeletes.forEach(({ id }) => { transaction = transaction.delete(id); });
            sanityCreates.forEach(doc => { transaction = transaction.create(doc); });
            sanityPatches.forEach(({ id, set }) => { transaction = transaction.patch(id, p => p.set(set)); });
            result = await transaction.commit();
        }

        return NextResponse.json({ success: true, result });
    } catch (err) {
        console.error('Admin mutate error:', err);
        return NextResponse.json({ error: 'Gagal menyimpan perubahan: ' + err.message }, { status: 500 });
    }
}
