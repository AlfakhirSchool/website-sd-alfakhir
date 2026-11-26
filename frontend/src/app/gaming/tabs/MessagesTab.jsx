'use client';

/**
 * Messages tab: inbox list with an All/Unread filter and a detail drawer.
 * Mark as read and Delete are immediate (same adminMutate calls as before), then the data is refetched.
 *
 * Props (same identifiers as page.jsx):
 *  - messages: Array<{ _id, name, email, subject, message, status: 'unread' | 'read', receivedAt }>  <- messages
 *  - adminMutate: (mutation: { patches?, deletes? }) => Promise<any>                                 <- adminMutate
 *  - fetchAllData: () => Promise<void> | void                                                         <- fetchAllData
 */

import React, { useState } from 'react';
import { Check, Mail, Reply, Trash2 } from 'lucide-react';
import { Avatar, Button, C, Drawer, EmptyState, Notice, Segmented, Toolbar, fmtDate, radius } from '../ui';

const replyHref = (m) => `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || ''}`)}`;

export default function MessagesTab({ messages, adminMutate, fetchAllData }) {
    const [filter, setFilter] = useState('all');
    const [openId, setOpenId] = useState(null);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');

    const unread = messages.filter(m => m.status === 'unread').length;
    const shown = filter === 'unread' ? messages.filter(m => m.status === 'unread') : messages;
    const current = messages.find(m => m._id === openId);

    const run = async (kind, mutation) => {
        setBusy(kind);
        setError('');
        try {
            await adminMutate(mutation);
            await fetchAllData();
            return true;
        } catch (err) {
            setError(err.message || 'Something went wrong. Try again.');
            return false;
        } finally {
            setBusy('');
        }
    };

    const markRead = (m) => run('read', { patches: [{ id: m._id, set: { status: 'read' } }] });

    const remove = async (m) => {
        if (!window.confirm('Delete this message?')) return;
        if (await run('delete', { deletes: [{ type: 'contactMessage', id: m._id }] })) setOpenId(null);
    };

    const open = (id) => { setError(''); setOpenId(id); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Toolbar
                left={(
                    <Segmented
                        value={filter}
                        onChange={setFilter}
                        options={[{ value: 'all', label: `All (${messages.length})` }, { value: 'unread', label: `Unread (${unread})` }]}
                    />
                )}
            />

            {error && !current && <Notice tone="bad" onClose={() => setError('')}>{error}</Notice>}

            {messages.length === 0 ? (
                <EmptyState icon={Mail} title="No messages yet" text="Messages sent through the contact form on the public site appear here." />
            ) : shown.length === 0 ? (
                <EmptyState icon={Mail} title="Nothing unread" text="Every message has been read.">
                    <Button onClick={() => setFilter('all')}>Show all messages</Button>
                </EmptyState>
            ) : (
                <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: radius.lg, overflow: 'hidden' }}>
                    {shown.map((m, i) => {
                        const isUnread = m.status === 'unread';
                        return (
                            <button
                                key={m._id || i}
                                onClick={() => open(m._id)}
                                onMouseOver={e => { e.currentTarget.style.background = C.soft; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', background: 'transparent', border: 'none', borderTop: i ? `1px solid ${C.line}` : 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                <span aria-label={isUnread ? 'Unread' : 'Read'} style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isUnread ? C.accent : 'transparent' }} />
                                <Avatar name={m.name || 'Visitor'} size={38} />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                        <span style={{ fontSize: '0.88rem', fontWeight: isUnread ? 700 : 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name || 'Visitor'}</span>
                                        <span style={{ fontSize: '0.76rem', color: C.muted, flexShrink: 0 }}>{fmtDate(m.receivedAt) || '-'}</span>
                                    </div>
                                    <div style={{ marginTop: 2, fontSize: '0.84rem', fontWeight: isUnread ? 700 : 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject || 'No subject'}</div>
                                    <div style={{ marginTop: 2, fontSize: '0.82rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <Drawer
                open={!!current}
                title={current?.subject || 'No subject'}
                subtitle={current?.receivedAt ? new Date(current.receivedAt).toLocaleString('en-GB') : undefined}
                onClose={() => setOpenId(null)}
                width={520}
                footer={current && (
                    <>
                        <Button variant="danger" icon={Trash2} disabled={!!busy} onClick={() => remove(current)}>{busy === 'delete' ? 'Deleting…' : 'Delete'}</Button>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {current.status === 'unread' && (
                                <Button icon={Check} disabled={!!busy} onClick={() => markRead(current)}>{busy === 'read' ? 'Marking…' : 'Mark as read'}</Button>
                            )}
                            {current.email && (
                                <a
                                    href={replyHref(current)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: radius.md, background: C.accent, color: '#fff', border: `1px solid ${C.accent}`, fontSize: '0.84rem', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    <Reply size={16} />Reply by email
                                </a>
                            )}
                        </div>
                    </>
                )}
            >
                {current && (
                    <>
                        {error && <Notice tone="bad" onClose={() => setError('')} style={{ marginBottom: 18 }}>{error}</Notice>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <Avatar name={current.name || 'Visitor'} size={44} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.ink }}>{current.name || 'Visitor'}</div>
                                {current.email && <div style={{ fontSize: '0.82rem', color: C.muted, overflowWrap: 'anywhere' }}>{current.email}</div>}
                            </div>
                        </div>
                        <div style={{ padding: 18, borderRadius: radius.md, background: C.soft, border: `1px solid ${C.line}`, fontSize: '0.92rem', lineHeight: 1.65, color: C.ink, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                            {current.message}
                        </div>
                    </>
                )}
            </Drawer>
        </div>
    );
}
