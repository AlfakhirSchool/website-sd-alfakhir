'use client';

/**
 * Online registrations tab: open/close switch, active wave, filters, table, detail drawer, Excel export.
 *
 * Props (identifier = what page.jsx already calls it):
 *   students            array   - all students; registrations are the ones with `registrationDate`
 *   setStudents         fn      - state setter (optimistic row updates)
 *   siteSettings        object  - { registrationEnabled, activeWave, ... }
 *   setSiteSettings     fn      - state setter
 *   isSavingSettings    bool    - settings save in flight
 *   setIsSavingSettings fn      - state setter
 *   filterYear          string  - selected academic year, 'Semua' = all years
 *   setFilterYear       fn      - state setter
 *   availableYears      string[]
 *   newYearInput        string  - "add year" text field value
 *   setNewYearInput     fn      - state setter
 *   handleAddYear       fn      - adds newYearInput to availableYears
 *   registrationFilter  string  - 'all' | 'booking_fee' | 'formulir' | 'seat'
 *   setRegistrationFilter fn    - state setter
 *   adminMutate         fn      - async ({ patches?, deletes? }) network helper
 *   fetchAllData        fn      - reloads everything from the server
 *   setIsLoading        fn      - state setter (full-screen loading overlay)
 *   setSuccess          fn      - state setter (success toast)
 *   setError            fn      - state setter (error toast)
 *
 * The XLSX export is done here; the `xlsx` package is imported locally.
 */

import React, { useMemo, useState } from 'react';
import { BadgeCheck, CheckCircle2, CreditCard, Download, Eye, FileText, Plus, Trash2, Users } from 'lucide-react';
import {
    C, radius, Button, IconButton, Card, Pill, StatCard, StatGrid, Toolbar, inputStyle, SearchInput, Select,
    EmptyState, Segmented, table, Drawer, fmtDate,
} from '../ui';

const WAVES = ['1', '2', '3'];
const longDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// `group` decides the drawer section; array order is the export column order.
const FIELDS = [
    { group: 'registration', label: 'Registered on', get: r => (r.registrationDate ? fmtDate(r.registrationDate) : '-') },
    { group: 'student', label: 'Child name', get: r => r.name || '-' },
    { group: 'student', label: 'Gender', get: r => (r.gender === 'L' || r.gender === 'Laki-laki' ? 'Male' : 'Female') },
    { group: 'registration', label: 'Year', get: r => r.year || '-' },
    { group: 'registration', label: 'Wave', get: r => r.wave || '-' },
    { group: 'contact', label: 'Parent name', get: r => r.parentName || '-' },
    { group: 'contact', label: 'WhatsApp contact', get: r => r.whatsapp || '-' },
    { group: 'school', label: 'Previous school', get: r => r.school || r.schoolName || '-' },
    { group: 'student', label: 'Place, date of birth', get: r => `${r.birthPlace || '-'}${r.birthDate ? `, ${longDate(r.birthDate)}` : ''}` },
    { group: 'student', label: 'NIK', get: r => r.nik || '-' },
    { group: 'student', label: 'NISN', get: r => r.nisn || '-' },
    { group: 'student', label: 'Religion', get: r => r.religion || '-' },
    { group: 'student', label: 'Child order / of siblings', get: r => `${r.childOrder || '-'} of ${r.siblingOf || '-'}` },
    { group: 'student', label: 'Height / weight', get: r => `${r.height || '-'} cm / ${r.weight || '-'} kg` },
    { group: 'student', label: 'Daily language', get: r => r.dailyLanguage || '-' },
    { group: 'student', label: 'KIP/KIS/KKS/KPS no.', get: r => r.kip || '-' },
    { group: 'student', label: 'Student phone no.', get: r => r.studentPhone || '-' },
    { group: 'student', label: 'Address', get: r => `${r.address || '-'}${r.city ? `, ${r.city}` : ''}${r.province ? `, ${r.province}` : ''}` },
    { group: 'school', label: 'Previous school grad. year', get: r => r.graduationYear || '-' },
    { group: 'father', label: 'Father name', get: r => r.fatherName || '-' },
    { group: 'father', label: 'Father NIK', get: r => r.nikAyah || '-' },
    { group: 'father', label: 'Father place/DOB', get: r => r.fatherBirthInfo || '-' },
    { group: 'father', label: 'Father education', get: r => r.fatherEducation || '-' },
    { group: 'father', label: 'Father occupation', get: r => r.fatherJob || '-' },
    { group: 'father', label: 'Father income', get: r => r.fatherIncome || '-' },
    { group: 'father', label: 'Father phone no.', get: r => r.fatherPhone || '-' },
    { group: 'father', label: 'Father status', get: r => r.fatherStatus || '-' },
    { group: 'mother', label: 'Mother name', get: r => r.motherName || '-' },
    { group: 'mother', label: 'Mother NIK', get: r => r.nikIbu || '-' },
    { group: 'mother', label: 'Mother place/DOB', get: r => r.motherBirthInfo || '-' },
    { group: 'mother', label: 'Mother education', get: r => r.motherEducation || '-' },
    { group: 'mother', label: 'Mother occupation', get: r => r.motherJob || '-' },
    { group: 'mother', label: 'Mother income', get: r => r.motherIncome || '-' },
    { group: 'mother', label: 'Mother phone no.', get: r => r.motherPhone || '-' },
    { group: 'mother', label: 'Mother status', get: r => r.motherStatus || '-' },
];

