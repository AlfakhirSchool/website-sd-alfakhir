// Self-hosted student registration store. Runs on the school's own server
// (Proxmox), not on Sanity/Vercel — this is the whole point: student PII
// (NIK, WhatsApp, parent info, address) never lives anywhere public-read
// again. Every route except /health requires the shared API key, sent only
// by our Next.js backend (src/lib/studentApi.js) — never by the browser.
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4001;
const API_KEY = process.env.STUDENT_API_KEY;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'students.db');

if (!API_KEY) {
    console.error('STUDENT_API_KEY is not set. Refusing to start.');
    process.exit(1);
}

require('fs').mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS students (
    _id TEXT PRIMARY KEY,
    id TEXT,
    name TEXT,
    gender TEXT,
    birthPlace TEXT,
    birthDate TEXT,
    nik TEXT,
    nisn TEXT,
    school TEXT,
    schoolName TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    parentName TEXT,
    whatsapp TEXT,
    parentJob TEXT,
    nikAyah TEXT,
    nikIbu TEXT,
    year TEXT,
    wave TEXT,
    status TEXT,
    score TEXT,
    pdfLink TEXT,
    paymentProof TEXT,
    externalImage TEXT,
    note TEXT,
    registrationDate TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);
`);

// Fields added after the table already had rows in production — plain
// ALTER TABLE ADD COLUMN, one per field not yet present. Safe to re-run.
const NEW_COLUMNS = ['religion', 'kip', 'childOrder', 'siblingOf', 'siblingsCount', 'dailyLanguage',
    'height', 'weight', 'studentPhone', 'schoolAddress', 'schoolNpsn', 'graduationYear', 'fatherName', 'fatherBirthInfo',
    'fatherEducation', 'fatherJob', 'fatherIncome', 'fatherPhone', 'fatherStatus',
    'motherName', 'motherBirthInfo', 'motherEducation', 'motherJob', 'motherIncome',
    'motherPhone', 'motherStatus', 'registrationType'];
const existingColumns = new Set(db.prepare('PRAGMA table_info(students)').all().map(c => c.name));
for (const col of NEW_COLUMNS) {
    if (!existingColumns.has(col)) db.exec(`ALTER TABLE students ADD COLUMN ${col} TEXT`);
}

const app = express();
app.use(express.json({ limit: '1mb' }));

// Constant-time compare so this isn't timing-attackable.
function isValidKey(header) {
    if (!header || !header.startsWith('Bearer ')) return false;
    const provided = Buffer.from(header.slice(7));
    const expected = Buffer.from(API_KEY);
    if (provided.length !== expected.length) return false;
    return crypto.timingSafeEqual(provided, expected);
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res, next) => {
    if (!isValidKey(req.headers.authorization)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

const ALL_COLUMNS = ['_id', 'id', 'name', 'gender', 'birthPlace', 'birthDate', 'nik', 'nisn', 'school',
    'schoolName', 'address', 'city', 'province', 'parentName', 'whatsapp', 'parentJob', 'nikAyah', 'nikIbu',
    'year', 'wave', 'status', 'score', 'pdfLink', 'paymentProof', 'externalImage', 'note', 'registrationDate',
    ...NEW_COLUMNS];

const PUBLIC_COLUMNS = ['_id', 'id', 'name', 'year', 'wave', 'status', 'school', 'schoolName', 'pdfLink'];
const PASSED_STATUSES = ['Lolos', 'Diterima', 'Lolos Seleksi', 'Lulus Seleksi', 'Passed Selection'];

// Full records — admin dashboard only.
app.get('/students', (req, res) => {
    const rows = db.prepare(`SELECT ${ALL_COLUMNS.join(',')} FROM students ORDER BY createdAt DESC`).all();
    res.json(rows);
});

// Duplicate-submission guard for the registration form: same child (by NIK)
// submitting the form again shouldn't create a second record.
app.get('/students/find-by-nik', (req, res) => {
    const nik = (req.query.nik || '').trim();
    if (!nik) return res.json(null);
    const row = db.prepare(`SELECT ${ALL_COLUMNS.join(',')} FROM students WHERE nik = ? ORDER BY createdAt ASC LIMIT 1`).get(nik);
    res.json(row || null);
});

// No PII — safe for the public PPDB result page.
app.get('/students/public', (req, res) => {
    const placeholders = PASSED_STATUSES.map(() => '?').join(',');
    const rows = db.prepare(
        `SELECT ${PUBLIC_COLUMNS.join(',')} FROM students WHERE status IN (${placeholders}) ORDER BY id ASC`
    ).all(...PASSED_STATUSES);
    res.json(rows);
});

app.post('/students', (req, res) => {
    const doc = req.body || {};
    const _id = doc._id || crypto.randomUUID();
    const cols = ALL_COLUMNS.filter(c => c !== '_id');
    const stmt = db.prepare(
        `INSERT INTO students (_id, ${cols.join(',')}) VALUES (@_id, ${cols.map(c => '@' + c).join(',')})`
    );
    const params = { _id };
    cols.forEach(c => { params[c] = doc[c] ?? null; });
    try {
        stmt.run(params);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, _id });
});

app.patch('/students/:id', (req, res) => {
    const set = req.body?.set || {};
    const cols = Object.keys(set).filter(c => ALL_COLUMNS.includes(c) && c !== '_id');
    if (cols.length === 0) return res.json({ success: true });
    const assignments = cols.map(c => `${c} = @${c}`).join(', ');
    const stmt = db.prepare(`UPDATE students SET ${assignments}, updatedAt = datetime('now') WHERE _id = @_id`);
    stmt.run({ ...set, _id: req.params.id });
    res.json({ success: true });
});

app.delete('/students/:id', (req, res) => {
    db.prepare('DELETE FROM students WHERE _id = ?').run(req.params.id);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`student-api listening on :${PORT}`));
