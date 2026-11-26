'use client';

import React, { useMemo, useRef, useState } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight, Clock, Download, ExternalLink, FileText, Pencil, Plus, Settings, Trash2, Upload, UploadCloud, Users } from 'lucide-react';
import {
    Button, C, Drawer, EmptyState, Field, IconButton, Notice, Pill, SearchInput, Select, StatCard, StatGrid, Toolbar,
    inputStyle, isUrl, radius, table,
} from '../ui';

/**
 * Observation results: students who sat the observation, their selection status and result PDF link.
 * Every change is saved on its own; nothing here is held locally until a global save.
 *
 * Props (page.jsx identifier in brackets):
 *   students: object[]                      server list [students]; rows with `registrationDate` are online registrations and are ignored
 *   availableYears: string[]                [availableYears]
 *   yearConfigs: {year, videoUrl}[]         [yearConfigs]
 *   filterYear / setFilterYear              [filterYear, setFilterYear] 'Semua' means all years
 *   filterWave / setFilterWave              [filterWave, setFilterWave] 'Semua' means all waves
 *   searchQuery / setSearchQuery            [searchQuery, setSearchQuery]
 *   isPassed(status): boolean               [isPassed]
 *   handleDownloadTemplate(): void          [handleDownloadTemplate]
 *   onSave(draft): Promise                  create (no _id) or patch (has _id); draft = {_id?, id, name, school, year, wave, status, pdfLink, ...other loaded fields}
 *   onDelete(item): Promise                 item = the student object from `students`
 *   onImport(docs): Promise                 docs = [{id, name, school, status, year, wave, score, pdfLink, createdAt}]
 *   onAddYear(year): Promise
 *   onDeleteYear(year): Promise
 *   onSaveYearVideo(year, videoUrl): Promise
 * The tab owns its hidden file input and drag-and-drop import, so `fileInputRef`, `handleImportExcel`,
 * `newYearInput` and `showConfig` are not needed.
 */

const PAGE_SIZE = 20;
const ALL = 'Semua';
const PASSED = 'Passed Selection';
const NOT_YET = 'Not Yet Passed';
const WAVES = ['1', '2', '3'];
const LINK_HINT = 'Enter a full link starting with https://';

const cell = (row, keys) => {
    const found = keys.map(k => row[k]).find(v => v !== undefined && String(v).trim() !== '');
    return found === undefined ? '' : String(found).trim();
};

const rowKey = (s) => s._id || s.id;
const errorText = (e) => e?.message || 'Something went wrong. Try again.';

