"use client";

/**
 * Student profile announcements (public page /profil-siswa).
 * Profiles are collected every month: one row = one student's profile PDF for one month.
 * Parents find theirs by NIS (digits) and see the newest month first.
 *
 * Props (supplied by page.jsx):
 *   profiles: {_id, nis, name, period: 'YYYY-MM', pdfLink, publishedAt}[]   server state
 *   onSave(draft): Promise   create (no _id) or update (_id) one profile
 *   onDelete(profile): Promise
 *   onImport(docs): Promise  docs may carry _id when they update an existing profile
 */

import React, { useMemo, useRef, useState } from 'react';
import {
    BadgeCheck, CalendarDays, ChevronLeft, ChevronRight, Copy, CopyPlus, Download, ExternalLink, FileText, Pencil, Plus, Trash2, Upload, UploadCloud, Users,
} from 'lucide-react';
import {
    C, Button, IconButton, StatCard, StatGrid, Toolbar, SearchInput, Select, Field, inputStyle, Notice, EmptyState, Avatar, Pill, Drawer, isUrl, fmtDate,
} from './ui';

const PAGE_SIZE = 20;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const normNis = (v) => String(v ?? '').trim().replace(/\s+/g, '');
const validNis = (v) => /^\d{3,25}$/.test(v);
const toPeriod = (year, month) => `${year}-${String(month).padStart(2, '0')}`;
const periodLabel = (p) => { const [y, m] = p.split('-'); return `${MONTHS[Number(m) - 1]} ${y}`; };
const previousPeriod = (p) => { const [y, m] = p.split('-').map(Number); return m === 1 ? toPeriod(y - 1, 12) : toPeriod(y, m - 1); };
const blank = (period) => ({ nis: '', name: '', period, pdfLink: '' });

// Spreadsheet headers are matched loosely so a teacher's own column names still work.
const pick = (row, names) => {
    const found = Object.keys(row).find(k => names.includes(k.toLowerCase().replace(/[\s_]+/g, '')));
    return found === undefined ? '' : String(row[found] ?? '').trim();
};

