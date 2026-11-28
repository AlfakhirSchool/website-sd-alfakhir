"use client";

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LayoutDashboard, BookOpen, Search, FileText, Image as ImageIcon, Users, Mail } from 'lucide-react';
import { templateData } from './templateData';
import Shell from './Shell';
import LoginScreen from './LoginScreen';
import { C, radius } from './ui';

// Tabs load on demand (and are warmed up when the sidebar item is hovered), so
// the first paint after login only ships the shell.
const TAB_LOADERS = {
    overview: () => import('./tabs/OverviewTab'),
    registrations: () => import('./tabs/RegistrationsTab'),
    students: () => import('./tabs/ObservationTab'),
    profiles: () => import('./ProfilesPanel'),
    gallery: () => import('./tabs/GalleryTab'),
    staff: () => import('./tabs/StaffTab'),
    messages: () => import('./tabs/MessagesTab'),
};
const Tabs = Object.fromEntries(Object.entries(TAB_LOADERS).map(([tab, load]) => [tab, lazy(load)]));
const prefetchTab = (tab) => { TAB_LOADERS[tab]?.(); };

const TabSkeleton = () => (
    <div aria-busy="true" style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ height: 84, borderRadius: radius.lg, background: C.surface, border: `1px solid ${C.line}` }} />)}
        </div>
        <div style={{ height: 320, borderRadius: radius.lg, background: C.surface, border: `1px solid ${C.line}` }} />
    </div>
);

// All writes go through these: the browser never holds a Sanity write
// token, and both routes check the admin session cookie server-side.
async function adminUploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to upload image.');
    return data.asset; // { _id, url }
}

async function adminMutate({ deletes = [], creates = [], patches = [] }) {
    const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletes, creates, patches }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save changes.');
    return data.result;
}

const PASSED_STATUSES = ['Lolos', 'Diterima', 'Lolos Seleksi', 'Lulus Seleksi', 'Passed Selection'];
const isPassed = (status) => PASSED_STATUSES.includes(status);

