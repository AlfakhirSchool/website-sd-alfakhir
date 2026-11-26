'use client';

/**
 * Staff tab: grid of person cards with search and an edit drawer.
 * The list shows server state only. The drawer edits a local draft; Save and Delete hit the server immediately.
 *
 * Props:
 *  - staff: Array<{ _id, name, role, vision, education, email, order, imageUrl?, image? }>  <- staff
 *  - onSave: (draft) => Promise<void>   Create (no _id) or update (has _id). Rejects with an Error to show inline.
 *  - onDelete: (item) => Promise<void>  Called after window.confirm.
 *  - uploadImage: (file: File) => Promise<{ _id: string, url: string }>
 * On upload the draft gets `image` ({ _type: 'image', asset: { _type: 'reference', _ref } }) and `imageUrl`,
 * and `externalImage` is cleared; the whole draft is passed to onSave.
 * New staff start with `order` = staff.length.
 */

import React, { useRef, useState } from 'react';
import { Pencil, Plus, Trash2, Upload, Users } from 'lucide-react';
import { Avatar, Button, C, Drawer, EmptyState, Field, IconButton, Notice, SearchInput, Toolbar, inputStyle, radius } from '../ui';

// Shows the photo, or initials when there is none or it fails to load. `bad` remembers the failing URL, so a new upload resets it.
function Photo({ name, url, size, bad, onError }) {
    const ok = url && bad !== url;
    return ok
        ? <img src={url} alt={name || 'Staff photo'} onError={() => onError(url)} style={{ width: size, height: size, borderRadius: radius.md, objectFit: 'cover', flexShrink: 0 }} />
        : <Avatar name={name} size={size} />;
}