export default function ObservationTab({
    students, availableYears, yearConfigs,
    filterYear, setFilterYear, filterWave, setFilterWave, searchQuery, setSearchQuery,
    isPassed, handleDownloadTemplate, onSave, onDelete, onImport, onAddYear, onDeleteYear, onSaveYearVideo,
}) {
    const defaultYear = availableYears[0] || '2026/2027';
    const [statusTab, setStatusTab] = useState('all');
    const [page, setPage] = useState(1);
    const [notice, setNotice] = useState(null);
    const [busy, setBusy] = useState({});
    const [editor, setEditor] = useState(null);
    const [tried, setTried] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editorError, setEditorError] = useState('');
    const [importPlan, setImportPlan] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [dragging, setDragging] = useState(false);
    const [yearsOpen, setYearsOpen] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [videoDrafts, setVideoDrafts] = useState({});
    const [yearError, setYearError] = useState('');
    const fileRef = useRef(null);

    const observed = useMemo(() => students.filter(s => !s.registrationDate), [students]);

    const scoped = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return observed.filter(s =>
            (filterYear === ALL || (s.year || '2026/2027') === filterYear) &&
            (filterWave === ALL || String(s.wave) === filterWave) &&
            ((s.name || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q)));
    }, [observed, filterYear, filterWave, searchQuery]);

    const counts = useMemo(() => {
        const passed = scoped.filter(s => isPassed(s.status)).length;
        return { all: scoped.length, passed, notYet: scoped.length - passed, noLink: scoped.filter(s => !(s.pdfLink || '').trim()).length };
    }, [scoped, isPassed]);

    const rows = useMemo(() => scoped.filter(s => {
        if (statusTab === 'passed') return isPassed(s.status);
        if (statusTab === 'notYet') return !isPassed(s.status);
        if (statusTab === 'noLink') return !(s.pdfLink || '').trim();
        return true;
    }), [scoped, statusTab, isPassed]);

    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const current = Math.min(page, pages);
    const start = (current - 1) * PAGE_SIZE;
    const visible = rows.slice(start, start + PAGE_SIZE);

    const filter = (fn) => (v) => { fn(v); setPage(1); };
    const resetView = () => { setFilterYear(ALL); setFilterWave(ALL); setSearchQuery(''); setStatusTab('all'); setPage(1); };
    const pickTab = (tab) => { setStatusTab(tab); setPage(1); };

    const runRow = async (key, action, okText) => {
        setBusy(b => ({ ...b, [key]: true }));
        try {
            await action();
            if (okText) setNotice({ tone: 'ok', text: okText });
        } catch (e) {
            setNotice({ tone: 'bad', text: errorText(e) });
        } finally {
            setBusy(b => ({ ...b, [key]: false }));
        }
    };

    const changeStatus = (s, status) => runRow(rowKey(s), () => onSave({ ...s, status }));
    const removeStudent = (s) => {
        if (!window.confirm(`Delete ${s.name || 'this student'} (${s.id})? This cannot be undone.`)) return;
        runRow(rowKey(s), () => onDelete(s), `${s.name || 'Student'} deleted.`);
    };

    const openEditor = (source) => {
        setTried(false);
        setEditorError('');
        setEditor({
            source,
            draft: {
                ...source,
                school: source.school || source.schoolName || '',
                year: source.year || defaultYear,
                wave: String(source.wave || '1'),
                status: isPassed(source.status) ? PASSED : NOT_YET,
                pdfLink: source.pdfLink || '',
            },
        });
    };

    const openNew = () => {
        setTried(false);
        setEditorError('');
        setEditor({
            source: null,
            draft: {
                id: `REG-${new Date().getFullYear()}-${String(observed.length + 1).padStart(3, '0')}`,
                name: '', school: '', status: PASSED,
                year: filterYear === ALL ? defaultYear : filterYear,
                wave: filterWave === ALL ? '1' : filterWave,
                pdfLink: '',
            },
        });
    };

    const draft = editor?.draft;
    const setField = (k, v) => setEditor(ed => ({ ...ed, draft: { ...ed.draft, [k]: v } }));
    const errors = draft ? {
        id: !(draft.id || '').trim() && 'Registration number is required',
        name: !(draft.name || '').trim() && 'Student name is required',
        pdfLink: (draft.pdfLink || '').trim() && !isUrl(draft.pdfLink) && LINK_HINT,
    } : {};
    const hasErrors = Object.values(errors).some(Boolean);

    const saveDraft = async () => {
        setTried(true);
        if (hasErrors) return;
        setSaving(true);
        setEditorError('');
        try {
            await onSave({ ...draft, id: draft.id.trim(), name: draft.name.trim(), school: (draft.school || '').trim(), pdfLink: draft.pdfLink.trim() });
            setNotice({ tone: 'ok', text: `${draft.name.trim()} saved.` });
            setEditor(null);
        } catch (e) {
            setEditorError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const deleteFromDrawer = async () => {
        const s = editor.source;
        if (!window.confirm(`Delete ${s.name || 'this student'} (${s.id})? This cannot be undone.`)) return;
        setSaving(true);
        setEditorError('');
        try {
            await onDelete(s);
            setNotice({ tone: 'ok', text: `${s.name || 'Student'} deleted.` });
            setEditor(null);
        } catch (e) {
            setEditorError(errorText(e));
        } finally {
            setSaving(false);
        }
    };

    const readFile = async (file) => {
        if (!file) return;
        try {
            const XLSX = await import('xlsx');
            const book = XLSX.read(await file.arrayBuffer());
            const data = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' });
            const seen = new Set(observed.map(s => `${s.id}|${s.year || '2026/2027'}`));
            const docs = [];
            const skipped = [];
            data.forEach((row, i) => {
                const name = cell(row, ['STUDENT NAME', 'Nama Lengkap', 'name', 'Nama']);
                const pdfLink = cell(row, ['PDF LINK', 'pdfLink']);
                const year = filterYear === ALL ? (cell(row, ['YEAR', 'Tahun', 'year']) || defaultYear) : filterYear;
                const wave = filterWave === ALL ? (cell(row, ['WAVE', 'Gelombang', 'wave']) || '1') : filterWave;
                const id = cell(row, ['ID / NO REG', 'No. Peserta', 'id', 'regId']) || `REG-${Date.now()}-${i}`;
                const reason = !name ? 'Missing student name'
                    : pdfLink && !isUrl(pdfLink) ? 'PDF link is not a valid https:// link'
                    : !WAVES.includes(wave) ? 'Wave must be 1, 2 or 3'
                    : seen.has(`${id}|${year}`) ? 'Registration number already exists for this year' : '';
                if (reason) { skipped.push({ row: i + 2, name: name || id, reason }); return; }
                seen.add(`${id}|${year}`);
                docs.push({
                    id, name, year, wave, pdfLink,
                    school: cell(row, ['PREVIOUS SCHOOL', 'Asal Sekolah', 'school', 'schoolName']),
                    status: isPassed(cell(row, ['STATUS', 'Status', 'status']) || PASSED) ? PASSED : NOT_YET,
                    score: cell(row, ['Nilai', 'score']) || '-',
                    createdAt: new Date().toISOString(),
                });
            });
            setImportError('');
            setImportPlan({ fileName: file.name, docs, skipped });
        } catch {
            setNotice({ tone: 'bad', text: 'Could not read that file. Use the template (.xlsx or .xls).' });
        } finally {
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const confirmImport = async () => {
        setImporting(true);
        setImportError('');
        try {
            await onImport(importPlan.docs);
            setNotice({ tone: 'ok', text: `${importPlan.docs.length} students imported.` });
            setImportPlan(null);
        } catch (e) {
            setImportError(errorText(e));
        } finally {
            setImporting(false);
        }
    };

    const runYear = async (key, action) => {
        setBusy(b => ({ ...b, [key]: true }));
        setYearError('');
        try {
            await action();
        } catch (e) {
            setYearError(errorText(e));
        } finally {
            setBusy(b => ({ ...b, [key]: false }));
        }
    };

    const addYear = () => runYear('year:new', async () => {
        await onAddYear(newYear.trim());
        setNewYear('');
    });
    const removeYear = (y) => {
        if (!window.confirm(`Remove academic year ${y} and its video link? Students are not deleted.`)) return;
        runYear(`year:${y}`, () => onDeleteYear(y));
    };
    const saveVideo = (y, url) => runYear(`year:${y}`, async () => {
        await onSaveYearVideo(y, url.trim());
        setVideoDrafts(v => { const next = { ...v }; delete next[y]; return next; });
    });

    const yearTaken = availableYears.includes(newYear.trim());
    const canAddYear = newYear.trim() !== '' && !yearTaken && !busy['year:new'];

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
            onDrop={e => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files?.[0]); }}
        >
            {dragging && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 20, borderRadius: radius.lg, border: `2px dashed ${C.accent}`, background: 'rgba(255,255,255,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
                    <UploadCloud size={34} color={C.accent} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: C.ink }}>Drop the spreadsheet to import</div>
                    <div style={{ fontSize: '0.8rem', color: C.muted }}>.xlsx or .xls with the columns from the template</div>
                </div>
            )}

            <StatGrid>
                <StatCard icon={Users} label="All students" value={counts.all} active={statusTab === 'all'} onClick={() => pickTab('all')} />
                <StatCard icon={BadgeCheck} tone="ok" label="Passed selection" value={counts.passed} active={statusTab === 'passed'} onClick={() => pickTab('passed')} />
                <StatCard icon={Clock} tone="wait" label="Not yet passed" value={counts.notYet} active={statusTab === 'notYet'} onClick={() => pickTab('notYet')} />
                <StatCard icon={FileText} tone="info" label="Missing PDF link" value={counts.noLink} active={statusTab === 'noLink'} onClick={() => pickTab('noLink')} />
            </StatGrid>

            <Toolbar
                left={(
                    <>
                        <SearchInput value={searchQuery} onChange={filter(setSearchQuery)} placeholder="Search name or registration no." />
                        <Select aria-label="Filter by year" value={filterYear} onChange={e => filter(setFilterYear)(e.target.value)}>
                            <option value={ALL}>All years</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                        <Select aria-label="Filter by wave" value={filterWave} onChange={e => filter(setFilterWave)(e.target.value)}>
                            <option value={ALL}>All waves</option>
                            {WAVES.map(w => <option key={w} value={w}>Wave {w}</option>)}
                        </Select>
                    </>
                )}
                right={(
                    <>
                        <Button icon={Download} onClick={handleDownloadTemplate}>Template</Button>
                        <Button icon={Upload} onClick={() => fileRef.current?.click()} title="Rows take the year and wave selected in the filters; with All selected they come from the file.">Import</Button>
                        <Button icon={Settings} onClick={() => { setYearError(''); setYearsOpen(true); }}>Year settings</Button>
                        <Button variant="primary" icon={Plus} onClick={openNew}>New student</Button>
                        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" aria-label="Import spreadsheet" style={{ display: 'none' }} onChange={e => readFile(e.target.files?.[0])} />
                    </>
                )}
            />

            {notice && <Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice>}

            {rows.length === 0 ? (
                observed.length === 0 ? (
                    <EmptyState icon={Users} title="No observation results yet" text="Add a student by hand, or drop a spreadsheet anywhere on this page. Download the template to see the columns.">
                        <Button variant="primary" icon={Plus} onClick={openNew}>New student</Button>
                        <Button icon={Upload} onClick={() => fileRef.current?.click()}>Import spreadsheet</Button>
                    </EmptyState>
                ) : (
                    <EmptyState icon={Users} title="Nothing matches this view" text="Try another status, year, wave or search term.">
                        <Button onClick={resetView}>Clear filters</Button>
                    </EmptyState>
                )
            ) : (
                <>
                    <div style={table.wrap}>
                        <table style={table.el}>
                            <thead>
                                <tr>
                                    <th style={table.th}>Reg. no.</th>
                                    <th style={table.th}>Student</th>
                                    <th style={table.th}>Year</th>
                                    <th style={{ ...table.th, textAlign: 'center' }}>Wave</th>
                                    <th style={table.th}>Status</th>
                                    <th style={table.th}>PDF link</th>
                                    <th style={{ ...table.th, textAlign: 'right' }}><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(s => {
                                    const key = rowKey(s);
                                    const pending = !!busy[key];
                                    const passed = isPassed(s.status);
                                    const link = (s.pdfLink || '').trim();
                                    return (
                                        <tr key={key} style={{ opacity: pending ? 0.55 : 1, transition: 'opacity 0.15s' }}>
                                            <td style={{ ...table.td, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: s.id ? C.text : C.red }}>{s.id || 'Missing'}</td>
                                            <td style={{ ...table.td, minWidth: 200 }}>
                                                <div style={{ fontWeight: 600, color: s.name ? C.ink : C.red }}>{s.name || 'Missing name'}</div>
                                                <div style={{ marginTop: 2, fontSize: '0.78rem', color: C.muted }}>{s.school || s.schoolName || 'No previous school'}</div>
                                            </td>
                                            <td style={{ ...table.td, whiteSpace: 'nowrap' }}>{s.year || '2026/2027'}</td>
                                            <td style={{ ...table.td, textAlign: 'center' }}>{s.wave || '1'}</td>
                                            <td style={table.td}>
                                                <Select
                                                    aria-label={`Status of ${s.name || s.id}`}
                                                    value={passed ? PASSED : NOT_YET}
                                                    disabled={pending}
                                                    onChange={e => changeStatus(s, e.target.value)}
                                                    style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: radius.sm, color: passed ? C.teal : '#a8650a' }}
                                                >
                                                    <option value={PASSED}>Passed selection</option>
                                                    <option value={NOT_YET}>Not yet passed</option>
                                                </Select>
                                            </td>
                                            <td style={table.td}>
                                                {link ? (
                                                    isUrl(link) ? (
                                                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.accentDark, fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                                                            <ExternalLink size={14} /> Open PDF
                                                        </a>
                                                    ) : <Pill tone="bad">Invalid link</Pill>
                                                ) : <Pill tone="idle">No link</Pill>}
                                            </td>
                                            <td style={{ ...table.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <IconButton icon={Pencil} label={`Edit ${s.name || s.id}`} disabled={pending} onClick={() => openEditor(s)} />
                                                <IconButton icon={Trash2} tone="danger" label={`Delete ${s.name || s.id}`} disabled={pending} onClick={() => removeStudent(s)} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600, color: C.muted }}>
                            <span>{start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Button size="sm" icon={ChevronLeft} aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} />
                                <span>{current} / {pages}</span>
                                <Button size="sm" icon={ChevronRight} aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} />
                            </div>
                        </div>
                    )}
                </>
            )}

            <Drawer
                open={!!editor}
                title={editor?.source ? 'Edit student' : 'New student'}
                subtitle="Saved to the website as soon as you press Save."
                onClose={() => !saving && setEditor(null)}
                footer={(
                    <>
                        {editor?.source ? <Button variant="danger" icon={Trash2} disabled={saving} onClick={deleteFromDrawer}>Delete</Button> : <span />}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Button disabled={saving} onClick={() => setEditor(null)}>Cancel</Button>
                            <Button variant="primary" disabled={saving} onClick={saveDraft}>{saving ? 'Saving…' : 'Save'}</Button>
                        </div>
                    </>
                )}
            >
                {draft && (
                    <>
                        {editorError && <Notice tone="bad" style={{ marginBottom: 18 }}>{editorError}</Notice>}
                        <Field label="Registration no." error={tried && errors.id}>
                            <input style={inputStyle(tried && errors.id)} value={draft.id || ''} onChange={e => setField('id', e.target.value)} />
                        </Field>
                        <Field label="Student name" error={tried && errors.name}>
                            <input style={inputStyle(tried && errors.name)} value={draft.name || ''} onChange={e => setField('name', e.target.value)} />
                        </Field>
                        <Field label="Previous school">
                            <input style={inputStyle(false)} value={draft.school} onChange={e => setField('school', e.target.value)} />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <Field label="Academic year">
                                <Select style={{ width: '100%' }} value={draft.year} onChange={e => setField('year', e.target.value)}>
                                    {(availableYears.includes(draft.year) ? availableYears : [draft.year, ...availableYears]).map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </Field>
                            <Field label="Wave">
                                <Select style={{ width: '100%' }} value={draft.wave} onChange={e => setField('wave', e.target.value)}>
                                    {WAVES.map(w => <option key={w} value={w}>Wave {w}</option>)}
                                </Select>
                            </Field>
                        </div>
                        <Field label="Status">
                            <Select style={{ width: '100%' }} value={draft.status} onChange={e => setField('status', e.target.value)}>
                                <option value={PASSED}>Passed selection</option>
                                <option value={NOT_YET}>Not yet passed</option>
                            </Select>
                        </Field>
                        <Field label="PDF link (Google Drive)" error={errors.pdfLink} hint="Parents open this link to see the observation result.">
                            <input style={inputStyle(errors.pdfLink)} placeholder="https://drive.google.com/file/d/…" value={draft.pdfLink} onChange={e => setField('pdfLink', e.target.value)} />
                        </Field>
                        {isUrl(draft.pdfLink) && (
                            <a href={draft.pdfLink.trim()} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: -8, color: C.accentDark, fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}>
                                <ExternalLink size={14} /> Open link to check it
                            </a>
                        )}
                    </>
                )}
            </Drawer>

            <Drawer
                open={!!importPlan}
                title="Import students"
                subtitle={importPlan?.fileName}
                onClose={() => !importing && setImportPlan(null)}
                footer={(
                    <>
                        <span />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Button disabled={importing} onClick={() => setImportPlan(null)}>Cancel</Button>
                            <Button variant="primary" disabled={importing || importPlan?.docs.length === 0} onClick={confirmImport}>
                                {importing ? 'Importing…' : `Import ${importPlan?.docs.length ?? 0} students`}
                            </Button>
                        </div>
                    </>
                )}
            >
                {importPlan && (
                    <>
                        {importError && <Notice tone="bad" style={{ marginBottom: 18 }}>{importError}</Notice>}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                            <Pill tone="ok">{importPlan.docs.length} ready to import</Pill>
                            <Pill tone={importPlan.skipped.length ? 'bad' : 'idle'}>{importPlan.skipped.length} skipped</Pill>
                        </div>
                        <p style={{ margin: '0 0 18px', fontSize: '0.84rem', lineHeight: 1.6, color: C.muted }}>
                            Year and wave come from the filters when one is selected, otherwise from the file. Imported students are saved immediately.
                        </p>
                        {importPlan.skipped.length > 0 && (
                            <div style={{ border: `1px solid ${C.line}`, borderRadius: radius.md, overflow: 'hidden' }}>
                                {importPlan.skipped.slice(0, 50).map(r => (
                                    <div key={r.row} style={{ padding: '10px 14px', borderBottom: `1px solid ${C.line}`, fontSize: '0.82rem' }}>
                                        <div style={{ fontWeight: 600, color: C.ink }}>Row {r.row}: {r.name}</div>
                                        <div style={{ color: C.red, marginTop: 2 }}>{r.reason}</div>
                                    </div>
                                ))}
                                {importPlan.skipped.length > 50 && (
                                    <div style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.muted }}>and {importPlan.skipped.length - 50} more skipped rows</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Drawer>

            <Drawer
                open={yearsOpen}
                title="Year settings"
                subtitle="Academic years and the documentation video shown for each."
                onClose={() => setYearsOpen(false)}
            >
                {yearError && <Notice tone="bad" onClose={() => setYearError('')} style={{ marginBottom: 18 }}>{yearError}</Notice>}
                <div style={{ marginBottom: 22 }}>
                    <div style={{ marginBottom: 8, fontSize: '0.78rem', fontWeight: 600, color: C.text }}>Add academic year</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            aria-label="New academic year"
                            style={inputStyle(yearTaken)}
                            placeholder="2027/2028"
                            value={newYear}
                            onChange={e => setNewYear(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && canAddYear) addYear(); }}
                        />
                        <Button variant="primary" icon={Plus} disabled={!canAddYear} onClick={addYear}>Add</Button>
                    </div>
                    {yearTaken && <div style={{ marginTop: 6, fontSize: '0.75rem', fontWeight: 600, color: C.red }}>This year already exists</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {availableYears.map(y => {
                        const saved = yearConfigs.find(c => c.year === y)?.videoUrl || '';
                        const value = videoDrafts[y] ?? saved;
                        const bad = value.trim() !== '' && !isUrl(value);
                        const pending = !!busy[`year:${y}`];
                        return (
                            <div key={y} style={{ padding: 16, borderRadius: radius.md, border: `1px solid ${C.line}`, background: C.soft }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, color: C.ink }}>{y}</span>
                                    <IconButton icon={Trash2} tone="danger" label={`Remove year ${y}`} disabled={pending} onClick={() => removeYear(y)} />
                                </div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.76rem', fontWeight: 600, color: C.text }} htmlFor={`video-${y}`}>YouTube documentation link</label>
                                <input
                                    id={`video-${y}`}
                                    style={inputStyle(bad)}
                                    placeholder="https://youtube.com/watch?v=…"
                                    value={value}
                                    onChange={e => setVideoDrafts(v => ({ ...v, [y]: e.target.value }))}
                                />
                                {bad && <div style={{ marginTop: 6, fontSize: '0.75rem', fontWeight: 600, color: C.red }}>{LINK_HINT}</div>}
                                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Button size="sm" variant="primary" disabled={pending || bad || value === saved} onClick={() => saveVideo(y, value)}>
                                        {pending ? 'Saving…' : 'Save link'}
                                    </Button>
                                    {isUrl(saved) && (
                                        <a href={saved} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.accentDark, fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                                            <ExternalLink size={13} /> Open saved link
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Drawer>
        </div>
    );
}
