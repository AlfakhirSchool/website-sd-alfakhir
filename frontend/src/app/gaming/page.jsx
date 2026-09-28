"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Plus, Trash2, UserCheck, User, AlertCircle, Image as ImageIcon, LayoutDashboard, Download, Upload, Search, Settings, X, ChevronRight, Save, Eye, Users, BookOpen, RefreshCw, Mail, Phone, ShieldCheck, Clock } from 'lucide-react'; // Core icons
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { templateData } from './templateData';

// All writes go through these — the browser never holds a Sanity write
// token. Both routes check the admin session cookie server-side.
async function adminUploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal upload gambar.');
    return data.asset; // { _id, url }
}

const PASSED_STATUSES = ['Lolos', 'Diterima', 'Lolos Seleksi', 'Lulus Seleksi', 'Passed Selection'];
const isPassed = (status) => PASSED_STATUSES.includes(status);

const Field = ({ label, value, span, color = '#1a1612' }) => (
    <div style={span ? { gridColumn: 'span 2' } : undefined}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</div>
    </div>
);

async function adminMutate({ deletes = [], creates = [], patches = [] }) {
    const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletes, creates, patches }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal menyimpan perubahan.');
    return data.result;
}

export default function AdminPage() {
    // --- Refs & State ---
    const isMobile = useIsMobile();
    const fileInputRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [registrationFilter, setRegistrationFilter] = useState('all');
    const [students, setStudents] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletedStudents, setDeletedStudents] = useState([]);
    const [deletedGallery, setDeletedGallery] = useState([]);
    const [deletedStaff, setDeletedStaff] = useState([]);
    const [staff, setStaff] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [filterYear, setFilterYear] = useState('Semua');
    const [filterWave, setFilterWave] = useState('Semua');
    const [availableYears, setAvailableYears] = useState(['2026/2027']);
    const [availableWaves] = useState(['1', '2', '3']);
    const [newYearInput, setNewYearInput] = useState('');
    const [showConfig, setShowConfig] = useState(false);
    const [yearConfigs, setYearConfigs] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Data Validation Logic ---
    useEffect(() => {
        const errors = [];
        
        students.forEach((s, i) => {
            if (!s.name || s.name.trim() === '') errors.push({ tab: 'students', index: i, field: 'name', msg: `Nama siswa di baris ${i+1} masih kosong.` });
            if (!s.id || s.id.trim() === '') errors.push({ tab: 'students', index: i, field: 'id', msg: `No. Registrasi di baris ${i+1} belum diisi.` });
        });

        gallery.forEach((g, i) => {
            if (!g.title || g.title.trim() === '') errors.push({ tab: 'gallery', index: i, field: 'title', msg: `Judul Galeri #${i+1} kosong.` });
            if (!g.imageUrl) errors.push({ tab: 'gallery', index: i, field: 'image', msg: `Konten "${g.title || 'Tanpa Judul'}" belum memiliki gambar.` });
        });

        staff.forEach((st, i) => {
            if (!st.name || st.name.trim() === '') errors.push({ tab: 'staff', index: i, field: 'name', msg: `Nama Guru #${i+1} kosong.` });
            if (!st.imageUrl) errors.push({ tab: 'staff', index: i, field: 'image', msg: `Guru "${st.name || 'Tanpa Nama'}" belum ada foto profil.` });
        });

        setValidationErrors(errors);
    }, [students, gallery, staff]);

    // --- Authentication Persistence ---
    // Server holds the real session (signed httpOnly cookie); this just asks
    // it whether we're still logged in, instead of trusting a client-side flag.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/admin/session');
                const data = await res.json();
                if (data.loggedIn) {
                    setIsLoggedIn(true);
                    setAdminEmail(data.email || '');
                    fetchAllData();
                }
            } catch { /* stay logged out */ }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/data');
            if (res.status === 401) {
                setIsLoggedIn(false);
                throw new Error('Sesi berakhir, silakan login ulang.');
            }
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // YEAR SYNC: Update list based on existing state and what's in the DB
            const combinedYears = Array.from(new Set([
                ...availableYears,
                ...(data.students || []).map(s => s.year).filter(Boolean)
            ])).sort((a,b) => b.localeCompare(a));
            setAvailableYears(combinedYears.length > 0 ? combinedYears : ['2026/2027']);

            setStudents(data.students || []);
            setGallery(data.gallery || []);
            setStaff(data.staff || []);
            setMessages(data.messages || []);
            setYearConfigs(data.yearConfigs || []);
            
            // Set registrations as a subset of students who have a registrationDate
            setRegistrations((data.students || []).filter(s => s.registrationDate));

            setDeletedStudents([]);
            setDeletedGallery([]);
            setDeletedStaff([]);
        } catch (err) {
            console.error('Data Sync Full Error:', err);
            let userFriendlyMsg = err.message || 'Kesalahan tidak diketahui';
            
            if (err.message?.includes('Failed to fetch') || err.message?.includes('reach')) {
                userFriendlyMsg = 'Gagal menjangkau server Sanity. Pastikan CORS sudah diatur di Dashboard Sanity dan Token benar.';
            } else if (err.message?.includes('403')) {
                userFriendlyMsg = 'Akses ditolak (403). Cek Izin Token di Sanity Dashboard.';
            }

            setError(`Gagal Sinkronisasi Cloud: ${userFriendlyMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try { await fetch('/api/admin/session', { method: 'DELETE' }); } catch {}
        setIsLoggedIn(false);
        setAdminEmail('');
        if (typeof window !== 'undefined' && window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoselect();
        }
    };

    // --- Google Sign-In Integration ---
    // The ID token is verified against Google's own endpoint server-side
    // (src/app/api/admin/session), which sets a signed httpOnly session
    // cookie. This client only reacts to that result — it never itself
    // decides who's an admin (that used to be a client-decoded, unverified
    // JWT anyone could forge, plus a hardcoded username/password fallback).
    const handleGoogleAdminLogin = async (response) => {
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
                setError('');
                fetchAllData();
            } else {
                setError(data.error || 'Akses ditolak.');
                // Best-effort — some GSI library states don't expose this
                // method; never let a UI cleanup call mask the real error.
                try { window.google?.accounts?.id?.disableAutoselect?.(); } catch {}
            }
        } catch (err) {
            console.error("Admin login error:", err);
            setError("Gagal memproses otentikasi Google Cloud.");
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const initGSI = () => {
            if (window.google && window.google.accounts) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GOOGLE_CLIENT_ID : null) || "288549804223-r9kp2bmjleqt8l8lj3fakj3p36cbeq4d.apps.googleusercontent.com",
                        callback: handleGoogleAdminLogin
                    });
                    const container = document.getElementById("google-signIn-btn-container");
                    if (container) {
                        window.google.accounts.id.renderButton(container, {
                            theme: "outline",
                            size: "large",
                            width: 320,
                            shape: "pill"
                        });
                    }
                } catch(e){}
            }
        };

        const scriptId = 'google-gsi-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initGSI;
            document.body.appendChild(script);
        } else {
            initGSI();
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn && typeof window !== 'undefined' && window.google) {
            const container = document.getElementById("google-signIn-btn-container");
            if (container) {
                try {
                    window.google.accounts.id.renderButton(container, {
                        theme: "outline",
                        size: "large",
                        width: 320,
                        shape: "pill"
                    });
                } catch(e){}
            }
        }
    }, [isLoggedIn]);

    // --- Configuration Handlers ---
    const handleAddYear = () => {
        if (newYearInput && !availableYears.includes(newYearInput)) {
            setAvailableYears([...availableYears, newYearInput].sort((a,b) => b.localeCompare(a)));
            setNewYearInput('');
            setSuccess('Tahun ajaran berhasil ditambahkan!');
            setTimeout(() => setSuccess(''), 2000);
        }
    };

    const handleDeleteYear = (year) => {
        setAvailableYears(availableYears.filter(y => y !== year));
        setSuccess(`Tahun ${year} dihapus dari daftar.`);
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleUpdateYearConfig = (year, field, value) => {
        const existing = yearConfigs.find(c => c.year === year);
        if (existing) {
            setYearConfigs(yearConfigs.map(c => c.year === year ? { ...c, [field]: value } : c));
        } else {
            setYearConfigs([...yearConfigs, { year, [field]: value, _type: 'yearConfig', isNew: true }]);
        }
    };

    // --- Student Handlers ---
    const handleDeleteStudent = (index) => { 
        const n = [...students]; 
        const target = n[index];
        if (target._id) {
            setDeletedStudents(prev => [...prev, target._id]);
        }
        n.splice(index, 1); 
        setStudents(n); 
    };

    const handleStudentChange = (index, field, value) => { 
        const n = [...students]; 
        if (n[index]) {
            n[index][field] = value; 
            setStudents(n); 
        }
    };

    // --- Gallery Handlers ---
    const handleDeleteGallery = (index) => { 
        const n = [...gallery]; 
        const target = n[index];
        if (target._id) {
            setDeletedGallery(prev => [...prev, target._id]);
        }
        n.splice(index, 1); 
        setGallery(n); 
    };

    const handleGalleryChange = (index, field, value) => { 
        const n = [...gallery]; 
        if (n[index]) {
            n[index][field] = value; 
            setGallery(n); 
        }
    };

    // --- Staff Handlers ---
    const handleDeleteStaff = (index) => {
        const n = [...staff];
        const target = n[index];
        if (target._id) {
            setDeletedStaff(prev => [...prev, target._id]);
        }
        n.splice(index, 1);
        setStaff(n);
    };

    const handleStaffChange = (index, field, value) => {
        const n = [...staff];
        if (n[index]) {
            n[index][field] = value;
            setStaff(n);
        }
    };

    const handleStaffImageUpload = async (index, file) => {
        if (!file) return;
        try {
            setIsLoading(true);
            const asset = await adminUploadImage(file);
            const n = [...staff];
            if (n[index]) {
                n[index].image = {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    }
                };
                n[index].imageUrl = asset.url;
                n[index].externalImage = undefined; // Sanity prioritised
                setStaff(n);
                setSuccess('Foto staff berhasil diunggah ke Sanity!');
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (err) {
            setError('Gagal upload gambar staff ke Sanity: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        try {
            setIsLoading(true);
            const asset = await adminUploadImage(file);
            const n = [...gallery];
            if (n[index]) {
                n[index].image = {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    }
                };
                n[index].imageUrl = asset.url;
                n[index].externalImage = undefined; // Sanity prioritised
                setGallery(n);
                setSuccess('Foto gallery berhasil diunggah ke Sanity!');
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (err) {
            setError('Gagal upload gambar gallery ke Sanity: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (isSaving) return; // Guard: prevent double click/double execution
        setIsSaving(true);
        setSuccess('');
        setError('');
        try {
            const deletes = [
                ...deletedStudents.map(id => ({ type: 'student', id })),
                ...deletedGallery.map(id => ({ type: 'gallery', id })),
                ...deletedStaff.map(id => ({ type: 'teacher', id })),
            ];
            const creates = [];
            const patches = [];
            const upsert = (doc, existing) => {
                if (existing?._id && !existing.isNew) {
                    patches.push({ id: existing._id, set: doc });
                } else {
                    creates.push(doc);
                }
            };

            // 1. Students
            students.forEach(std => upsert({
                _type: 'student',
                id: std.id || `REG-${Date.now()}`,
                name: std.name || 'Tanpa Nama',
                school: std.school || std.schoolName || '',
                score: std.score || '-',
                status: std.status || 'Passed Selection',
                year: std.year || availableYears[0] || '2026/2027',
                wave: String(std.wave || '1'),
                pdfLink: std.pdfLink || ''
            }, std));

            // 2. Gallery
            gallery.forEach(item => upsert({
                _type: 'gallery',
                title: item.title || 'Tanpa Judul',
                category: item.category || 'acara',
                date: item.date || new Date().toLocaleDateString('en-GB'),
                agenda: item.agenda || '',
                ...(item.image ? { image: item.image } : {}),
                ...(item.externalImage ? { externalImage: item.externalImage } : {})
            }, item));

            // 3. Staff
            staff.forEach(stf => upsert({
                _type: 'teacher',
                name: stf.name || 'Anggota Staf',
                role: stf.role || 'Guru',
                vision: stf.vision || '',
                education: stf.education || '',
                email: stf.email || '',
                ...(stf.image ? { image: stf.image } : {}),
                ...(stf.externalImage ? { externalImage: stf.externalImage } : {})
            }, stf));

            // 4. Year Configs (Video URLs)
            yearConfigs.forEach(conf => upsert({
                _type: 'yearConfig',
                year: conf.year,
                videoUrl: conf.videoUrl || ''
            }, conf));

            // Commit all at once (1 request)
            await adminMutate({ deletes, creates, patches });

            setDeletedStudents([]);
            setDeletedGallery([]);
            setDeletedStaff([]);

            setSuccess('Database berhasil disinkronkan!');
            setTimeout(() => setSuccess(''), 3000);
            fetchAllData();
        } catch (err) { 
            console.error(err);
            setError('Gagal menyimpan ke cloud: ' + err.message); 
        } finally { 
            setIsSaving(false); 
        }
    };

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Observation Template");
        
        // Auto-size columns for better readability
        const colWidths = [
            { wch: 20 }, // ID
            { wch: 35 }, // Name
            { wch: 30 }, // School
            { wch: 15 }, // Year
            { wch: 10 }, // Wave
            { wch: 20 }, // Status
            { wch: 45 }  // PDF Link
        ];
        worksheet["!cols"] = colWidths;

        XLSX.writeFile(workbook, "AlFakhir_Student_Data_Template.xlsx");
        setSuccess('Template berhasil diunduh!');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleImportExcel = (importEvent) => {
        const file = importEvent.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const newStudents = data.map((item, idx) => ({
                    isNew: true, // Mark for creation in Sanity
                    id: item["ID / NO REG"] || item["No. Peserta"] || item.id || item.regId || `REG-${Date.now()}-${idx}`,
                    name: item["STUDENT NAME"] || item["Nama Lengkap"] || item.name || item.Nama || '',
                    school: item["PREVIOUS SCHOOL"] || item["Asal Sekolah"] || item.school || item.schoolName || '',
                    status: item["STATUS"] || item.Status || item.status || 'Passed Selection',
                    year: filterYear === 'Semua' ? (item["YEAR"] || item.Tahun || item.year || availableYears[0] || '2026/2027') : filterYear,
                    wave: String(filterWave === 'Semua' ? (item["WAVE"] || item.Gelombang || item.wave || '1') : filterWave),
                    score: item.Nilai || item.score || '-',
                    pdfLink: item["PDF LINK"] || item.pdfLink || '',
                    createdAt: new Date().toISOString()
                }));
                
                setStudents([...students, ...newStudents]);
                setSuccess(`${newStudents.length} data berhasil diimpor! Jangan lupa klik SIMPAN.`);
                setTimeout(() => setSuccess(''), 3000);
            } catch (errImport) { 
                console.error(errImport);
                setError('Gagal membaca file Excel. Pastikan format kolom sesuai.'); 
            }
        };
        reader.readAsBinaryString(file);
        // Reset file input so same file can be uploaded again if needed
        importEvent.target.value = '';
    };

    if (!isLoggedIn) {
        return (
            <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden', position: 'relative', fontFamily: '"DM Sans", sans-serif' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")', pointerEvents: 'none' }}></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    style={{ background: '#fffdf9', padding: '4rem', borderRadius: '14px', boxShadow: '0 20px 80px rgba(26,22,18,0.08)', width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1, border: '1px solid #ece4d8', textAlign: 'center' }}
                >
                    <div style={{ marginBottom: '3rem' }}>
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            style={{ width: '100px', height: '100px', background: '#faf7f2', borderRadius: '14px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d4820a' }}
                        >
                            <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Official Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </motion.div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#d4820a', letterSpacing: '2px', marginBottom: '10px' }}>PORTAL ADMIN</div>
                        <h2 style={{ fontWeight: 600, color: '#1a1612', fontSize: '2rem', letterSpacing: '-0.5px', lineHeight: 1.15, margin: 0 }}>Selamat Datang<br/><span style={{ color: '#d4820a' }}>Kembali</span></h2>
                        <p style={{ color: '#4a3f35', fontSize: '0.9rem', fontWeight: 500, marginTop: '12px' }}>SD Islam Modern Al-Fakhir</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            style={{ background: 'rgba(192, 57, 43, 0.05)', color: '#c0392b', padding: '16px', borderRadius: '14px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #c0392b' }}
                        >
                            <AlertCircle size={20} style={{ flexShrink: 0 }} /> <span style={{ textAlign: 'left' }}>{error}</span>
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <div style={{ background: '#faf7f2', border: '1px solid #ece4d8', borderRadius: '14px', padding: '30px 20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4a3f35', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>IDENTITAS GOOGLE</p>
                            <div id="google-signIn-btn-container" style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: '#9a8c82', fontWeight: 700, letterSpacing: '1px' }}>
                        <p style={{ margin: 0 }}>© 2026 SD Islam Modern Al-Fakhir</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', fontFamily: '"DM Sans", sans-serif', color: '#1a1612' }}>
            {/* --- Sidebar Redesign: Executive Brutalism --- */}
            <div style={{ width: '280px', background: '#fffdf9', color: '#1a1612', position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', padding: '40px 0', zIndex: 100, borderRight: '1px solid #ece4d8', boxShadow: '4px 0 30px rgba(26,22,18,0.03)' }}>
                {/* Profile Section at Top */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '2rem', padding: '0 30px 28px', borderBottom: '1px solid #f1ece2' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: '#faf7f2',
                            width: '76px',
                            height: '76px',
                            borderRadius: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '1px solid #d4820a',
                            boxShadow: '0 12px 30px rgba(212,130,10,0.15)',
                            position: 'relative'
                        }}
                    >
                        <img src="/logo_new.webp" alt="Admin Profile Avatar" style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#0d7c6e', border: '2px solid #fffdf9' }} />
                    </motion.div>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#1a1612', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Administrator</h1>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, margin: '5px 0 0', color: '#9a8c82', letterSpacing: '0.5px' }}>{adminEmail || 'sdialfakhir@gmail.com'}</p>
                    </div>
                </div>

                {/* Nav Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
                    {[
                        { tab: 'overview', label: 'Beranda', icon: LayoutDashboard },
                        { tab: 'registrations', label: 'Pendaftaran', icon: BookOpen },
                        { tab: 'students', label: 'Pengumuman Observasi', icon: Search },
                        { tab: 'gallery', label: 'Galeri', icon: ImageIcon },
                        { tab: 'staff', label: 'Staf', icon: Users },
                        { tab: 'messages', label: 'Pesan', icon: Mail, badge: messages.filter(m => m.status === 'unread').length }
                    ].map((item) => (
                        <motion.button
                            key={item.tab}
                            whileHover={{ x: activeTab === item.tab ? 0 : 3 }}
                            onClick={() => setActiveTab(item.tab)}
                            style={{
                                padding: '13px 16px', border: 'none', borderRadius: '14px',
                                background: activeTab === item.tab ? '#1a1612' : 'transparent',
                                color: activeTab === item.tab ? '#fffdf9' : '#6b5f53',
                                display: 'flex', alignItems: 'center', gap: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s ease, color 0.2s ease',
                                textAlign: 'left', position: 'relative', fontSize: '0.82rem', letterSpacing: '0.2px'
                            }}
                        >
                            <item.icon size={17} style={{ color: activeTab === item.tab ? '#d4820a' : '#9a8c82', flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge > 0 && <span style={{ background: '#c0392b', color: '#fffdf9', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '100px', fontWeight: 700 }}>{item.badge}</span>}
                        </motion.button>
                    ))}
                </div>

                <div style={{ padding: '16px 30px 0', marginTop: 'auto' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '13px', borderRadius: '14px', border: '1px solid rgba(192,57,43,0.25)',
                            background: 'rgba(192,57,43,0.04)', color: '#c0392b', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background-color 0.2s ease', fontSize: '0.78rem', letterSpacing: '0.5px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(192,57,43,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(192,57,43,0.04)'}
                    >
                        <AlertCircle size={16} /> <span>Keluar</span>
                    </button>
                </div>
            </div>

            <div style={{ marginLeft: '280px', flex: 1, padding: '40px', width: 'calc(100% - 280px)' }}>
                <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
                    
                    {/* Premium Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                <div style={{ background: '#fef3dc', color: '#d4820a', padding: '4px 10px', borderRadius: '100px', border: '1px solid #f3d9ab', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1.5px' }}>
                                    ● LIVE
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9a8c82' }}>
                                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString('id-ID')}
                                </div>
                            </div>
                              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1612', letterSpacing: '-1px', margin: 0 }}>
                                {activeTab === 'overview' ? 'Sistem Manajemen Al-Fakhir'
                                    : activeTab === 'students' ? 'Manajemen Observasi & Seleksi'
                                    : activeTab === 'active-students' ? 'Basis Data Siswa Diterima / Aktif'
                                    : activeTab === 'registrations' ? 'Data Pendaftaran (Formulir Online)'
                                    : activeTab === 'gallery' ? 'Konten Multimedia'
                                    : activeTab === 'staff' ? 'Tim Pengajar'
                                    : 'Pusat Pesan'}
                            </h2>
                            <p style={{ color: '#4a3f35', fontWeight: 600, fontSize: '0.9rem', marginTop: '5px' }}>
                                Selamat datang kembali, Admin. Kelola ekosistem Al-Fakhir secara real-time.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(212,130,10,0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    background: '#d4820a', color: '#fffdf9', border: '1px solid #ece4d8', padding: '14px 28px',
                                    borderRadius: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '12px', transition: '0.2s',
                                    fontSize: '0.85rem', letterSpacing: '1px'
                                }}
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                <span>{isSaving ? 'MENYIMPAN...' : 'SIMPAN SEMUA'}</span>
                            </motion.button>
                            
                            {(activeTab === 'students' || activeTab === 'active-students' || activeTab === 'gallery' || activeTab === 'staff') && (
                                <motion.button 
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(13,124,110,0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (activeTab === 'students' || activeTab === 'active-students') {
                                            const newId = `REG-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`;
                                            setStudents([{ isNew: true, id: newId, name: '', status: 'Passed Selection', year: filterYear === 'Semua' ? (availableYears[0] || '2026/2027') : filterYear, wave: filterWave === 'Semua' ? '1' : filterWave, pdfLink: '' }, ...students]);
                                        } else if (activeTab === 'gallery') {
                                            setGallery([{ title: '', category: 'acara', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), agenda: '' }, ...gallery]);
                                        } else if (activeTab === 'staff') {
                                            setStaff([{ name: '', role: '', order: staff.length }, ...staff]);
                                        }
                                    }} 
                                    style={{ 
                                        background: '#fffdf9', border: '1px solid #0d7c6e', color: '#0d7c6e', 
                                        padding: '14px 24px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        fontSize: '0.85rem', letterSpacing: '1px'
                                    }}
                                >
                                    <Plus size={18} style={{ color: '#0d7c6e' }} /> <span>TAMBAH BARU</span>
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {validationErrors.length > 0 && activeTab !== 'profile' && activeTab !== 'config' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                style={{ background: 'rgba(212, 130, 10, 0.05)', border: '1px solid #d4820a', padding: '15px 25px', borderRadius: '14px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', color: '#d4820a' }}
                            >
                                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
                                    TERDETEKSI {validationErrors.filter(e => e.tab === activeTab).length} DATA YANG PERLU DIPERBAIKI PADA TAB INI.
                                </div>
                                <button 
                                    onClick={() => setError(validationErrors.filter(e => e.tab === activeTab).map(e => e.msg).join('\n'))}
                                    style={{ marginLeft: 'auto', background: '#d4820a', color: '#fffdf9', border: 'none', padding: '6px 14px', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '1px' }}
                                >
                                    LIHAT DETAIL
                                </button>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(13, 124, 110, 0.08)', color: '#0d7c6e', padding: '16px 25px', borderRadius: '14px', marginBottom: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #0d7c6e', fontSize: '0.85rem' }}>
                                <div style={{ border: '1px solid #0d7c6e', padding: '4px', background: '#fffdf9' }}><UserCheck size={18} color="#0d7c6e" /></div>
                                <span>{success}</span>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(192, 57, 43, 0.05)', color: '#c0392b', padding: '16px 20px', borderRadius: '14px', marginBottom: '2rem', textAlign: 'left', fontWeight: 600, border: '1px solid #c0392b', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                                <AlertCircle size={18} style={{ flexShrink: 0 }} /> 
                                <div style={{ flex: 1, lineHeight: 1.5 }}>{error}</div>
                                <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', display: 'flex', padding: '4px' }}>
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ background: '#fffdf9', borderRadius: '14px', overflow: 'hidden', border: '1px solid #ece4d8', minHeight: '600px', position: 'relative' }}>
                        {isLoading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 253, 249, 0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <RefreshCw size={40} color="#d4820a" />
                                </motion.div>
                                <p style={{ fontWeight: 700, color: '#d4820a', letterSpacing: '3px', fontSize: '0.8rem' }}>MEMUAT DATA...</p>
                            </div>
                        )}
                        {activeTab === 'overview' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '30px', background: '#fffdf9' }}>
                                {/* Asymmetric Executive Hero Showcase */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '20px' }}>
                                    <div style={{ background: '#faf7f2', color: '#1a1612', padding: '40px', borderRadius: '20px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #d4820a', border: '1px solid #ece4d8', boxShadow: '0 20px 50px rgba(26,22,18,0.06)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                                <div style={{ padding: '4px 10px', borderRadius: '100px', background: '#fef3dc', color: '#d4820a', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '1px', border: '1px solid #f3d9ab' }}>Data Terbaru</div>
                                                <span style={{ fontSize: '0.75rem', color: '#4a3f35' }}>|</span>
                                                <span style={{ fontSize: '0.65rem', color: '#9a8c82', fontWeight: 700, letterSpacing: '0.5px' }}>SD ISLAM MODERN AL-FAKHIR</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9a8c82', letterSpacing: '3px', marginBottom: '5px' }}>TOTAL SISWA DITERIMA</div>
                                            <div style={{ fontSize: '4.5rem', fontWeight: 600, color: '#1a1612', lineHeight: '1', letterSpacing: '-2px', margin: '10px 0 25px 0' }}>
                                                {students.filter(s => isPassed(s.status)).length}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #ece4d8', paddingTop: '20px', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <ShieldCheck size={20} style={{ color: '#d4820a' }} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1612', letterSpacing: '1px' }}>AKREDITASI</span>
                                            </div>
                                            <div style={{ background: '#d4820a', color: '#fffdf9', padding: '4px 12px', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                SANGAT BAIK ⭐
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ background: '#faf7f2', padding: '30px', borderRadius: '18px', border: '1px solid #ece4d8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 15px 35px rgba(26,22,18,0.05)', transition: 'transform 0.25s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a8c82', letterSpacing: '2px' }}>PENDAFTAR CALON SISWA</span>
                                                <BookOpen size={18} style={{ color: '#d4820a' }} />
                                            </div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#1a1612' }}>
                                                {registrations.length}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600, marginTop: '5px' }}>Menunggu tahap peninjauan awal</div>
                                        </div>

                                        <div style={{ background: '#faf7f2', padding: '30px', borderRadius: '18px', border: '1px solid #ece4d8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 15px 35px rgba(26,22,18,0.05)', transition: 'transform 0.25s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a8c82', letterSpacing: '2px' }}>PESAN BELUM DIBACA</span>
                                                <Mail size={18} style={{ color: '#d4820a' }} />
                                            </div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: '#1a1612' }}>
                                                {messages.filter(m => m.status === 'unread').length}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600, marginTop: '5px' }}>Perlu ditanggapi segera</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics Array & Live Database Intelligence */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px' }}>
                                    {/* Monthly Registration Flow */}
                                    <div style={{ background: '#faf7f2', padding: '30px', borderRadius: '18px', border: '1px solid #ece4d8', boxShadow: '0 15px 35px rgba(26,22,18,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1a1612', letterSpacing: '1px' }}>Distribusi Pendaftaran</h3>
                                                <div style={{ fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600, marginTop: '4px' }}>Pemetaan waktu real-time dari data pendaftar</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', letterSpacing: '1px' }}>
                                                    <div style={{ width: '8px', height: '8px', background: '#d4820a' }} /> <span>PENDAFTAR</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', letterSpacing: '1px' }}>
                                                    <div style={{ width: '8px', height: '8px', background: '#0d7c6e' }} /> <span>DITERIMA</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 10px', gap: '12px' }}>
                                            {(() => {
                                                const counts = new Array(9).fill(0);
                                                const regCounts = new Array(9).fill(0);
                                                students.forEach(s => {
                                                    const dStr = s.registrationDate || s._createdAt;
                                                    if (dStr) {
                                                        const m = new Date(dStr).getMonth();
                                                        if (m >= 0 && m < 9) {
                                                            counts[m]++;
                                                            if (s.registrationDate) regCounts[m]++;
                                                        }
                                                    }
                                                });
                                                const maxCount = Math.max(...counts, ...regCounts, 1);
                                                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => {
                                                    const sPct = Math.min(100, Math.round((counts[i] / maxCount) * 85) + 4);
                                                    const rPct = Math.min(100, Math.round((regCounts[i] / maxCount) * 85) + 4);
                                                    return (
                                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ display: 'flex', gap: '3px', height: '160px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                                                                <motion.div initial={{ height: 0 }} animate={{ height: `${rPct}%` }} style={{ width: '10px', background: '#d4820a' }} title={`Pendaftar: ${regCounts[i]}`} />
                                                                <motion.div initial={{ height: 0 }} animate={{ height: `${sPct}%` }} style={{ width: '10px', background: '#0d7c6e' }} title={`Diterima: ${counts[i]}`} />
                                                            </div>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9a8c82', letterSpacing: '1px' }}>{month}</span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    {/* Building Quota Indicator */}
                                    {(() => {
                                        const activeCount = students.filter(s => isPassed(s.status)).length;
                                        const pct = Math.min(100, Math.round((activeCount / 320) * 100));
                                        const fraction = pct / 100;
                                        return (
                                            <div style={{ background: '#faf7f2', padding: '30px', borderRadius: '18px', border: '1px solid #ece4d8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 15px 35px rgba(26,22,18,0.05)' }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', fontWeight: 600, color: '#1a1612', letterSpacing: '1px' }}>Kuota Daya Tampung</h3>
                                                    <div style={{ fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600, marginBottom: '25px' }}>Target ambang batas penerimaan</div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
                                                    <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                                                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e8e0d4" strokeWidth="2.5" />
                                                            <motion.path 
                                                                initial={{ pathLength: 0 }}
                                                                animate={{ pathLength: fraction }}
                                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                                                fill="none" stroke="#d4820a" strokeWidth="2.5" strokeDasharray="100, 100"
                                                            />
                                                        </svg>
                                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '1.6rem', fontWeight: 600, color: '#d4820a', lineHeight: '1' }}>{pct}%</span>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#9a8c82', marginTop: '4px' }}>{activeCount} / 320</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ borderTop: '1px solid #ece4d8', paddingTop: '15px', marginTop: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                                                        <span style={{ color: '#9a8c82' }}>Status</span>
                                                        <span style={{ color: pct >= 100 ? '#c0392b' : '#0d7c6e' }}>{pct >= 100 ? 'PENUH' : 'TERSEDIA'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Continuous Intelligence Stream (Live Operational Logs) */}
                                <div style={{ background: '#faf7f2', padding: '30px', borderRadius: '18px', border: '1px solid #ece4d8', boxShadow: '0 15px 35px rgba(26,22,18,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600, color: '#1a1612', letterSpacing: '1px' }}>Aktivitas Terkini</h3>
                                            <div style={{ fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600 }}>Log sinkronisasi otomatis & aktivitas pendaftar terbaru</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 600, color: '#0d7c6e', background: '#fffdf9', padding: '4px 10px', border: '1px solid #0d7c6e', letterSpacing: '1px' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '14px', background: '#0d7c6e', display: 'inline-block' }} /> LIVE
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px' }}>
                                        {/* Stream Column 1: Recent Admissions */}
                                        <div style={{ background: '#fffdf9', padding: '20px', border: '1px solid #ece4d8' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9a8c82', marginBottom: '12px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <UserCheck size={12} style={{ color: '#d4820a' }} /> BARU DIKIRIM
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {students.slice(0, 3).map((s, idx) => (
                                                    <div key={idx} style={{ background: '#faf7f2', padding: '10px 12px', borderLeft: `3px solid ${s.status?.includes('Lolos') || s.status?.includes('Diterima') ? '#0d7c6e' : '#d4820a'}`, border: '1px solid #ece4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', fontWeight: 600, color: '#1a1612' }}>
                                                            {s.fullName || 'Tanpa Nama'}
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', background: '#fef3dc', color: '#d4820a', border: '1px solid #d4820a' }}>
                                                            {s.status || 'Menunggu'}
                                                        </span>
                                                    </div>
                                                ))}
                                                {students.length === 0 && <div style={{ fontSize: '0.7rem', color: '#4a3f35', fontStyle: 'italic' }}>Belum ada data</div>}
                                            </div>
                                        </div>

                                        {/* Stream Column 2: Recent Inbox Activity */}
                                        <div style={{ background: '#fffdf9', padding: '20px', border: '1px solid #ece4d8' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9a8c82', marginBottom: '12px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={12} style={{ color: '#d4820a' }} /> PESAN MASUK TERBARU
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {messages.slice(0, 3).map((m, idx) => (
                                                    <div key={idx} style={{ background: '#faf7f2', padding: '10px 12px', borderLeft: `3px solid ${m.status === 'unread' ? '#c0392b' : '#4a3f35'}`, border: '1px solid #ece4d8', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: 600, color: '#1a1612', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{m.senderName || 'Pengunjung'}</span>
                                                            <span style={{ fontSize: '0.6rem', color: '#9a8c82', fontWeight: 700 }}>{m.status}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9a8c82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject || m.message || 'Tanpa subjek'}</div>
                                                    </div>
                                                ))}
                                                {messages.length === 0 && <div style={{ fontSize: '0.7rem', color: '#4a3f35', fontStyle: 'italic' }}>Belum ada pesan</div>}
                                            </div>
                                        </div>

                                        {/* Stream Column 3: Platform Telemetry Snapshot */}
                                        <div style={{ background: '#fffdf9', padding: '20px', border: '1px solid #ece4d8', color: '#1a1612', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#9a8c82', marginBottom: '12px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={12} style={{ color: '#d4820a' }} /> STATUS SISTEM
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a8c82', fontWeight: 600 }}>
                                                        <span>Koneksi Database</span>
                                                        <span style={{ color: '#0d7c6e', fontWeight: 600 }}>OK 24ms</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a8c82', fontWeight: 600 }}>
                                                        <span>Mesin Sinkronisasi</span>
                                                        <span style={{ color: '#1a1612', fontWeight: 600 }}>Vercel Edge</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a8c82', fontWeight: 600 }}>
                                                        <span>Total Data Aktif</span>
                                                        <span style={{ color: '#d4820a', fontWeight: 600 }}>{students.length + registrations.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: '#9a8c82', borderTop: '1px solid #ece4d8', paddingTop: '10px', fontWeight: 600, letterSpacing: '1px' }}>
                                                TERVERIFIKASI AMAN OTOMATIS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'students' ? (
                            <>
                                {/* Executive Brutalism Configuration Row */}
                                <div style={{ background: '#fffdf9', padding: '15px 30px', borderBottom: '1px solid #ece4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ padding: '6px 12px', background: '#d4820a', color: '#fffdf9', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 1000, letterSpacing: '1px' }}>PENGATURAN:</div>
                                        
                                        <div style={{ position: 'relative' }}>
                                            <motion.button 
                                                onClick={() => setShowConfig(!showConfig)}
                                                whileHover={{ background: '#f0a830', color: '#1a1612' }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{ background: '#faf7f2', border: '1px solid #ece4d8', padding: '10px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600, color: '#1a1612', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s' }}
                                            >
                                                <Settings size={16} /> <span>Pengaturan Formulir</span>
                                            </motion.button>

                                            <AnimatePresence>
                                                {showConfig && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        style={{ position: 'absolute', top: 'calc(100% + 15px)', left: 0, width: '320px', background: '#fffdf9', borderRadius: '14px', border: '1px solid #ece4d8', padding: '25px', zIndex: 1000 }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                            {/* Compact Year Manage */}
                                                            <div>
                                                                <h5 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', fontWeight: 1000, color: '#d4820a', letterSpacing: '1px' }}>PENGATURAN TAHUN AJARAN</h5>
                                                                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                                                    <input placeholder="20xx..." style={{ flex: 1, padding: '8px 12px', background: '#faf7f2', border: '1px solid #ece4d8', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 700, color: '#1a1612', outline: 'none' }} value={newYearInput} onChange={e => setNewYearInput(e.target.value)} />
                                                                    <button onClick={handleAddYear} style={{ background: '#d4820a', color: '#fffdf9', border: 'none', padding: '8px', borderRadius: '14px', cursor: 'pointer', fontWeight: 700 }}><Plus size={16} /></button>
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                                                    {availableYears.map(y => {
                                                                        const config = yearConfigs.find(c => c.year === y) || { videoUrl: '' };
                                                                        return (
                                                                            <div key={y} style={{ background: '#faf7f2', borderRadius: '14px', padding: '15px', border: '1px solid #ece4d8' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                                                    <span style={{ fontWeight: 700, color: '#1a1612' }}>{y}</span>
                                                                                    <X size={14} style={{ cursor: 'pointer', color: '#c0392b' }} onClick={() => handleDeleteYear(y)} />
                                                                                </div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                                    <label style={{ fontSize: '0.6rem', fontWeight: 600, color: '#9a8c82' }}>LINK DOKUMENTASI YOUTUBE</label>
                                                                                    <input 
                                                                                        placeholder="https://youtube.com/watch?v=..." 
                                                                                        style={{ width: '100%', padding: '8px 12px', background: '#fffdf9', border: '1px solid #ece4d8', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 600, color: '#1a1612', outline: 'none' }}
                                                                                        value={config.videoUrl} 
                                                                                        onChange={e => handleUpdateYearConfig(y, 'videoUrl', e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px 30px', borderBottom: '1px solid #ece4d8', display: 'flex', justifyContent: 'space-between', background: '#faf7f2', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', background: '#fffdf9', padding: '6px', borderRadius: '14px', gap: '8px', border: '1px solid #ece4d8' }}>
                                            <select 
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                                style={{ padding: '8px 15px', borderRadius: '14px', border: '1px solid #ece4d8', background: '#fffdf9', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: '#1a1612' }}
                                            >
                                                <option value="Semua">Semua Tahun</option>
                                                {availableYears.map(y => <option key={`f-${y}`} value={y}>{y}</option>)}
                                            </select>
                                            <select 
                                                value={filterWave}
                                                onChange={(e) => setFilterWave(e.target.value)}
                                                style={{ padding: '8px 15px', borderRadius: '14px', border: '1px solid #ece4d8', background: '#fffdf9', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: '#1a1612' }}
                                            >
                                                <option value="Semua">Semua Gelombang</option>
                                                <option value="1">Gelombang 1</option>
                                                <option value="2">Gelombang 2</option>
                                                <option value="3">Gelombang 3</option>
                                            </select>
                                        </div>
                                        <button onClick={handleDownloadTemplate} style={{ background: '#fffdf9', border: '1px solid #ece4d8', color: '#1a1612', padding: '10px 18px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', transition: '0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#1a1612'; e.currentTarget.style.color = '#fffdf9'; }} onMouseOut={e => { e.currentTarget.style.background = '#fffdf9'; e.currentTarget.style.color = '#1a1612'; }}><Download size={16} /> <span>TEMPLATE</span></button>
                                        <button onClick={() => fileInputRef.current?.click()} style={{ background: '#1a1612', border: '1px solid #ece4d8', color: '#fffdf9', padding: '10px 18px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', transition: '0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#d4820a'; }} onMouseOut={e => { e.currentTarget.style.background = '#1a1612'; }}><Upload size={16} /> <span>IMPOR</span></button>
                                    </div>
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#d4820a' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Cari Nama / No. Registrasi..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '12px 20px 12px 45px', borderRadius: '14px', border: '1px solid #ece4d8', background: '#fffdf9', fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: '0.3s', color: '#1a1612' }} 
                                            onFocus={e => e.target.style.border = '1px solid #d4820a'}
                                            onBlur={e => e.target.style.border = '1px solid #ece4d8'}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: '0 30px 40px', overflowX: 'auto', marginTop: '20px', background: '#fffdf9' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed', border: '1px solid #ece4d8' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#faf7f2' }}>
                                                <th style={{ padding: '15px 10px', width: '50px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'center' }}>NO</th>
                                                <th style={{ padding: '15px 10px', width: '160px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'center' }}>ID / NO REG</th>
                                                <th style={{ padding: '15px 10px', width: '220px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'left' }}>NAMA SISWA</th>
                                                <th style={{ padding: '15px 10px', width: '160px', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'left' }}>ASAL SEKOLAH</th>
                                                <th style={{ padding: '15px 10px', width: '110px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'center' }}>TAHUN</th>
                                                <th style={{ padding: '15px 10px', width: '70px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'center' }}>GEL.</th>
                                                <th style={{ padding: '15px 10px', width: '160px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'center' }}>STATUS</th>
                                                <th style={{ padding: '15px 10px', width: '180px', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #ece4d8', borderRight: '1px solid #ece4d8', textAlign: 'left' }}>LINK PDF (DRIVE)</th>
                                                <th style={{ padding: '15px 10px', width: '70px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#1a1612', textTransform: 'uppercase', borderBottom: '1px solid #ece4d8' }}>AKSI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.filter(s => {
                                                const matchYear = filterYear === 'Semua' || (s.year || '2026/2027') === filterYear;
                                                const matchWave = filterWave === 'Semua' || String(s.wave) === filterWave;
                                                const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
                                                return matchYear && matchWave && matchSearch && !s.registrationDate;
                                            })
                                            .map((s, idx) => {
                                                const originalIndex = students.indexOf(s);
                                                return (
                                                    <motion.tr 
                                                        key={s._id || `temp-${originalIndex}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        whileHover={{ background: '#faf7f2' }}
                                                        style={{ background: '#fffdf9', borderBottom: '1px solid #ece4d8', transition: '0.2s' }}
                                                    >
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #ece4d8', background: '#faf7f2' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1612' }}>{idx + 1}</div>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #ece4d8' }}>
                                                            <input 
                                                                style={{ 
                                                                    padding: '6px 12px', 
                                                                    background: '#fffdf9', 
                                                                    color: '#1a1612', 
                                                                    borderRadius: '14px', 
                                                                    fontSize: '0.75rem', 
                                                                    fontWeight: 700, 
                                                                    border: '1px solid #ece4d8',
                                                                    width: '100%',
                                                                    textAlign: 'center', 
                                                                    outline: 'none',
                                                                    transition: '0.3s'
                                                                }} 
                                                                onFocus={(e) => e.target.style.border = '1px solid #d4820a'}
                                                                onBlur={(e) => e.target.style.border = '1px solid #ece4d8'}
                                                                value={s.id || ''} 
                                                                onChange={e => handleStudentChange(originalIndex, 'id', e.target.value)} 
                                                            />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #ece4d8' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 700, fontSize: '0.85rem', color: '#1a1612', width: '100%', outline: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} value={s.name || ''} onChange={e => handleStudentChange(originalIndex, 'name', e.target.value)} />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #ece4d8' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#4a3f35', width: '100%', outline: 'none' }} value={s.school || s.schoolName || ''} onChange={e => handleStudentChange(originalIndex, 'school', e.target.value)} />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #ece4d8' }}>
                                                            <select value={s.year || availableYears[0] || '2026/2027'} onChange={e => handleStudentChange(originalIndex, 'year', e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', outline: 'none', textAlign: 'center', color: '#1a1612' }}>
                                                                {availableYears.map(y => <option key={y} value={y} style={{ background: '#fffdf9' }}>{y}</option>)}
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #ece4d8' }}>
                                                            <select value={s.wave || '1'} onChange={e => handleStudentChange(originalIndex, 'wave', e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', outline: 'none', textAlign: 'center', color: '#1a1612' }}>
                                                                <option value="1" style={{ background: '#fffdf9' }}>1</option>
                                                                <option value="2" style={{ background: '#fffdf9' }}>2</option>
                                                                <option value="3" style={{ background: '#fffdf9' }}>3</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #ece4d8' }}>
                                                            <select 
                                                                value={s.status || 'Not Yet Passed'} 
                                                                onChange={e => handleStudentChange(originalIndex, 'status', e.target.value)}
                                                                style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', color: isPassed(s.status) ? '#0d7c6e' : '#d4820a', cursor: 'pointer', outline: 'none', textAlign: 'center' }}
                                                            >
                                                                <option value="Passed Selection" style={{ background: '#fffdf9' }}>Lolos Seleksi</option>
                                                                <option value="Not Yet Passed" style={{ background: '#fffdf9' }}>Belum Lolos</option>
                                                            </select>
                                                        </td>

                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #ece4d8' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#d4820a', width: '100%', outline: 'none', textDecoration: s.pdfLink ? 'underline' : 'none' }} placeholder="https://drive.google.com/..." value={s.pdfLink || ''} onChange={e => handleStudentChange(originalIndex, 'pdfLink', e.target.value)} />
                                                        </td>

                                                        <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                            <button 
                                                                onClick={() => handleDeleteStudent(originalIndex)} 
                                                                style={{ background: '#c0392b', border: 'none', padding: '8px', borderRadius: '14px', cursor: 'pointer', color: '#fff', transition: '0.2s' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : activeTab === 'active-students' ? (
                            <>
                                <div style={{ padding: '30px 40px', borderBottom: '1px solid #ece4d8', display: 'flex', justifyContent: 'space-between', background: '#faf7f2', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', background: '#fffdf9', padding: '6px', borderRadius: '14px', gap: '8px', border: '1px solid #ece4d8' }}>
                                        <select 
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                            style={{ padding: '8px 15px', borderRadius: '14px', border: '1px solid #ece4d8', background: '#fffdf9', fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: '#1a1612' }}
                                        >
                                            <option value="Semua">Semua Tahun</option>
                                            {availableYears.map(y => <option key={`af-${y}`} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.4rem', color: '#1a1612', letterSpacing: '-0.5px' }}>DATABASE SISWA DITERIMA</h3>
                                    <div style={{ position: 'relative', width: '320px' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#d4820a' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Cari Siswa Aktif..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '14px', border: '1px solid #ece4d8', background: '#fffdf9', fontSize: '0.9rem', fontWeight: 600, color: '#1a1612', outline: 'none' }}
                                            onFocus={e => e.target.style.border = '1px solid #d4820a'}
                                            onBlur={e => e.target.style.border = '1px solid #ece4d8'}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: '40px', background: '#fffdf9' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                                        {students.filter(s => {
                                            const matchYear = filterYear === 'Semua' || (s.year || '2026/2027') === filterYear;
                                            const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
                                            const isActive = isPassed(s.status);
                                            return matchYear && matchSearch && isActive;
                                        }).map((s, idx) => {
                                            const originalIndex = students.indexOf(s);
                                            return (
                                                <motion.div 
                                                    key={s._id || idx}
                                                    whileHover={{ y: -5, borderColor: '#d4820a' }}
                                                    style={{ 
                                                        background: '#faf7f2', 
                                                        padding: '35px', 
                                                        borderRadius: '14px', 
                                                        border: '1px solid #ece4d8', 
                                                        display: 'flex', 
                                                        flexDirection: 'column', 
                                                        gap: '25px',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        transition: '0.2s'
                                                    }}
                                                >
                                                    {/* Decorative Background Accent */}
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'linear-gradient(135deg, transparent 50%, #d4820a08 100%)', zIndex: 0 }} />
                                                    <div style={{ position: 'absolute', top: '20px', left: '25px', width: '38px', height: '38px', background: '#d4820a', color: '#fffdf9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 1000, zIndex: 1 }}>{idx + 1}</div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2, marginLeft: '50px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <input 
                                                                style={{ 
                                                                    padding: '6px 16px', 
                                                                    background: '#fffdf9', 
                                                                    color: '#1a1612', 
                                                                    borderRadius: '14px', 
                                                                    fontSize: '0.75rem', 
                                                                    fontWeight: 600, 
                                                                    letterSpacing: '0.5px', 
                                                                    border: '1px solid #ece4d8',
                                                                    width: '180px',
                                                                    textAlign: 'center',
                                                                    outline: 'none',
                                                                    transition: '0.3s'
                                                                }} 
                                                                onFocus={(e) => e.target.style.border = '1px solid #d4820a'}
                                                                onBlur={(e) => e.target.style.border = '1px solid #ece4d8'}
                                                                value={s.id || ''} 
                                                                onChange={e => handleStudentChange(originalIndex, 'id', e.target.value)} 
                                                            />
                                                        </div>
                                                        <div style={{ 
                                                            display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                                            background: '#0d7c6e15', color: '#0d7c6e', padding: '8px 18px', 
                                                            borderRadius: '14px', fontSize: '0.7rem', fontWeight: 1000,
                                                            border: '1px solid #0d7c6e30',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '14px', background: '#0d7c6e' }} />
                                                            <span>{s.status?.toUpperCase() || 'DITERIMA'}</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ position: 'relative', zIndex: 2 }}>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 600, color: '#1a1612', letterSpacing: '-0.8px', lineHeight: 1.2 }}>{s.name}</h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4a3f35', fontSize: '0.85rem', fontWeight: 700 }}>
                                                            <div style={{ width: '30px', height: '30px', borderRadius: '14px', background: '#fffdf9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ece4d8' }}>
                                                                <Users size={16} color="#d4820a" />
                                                            </div>
                                                            <span>{s.school || s.schoolName || 'Asal Sekolah Belum Diisi'}</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ background: '#fffdf9', padding: '20px 25px', borderRadius: '14px', border: '1px solid #ece4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#9a8c82', textTransform: 'uppercase', letterSpacing: '1px' }}>TAHUN AJARAN</span>
                                                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#d4820a' }}>{s.year}</span>
                                                        </div>
                                                        <motion.div 
                                                            whileHover={{ scale: 1.1, x: 5, background: '#d4820a', color: '#fffdf9' }}
                                                            style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#faf7f2', border: '1px solid #d4820a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4820a', cursor: 'pointer', transition: '0.2s' }}
                                                        >
                                                            <ChevronRight size={22} />
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'registrations' ? (
                            <div style={{ padding: '40px', background: '#fffdf9' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: 'booking_fee', label: 'Sudah Booking Fee' },
                                        { key: 'formulir', label: 'Ambil Formulir Saja' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setRegistrationFilter(f.key)}
                                            style={{
                                                padding: '10px 20px', borderRadius: '100px', border: '1px solid #ece4d8', cursor: 'pointer',
                                                fontSize: '0.8rem', fontWeight: 700,
                                                background: registrationFilter === f.key ? '#1a1612' : '#fffdf9',
                                                color: registrationFilter === f.key ? '#fffdf9' : '#6b5f53',
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
                                    {students.filter(s => s.registrationDate).filter(s => {
                                        const type = s.registrationType || (s.paymentProof ? 'booking_fee' : 'formulir');
                                        return registrationFilter === 'all' || type === registrationFilter;
                                    }).map((reg, idx) => (
                                        <motion.div 
                                            key={reg._id || idx}
                                            whileHover={{ y: -5, borderColor: '#d4820a' }}
                                            style={{ background: '#faf7f2', padding: '35px', borderRadius: '14px', border: '1px solid #ece4d8', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflow: 'hidden', transition: '0.2s' }}
                                        >
                                            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', background: '#d4820a', color: '#fffdf9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, zIndex: 10 }}>{idx + 1}</div>
                                            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'linear-gradient(135deg, transparent 50%, #d4820a08 100%)', zIndex: 0 }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                                <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: '#fffdf9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4820a', border: '1px solid #ece4d8', marginLeft: '35px' }}>
                                                    <BookOpen size={30} />
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9a8c82', fontWeight: 600, textTransform: 'uppercase' }}>DAFTAR PADA</span>
                                                    <span style={{ fontSize: '0.9rem', color: '#d4820a', fontWeight: 700 }}>{reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : '-'}</span>
                                                </div>
                                            </div>

                                            <div style={{ position: 'relative', zIndex: 1 }}>
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: 600, color: '#1a1612', letterSpacing: '-1px', lineHeight: 1.2 }}>{reg.name}</h4>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <span style={{ padding: '6px 14px', background: '#fffdf9', color: '#1a1612', borderRadius: '14px', border: '1px solid #ece4d8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{reg.gender === 'L' || reg.gender === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}</span>
                                                    <span style={{ padding: '6px 14px', background: '#d4820a10', color: '#d4820a', borderRadius: '14px', border: '1px solid #d4820a30', fontSize: '0.75rem', fontWeight: 700 }}>TAHUN {reg.year || '-'}</span>
                                                    {(reg.registrationType || (reg.paymentProof ? 'booking_fee' : 'formulir')) === 'booking_fee' ? (
                                                        <span style={{ padding: '6px 14px', background: '#0d7c6e15', color: '#0d7c6e', borderRadius: '14px', border: '1px solid #0d7c6e30', fontSize: '0.75rem', fontWeight: 700 }}>BOOKING FEE</span>
                                                    ) : (
                                                        <span style={{ padding: '6px 14px', background: '#c0392b15', color: '#c0392b', borderRadius: '14px', border: '1px solid #c0392b30', fontSize: '0.75rem', fontWeight: 700 }}>AMBIL FORMULIR</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', background: '#fffdf9', padding: '25px', borderRadius: '14px', border: '1px solid #ece4d8', position: 'relative', zIndex: 1 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>NAMA ORANG TUA</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1612' }}>{reg.parentName || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>KONTAK WA</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d7c6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Phone size={16} /> <span>{reg.whatsapp}</span>
                                                    </div>
                                                </div>
                                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #ece4d8', paddingTop: '15px', marginTop: '5px' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>ASAL SEKOLAH</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1612' }}>{reg.school || reg.schoolName || '-'}</div>
                                                </div>

                                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #ece4d8', paddingTop: '15px' }}>
                                                    <Field label="TEMPAT, TANGGAL LAHIR" value={`${reg.birthPlace || '-'}${reg.birthDate ? `, ${new Date(reg.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`} />
                                                </div>
                                                <Field label="NIK" value={reg.nik || '-'} />
                                                <Field label="NISN" value={reg.nisn || '-'} />
                                                <Field label="AGAMA" value={reg.religion || '-'} />
                                                <Field label="ANAK KE / DARI SAUDARA" value={`${reg.childOrder || '-'} dari ${reg.siblingOf || '-'}`} />
                                                <Field label="TINGGI / BERAT BADAN" value={`${reg.height || '-'} cm / ${reg.weight || '-'} kg`} />
                                                <Field label="BAHASA SEHARI-HARI" value={reg.dailyLanguage || '-'} />
                                                <Field label="NO. KIP/KIS/KKS/KPS" value={reg.kip || '-'} />
                                                <Field label="NO. HP SISWA" value={reg.studentPhone || '-'} />
                                                <Field span label="ALAMAT" value={`${reg.address || '-'}${reg.city ? `, ${reg.city}` : ''}${reg.province ? `, ${reg.province}` : ''}`} />
                                                <Field label="TAHUN LULUS SEKOLAH ASAL" value={reg.graduationYear || '-'} />
                                                <Field label="GELOMBANG" value={reg.wave || '-'} />

                                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #ece4d8', paddingTop: '15px', fontSize: '0.7rem', fontWeight: 600, color: '#d4820a', letterSpacing: '1px' }}>DATA AYAH KANDUNG</div>
                                                <Field label="NAMA AYAH" value={reg.fatherName || '-'} />
                                                <Field label="NIK AYAH" value={reg.nikAyah || '-'} />
                                                <Field label="TTL AYAH" value={reg.fatherBirthInfo || '-'} />
                                                <Field label="PENDIDIKAN AYAH" value={reg.fatherEducation || '-'} />
                                                <Field label="PEKERJAAN AYAH" value={reg.fatherJob || '-'} />
                                                <Field label="PENGHASILAN AYAH" value={reg.fatherIncome || '-'} />
                                                <Field label="NO. TLP AYAH" value={reg.fatherPhone || '-'} />
                                                <Field label="STATUS AYAH" value={reg.fatherStatus || '-'} />

                                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #ece4d8', paddingTop: '15px', fontSize: '0.7rem', fontWeight: 600, color: '#d4820a', letterSpacing: '1px' }}>DATA IBU KANDUNG</div>
                                                <Field label="NAMA IBU" value={reg.motherName || '-'} />
                                                <Field label="NIK IBU" value={reg.nikIbu || '-'} />
                                                <Field label="TTL IBU" value={reg.motherBirthInfo || '-'} />
                                                <Field label="PENDIDIKAN IBU" value={reg.motherEducation || '-'} />
                                                <Field label="PEKERJAAN IBU" value={reg.motherJob || '-'} />
                                                <Field label="PENGHASILAN IBU" value={reg.motherIncome || '-'} />
                                                <Field label="NO. TLP IBU" value={reg.motherPhone || '-'} />
                                                <Field label="STATUS IBU" value={reg.motherStatus || '-'} />
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px', position: 'relative', zIndex: 1 }}>
                                                {reg.paymentProof ? (
                                                    <motion.button 
                                                        whileHover={{ scale: 1.02 }}
                                                        onClick={() => {
                                                            let pUrl = reg.paymentProof;
                                                            if (pUrl && !pUrl.startsWith('http://') && !pUrl.startsWith('https://')) {
                                                                pUrl = 'https://' + pUrl;
                                                            }
                                                            window.open(pUrl, '_blank');
                                                        }} 
                                                        style={{ flex: 1, padding: '16px', background: '#d4820a', color: '#fffdf9', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                                    >
                                                        <Eye size={20} /> <span>LIHAT BUKTI BAYAR</span>
                                                    </motion.button>
                                                ) : (
                                                    <div style={{ flex: 1, padding: '16px', background: '#c0392b15', color: '#c0392b', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', border: '1px solid #c0392b30' }}>BUKTI BAYAR BELUM ADA</div>
                                                )}
                                                <motion.button 
                                                    whileHover={{ scale: 1.05, background: '#c0392b', color: '#fff' }}
                                                    onClick={async () => { 
                                                        if (window.confirm('Hapus data pendaftaran ini?')) { 
                                                            try {
                                                                setIsLoading(true);
                                                                await adminMutate({ deletes: [{ type: 'student', id: reg._id }] });
                                                                setSuccess('Data registrasi berhasil dihapus dari Cloud!');
                                                                setTimeout(() => setSuccess(''), 3000);
                                                                fetchAllData(); 
                                                            } catch (errDel) {
                                                                console.error("Delete Error:", errDel);
                                                                setError('Gagal menghapus: ' + (errDel.message || 'Akses ditolak. Pastikan Token Sanity memiliki izin Write/Editor dan CORS Allow Credentials aktif.'));
                                                            } finally {
                                                                setIsLoading(false);
                                                            }
                                                        } 
                                                    }} 
                                                    style={{ padding: '16px', background: '#fffdf9', border: '1px solid #ece4d8', color: '#c0392b', borderRadius: '14px', cursor: 'pointer', transition: '0.2s' }}
                                                >
                                                    <Trash2 size={22} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {students.filter(s => s.registrationDate).length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '6rem', color: '#9a8c82', fontWeight: 600, gridColumn: 'span 2' }}>
                                            <BookOpen size={60} style={{ opacity: 0.2, marginBottom: '20px', margin: '0 auto' }} />
                                            <p>Belum ada pendaftaran online yang masuk.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'gallery' ? (
                            <div style={{ padding: '40px', background: '#fffdf9' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                    {gallery.map((item, index) => (
                                        <motion.div key={item._id || index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#faf7f2', padding: '1.5rem', borderRadius: '14px', border: '1px solid #ece4d8' }}>
                                            <div style={{ aspectRatio: '16 / 10', background: '#fffdf9', borderRadius: '14px', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative', border: item.imageUrl ? '1px solid #ece4d8' : '1px solid #c0392b' }}>
                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.title || "Gallery Item"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c0392b', gap: '10px' }}><ImageIcon size={48} /><span style={{ fontSize: '0.7rem', fontWeight: 600 }}>GAMBAR TIDAK ADA</span></div>}
                                                <label style={{ position: 'absolute', bottom: '15px', right: '15px', background: item.imageUrl ? '#d4820a' : '#c0392b', color: '#fffdf9', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <span style={{ color: '#fffdf9' }}>{item.imageUrl ? 'GANTI GAMBAR' : 'UNGGAH SEKARANG'}</span>
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleImageUpload(index, e.target.files[0])} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <div style={{ flex: 2 }}>
                                                        <label htmlFor={`gallery-title-${index}`} style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', marginBottom: '5px' }}>JUDUL KONTEN</label>
                                                        <input id={`gallery-title-${index}`} placeholder="Judul Acara" style={{ width: '100%', padding: '12px 15px', border: item.title ? '1px solid #ece4d8' : '1px solid #c0392b', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', background: '#fffdf9', color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = item.title ? '1px solid #ece4d8' : '1px solid #c0392b'} value={item.title || ''} onChange={e => handleGalleryChange(index, 'title', e.target.value)} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label htmlFor={`gallery-cat-${index}`} style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82', marginBottom: '5px' }}>JENIS</label>
                                                        <select id={`gallery-cat-${index}`} style={{ width: '100%', padding: '12px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#fffdf9', fontWeight: 700, fontSize: '0.8rem', color: '#1a1612', outline: 'none' }} value={item.category || 'acara'} onChange={e => handleGalleryChange(index, 'category', e.target.value)}>
                                                            <option value="acara">Acara</option>
                                                            <option value="berita">Berita</option>
                                                            <option value="penghargaan">Penghargaan</option>
                                                            <option value="lain-lain">Lainnya</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input placeholder="Tanggal (mis. 12 Mar 2026)" aria-label="Event Date" style={{ flex: 1, padding: '12px 15px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#fffdf9', color: '#1a1612', fontWeight: 700, fontSize: '0.85rem', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={item.date || ''} onChange={e => handleGalleryChange(index, 'date', e.target.value)} />
                                                    <input type="date" aria-label="Pick Date" style={{ width: '45px', padding: '10px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#d4820a', color: '#fffdf9', cursor: 'pointer', outline: 'none' }} onChange={e => {
                                                        const d = new Date(e.target.value);
                                                        const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                        handleGalleryChange(index, 'date', formatted);
                                                    }} />
                                                </div>
                                                <textarea placeholder="Deskripsi lengkap acara..." style={{ width: '100%', padding: '15px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#fffdf9', height: '100px', resize: 'none', fontSize: '0.85rem', color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={item.agenda || ''} onChange={e => handleGalleryChange(index, 'agenda', e.target.value)} />
                                                <button onClick={() => handleDeleteGallery(index)} style={{ width: '100%', padding: '12px', border: '1px solid #ece4d8', color: '#c0392b', background: '#fffdf9', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = '#fffdf9'; e.currentTarget.style.color = '#c0392b'; }}><Trash2 size={18} /> <span>HAPUS KONTEN</span></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'staff' ? (
                            <div style={{ padding: '40px', background: '#fffdf9' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                    {staff.map((member, index) => (
                                        <motion.div key={member._id || index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#faf7f2', padding: '1.5rem', borderRadius: '14px', border: '1px solid #ece4d8' }}>
                                            <div style={{ aspectRatio: '1/1', background: '#fffdf9', borderRadius: '14px', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative', border: member.imageUrl ? '1px solid #ece4d8' : '1px solid #c0392b' }}>
                                                {member.imageUrl ? (
                                                    <img 
                                                        src={member.imageUrl} 
                                                        alt={member.name || "Staff Photo"} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.parentElement) {
                                                                e.currentTarget.parentElement.innerHTML = '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #c0392b; gap: 8px;"><span style="font-size: 0.6rem; font-weight: 800;">GAMBAR RUSAK</span></div>';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c0392b', gap: '8px' }}>
                                                        <Users size={48} />
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>BELUM ADA FOTO</span>
                                                    </div>
                                                )}
                                                <label style={{ position: 'absolute', bottom: '15px', right: '15px', background: member.imageUrl ? '#d4820a' : '#c0392b', color: '#fffdf9', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <span style={{ color: '#fffdf9' }}>{member.imageUrl ? 'GANTI' : 'TAMBAH FOTO'}</span>
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleStaffImageUpload(index, e.target.files[0])} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <input placeholder="Nama Lengkap & Gelar" aria-label="Staff Full Name" style={{ width: '100%', padding: '12px 15px', border: member.name ? '1px solid #ece4d8' : '1px solid #c0392b', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', background: '#fffdf9', color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = member.name ? '1px solid #ece4d8' : '1px solid #c0392b'} value={member.name || ''} onChange={e => handleStaffChange(index, 'name', e.target.value)} />
                                                <input placeholder="Jabatan / Posisi" aria-label="Staff Role" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ece4d8', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', background: '#fffdf9', color: '#d4820a', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={member.role || ''} onChange={e => handleStaffChange(index, 'role', e.target.value)} />
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fffdf9', padding: '15px', borderRadius: '14px', border: '1px solid #ece4d8' }}>
                                                    <label style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9a8c82' }}>DETAIL PROFESIONAL</label>
                                                    <input placeholder="Visi Singkat (satu kalimat)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#faf7f2', fontSize: '0.75rem', fontWeight: 600, color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={member.vision || ''} onChange={e => handleStaffChange(index, 'vision', e.target.value)} />
                                                    <input placeholder="Pendidikan Terakhir (mis. S1 TI)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#faf7f2', fontSize: '0.75rem', fontWeight: 600, color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={member.education || ''} onChange={e => handleStaffChange(index, 'education', e.target.value)} />
                                                    <input placeholder="Email Resmi" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ece4d8', borderRadius: '14px', background: '#faf7f2', fontSize: '0.75rem', fontWeight: 600, color: '#1a1612', outline: 'none' }} onFocus={e => e.target.style.border = '1px solid #d4820a'} onBlur={e => e.target.style.border = '1px solid #ece4d8'} value={member.email || ''} onChange={e => handleStaffChange(index, 'email', e.target.value)} />
                                                </div>

                                                <button onClick={() => handleDeleteStaff(index)} style={{ width: '100%', padding: '12px', border: '1px solid #ece4d8', color: '#c0392b', background: '#fffdf9', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = '#fffdf9'; e.currentTarget.style.color = '#c0392b'; }}><Trash2 size={18} /> <span>HAPUS</span></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'messages' ? (
                            <div style={{ padding: '30px', background: '#fffdf9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {messages.map((msg, idx) => (
                                        <motion.div 
                                            key={msg._id || idx} 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{ background: '#faf7f2', padding: '25px', borderRadius: '14px', border: '1px solid #ece4d8', position: 'relative' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#fffdf9', color: '#d4820a', border: '1px solid #ece4d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Mail size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1a1612' }}>{msg.name}</h4>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9a8c82', fontWeight: 600 }}>{msg.email}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#9a8c82', fontWeight: 700 }}>
                                                        {msg.receivedAt ? new Date(msg.receivedAt).toLocaleString('en-GB') : '-'}
                                                    </span>
                                                    <button 
                                                        onClick={async () => {
                                                            if (window.confirm('Hapus pesan ini?')) {
                                                                await adminMutate({ deletes: [{ type: 'contactMessage', id: msg._id }] });
                                                                fetchAllData();
                                                            }
                                                        }} 
                                                        style={{ padding: '8px', background: '#fffdf9', color: '#c0392b', border: '1px solid #ece4d8', borderRadius: '14px', cursor: 'pointer' }}
                                                        onMouseOver={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = '#fffdf9'; e.currentTarget.style.color = '#c0392b'; }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ background: '#fffdf9', padding: '20px', borderRadius: '14px', border: '1px solid #ece4d8' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#d4820a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Subject: {msg.subject || 'Tanpa Subjek'}</div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1a1612', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                            </div>
                                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    {msg.status === 'unread' && (
                                                        <button 
                                                            onClick={async () => {
                                                                await adminMutate({ patches: [{ id: msg._id, set: { status: 'read' } }] });
                                                                fetchAllData();
                                                            }}
                                                            style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fffdf9', background: '#0d7c6e', border: 'none', padding: '6px 14px', borderRadius: '14px', cursor: 'pointer' }}
                                                        >
                                                            TANDAI DIBACA
                                                        </button>
                                                    )}
                                                </div>
                                                <a href={`mailto:${msg.email}?subject=Reply to: ${msg.subject}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d4820a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span>BALAS VIA EMAIL</span> <ChevronRight size={14} />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {messages.length === 0 && <div style={{ textAlign: 'center', padding: '5rem', color: '#9a8c82', fontWeight: 600 }}>Belum ada pesan.</div>}
                                </div>
                            </div>
                        ) : null}

                        {!isLoading && (
                            (activeTab === 'students' && students.length === 0) || 
                            (activeTab === 'gallery' && gallery.length === 0) ||
                            (activeTab === 'staff' && staff.length === 0)
                        ) && (
                            <div style={{ padding: '8rem', textAlign: 'center', background: '#fffdf9', border: '1px solid #ece4d8', margin: '40px' }}>
                                <LayoutDashboard size={80} style={{ opacity: 0.15, margin: '0 auto 1.5rem', color: '#d4820a' }} />
                                <p style={{ fontWeight: 700, color: '#1a1612', fontSize: '1.1rem' }}>BELUM ADA DATA</p>
                                <p style={{ fontSize: '0.85rem', color: '#9a8c82', fontWeight: 700 }}>Klik "TAMBAH BARU" di atas untuk menambah data baru.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImportExcel} />
        </div>
    );
}