function ProfileDrawer({ draft, setDraft, saving, error, onSave, onDelete, onClose }) {
    const isNew = !draft._id;
    const nisBad = !validNis(draft.nis || '');
    const nameBad = !draft.name?.trim();
    const linkBad = draft.pdfLink && !isUrl(draft.pdfLink);
    const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
    return (
        <Drawer
            open
            title={isNew ? 'New profile' : 'Edit profile'}
            subtitle={`${periodLabel(draft.period)}${draft.publishedAt ? ` · published ${fmtDate(draft.publishedAt)}` : ''}`}
            onClose={onClose}
            footer={
                <>
                    {isNew ? <span /> : <Button variant="danger" icon={Trash2} onClick={onDelete} disabled={saving}>Delete</Button>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button variant="primary" onClick={onSave} disabled={saving || nisBad || nameBad || linkBad}>{saving ? 'Saving...' : 'Save'}</Button>
                    </div>
                </>
            }
        >
            {error && <Notice tone="bad" style={{ marginBottom: 18 }}>{error}</Notice>}
            <Field label="NIS" hint="Digits only. Parents type this number to find the profile." error={draft.nis && nisBad && 'Use 3 to 25 digits.'}>
                <input autoFocus inputMode="numeric" style={{ ...inputStyle(draft.nis && nisBad), letterSpacing: '1px' }} placeholder="e.g. 2026001"
                    value={draft.nis || ''} onChange={e => set('nis', e.target.value.replace(/\D/g, ''))} />
            </Field>
            <Field label="Student name">
                <input style={inputStyle(false)} placeholder="Full name" value={draft.name || ''} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Profile PDF link" error={linkBad && 'Must start with http:// or https://'}
                hint={'Share the PDF on Drive as "Anyone with the link", otherwise parents cannot open it.'}>
                <input style={{ ...inputStyle(linkBad), fontSize: '0.84rem' }} placeholder="https://drive.google.com/file/d/..."
                    value={draft.pdfLink || ''} onChange={e => set('pdfLink', e.target.value.trim())} />
                {isUrl(draft.pdfLink) && (
                    <a href={draft.pdfLink} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.8rem', fontWeight: 600, color: C.accent, textDecoration: 'none' }}>
                        <ExternalLink size={14} /> Open to check it works
                    </a>
                )}
            </Field>
        </Drawer>
    );
}

export default function ProfilesPanel({ profiles, onSave, onDelete, onImport }) {
    const [now] = useState(() => new Date());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [query, setQuery] = useState('');
    const [tab, setTab] = useState('all');
    const [page, setPage] = useState(1);
    const [notice, setNotice] = useState(null);
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef(null);

    const period = toPeriod(year, month);
    const years = useMemo(() => {
        const set = new Set([now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1, year]);
        profiles.forEach(p => set.add(Number(p.period.slice(0, 4))));
        return [...set].sort((a, b) => b - a);
    }, [profiles, now, year]);

    const inPeriod = useMemo(
        () => profiles.filter(p => p.period === period).sort((a, b) => a.name.localeCompare(b.name)),
        [profiles, period],
    );

    const counts = useMemo(() => ({
        all: inPeriod.length,
        published: inPeriod.filter(p => p.pdfLink).length,
        draft: inPeriod.filter(p => !p.pdfLink).length,
    }), [inPeriod]);

    const rows = useMemo(() => {
        const q = query.toLowerCase();
        return inPeriod.filter(p =>
            (tab === 'all' || (tab === 'published' ? p.pdfLink : !p.pdfLink)) &&
            `${p.name || ''}${p.nis || ''}`.toLowerCase().includes(q));
    }, [inPeriod, tab, query]);

    // Students of the previous month that have no profile row in this month yet.
    const carryOver = useMemo(() => {
        const have = new Set(inPeriod.map(p => p.nis));
        return profiles.filter(p => p.period === previousPeriod(period) && !have.has(p.nis));
    }, [profiles, inPeriod, period]);

    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = rows.slice(start, start + PAGE_SIZE);

    const run = async (fn, okMessage) => {
        setSaving(true);
        setError('');
        try {
            await fn();
            if (okMessage) setNotice({ tone: 'ok', text: okMessage });
            return true;
        } catch (err) {
            setError(err.message || 'Something went wrong.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const save = async () => {
        const doc = { ...draft, nis: normNis(draft.nis), name: draft.name.trim() };
        if (await run(() => onSave(doc), 'Profile saved.')) setDraft(null);
    };
    const remove = async (profile) => {
        if (!window.confirm(`Delete the profile of ${profile.name} for ${periodLabel(profile.period)}?`)) return;
        if (await run(() => onDelete(profile), 'Profile deleted.')) setDraft(null);
    };

    const copy = async (text) => {
        try { await navigator.clipboard.writeText(text); setNotice({ tone: 'ok', text: 'Link copied.' }); } catch { setNotice({ tone: 'bad', text: 'Could not copy the link.' }); }
    };

    const copyStudents = async () => {
        const docs = carryOver.map(p => ({ nis: p.nis, name: p.name, period, pdfLink: '' }));
        await run(() => onImport(docs), `Copied ${docs.length} students from ${periodLabel(previousPeriod(period))}. Add their PDF links next.`);
    };

    const downloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const sheet = XLSX.utils.json_to_sheet([
            { NIS: '2026001', Nama: 'Contoh Nama Siswa', 'Link PDF': 'https://drive.google.com/file/d/xxxx/view' },
        ]);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, 'Profil Siswa');
        XLSX.writeFile(book, `profil-siswa-${period}.xlsx`);
    };

    const readFile = async (file) => {
        if (!file) return;
        try {
            const XLSX = await import('xlsx');
            const book = XLSX.read(await file.arrayBuffer());
            const data = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' });
            const docs = [];
            let skipped = 0;
            data.forEach((row) => {
                const nis = normNis(pick(row, ['nis', 'nomorinduk', 'nomorindukssiswa', 'nomorindukssiswanis']));
                const name = pick(row, ['nama', 'namasiswa', 'name', 'namalengkap']);
                const link = pick(row, ['linkpdf', 'link', 'pdf', 'pdflink', 'url', 'linkprofil']);
                if (!validNis(nis) || !name || (link && !isUrl(link))) { skipped++; return; }
                const existing = profiles.find(p => p.nis === nis && p.period === period);
                docs.push(existing
                    ? { ...existing, name, pdfLink: link || existing.pdfLink }
                    : { nis, name, period, pdfLink: link });
            });
            setPending({ docs, skipped, updates: docs.filter(d => d._id).length });
        } catch {
            setNotice({ tone: 'bad', text: 'Could not read that file. Use the template (.xlsx or .csv).' });
        } finally {
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const confirmImport = async () => {
        const { docs } = pending;
        if (await run(() => onImport(docs), `Imported ${docs.length} profiles into ${periodLabel(period)}.`)) setPending(null);
    };

    const tabs = [['all', Users, 'Students', 'idle'], ['published', BadgeCheck, 'Published', 'ok'], ['draft', FileText, 'Waiting for a link', 'info']];
    const goTo = (fn) => (e) => { fn(Number(e.target.value)); setPage(1); setPending(null); setNotice(null); };

    return (
        <div
            style={{ position: 'relative' }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
            onDrop={e => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files?.[0]); }}
        >
            {dragging && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 20, borderRadius: 18, border: `2px dashed ${C.accent}`, background: 'rgba(250,248,244,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
                    <UploadCloud size={36} color={C.accent} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: C.ink }}>Drop the spreadsheet to import into {periodLabel(period)}</div>
                    <div style={{ fontSize: '0.8rem', color: C.muted }}>.xlsx, .xls or .csv with NIS, name and PDF link</div>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: '16px 20px', marginBottom: 18, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 18 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', fontWeight: 600, color: C.text }}>
                    <CalendarDays size={18} color={C.accent} /> Profile period
                </span>
                <Select aria-label="Month" value={month} onChange={goTo(setMonth)}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </Select>
                <Select aria-label="Year" value={year} onChange={goTo(setYear)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
                <span style={{ fontSize: '0.8rem', color: C.muted }}>
                    New profiles and imports go to <strong style={{ color: C.ink }}>{periodLabel(period)}</strong>. Parents see the newest month first.
                </span>
            </div>

            <StatGrid>
                {tabs.map(([key, icon, label, tone]) => (
                    <StatCard key={key} icon={icon} label={label} value={counts[key]} tone={tone} active={tab === key} onClick={() => { setTab(key); setPage(1); }} />
                ))}
            </StatGrid>

            <Toolbar
                style={{ marginTop: 22 }}
                left={<SearchInput value={query} onChange={v => { setQuery(v); setPage(1); }} placeholder="Search name or NIS" />}
                right={<>
                    {carryOver.length > 0 && (
                        <Button icon={CopyPlus} onClick={copyStudents} disabled={saving}>Copy {carryOver.length} from {MONTHS[Number(previousPeriod(period).slice(5)) - 1]}</Button>
                    )}
                    <Button icon={Download} onClick={downloadTemplate}>Template</Button>
                    <Button icon={Upload} onClick={() => fileRef.current?.click()}>Import</Button>
                    <Button variant="primary" icon={Plus} onClick={() => { setError(''); setDraft(blank(period)); }}>New profile</Button>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => readFile(e.target.files?.[0])} />
                </>}
            />

            {notice && <Notice tone={notice.tone} onClose={() => setNotice(null)} style={{ marginTop: 16 }}>{notice.text}</Notice>}

            {pending && (
                <Notice tone="info" style={{ marginTop: 16 }}>
                    <span>
                        Ready to import {pending.docs.length} profiles into {periodLabel(period)} ({pending.docs.length - pending.updates} new, {pending.updates} updates)
                        {pending.skipped > 0 && `, ${pending.skipped} skipped (needs a numeric NIS and a name, and a valid link if given)`}.
                    </span>
                    <span style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" onClick={() => setPending(null)} disabled={saving}>Cancel</Button>
                        <Button size="sm" variant="primary" onClick={confirmImport} disabled={saving || pending.docs.length === 0}>{saving ? 'Importing...' : 'Import'}</Button>
                    </span>
                </Notice>
            )}
            {error && !draft && <Notice tone="bad" style={{ marginTop: 16 }}>{error}</Notice>}

            <div style={{ marginTop: 22 }}>
                {rows.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={inPeriod.length === 0 ? `No profiles for ${periodLabel(period)} yet` : 'Nothing matches this view'}
                        text={inPeriod.length === 0
                            ? 'Add a student by hand, import a spreadsheet of NIS, name and PDF link, or copy last month\'s student list.'
                            : 'Try another status or search term.'}
                    >
                        {inPeriod.length === 0 && (
                            <>
                                <Button variant="primary" icon={Plus} onClick={() => setDraft(blank(period))}>New profile</Button>
                                <Button icon={Upload} onClick={() => fileRef.current?.click()}>Import spreadsheet</Button>
                            </>
                        )}
                    </EmptyState>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {visible.map(p => (
                            <div
                                key={p._id}
                                onClick={() => { setError(''); setDraft({ ...p }); }}
                                style={{ display: 'grid', gridTemplateColumns: '48px minmax(180px, 1.4fr) minmax(200px, 1.6fr) 130px 92px', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, cursor: 'pointer', background: C.surface, border: `1px solid ${C.line}`, transition: 'box-shadow 0.15s' }}
                                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,24,20,0.07)'; }}
                                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <Avatar name={p.name} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                    <div style={{ marginTop: 3, fontSize: '0.78rem', color: C.muted }}>NIS {p.nis}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }} onClick={e => e.stopPropagation()}>
                                    {p.pdfLink ? (
                                        <>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: C.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.pdfLink.replace(/^https?:\/\//, '')}</span>
                                            <IconButton icon={Copy} size={15} label="Copy link" onClick={() => copy(p.pdfLink)} />
                                            <a href={p.pdfLink} target="_blank" rel="noopener noreferrer" aria-label="Open PDF" title="Open PDF" style={{ display: 'inline-flex', padding: 8, color: C.muted }}><ExternalLink size={15} /></a>
                                        </>
                                    ) : <span style={{ fontSize: '0.78rem', color: C.muted }}>No link yet</span>}
                                </div>
                                <div>
                                    {p.pdfLink ? <Pill tone="ok">Published</Pill> : <Pill tone="idle">Waiting for a link</Pill>}
                                    {p.publishedAt && p.pdfLink && <div style={{ marginTop: 4, fontSize: '0.7rem', color: C.muted }}>{fmtDate(p.publishedAt)}</div>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                                    <IconButton icon={Pencil} label="Edit" onClick={() => { setError(''); setDraft({ ...p }); }} />
                                    <IconButton icon={Trash2} tone="danger" label="Delete" onClick={() => remove(p)} />
                                </div>
                            </div>
                        ))}

                        {pages > 1 && (
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600, color: C.muted }}>
                                <span>{start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Button size="sm" icon={ChevronLeft} aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} />
                                    <span>{current} / {pages}</span>
                                    <Button size="sm" icon={ChevronRight} aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {draft && (
                <ProfileDrawer
                    draft={draft}
                    setDraft={setDraft}
                    saving={saving}
                    error={error}
                    onSave={save}
                    onDelete={() => remove(draft)}
                    onClose={() => setDraft(null)}
                />
            )}
        </div>
    );
}