function StaffDrawer({ item, open, onClose, onSave, onDelete, uploadImage }) {
    const [draft, setDraft] = useState(item);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [tried, setTried] = useState(false);
    const [bad, setBad] = useState('');
    const fileRef = useRef(null);
    const set = (field, value) => setDraft(d => ({ ...d, [field]: value }));
    const nameMissing = tried && !(draft.name || '').trim();

    const run = async (kind, action) => {
        setBusy(kind);
        setError('');
        try {
            await action();
            return true;
        } catch (err) {
            setError(err.message || 'Something went wrong. Try again.');
            return false;
        } finally {
            setBusy('');
        }
    };

    const upload = async (file) => {
        if (!file) return;
        await run('upload', async () => {
            const asset = await uploadImage(file);
            setDraft(d => ({ ...d, image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }, imageUrl: asset.url, externalImage: undefined }));
        });
    };

    const save = async () => {
        if (!(draft.name || '').trim()) { setTried(true); return; }
        if (await run('save', () => onSave(draft))) onClose();
    };

    const remove = async () => {
        if (!window.confirm('Delete this staff member?')) return;
        if (await run('delete', () => onDelete(item))) onClose();
    };

    return (
        <Drawer
            open={open}
            title={item._id ? 'Edit staff member' : 'New staff member'}
            onClose={onClose}
            footer={(
                <>
                    {item._id ? <Button variant="danger" icon={Trash2} disabled={!!busy} onClick={remove}>{busy === 'delete' ? 'Deleting…' : 'Delete'}</Button> : <span />}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button disabled={!!busy} onClick={onClose}>Cancel</Button>
                        <Button variant="primary" disabled={!!busy} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save'}</Button>
                    </div>
                </>
            )}
        >
            {error && <Notice tone="bad" onClose={() => setError('')} style={{ marginBottom: 18 }}>{error}</Notice>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <Photo name={draft.name} url={draft.imageUrl} size={88} bad={bad} onError={setBad} />
                <div>
                    <Button icon={Upload} disabled={!!busy} onClick={() => fileRef.current?.click()}>
                        {busy === 'upload' ? 'Uploading…' : draft.imageUrl ? 'Replace photo' : 'Upload photo'}
                    </Button>
                    <div style={{ marginTop: 6, fontSize: '0.74rem', color: bad && bad === draft.imageUrl ? C.red : C.muted }}>
                        {bad && bad === draft.imageUrl ? 'The current photo failed to load. Upload a new one.' : 'Square photos look best.'}
                    </div>
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    aria-hidden="true"
                    tabIndex={-1}
                    style={{ display: 'none' }}
                    onChange={e => {
                        const file = e.target.files[0];
                        e.target.value = '';
                        upload(file);
                    }}
                />
            </div>

            <Field label="Full name and title" error={nameMissing ? 'A name is required' : ''}>
                <input style={inputStyle(nameMissing)} placeholder="Dr. Jane Doe, M.Ed." value={draft.name || ''} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Position or role">
                <input style={inputStyle(false)} placeholder="Head of curriculum" value={draft.role || ''} onChange={e => set('role', e.target.value)} />
            </Field>
            <Field label="Short vision" hint="One sentence.">
                <textarea style={{ ...inputStyle(false), minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} value={draft.vision || ''} onChange={e => set('vision', e.target.value)} />
            </Field>
            <Field label="Latest education">
                <input style={inputStyle(false)} placeholder="B.S. Information Technology" value={draft.education || ''} onChange={e => set('education', e.target.value)} />
            </Field>
            <Field label="Official email">
                <input type="email" style={inputStyle(false)} placeholder="name@school.edu" value={draft.email || ''} onChange={e => set('email', e.target.value)} />
            </Field>
        </Drawer>
    );
}

export default function StaffTab({ staff, onSave, onDelete, uploadImage }) {
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [bad, setBad] = useState('');

    const q = query.trim().toLowerCase();
    const members = staff.filter(m => !q || [m.name, m.role, m.email].some(v => (v || '').toLowerCase().includes(q)));

    const openEditor = (item) => setEditing(e => ({ item, open: true, key: (e?.key ?? 0) + 1 }));
    const closeEditor = () => setEditing(e => e && { ...e, open: false });
    const addMember = () => openEditor({ name: '', role: '', order: staff.length });

    const remove = async (item) => {
        if (!window.confirm(`Delete ${item.name || 'this staff member'}?`)) return;
        setDeletingId(item._id);
        setError('');
        try {
            await onDelete(item);
        } catch (err) {
            setError(err.message || 'Could not delete the staff member.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Toolbar
                left={<SearchInput value={query} onChange={setQuery} placeholder="Search name, role or email" />}
                right={(
                    <>
                        <span style={{ fontSize: '0.82rem', color: C.muted }}>{members.length} of {staff.length}</span>
                        <Button variant="primary" icon={Plus} onClick={addMember}>New staff</Button>
                    </>
                )}
            />

            {error && <Notice tone="bad" onClose={() => setError('')}>{error}</Notice>}

            {staff.length === 0 ? (
                <EmptyState icon={Users} title="No staff yet" text="Add the teaching team with a photo, role and contact email. Each person appears on the public site as soon as you save.">
                    <Button variant="primary" icon={Plus} onClick={addMember}>New staff</Button>
                </EmptyState>
            ) : members.length === 0 ? (
                <EmptyState icon={Users} title="No one matches" text="Try a different name, role or email.">
                    <Button onClick={() => setQuery('')}>Clear search</Button>
                </EmptyState>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
                    {members.map(m => (
                        <div key={m._id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: radius.lg, display: 'flex', flexDirection: 'column', opacity: deletingId === m._id ? 0.5 : 1 }}>
                            <button
                                onClick={() => openEditor(m)}
                                aria-label={`Edit ${m.name || 'staff member'}`}
                                style={{ all: 'unset', cursor: 'pointer', padding: '20px 18px 8px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}
                            >
                                <Photo name={m.name} url={m.imageUrl} size={72} bad={bad} onError={setBad} />
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: m.name ? C.ink : C.red }}>{m.name || 'Unnamed'}</div>
                                    <div style={{ marginTop: 3, fontSize: '0.84rem', fontWeight: 600, color: C.accentDark }}>{m.role || 'No role set'}</div>
                                    {m.email && <div style={{ marginTop: 6, fontSize: '0.78rem', color: C.muted, overflowWrap: 'anywhere' }}>{m.email}</div>}
                                </div>
                            </button>
                            <div style={{ padding: '4px 10px 10px', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <IconButton icon={Pencil} label="Edit" onClick={() => openEditor(m)} />
                                <IconButton icon={Trash2} tone="danger" label="Delete" disabled={deletingId === m._id} onClick={() => remove(m)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <StaffDrawer
                    key={editing.key}
                    item={editing.item}
                    open={editing.open}
                    onClose={closeEditor}
                    onSave={onSave}
                    onDelete={onDelete}
                    uploadImage={uploadImage}
                />
            )}
        </div>
    );
}
