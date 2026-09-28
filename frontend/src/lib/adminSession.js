import crypto from 'crypto';
import { cookies } from 'next/headers';

// Server-only. Real admin auth: Google ID token verified against Google's
// own tokeninfo endpoint (checks signature, expiry, audience), then a
// signed session cookie so we don't re-verify with Google on every request.
// No more client-decoded-JWT-with-no-signature-check, no more hardcoded
// admin/alfakhir2025 fallback, no more sessionStorage flag anyone can set
// from devtools.

const ALLOWED_ADMIN_EMAIL = 'sdialfakhir@gmail.com';
const COOKIE_NAME = 'af_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error('ADMIN_SESSION_SECRET belum diset di .env');
    return secret;
}

function sign(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
    return `${body}.${sig}`;
}

function verify(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return null;
    const [body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
    if (sig !== expected || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (!payload.exp || Date.now() > payload.exp) return null;
        if (payload.email !== ALLOWED_ADMIN_EMAIL) return null;
        return payload;
    } catch {
        return null;
    }
}

// Verifies a Google Sign-In `credential` (ID token) server-side via Google's
// tokeninfo endpoint — validates signature/expiry/audience without pulling
// in google-auth-library for one check.
export async function verifyGoogleCredential(credential) {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!res.ok) return null;
    const data = await res.json();

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && data.aud !== clientId) return null;
    if (data.email_verified !== 'true' && data.email_verified !== true) return null;
    if (data.email !== ALLOWED_ADMIN_EMAIL) return null;

    return { email: data.email };
}

export function createSessionCookieValue(email) {
    return sign({ email, exp: Date.now() + SESSION_TTL_MS });
}

export function readSession(cookieStore) {
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    return verify(raw);
}

// Shared by every admin API route: `const session = await requireAdminSession();
// if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });`
export async function requireAdminSession() {
    return readSession(await cookies());
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SEC = SESSION_TTL_MS / 1000;
