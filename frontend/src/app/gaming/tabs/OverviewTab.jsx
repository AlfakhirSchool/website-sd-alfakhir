'use client';

/**
 * Dashboard home: key totals, registrations by month, capacity quota and recent activity.
 *
 * Props (identifier in page.jsx -> prop):
 *   students      array    students
 *   registrations array    registrations
 *   messages      array    messages
 *   isPassed      function isPassed (status string -> boolean)
 *   setActiveTab  function setActiveTab (tab id string), used by the stat cards and "View all" links
 */

import React from 'react';
import { BookOpen, Database, GraduationCap, Mail } from 'lucide-react';
import { Button, Card, C, Pill, SectionTitle, StatCard, StatGrid, radius } from '../ui';

const CAPACITY = 320;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const CHART_HEIGHT = 180;
const RECENT_LIMIT = 3;

// Same series as before: "Registrants" = students with a registrationDate, "Accepted" = every student with any date.
function monthlyCounts(students) {
    const accepted = new Array(MONTHS.length).fill(0);
    const registrants = new Array(MONTHS.length).fill(0);
    students.forEach(s => {
        const dStr = s.registrationDate || s._createdAt;
        if (!dStr) return;
        const m = new Date(dStr).getMonth();
        if (m >= 0 && m < MONTHS.length) {
            accepted[m]++;
            if (s.registrationDate) registrants[m]++;
        }
    });
    return { accepted, registrants };
}

function Legend({ color, label }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: C.text, fontWeight: 600 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            {label}
        </span>
    );
}

function Bar({ value, max, color, label }) {
    const height = Math.round((value / max) * CHART_HEIGHT);
    return (
        <div title={`${label}: ${value}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', width: 14 }}>
            {value > 0 && <span style={{ fontSize: '0.68rem', fontWeight: 600, color: C.muted, marginBottom: 2 }}>{value}</span>}
            <div style={{ width: '100%', height, background: color, borderRadius: '4px 4px 0 0' }} />
        </div>
    );
}

function RegistrationChart({ students }) {
    const { accepted, registrants } = monthlyCounts(students);
    const max = Math.max(...accepted, ...registrants, 1);
    const ticks = [max, Math.round(max / 2), 0];

    return (
        <Card style={{ flex: '2 1 420px', minWidth: 0 }}>
            <SectionTitle
                title="Registrations by month"
                hint="January to September, from student records with a date"
                action={
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Legend color={C.accent} label="Registrants" />
                        <Legend color={C.teal} label="Accepted" />
                    </div>
                }
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: CHART_HEIGHT, alignItems: 'flex-end', fontSize: '0.72rem', color: C.muted, width: 26 }}>
                    {ticks.map((t, i) => <span key={i} style={{ lineHeight: 1 }}>{t}</span>)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ position: 'relative', height: CHART_HEIGHT, borderBottom: `1px solid ${C.line}` }}>
                        {[0, 50].map(p => (
                            <div key={p} style={{ position: 'absolute', left: 0, right: 0, top: `${p}%`, borderTop: `1px dashed ${C.line}` }} />
                        ))}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between' }}>
                            {MONTHS.map((month, i) => (
                                <div key={month} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                                    <Bar value={registrants[i]} max={max} color={C.accent} label={`${month} registrants`} />
                                    <Bar value={accepted[i]} max={max} color={C.teal} label={`${month} accepted`} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginTop: 8 }}>
                        {MONTHS.map(month => (
                            <span key={month} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>{month}</span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function CapacityCard({ accepted }) {
    const pct = Math.min(100, Math.round((accepted / CAPACITY) * 100));
    const full = pct >= 100;

    return (
        <Card style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle title="Capacity quota" hint="Accepted students against the admission target" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 700, color: C.ink, lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 600 }}>{accepted} / {CAPACITY}</span>
            </div>
            <div
                role="progressbar"
                aria-label="Capacity used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                style={{ height: 10, borderRadius: 100, background: C.neutralSoft, overflow: 'hidden', marginTop: 16 }}
            >
                <div style={{ width: `${pct}%`, height: '100%', background: full ? C.red : C.accent, borderRadius: 100 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.line}`, paddingTop: 14, marginTop: 'auto' }}>
                <span style={{ fontSize: '0.85rem', color: C.text }}>Status</span>
                <Pill tone={full ? 'bad' : 'ok'}>{full ? 'Full' : 'Available'}</Pill>
            </div>
        </Card>
    );
}

function Row({ title, detail, pill }) {
    return (
        <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: radius.md, background: C.soft }}>
            <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                {detail && <span style={{ display: 'block', fontSize: '0.8rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{detail}</span>}
            </span>
            {pill}
        </li>
    );
}

function RecentList({ title, empty, items, onViewAll, viewAllLabel }) {
    return (
        <Card style={{ flex: '1 1 320px', minWidth: 0 }}>
            <SectionTitle title={title} action={<Button variant="ghost" size="sm" onClick={onViewAll}>{viewAllLabel}</Button>} />
            {items.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.88rem', color: C.muted }}>{empty}</p>
            ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>{items}</ul>
            )}
        </Card>
    );
}

export default function OverviewTab({ students, registrations, messages, isPassed, setActiveTab }) {
    const accepted = students.filter(s => isPassed(s.status)).length;
    const unread = messages.filter(m => m.status === 'unread').length;

    const recentStudents = students.slice(0, RECENT_LIMIT).map((s, i) => (
        <Row
            key={i}
            title={s.name || 'No name'}
            pill={<Pill tone={isPassed(s.status) ? 'ok' : 'wait'}>{s.status || 'Pending'}</Pill>}
        />
    ));
    const recentMessages = messages.slice(0, RECENT_LIMIT).map((m, i) => (
        <Row
            key={i}
            title={m.senderName || 'Visitor'}
            detail={m.subject || m.message || 'No subject'}
            pill={<Pill tone={m.status === 'unread' ? 'bad' : 'idle'}>{m.status}</Pill>}
        />
    ));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <StatGrid>
                <StatCard icon={GraduationCap} tone="ok" label="Students accepted" value={accepted} onClick={() => setActiveTab('active-students')} />
                <StatCard icon={BookOpen} tone="wait" label="Prospective registrants" value={registrations.length} hint="Awaiting initial review" onClick={() => setActiveTab('registrations')} />
                <StatCard icon={Mail} tone={unread ? 'bad' : 'idle'} label="Unread messages" value={unread} hint="Needs a prompt response" onClick={() => setActiveTab('messages')} />
                <StatCard icon={Database} tone="info" label="Total active records" value={students.length + registrations.length} hint="Students and registrants" />
            </StatGrid>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <RegistrationChart students={students} />
                <CapacityCard accepted={accepted} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <RecentList
                    title="Recently submitted"
                    empty="No students yet."
                    items={recentStudents}
                    onViewAll={() => setActiveTab('students')}
                    viewAllLabel="View all"
                />
                <RecentList
                    title="Latest messages"
                    empty="No messages yet."
                    items={recentMessages}
                    onViewAll={() => setActiveTab('messages')}
                    viewAllLabel="View all"
                />
            </div>
        </div>
    );
}
