import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyGoogleCredential, createSessionCookieValue, readSession, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE_SEC } from '@/lib/adminSession';

export const runtime = 'nodejs';

export async function GET() {
    const jar = await cookies();
    const session = readSession(jar);
    return NextResponse.json({ loggedIn: !!session, email: session?.email || null });
}

export async function POST(req) {
    try {
        const { credential } = await req.json();
        if (!credential) {
            return NextResponse.json({ success: false, error: 'Missing credential' }, { status: 400 });
        }

        const verified = await verifyGoogleCredential(credential);
        if (!verified) {
            return NextResponse.json({ success: false, error: 'Akses ditolak: akun tidak diizinkan.' }, { status: 403 });
        }

        const jar = await cookies();
        jar.set(ADMIN_COOKIE_NAME, createSessionCookieValue(verified.email), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: ADMIN_COOKIE_MAX_AGE_SEC,
        });

        return NextResponse.json({ success: true, email: verified.email });
    } catch (err) {
        console.error('Admin session error:', err);
        return NextResponse.json({ success: false, error: 'Gagal memproses login.' }, { status: 500 });
    }
}

export async function DELETE() {
    const jar = await cookies();
    jar.delete(ADMIN_COOKIE_NAME);
    return NextResponse.json({ success: true });
}