const SECTIONS = [
    { group: 'registration', title: 'Registration' },
    { group: 'student', title: 'Student' },
    { group: 'school', title: 'School' },
    { group: 'contact', title: 'Parent contact' },
    { group: 'father', title: 'Father' },
    { group: 'mother', title: 'Mother' },
];

const typeOf = (r) => r.registrationType || (r.paymentProof ? 'booking_fee' : 'formulir');
const isSeat = (r) => r.seatConfirmed === 'true' || r.seatConfirmed === true;
const proofUrl = (v) => (/^https?:\/\//.test(v) ? v : `https://${v}`);
const openProof = (v) => window.open(proofUrl(v), '_blank', 'noopener');

function TypeToggle({ reg, onToggle }) {
    const booking = typeOf(reg) === 'booking_fee';
    return (
        <button
            onClick={onToggle}
            title={booking ? 'Switch to form only' : 'Switch to booking fee'}
            aria-label={`Registration type: ${booking ? 'booking fee' : 'form only'}. Click to change.`}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
            <Pill tone={booking ? 'ok' : 'wait'}>{booking ? 'Booking fee' : 'Form only'}</Pill>
        </button>
    );
}

function SeatCheckbox({ reg, onChange, label }) {
    return (
        <input
            type="checkbox"
            aria-label={label}
            checked={isSeat(reg)}
            onChange={e => onChange(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.teal }}
        />
    );
}

function Switch({ on, disabled, onClick, label }) {
    return (
        <button
            role="switch"
            aria-checked={on}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            style={{
                width: 44, height: 24, borderRadius: 100, border: 'none', padding: 2, flexShrink: 0, position: 'relative',
                background: on ? C.teal : '#cfc6b8', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
                transition: 'background-color 0.15s',
            }}
        >
            <span style={{ display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: `translateX(${on ? 20 : 0}px)`, transition: 'transform 0.15s' }} />
        </button>
    );
}

function Detail({ label, value }) {
    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted }}>{label}</div>
            <div style={{ marginTop: 3, fontSize: '0.86rem', color: C.ink, wordBreak: 'break-word' }}>{value}</div>
        </div>
    );
}

function DetailSection({ title, children }) {
    return (
        <section style={{ marginBottom: 26 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 700, color: C.ink }}>{title}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px 18px', padding: 16, borderRadius: radius.md, background: C.soft, border: `1px solid ${C.line}` }}>
                {children}
            </div>
        </section>
    );
}

