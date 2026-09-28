import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { serverClient } from '@/lib/sanityServer';
import { proxyImageUrl } from '@/lib/imageProxy';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req) {
    const session = await requireAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file || typeof file.arrayBuffer !== 'function') {
            return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
        }
        if (file.size > MAX_FILE_BYTES) {
            return NextResponse.json({ error: 'File maksimal 8MB.' }, { status: 400 });
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Format harus JPG, PNG, atau WEBP.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const asset = await serverClient.assets.upload('image', buffer, {
            filename: file.name,
            contentType: file.type,
        });

        return NextResponse.json({ success: true, asset: { _id: asset._id, url: proxyImageUrl(asset.url) } });
    } catch (err) {
        console.error('Admin upload error:', err);
        return NextResponse.json({ error: 'Gagal upload: ' + err.message }, { status: 500 });
    }
}
