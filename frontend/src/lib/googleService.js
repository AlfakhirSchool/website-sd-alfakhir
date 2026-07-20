import crypto from 'crypto';

// ponytail: manual service-account JWT signing via node:crypto instead of
// pulling in the ~35MB googleapis package for two REST calls.
function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(scope) {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!email || !privateKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY belum diset di .env');
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: email,
        scope,
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };
    const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsigned);
    signer.end();
    const signature = signer.sign(privateKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${unsigned}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Google auth gagal: ' + JSON.stringify(data));
    return data.access_token;
}

// Drive uploads go through the school's own Google account (OAuth refresh token),
// not the service account: personal Gmail accounts give service accounts zero
// storage quota, so service-account uploads fail with storageQuotaExceeded.
async function getUserAccessToken() {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN belum diset di .env');
    }
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Google OAuth refresh gagal: ' + JSON.stringify(data));
    return data.access_token;
}

export async function appendRow(spreadsheetId, range, values) {
    const token = await getAccessToken('https://www.googleapis.com/auth/spreadsheets');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [values] }),
    });
    if (!res.ok) throw new Error('Sheets append gagal: ' + await res.text());
    return res.json();
}

export async function uploadFileToDrive(folderId, filename, mimeType, buffer) {
    const token = await getUserAccessToken();
    const boundary = 'alfakhir_' + Date.now();
    const metadata = { name: filename, parents: [folderId] };
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
        buffer,
        Buffer.from(`\r\n--${boundary}--`),
    ]);
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Drive upload gagal: ' + JSON.stringify(data));
    return data;
}
