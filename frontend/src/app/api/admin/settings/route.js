import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';

export const runtime = 'nodejs';

// Singleton "website-settings" doc — separate from the generic mutate
// endpoint because a singleton needs create-if-missing-then-patch, not a
// plain create/patch/delete.
const SETTINGS_ID = 'website-settings';

export async function POST(req) {
    const session = await requireAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const allowed = ['registrationEnabled', 'brochureUrl', 'structureUrl'];
        const set = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

        await serverClient.createIfNotExists({ _id: SETTINGS_ID, _type: 'settings' });
        await serverClient.patch(SETTINGS_ID).set(set).commit();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Admin settings update error:', err);
        return NextResponse.json({ error: 'Gagal menyimpan pengaturan: ' + err.message }, { status: 500 });
    }
}
