'use client';

/**
 * Gallery tab: photo/event cards with search, category filter and an edit drawer.
 * The list shows server state only. The drawer edits a local draft; Save and Delete hit the server immediately.
 *
 * Props:
 *  - gallery: Array<{ _id, title, category, date, agenda, imageUrl?, image? }>  <- gallery
 *  - onSave: (draft) => Promise<void>   Create (no _id) or update (has _id). Rejects with an Error to show inline.
 *  - onDelete: (item) => Promise<void>  Called after window.confirm.
 *  - uploadImage: (file: File) => Promise<{ _id: string, url: string }>
 * On upload the draft gets `image` ({ _type: 'image', asset: { _type: 'reference', _ref } }) and `imageUrl`,
 * and `externalImage` is cleared; the whole draft is passed to onSave.
 */

import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Button, C, Drawer, EmptyState, Field, IconButton, Notice, Pill, SearchInput, Select, Toolbar, inputStyle, radius } from '../ui';

const CATEGORIES = [
    { value: 'acara', label: 'Event', tone: 'info' },
    { value: 'berita', label: 'News', tone: 'ok' },
    { value: 'penghargaan', label: 'Award', tone: 'wait' },
    { value: 'lain-lain', label: 'Other', tone: 'idle' },
];
const categoryOf = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[0];
const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

function GalleryDrawer({ item, open, onClose, onSave, onDelete, uploadImage }) {
    const [draft, setDraft] = useState(item);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [tried, setTried] = useState(false);
    const fileRef = useRef(null);
    const set = (field, value) => setDraft(d => ({ ...d, [field]: value }));

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
        if (!(draft.title || '').trim()) { setTried(true); return; }
        if (await run('save', () => onSave(draft))) onClose();
    };

    const remove = async () => {
        if (!window.confirm('Delete this gallery item?')) return;
        if (await run('delete', () => onDelete(item))) onClose();
    };

    return (
        <Drawer
            open={open}
            title={item._id ? 'Edit photo or event' : 'New photo or event'}
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

            <div style={{ marginBottom: 18 }}>
                <div style={{ marginBottom: 8, fontSize: '0.78rem', fontWeight: 600, color: C.text }}>Image</div>
                <div style={{ aspectRatio: '16 / 10', borderRadius: radius.md, border: `1px solid ${C.line}`, background: draft.imageUrl ? C.neutralSoft : C.soft, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.8rem', fontWeight: 600 }}>
                    {draft.imageUrl
                        ? <img src={draft.imageUrl} alt={draft.title || 'Gallery preview'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ textAlign: 'center' }}><ImageIcon size={28} style={{ marginBottom: 6 }} /><div>No image uploaded</div></div>}
                </div>
                <Button style={{ marginTop: 10 }} icon={Upload} disabled={!!busy} onClick={() => fileRef.current?.click()}>
                    {busy === 'upload' ? 'Uploading…' : draft.imageUrl ? 'Replace image' : 'Upload image'}
                </Button>
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

            <Field label="Title" error={tried && !(draft.title || '').trim() ? 'A title is required' : ''}>
                <input style={inputStyle(tried && !(draft.title || '').trim())} placeholder="Event title" value={draft.title || ''} onChange={e => set('title', e.target.value)} />
            </Field>
            <Field label="Category">
                <Select style={{ width: '100%' }} value={draft.category || 'acara'} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
            </Field>
            <Field label="Date" hint="Shown as written, for example 12 Mar 2026. Use the picker to fill it in.">
                <div style={{ display: 'flex', gap: 8 }}>
                    <input style={inputStyle(false)} placeholder="12 Mar 2026" value={draft.date || ''} onChange={e => set('date', e.target.value)} />
                    <input
                        type="date"
                        aria-label="Pick date"
                        style={{ ...inputStyle(false), width: 'auto', cursor: 'pointer' }}
                        onChange={e => e.target.value && set('date', formatDate(new Date(e.target.value)))}
                    />
                </div>
            </Field>
            <Field label="Description">
                <textarea
                    style={{ ...inputStyle(false), minHeight: 120, resize: 'vertical', lineHeight: 1.5 }}
                    placeholder="What happened, who took part, why it matters"
                    value={draft.agenda || ''}
                    onChange={e => set('agenda', e.target.value)}
                />
            </Field>
        </Drawer>
    );
}

