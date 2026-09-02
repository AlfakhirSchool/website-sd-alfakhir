// Server-only client for the self-hosted student-api (services/student-api),
// running on the school's own Proxmox server. Student PII never touches
// Sanity — this is the whole point. Only import this from route.js handlers.

const BASE_URL = process.env.STUDENT_API_URL;
const API_KEY = process.env.STUDENT_API_KEY;

async function call(path, options = {}) {
    if (!BASE_URL || !API_KEY) {
        throw new Error('STUDENT_API_URL / STUDENT_API_KEY belum diset di .env');
    }
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
            ...options.headers,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `student-api ${path} failed (${res.status})`);
    }
    return res.json();
}

export const studentApi = {
    list: () => call('/students'),
    listPublic: () => call('/students/public'),
    create: (doc) => call('/students', { method: 'POST', body: JSON.stringify(doc) }),
    patch: (id, set) => call(`/students/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ set }) }),
    remove: (id) => call(`/students/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