export default function RegistrationsTab({
    students, setStudents, siteSettings, setSiteSettings, isSavingSettings, setIsSavingSettings,
    filterYear, setFilterYear, availableYears, newYearInput, setNewYearInput, handleAddYear,
    registrationFilter, setRegistrationFilter, adminMutate, fetchAllData, setIsLoading, setSuccess, setError,
}) {
    const [query, setQuery] = useState('');
    const [detailId, setDetailId] = useState(null);

    const registrationOpen = siteSettings.registrationEnabled !== false;
    const activeWave = siteSettings.activeWave || '1';

    const flash = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const saveSetting = async (patch, okMessage, failPrefix) => {
        if (isSavingSettings) return;
        try {
            setIsSavingSettings(true);
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to save.');
            setSiteSettings(prev => ({ ...prev, ...patch }));
            flash(okMessage);
        } catch (err) {
            setError(`${failPrefix}: ${err.message || 'An error occurred.'}`);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Optimistic: a full fetchAllData() per click would flash the loading overlay.
    const patchRegistration = async (id, set) => {
        setStudents(prev => prev.map(s => (s._id === id ? { ...s, ...set } : s)));
        try {
            await adminMutate({ patches: [{ id, set: { _type: 'student', ...set } }] });
        } catch (err) {
            setError('Failed to save: ' + (err.message || 'An error occurred.'));
            fetchAllData();
        }
    };

    const deleteRegistration = async (id) => {
        if (!window.confirm('Delete this registration record?')) return;
        try {
            setIsLoading(true);
            await adminMutate({ deletes: [{ type: 'student', id }] });
            setDetailId(null);
            flash('Registration record deleted from Cloud successfully!');
            fetchAllData();
        } catch (err) {
            console.error('Delete Error:', err);
            setError('Failed to delete: ' + (err.message || 'Access denied. Make sure the Sanity Token has Write/Editor permission and CORS Allow Credentials is enabled.'));
        } finally {
            setIsLoading(false);
        }
    };

    const legacyLeaked = students.filter(s => s.registrationDate && s.status === 'Lolos');

    const fixLegacy = async () => {
        if (!window.confirm(`Reset the status of ${legacyLeaked.length} of these registrations back to "Not Yet Passed" (not yet observed)?`)) return;
        try {
            setIsLoading(true);
            await adminMutate({ patches: legacyLeaked.map(s => ({ id: s._id, set: { _type: 'student', status: 'Not Yet Passed' } })) });
            flash('Old registration statuses reset successfully!');
            fetchAllData();
        } catch (err) {
            setError('Failed to reset: ' + (err.message || 'An error occurred.'));
        } finally {
            setIsLoading(false);
        }
    };

    const yearRows = useMemo(
        () => students.filter(s => s.registrationDate && (filterYear === 'Semua' || (s.year || '') === filterYear)),
        [students, filterYear],
    );
    const counts = useMemo(() => ({
        all: yearRows.length,
        booking_fee: yearRows.filter(r => typeOf(r) === 'booking_fee').length,
        formulir: yearRows.filter(r => typeOf(r) === 'formulir').length,
        seat: yearRows.filter(isSeat).length,
    }), [yearRows]);

    const q = query.trim().toLowerCase();
    const rows = yearRows.filter(r => {
        if (registrationFilter === 'seat' ? !isSeat(r) : registrationFilter !== 'all' && typeOf(r) !== registrationFilter) return false;
        return !q || [r.name, r.parentName, r.whatsapp, r.school, r.schoolName].some(v => (v || '').toLowerCase().includes(q));
    });

    const detail = detailId ? students.find(s => s._id === detailId) : null;
    const filtered = registrationFilter !== 'all' || q !== '';

    const exportRegistrations = async () => {
        const XLSX = await import('xlsx');
        const exportRows = rows.map((r, i) => {
            const row = { '#': i + 1, TYPE: typeOf(r) === 'booking_fee' ? 'BOOKING FEE' : 'FORM ONLY', 'SEAT CONFIRMED': isSeat(r) ? 'YES' : 'NO' };
            FIELDS.forEach(f => { row[f.label.toUpperCase()] = f.get(r); });
            return row;
        });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exportRows), 'Registrations');
        const yearLabel = filterYear === 'Semua' ? 'AllYears' : filterYear.replace('/', '-');
        XLSX.writeFile(workbook, `AlFakhir_Registrations_${yearLabel}.xlsx`);
    };

    const statusLabel = registrationOpen ? 'Online registration is open' : 'Online registration is closed';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'inherit' }}>
            <Card padding={18} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                    <Switch
                        on={registrationOpen}
                        disabled={isSavingSettings}
                        label={statusLabel}
                        onClick={() => saveSetting(
                            { registrationEnabled: !registrationOpen },
                            registrationOpen ? 'Online registration closed!' : 'Online registration opened!',
                            'Failed to change registration status',
                        )}
                    />
                    <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.ink }}>{statusLabel}</div>
                        <div style={{ marginTop: 3, fontSize: '0.78rem', color: C.muted }}>
                            {registrationOpen ? 'The form shows normally at /pendaftaran.' : 'The /pendaftaran page shows a registration-closed message.'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: 300 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.ink }}>Active wave: Wave {activeWave}</div>
                        <div style={{ marginTop: 3, fontSize: '0.78rem', color: C.muted }}>
                            New registrations are assigned to this wave. Move it up once a wave&apos;s results are published.
                        </div>
                    </div>
                    <Segmented
                        value={activeWave}
                        options={WAVES.map(w => ({ value: w, label: `Wave ${w}` }))}
                        onChange={w => w !== activeWave && saveSetting({ activeWave: w }, `Active wave set to Wave ${w}!`, 'Failed to change active wave')}
                    />
                </div>
            </Card>

            {legacyLeaked.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '14px 18px', borderRadius: radius.md, background: C.amberSoft, border: `1px solid ${C.line}` }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#8a4a12', flex: 1, minWidth: 260 }}>
                        {legacyLeaked.length} old registrations were automatically pulled into Observation Results (the &quot;Lolos&quot; status bug, since fixed), even though they haven&apos;t been observed yet.
                    </div>
                    <Button variant="dark" size="sm" onClick={fixLegacy}>Fix {legacyLeaked.length} old records</Button>
                </div>
            )}

            <StatGrid min={190}>
                <StatCard icon={Users} label="All registrations" value={counts.all} active={registrationFilter === 'all'} onClick={() => setRegistrationFilter('all')} />
                <StatCard icon={CreditCard} tone="ok" label="Booking fee paid" value={counts.booking_fee} active={registrationFilter === 'booking_fee'} onClick={() => setRegistrationFilter('booking_fee')} />
                <StatCard icon={FileText} tone="wait" label="Form only" value={counts.formulir} active={registrationFilter === 'formulir'} onClick={() => setRegistrationFilter('formulir')} />
                <StatCard icon={BadgeCheck} tone="info" label="Seat confirmed" value={counts.seat} active={registrationFilter === 'seat'} onClick={() => setRegistrationFilter('seat')} />
            </StatGrid>

            <Toolbar
                left={(
                    <>
                        <SearchInput value={query} onChange={setQuery} placeholder="Search child, parent, WhatsApp or school" />
                        <Select value={filterYear} onChange={e => setFilterYear(e.target.value)} aria-label="Academic year">
                            <option value="Semua">All years</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </>
                )}
                right={(
                    <>
                        <input
                            aria-label="New academic year"
                            placeholder="Add year, e.g. 2027/2028"
                            value={newYearInput}
                            onChange={e => setNewYearInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddYear()}
                            style={{ ...inputStyle(false), width: 190 }}
                        />
                        <Button icon={Plus} onClick={handleAddYear} disabled={!newYearInput}>Add year</Button>
                        <Button variant="primary" icon={Download} onClick={exportRegistrations} disabled={rows.length === 0}>Export ({rows.length})</Button>
                    </>
                )}
            />

            {rows.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title={filtered ? 'No registrations match' : 'No online registrations yet'}
                    text={filtered ? 'Try another filter or clear the search.' : 'Registrations submitted through the online form appear here.'}
                >
                    {filtered && <Button onClick={() => { setRegistrationFilter('all'); setQuery(''); }}>Clear filters</Button>}
                </EmptyState>
            ) : (
                <div style={table.wrap}>
                    <table style={table.el}>
                        <thead>
                            <tr>
                                {['#', 'Registered', 'Child', 'Parent', 'Year', 'Type', 'Seat', 'Payment proof', ''].map(h => (
                                    <th key={h || 'actions'} style={{ ...table.th, textAlign: h === 'Seat' ? 'center' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((reg, idx) => (
                                <tr key={reg._id || idx}>
                                    <td style={{ ...table.td, color: C.muted, fontWeight: 600, width: 1 }}>{idx + 1}</td>
                                    <td style={{ ...table.td, whiteSpace: 'nowrap' }}>{fmtDate(reg.registrationDate) || '-'}</td>
                                    <td style={table.td}>
                                        <div style={{ fontWeight: 600, color: C.ink }}>{reg.name || '-'}</div>
                                        <div style={{ fontSize: '0.76rem', color: C.muted }}>{reg.school || reg.schoolName || 'No previous school'}</div>
                                    </td>
                                    <td style={table.td}>
                                        <div>{reg.parentName || '-'}</div>
                                        <div style={{ fontSize: '0.76rem', color: C.muted }}>{reg.whatsapp || '-'}</div>
                                    </td>
                                    <td style={{ ...table.td, whiteSpace: 'nowrap' }}>
                                        <div>{reg.year || '-'}</div>
                                        <div style={{ fontSize: '0.76rem', color: C.muted }}>Wave {reg.wave || '-'}</div>
                                    </td>
                                    <td style={table.td}>
                                        <TypeToggle reg={reg} onToggle={() => patchRegistration(reg._id, { registrationType: typeOf(reg) === 'booking_fee' ? 'formulir' : 'booking_fee' })} />
                                    </td>
                                    <td style={{ ...table.td, textAlign: 'center' }}>
                                        <SeatCheckbox
                                            reg={reg}
                                            label={`Seat confirmed for ${reg.name || 'this child'}`}
                                            onChange={checked => patchRegistration(reg._id, { seatConfirmed: checked ? 'true' : 'false' })}
                                        />
                                    </td>
                                    <td style={table.td}>
                                        {reg.paymentProof
                                            ? <Button size="sm" icon={Eye} onClick={() => openProof(reg.paymentProof)}>View proof</Button>
                                            : <Pill tone="bad">None yet</Pill>}
                                    </td>
                                    <td style={{ ...table.td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                                        <Button size="sm" variant="ghost" onClick={() => setDetailId(reg._id)}>Details</Button>
                                        <IconButton icon={Trash2} tone="danger" label="Delete registration" onClick={() => deleteRegistration(reg._id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Drawer
                open={Boolean(detail)}
                title={detail?.name || 'Registration'}
                subtitle={detail ? `Registered ${fmtDate(detail.registrationDate) || '-'}` : ''}
                width={540}
                onClose={() => setDetailId(null)}
                footer={detail && (
                    <>
                        <Button variant="danger" icon={Trash2} onClick={() => deleteRegistration(detail._id)}>Delete</Button>
                        <Button onClick={() => setDetailId(null)}>Close</Button>
                    </>
                )}
            >
                {detail && (
                    <>
                        <DetailSection title="Payment">
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, marginBottom: 6 }}>Registration type</div>
                                <TypeToggle reg={detail} onToggle={() => patchRegistration(detail._id, { registrationType: typeOf(detail) === 'booking_fee' ? 'formulir' : 'booking_fee' })} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: C.muted, marginBottom: 6 }}>Seat confirmed</div>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: C.ink, cursor: 'pointer' }}>
                                    <SeatCheckbox
                                        reg={detail}
                                        label={`Seat confirmed for ${detail.name || 'this child'}`}
                                        onChange={checked => patchRegistration(detail._id, { seatConfirmed: checked ? 'true' : 'false' })}
                                    />
                                    {isSeat(detail) ? 'Yes' : 'No'}
                                </label>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                {detail.paymentProof
                                    ? <Button icon={Eye} onClick={() => openProof(detail.paymentProof)}>View payment proof</Button>
                                    : <Pill tone="bad">No payment proof yet</Pill>}
                            </div>
                        </DetailSection>
                        {SECTIONS.map(s => (
                            <DetailSection key={s.group} title={s.title}>
                                {FIELDS.filter(f => f.group === s.group).map(f => <Detail key={f.label} label={f.label} value={f.get(detail)} />)}
                            </DetailSection>
                        ))}
                    </>
                )}
            </Drawer>
        </div>
    );
}