export default function GalleryTab({ gallery, onSave, onDelete, uploadImage }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    const q = query.trim().toLowerCase();
    const items = gallery.filter(item => (category === 'all' || (item.category || 'acara') === category)
        && (!q || [item.title, item.agenda, item.date].some(v => (v || '').toLowerCase().includes(q))));

    const openEditor = (item) => setEditing(e => ({ item, open: true, key: (e?.key ?? 0) + 1 }));
    const closeEditor = () => setEditing(e => e && { ...e, open: false });
    const addItem = () => openEditor({ title: '', category: 'acara', date: formatDate(new Date()), agenda: '' });

    const remove = async (item) => {
        if (!window.confirm('Delete this gallery item?')) return;
        setDeletingId(item._id);
        setError('');
        try {
            await onDelete(item);
        } catch (err) {
            setError(err.message || 'Could not delete the item.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Toolbar
                left={(
                    <>
                        <SearchInput value={query} onChange={setQuery} placeholder="Search title, description or date" />
                        <Select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="all">All categories</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </Select>
                    </>
                )}
                right={(
                    <>
                        <span style={{ fontSize: '0.82rem', color: C.muted }}>{items.length} of {gallery.length}</span>
                        <Button variant="primary" icon={Plus} onClick={addItem}>New photo or event</Button>
                    </>
                )}
            />

            {error && <Notice tone="bad" onClose={() => setError('')}>{error}</Notice>}

            {gallery.length === 0 ? (
                <EmptyState icon={ImageIcon} title="No photos or events yet" text="Add a photo with a title, category and date. It appears on the public gallery as soon as you save it.">
                    <Button variant="primary" icon={Plus} onClick={addItem}>New photo or event</Button>
                </EmptyState>
            ) : items.length === 0 ? (
                <EmptyState icon={ImageIcon} title="No items match" text="Try a different search or category.">
                    <Button onClick={() => { setQuery(''); setCategory('all'); }}>Clear filters</Button>
                </EmptyState>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {items.map(item => {
                        const cat = categoryOf(item.category);
                        return (
                            <div key={item._id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: radius.lg, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: deletingId === item._id ? 0.5 : 1 }}>
                                <button
                                    onClick={() => openEditor(item)}
                                    aria-label={`Edit ${item.title || 'untitled item'}`}
                                    style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', flex: 1 }}
                                >
                                    <div style={{ aspectRatio: '16 / 10', background: C.neutralSoft, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
                                        {item.imageUrl
                                            ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600 }}><ImageIcon size={28} style={{ opacity: 0.6, marginBottom: 6 }} /><div>No image yet</div></div>}
                                    </div>
                                    <div style={{ padding: '14px 16px 6px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                        <div><Pill tone={cat.tone} dot={false}>{cat.label}</Pill></div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.title ? C.ink : C.red }}>{item.title || 'Untitled'}</div>
                                        <div style={{ fontSize: '0.78rem', color: C.muted }}>{item.date || 'No date'}</div>
                                        {item.agenda && (
                                            <div style={{ fontSize: '0.84rem', lineHeight: 1.5, color: C.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.agenda}</div>
                                        )}
                                    </div>
                                </button>
                                <div style={{ padding: '6px 10px 10px', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <IconButton icon={Pencil} label="Edit" onClick={() => openEditor(item)} />
                                    <IconButton icon={Trash2} tone="danger" label="Delete" disabled={deletingId === item._id} onClick={() => remove(item)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editing && (
                <GalleryDrawer
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