const PAGES = {
    overview: { title: 'Overview', subtitle: 'Admissions, messages and recent activity at a glance.' },
    registrations: { title: 'Registrations', subtitle: 'Online registration forms, payment proof and seat confirmation.' },
    students: { title: 'Observation results', subtitle: 'Selection results and the PDF report each family can open.' },
    profiles: { title: 'Student profiles', subtitle: "Profile PDFs that parents open with their child's NIS." },
    gallery: { title: 'Gallery', subtitle: 'Photos and events shown on the public site.' },
    staff: { title: 'Staff', subtitle: 'Teachers and staff shown on the public site.' },
    messages: { title: 'Messages', subtitle: 'Messages sent through the contact form.' },
};

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const toastRef = useRef(null);
    const syncRef = useRef(null);

    const [students, setStudents] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [staff, setStaff] = useState([]);
    const [messages, setMessages] = useState([]);
    const [siteSettings, setSiteSettings] = useState({});
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [yearConfigs, setYearConfigs] = useState([]);
    const [newYearInput, setNewYearInput] = useState('');
    const [filterYear, setFilterYear] = useState('Semua');
    const [filterWave, setFilterWave] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [registrationFilter, setRegistrationFilter] = useState('all');

    // Years come from the records plus years added ahead of time via yearConfig.
    const availableYears = useMemo(() => {
        const years = Array.from(new Set([
            ...students.map(s => s.year),
            ...yearConfigs.map(c => c.year),
        ].filter(Boolean))).sort((a, b) => b.localeCompare(a));
        return years.length > 0 ? years : ['2026/2027'];
    }, [students, yearConfigs]);

    // A year set up ahead of time (e.g. next year's config) must not become the default for new records.
    const defaultYear = useMemo(() => {
        const used = students.map(x => x.year).filter(Boolean).sort((a, b) => b.localeCompare(a));
        return used[0] || availableYears[0];
    }, [students, availableYears]);

    const registrations = useMemo(() => students.filter(s => s.registrationDate), [students]);
    const unread = useMemo(() => messages.filter(m => m.status === 'unread').length, [messages]);

    const notify = useCallback((tone, text) => toastRef.current?.show(tone, text), []);
    const setSuccess = useCallback((text) => { if (text) notify('ok', text); }, [notify]);
    const setError = useCallback((text) => { if (text) notify('bad', text); }, [notify]);
    const setIsLoading = useCallback((on) => syncRef.current?.set(on), []);

    // --- Data: fetch only the parts that changed (see /api/admin/data?scope=) ---
    const SETTERS = useMemo(() => ({
        students: setStudents, profiles: setProfiles, gallery: setGallery, staff: setStaff,
        messages: setMessages, yearConfigs: setYearConfigs, settings: (v) => setSiteSettings(v || {}),
    }), []);

    const fetchData = useCallback(async (scopes) => {
        setIsLoading(true);
        try {
            const res = await fetch(scopes ? `/api/admin/data?scope=${scopes.join(',')}` : '/api/admin/data');
            if (res.status === 401) {
                setIsLoggedIn(false);
                throw new Error('Session expired, please log in again.');
            }
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            Object.entries(SETTERS).forEach(([key, set]) => { if (key in data) set(data[key] ?? (key === 'settings' ? {} : [])); });
        } catch (err) {
            console.error('Data sync error:', err);
            let msg = err.message || 'Unknown error';
            if (msg.includes('Failed to fetch') || msg.includes('reach')) msg = 'Could not reach the server. Check the connection and the Sanity token.';
            else if (msg.includes('403')) msg = 'Access denied (403). Check the Sanity token permissions.';
            setError(`Could not load data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [SETTERS, setError, setIsLoading]);

    // --- Auth ---
    // The server holds the real session (signed httpOnly cookie); this only asks
    // whether we are still logged in. The Google ID token is verified
    // server-side in src/app/api/admin/session.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/admin/session');
                const data = await res.json();
                if (data.loggedIn) {
                    setIsLoggedIn(true);
                    setAdminEmail(data.email || '');
                    fetchData();
                }
            } catch { /* stay logged out */ }
        })();
    }, [fetchData]);

    const handleLogout = useCallback(async () => {
        try { await fetch('/api/admin/session', { method: 'DELETE' }); } catch {}
        setIsLoggedIn(false);
        setAdminEmail('');
        try { window.google?.accounts?.id?.disableAutoselect?.(); } catch {}
    }, []);

    const handleGoogleAdminLogin = useCallback(async (response) => {
        try {
            const res = await fetch('/api/admin/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (data.success) {
                setIsLoggedIn(true);
                setAdminEmail(data.email || '');
                setLoginError('');
                fetchData();
            } else {
                setLoginError(data.error || 'Access denied.');
                try { window.google?.accounts?.id?.disableAutoselect?.(); } catch {}
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setLoginError('Failed to process Google authentication.');
        }
    }, [fetchData]);

    useEffect(() => {
        const renderButton = () => {
            const container = document.getElementById('google-signIn-btn-container');
            if (container && window.google?.accounts) {
                try { window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, shape: 'pill' }); } catch {}
            }
        };
        const initGSI = () => {
            if (!window.google?.accounts) return;
            try {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '288549804223-r9kp2bmjleqt8l8lj3fakj3p36cbeq4d.apps.googleusercontent.com',
                    callback: handleGoogleAdminLogin,
                });
                renderButton();
            } catch {}
        };

        if (isLoggedIn) return;
        const scriptId = 'google-gsi-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGSI;
            document.body.appendChild(script);
        } else {
            initGSI();
        }
    }, [isLoggedIn, handleGoogleAdminLogin]);

    // --- Per-item persistence: each save/delete is its own request, followed by a refresh of only what it touched. ---
    const saveItems = async (drafts, build, scopes) => {
        const creates = [];
        const patches = [];
        drafts.forEach((d) => {
            const doc = build(d);
            if (d._id) patches.push({ id: d._id, set: doc });
            else creates.push(doc);
        });
        await adminMutate({ creates, patches });
        await fetchData(scopes);
    };

    // Deleting needs no re-download: drop the row locally once the server confirms.
    const removeItem = async (type, id, setList) => {
        await adminMutate({ deletes: [{ type, id }] });
        setList(list => list.filter(x => x._id !== id));
    };

    const buildStudent = (s) => ({
        _type: 'student',
        id: s.id || `REG-${Date.now()}`,
        name: s.name || 'No Name',
        school: s.school || s.schoolName || '',
        score: s.score || '-',
        status: s.status || 'Passed Selection',
        year: s.year || defaultYear,
        wave: String(s.wave || '1'),
        pdfLink: s.pdfLink || '',
    });

    // publishedAt moves only when the link is new or replaced.
    const buildProfile = (p) => {
        const link = p.pdfLink || '';
        const previous = profiles.find(x => x._id === p._id);
        const publishedAt = link && link !== (previous?.pdfLink || '') ? new Date().toISOString() : previous?.publishedAt;
        return {
            _type: 'studentProfile',
            nis: (p.nis || '').trim(),
            nisn: (p.nisn || '').trim(),
            name: (p.name || '').trim(),
            period: p.period,
            pdfLink: link,
            ...(publishedAt ? { publishedAt } : {}),
        };
    };

    const buildGallery = (g) => ({
        _type: 'gallery',
        title: g.title || 'Untitled',
        category: g.category || 'acara',
        date: g.date || new Date().toLocaleDateString('en-GB'),
        agenda: g.agenda || '',
        ...(g.image ? { image: g.image } : {}),
        ...(g.externalImage ? { externalImage: g.externalImage } : {}),
    });

    const buildStaff = (s) => ({
        _type: 'teacher',
        name: s.name || 'Staff Member',
        role: s.role || 'Teacher',
        vision: s.vision || '',
        education: s.education || '',
        email: s.email || '',
        ...(s.order !== undefined ? { order: s.order } : {}),
        ...(s.image ? { image: s.image } : {}),
        ...(s.externalImage ? { externalImage: s.externalImage } : {}),
    });

    // --- Academic years ---
    const addYear = async (year) => {
        if (!year || availableYears.includes(year)) return;
        await adminMutate({ creates: [{ _type: 'yearConfig', year, videoUrl: '' }] });
        await fetchData(['yearConfigs']);
        notify('ok', 'Academic year added.');
    };

    const handleAddYear = async () => {
        const year = newYearInput.trim();
        setNewYearInput('');
        try { await addYear(year); } catch (err) { setError('Failed to add year: ' + err.message); }
    };

    const deleteYear = async (year) => {
        const config = yearConfigs.find(c => c.year === year);
        if (config?._id) await adminMutate({ deletes: [{ type: 'yearConfig', id: config._id }] });
        setYearConfigs(prev => prev.filter(c => c.year !== year));
        notify('ok', `Year ${year} removed.`);
    };

    const saveYearVideo = async (year, videoUrl) => {
        const config = yearConfigs.find(c => c.year === year);
        if (config?._id) await adminMutate({ patches: [{ id: config._id, set: { _type: 'yearConfig', year, videoUrl } }] });
        else await adminMutate({ creates: [{ _type: 'yearConfig', year, videoUrl }] });
        await fetchData(['yearConfigs']);
    };

    const downloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const sheet = XLSX.utils.json_to_sheet(templateData);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, 'Observation Template');
        XLSX.writeFile(book, 'template-observasi.xlsx');
    };

    // Tabs that patch immediately only need students/settings/messages back.
    const refreshStudents = useCallback(() => fetchData(['students', 'settings']), [fetchData]);
    const refreshMessages = useCallback(() => fetchData(['messages']), [fetchData]);

    const nav = useMemo(() => [
        { label: 'Overview', items: [{ tab: 'overview', label: 'Home', icon: LayoutDashboard }] },
        {
            label: 'Admissions',
            items: [
                { tab: 'registrations', label: 'Registrations', icon: BookOpen },
                { tab: 'students', label: 'Observation results', icon: Search },
                { tab: 'profiles', label: 'Student profiles', icon: FileText },
            ],
        },
        {
            label: 'Content',
            items: [
                { tab: 'gallery', label: 'Gallery', icon: ImageIcon },
                { tab: 'staff', label: 'Staff', icon: Users },
            ],
        },
        { label: 'Inbox', items: [{ tab: 'messages', label: 'Messages', icon: Mail, badge: unread }] },
    ], [unread]);

    if (!isLoggedIn) return <LoginScreen error={loginError} />;

    const Tab = Tabs[activeTab];
    const tabProps = {
        overview: { students, registrations, messages, isPassed, setActiveTab },
        registrations: {
            students, setStudents, siteSettings, setSiteSettings, isSavingSettings, setIsSavingSettings,
            filterYear, setFilterYear, availableYears, newYearInput, setNewYearInput, handleAddYear,
            registrationFilter, setRegistrationFilter, adminMutate, fetchAllData: refreshStudents, setIsLoading, setSuccess, setError,
        },
        students: {
            students, availableYears, yearConfigs, filterYear, setFilterYear, filterWave, setFilterWave, searchQuery, setSearchQuery, isPassed,
            handleDownloadTemplate: downloadTemplate,
            onSave: (d) => saveItems([d], buildStudent, ['students']),
            onDelete: (s) => removeItem('student', s._id, setStudents),
            onImport: (docs) => saveItems(docs, buildStudent, ['students']),
            onAddYear: addYear, onDeleteYear: deleteYear, onSaveYearVideo: saveYearVideo,
        },
        profiles: {
            profiles,
            onSave: (d) => saveItems([d], buildProfile, ['profiles']),
            onDelete: (p) => removeItem('studentProfile', p._id, setProfiles),
            onImport: (docs) => saveItems(docs, buildProfile, ['profiles']),
        },
        gallery: {
            gallery,
            onSave: (d) => saveItems([d], buildGallery, ['gallery']),
            onDelete: (g) => removeItem('gallery', g._id, setGallery),
            uploadImage: adminUploadImage,
        },
        staff: {
            staff,
            onSave: (d) => saveItems([d], buildStaff, ['staff']),
            onDelete: (s) => removeItem('teacher', s._id, setStaff),
            uploadImage: adminUploadImage,
        },
        messages: { messages, adminMutate, fetchAllData: refreshMessages },
    }[activeTab];

    return (
        <Shell
            nav={nav}
            active={activeTab}
            onNavigate={setActiveTab}
            onPrefetch={prefetchTab}
            title={PAGES[activeTab].title}
            subtitle={PAGES[activeTab].subtitle}
            adminEmail={adminEmail}
            onLogout={handleLogout}
            toastRef={toastRef}
            syncRef={syncRef}
        >
            <Suspense fallback={<TabSkeleton />}>
                <Tab {...tabProps} />
            </Suspense>
        </Shell>
    );
}
