import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const rawToken = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.VITE_SANITY_TOKEN || '';
const TOKEN = rawToken.startsWith('sk') ? rawToken : undefined;

// Streams a Sanity CDN image through our server so the browser never needs
// its own token — required once the dataset is private (the asset CDN
// enforces the same visibility as the document API). Restricted to
// cdn.sanity.io to avoid becoming an open image-fetching proxy.
export async function GET(req) {
    const target = new URL(req.url).searchParams.get('url');
    if (!target) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    let parsed;
    try {
        parsed = new URL(target);
    } catch {
        return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }
    if (parsed.hostname !== 'cdn.sanity.io') {
        return NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
    }

    try {
        const upstream = await fetch(parsed.toString(), {
            headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
        });
        if (!upstream.ok || !upstream.body) {
            return NextResponse.json({ error: 'Image not found' }, { status: upstream.status || 502 });
        }

        return new NextResponse(upstream.body, {
            headers: {
                'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
                // Sanity asset URLs are content-addressed (hash in the path) —
                // safe to cache essentially forever.
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (err) {
        console.error('Image proxy error:', err);
        return NextResponse.json({ error: 'Gagal memuat gambar.' }, { status: 500 });
    }
}
