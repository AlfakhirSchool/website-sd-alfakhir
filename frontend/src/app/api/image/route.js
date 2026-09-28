import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const rawToken = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.VITE_SANITY_TOKEN || '';
const TOKEN = rawToken.startsWith('sk') ? rawToken : undefined;

// Streams an image through our server so the browser never needs its own
// token/referrer — required for Sanity once the dataset is private (the
// asset CDN enforces the same visibility as the document API), and for
// lh3.googleusercontent.com because Chrome's Opaque Response Blocking
// rejects it as a direct <img src> when the request carries our site's
// Referer header. Restricted to this allowlist to avoid becoming an open
// image-fetching proxy.
const ALLOWED_HOSTS = ['cdn.sanity.io', 'lh3.googleusercontent.com'];

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
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        return NextResponse.json({ error: 'Host not allowed' }, { status: 400 });
    }

    try {
        const isSanity = parsed.hostname === 'cdn.sanity.io';
        const upstream = await fetch(parsed.toString(), {
            headers: isSanity && TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
        });
        if (!upstream.ok || !upstream.body) {
            return NextResponse.json({ error: 'Image not found' }, { status: upstream.status || 502 });
        }

        return new NextResponse(upstream.body, {
            headers: {
                'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
                // Sanity URLs are content-addressed (hash in the path); Google's
                // lh3 file id is likewise stable — safe to cache essentially forever.
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (err) {
        console.error('Image proxy error:', err);
        return NextResponse.json({ error: 'Gagal memuat gambar.' }, { status: 500 });
    }
}
