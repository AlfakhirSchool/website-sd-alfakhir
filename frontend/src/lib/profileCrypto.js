// Server-only. The Sanity dataset is public-read, so student profile documents
// never store NIS, name or PDF link in plain text: the NIS is kept as a keyed
// hash (lookup key) and everything identifying is sealed with AES-256-GCM.
// Keys are derived from ADMIN_SESSION_SECRET, so no new env var is needed.
import crypto from 'crypto';

function key(label) {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) throw new Error('ADMIN_SESSION_SECRET belum diset di .env');
    return crypto.createHmac('sha256', secret).update(label).digest();
}

export const normalizeNis = (v) => String(v ?? '').trim().toUpperCase().replace(/\s+/g, '');

export const nisHash = (nis) => crypto.createHmac('sha256', key('profile-nis')).update(normalizeNis(nis)).digest('hex');

export function seal(obj) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key('profile-blob'), iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(obj), 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

// Returns null for tampered or foreign blobs instead of throwing.
export function unseal(b64) {
    try {
        const raw = Buffer.from(b64, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key('profile-blob'), raw.subarray(0, 12));
        decipher.setAuthTag(raw.subarray(12, 28));
        return JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8'));
    } catch {
        return null;
    }
}
