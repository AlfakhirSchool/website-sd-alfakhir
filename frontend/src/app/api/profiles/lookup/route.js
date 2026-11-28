import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/sanityServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { nisHash, normalizeNis, unseal } from '@/lib/profileCrypto';

export const runtime = 'nodejs';

// NIS values are short and guessable, so the lookup is rate-limited per IP.
const isRateLimited = createRateLimiter(10 * 60 * 1000, 20);

export async function GET(req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const nis = normalizeNis(new URL(req.url).searchParams.get('nis'));
    if (!/^\d{3,25}$/.test(nis)) {
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }

    try {
        const docs = await serverClient.fetch(
            '*[_type == "studentProfile" && (nisHash == $h || nisnHash == $h)] | order(period desc, publishedAt desc) {period, publishedAt, blob}',
            { h: nisHash(nis) },
        );
        const results = docs
            .map(d => ({ ...unseal(d.blob), period: d.period, publishedAt: d.publishedAt }))
            .filter(r => /^https?:\/\/\S+$/i.test(r.pdfLink || ''))
            .map(({ name, pdfLink, period, publishedAt }) => ({ name, pdfLink, period, publishedAt }));
        return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
        console.error('Profile lookup error:', err);
        return NextResponse.json({ error: 'failed' }, { status: 500 });
    }
}
