import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';
import { studentApi } from '@/lib/studentApi';

export const runtime = 'nodejs';

// Generic batch mutation endpoint for the admin dashboard. Body shape:
//   { deletes?: {type: string, id: string}[], creates?: object[], patches?: {id: string, set: object}[] }
// 'student' items are routed to the self-hosted student-api; everything
// else goes to Sanity. Restricted to known document types so a compromised
// admin session can't be used to write arbitrary Sanity document types.
const SANITY_TYPES = new Set(['gallery', 'teacher', 'yearConfig', 'contactMessage']);

export async function POST(req) {
    const jar = await cookies();
    const session = readSession(jar);
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
        const sanityCreates = creates.filter(d => d._type !== 'student');
        const studentPatches = patches.filter(p => p.set?._type === 'student');
        const sanityPatches = patches.filter(p => p.set?._type !== 'student');
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
