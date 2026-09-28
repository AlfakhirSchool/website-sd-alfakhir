import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/sanityServer';
import { createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const isRateLimited = createRateLimiter(10 * 60 * 1000, 8);

export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json({ success: false, error: 'Terlalu banyak percobaan, coba lagi nanti.' }, { status: 429 });
        }

        const { name, email, subject, message } = await req.json();
        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap.' }, { status: 400 });
        }

        await serverClient.create({
            _type: 'contactMessage',
            name: String(name).slice(0, 200),
            email: String(email).slice(0, 200),
            subject: String(subject || '').slice(0, 200),
            message: String(message).slice(0, 5000),
            receivedAt: new Date().toISOString(),
            status: 'unread',
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Contact submit error:', err);
        return NextResponse.json({ success: false, error: 'Gagal mengirim pesan.' }, { status: 500 });
    }
}
