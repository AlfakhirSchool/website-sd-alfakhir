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
