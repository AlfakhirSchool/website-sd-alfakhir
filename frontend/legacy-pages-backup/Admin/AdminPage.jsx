import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, UserCheck, User, AlertCircle, Image as ImageIcon, LayoutDashboard, Download, Upload, Search, Settings, X, ChevronRight, Save, Eye, EyeOff, Users, BookOpen, RefreshCw, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { mutationClient } from '../../lib/sanity';
import { templateData } from './templateData';

const AdminPage = () => {
    // --- Refs & State ---
    const fileInputRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [students, setStudents] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
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

    // --- Data Validation Logic ---
    useEffect(() => {
        const errors = [];
        
        students.forEach((s, i) => {
            if (!s.name || s.name.trim() === '') errors.push({ tab: 'students', index: i, field: 'name', msg: `Nama siswa di baris ${i+1} masih kosong.` });
            if (!s.id || s.id.trim() === '') errors.push({ tab: 'students', index: i, field: 'id', msg: `No. Registrasi di baris ${i+1} belum diisi.` });
        });

        gallery.forEach((g, i) => {
            if (!g.title || g.title.trim() === '') errors.push({ tab: 'gallery', index: i, field: 'title', msg: `Judul Galeri #${i+1} kosong.` });
            if (!g.imageUrl) errors.push({ tab: 'gallery', index: i, field: 'image', msg: `Konten "${g.title || 'Untitled'}" belum memiliki gambar.` });
        });

        staff.forEach((st, i) => {
            if (!st.name || st.name.trim() === '') errors.push({ tab: 'staff', index: i, field: 'name', msg: `Nama Guru #${i+1} kosong.` });
            if (!st.imageUrl) errors.push({ tab: 'staff', index: i, field: 'image', msg: `Guru "${st.name || 'Untitled'}" belum ada foto profil.` });
        });

        setValidationErrors(errors);
    }, [students, gallery, staff]);


    // --- Authentication Persistence ---
    useEffect(() => {
        const token = sessionStorage.getItem('as-secure-auth-node-v1');
        if (token) {
            setIsLoggedIn(true);
            fetchAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        setError('');
        try {
            // SINGLE BATCH QUERY - Reduced 8 requests to 1
            const megaQuery = `{
            "students": *[_type == "student"] | order(_createdAt desc) {
                ...,
                "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage)
            },
            "gallery": *[_type == "gallery"] | order(date desc) {"_id": _id, title, category, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image, date, agenda},
            "staff": *[_type == "teacher"] | order(order asc) {"_id": _id, name, role, vision, education, email, "imageUrl": select(defined(image.asset) => image.asset->url + "?fm=webp&q=90", externalImage), externalImage, image},
            "messages": *[_type == "contactMessage"] | order(receivedAt desc),
            "yearConfigs": *[_type == "yearConfig"]
        }`;
            
            const data = await mutationClient.fetch(megaQuery);
            
            // YEAR SYNC: Update list based on existing state and what's in the DB
            const combinedYears = Array.from(new Set([
                ...availableYears,
                ...(data.students || []).map(s => s.year).filter(Boolean)
            ])).sort((a,b) => b.localeCompare(a));
            setAvailableYears(combinedYears);

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
            let userFriendlyMsg = err.message || 'Unknown error';
            
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



    const handleLogin = async (e) => {
        e.preventDefault();
        // Simple secure login via environment variables on Vercel
        const adminUser = import.meta.env.VITE_ADMIN_USERNAME;
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
            setError('System Configuration Error: Admin credentials not found in environment.');
            return;
        }

        if (loginData.username === adminUser && loginData.password === adminPass) {
            sessionStorage.setItem('as-secure-auth-node-v1', 'verified-sanity-session');
            setIsLoggedIn(true);
            setFailedAttempts(0);
            fetchAllData();
        } else {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            setError(`Login Gagal. Silakan cek Username & Password. (${newAttempts}/5)`);
            if (newAttempts >= 5) setIsLocked(true);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('as-secure-auth-node-v1');
        setIsLoggedIn(false);
        setLoginData({ username: '', password: '' });
    };

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
        n[index][field] = value; 
        setStudents(n); 
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
        n[index][field] = value; 
        setGallery(n); 
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
        n[index][field] = value;
        setStaff(n);
    };

    const handleStaffImageUpload = async (index, file) => {
        if (!file) return;
        try {
            setIsLoading(true);
            const asset = await mutationClient.assets.upload('image', file);
            const n = [...staff];
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
            const asset = await mutationClient.assets.upload('image', file);
            const n = [...gallery];
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
            // Start a new transaction
            let transaction = mutationClient.transaction();

            // Handle Deletions
            deletedStudents.forEach(id => { transaction.delete(id); });
            deletedGallery.forEach(id => { transaction.delete(id); });
            deletedStaff.forEach(id => { transaction.delete(id); });

            // 1. Students
            students.forEach(std => {
                const doc = {
                    _type: 'student',
                    id: std.id,
                    name: std.name,
                    school: std.school || std.schoolName || '', 
                    score: std.score,
                    status: std.status,
                    year: std.year,
                    wave: std.wave,
                    pdfLink: std.pdfLink || ''
                };
                if (std._id && !std.isNew) {
                    transaction.patch(std._id, { set: doc });
                } else {
                    transaction.create(doc);
                }
            });

            // 2. Gallery
            gallery.forEach(item => {
                const doc = {
                    _type: 'gallery',
                    title: item.title,
                    category: item.category,
                    date: item.date,
                    agenda: item.agenda,
                    ...(item.image ? { image: item.image } : {}),
                    ...(item.externalImage ? { externalImage: item.externalImage } : {})
                };
                if (item._id && !item.isNew) {
                    transaction.patch(item._id, { set: doc });
                } else {
                    transaction.create(doc);
                }
            });

            // 4. Staff
            staff.forEach(stf => {
                const doc = {
                    _type: 'teacher',
                    name: stf.name,
                    role: stf.role,
                    vision: stf.vision || '',
                    education: stf.education || '',
                    email: stf.email || '',
                    ...(stf.image ? { image: stf.image } : {}),
                    ...(stf.externalImage ? { externalImage: stf.externalImage } : {})
                };
                if (stf._id && !stf.isNew) {
                    transaction.patch(stf._id, { set: doc });
                } else {
                    transaction.create(doc);
                }
            });

            // 5. Year Configs (Video URLs)
            yearConfigs.forEach(conf => {
                const doc = {
                    _type: 'yearConfig',
                    year: conf.year,
                    videoUrl: conf.videoUrl || ''
                };
                if (conf._id && !conf.isNew) {
                    transaction.patch(conf._id, { set: doc });
                } else {
                    transaction.create(doc);
                }
            });


            // Commit all at once (1 request)
            await transaction.commit();

            setDeletedStudents([]);
            setDeletedGallery([]);
            setDeletedStaff([]);

            setSuccess('Global Database Successfully Synchronized!');
            setTimeout(() => setSuccess(''), 3000);
            fetchAllData();
        } catch (err) { 
            console.error(err);
            setError('Cloud Save Failed: ' + err.message); 
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
        setSuccess('Template downloaded successfully!');
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
                    year: filterYear === 'Semua' ? (item["YEAR"] || item.Tahun || item.year || availableYears[0]) : filterYear,
                    wave: String(filterWave === 'Semua' ? (item["WAVE"] || item.Gelombang || item.wave || '1') : filterWave),
                    score: item.Nilai || item.score || '-',
                    pdfLink: item["PDF LINK"] || item.pdfLink || '',
                    createdAt: new Date().toISOString()
                }));
                
                setStudents([...students, ...newStudents]);
                setSuccess(`${newStudents.length} Data imported successfully! Don't forget to click SAVE.`);
                setTimeout(() => setSuccess(''), 3000);
            } catch (errImport) { 
                console.error(errImport);
                setError('Failed to read Excel. Ensure column format matches.'); 
            }
        };
        reader.readAsBinaryString(file);
    };



    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isLoggedIn) {
        return (
            <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/islamic-art.png")', pointerEvents: 'none' }}></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: '4rem', borderRadius: '48px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}
                >
                    <div style={{ marginBottom: '3rem' }}>
                        <motion.div 
                            initial={{ rotate: -15, scale: 0 }} 
                            animate={{ rotate: 0, scale: 1 }} 
                            style={{ width: '120px', height: '120px', background: 'white', borderRadius: '35px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}
                        >
                            <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Official Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                        </motion.div>
                        <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '2.4rem', letterSpacing: '-1px', lineHeight: 1 }}>AUTHENTICATED<br/><span style={{ color: '#f59e0b' }}>ACCESS</span></h2>
                        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600, marginTop: '15px', letterSpacing: '1px' }}>SD ISLAM MODERN AL-FAKHIR</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '20px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 800, border: '1px solid #fee2e2' }}
                        >
                            <AlertCircle size={22} /> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 900, fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1.5px' }}>OFFICIAL USERNAME</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Admin Username"
                                        aria-label="Admin Username"
                                        style={{ width: '100%', padding: '18px 20px 18px 55px', borderRadius: '22px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 700, outline: 'none', transition: '0.3s' }} 
                                        value={loginData.username} 
                                        onChange={e => setLoginData({...loginData, username: e.target.value})} 
                                    />
                            </div>
                        </div>
                        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 900, fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1.5px' }}>SECURITY PASSCODE</label>
                            <div style={{ position: 'relative' }}>
                                <Settings size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    placeholder="••••••••"
                                    aria-label="Security Passcode"
                                    style={{ width: '100%', padding: '18px 55px 18px 55px', borderRadius: '22px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 700, outline: 'none', transition: '0.3s' }} 
                                    value={loginData.password} 
                                    onChange={e => setLoginData({...loginData, password: e.target.value})} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <motion.button 
                            type="submit" 
                            disabled={isLocked}
                            whileHover={{ scale: isLocked ? 1 : 1.02 }}
                            whileTap={{ scale: isLocked ? 1 : 0.98 }}
                            style={{ width: '100%', background: isLocked ? '#94a3b8' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '20px', borderRadius: '24px', border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', letterSpacing: '1px' }}
                        >
                            {isLocked ? '🔒 SYSTEM LOCKED (5 FAILED ATTEMPTS)' : 'VERIFY & ACCESS'}
                        </motion.button>
                    </form>
                    
                    <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <p>© 2026 AL-FAKHIR MODERN INTERFACE v2.1</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex' }}>
            {/* --- Sidebar Redesign: High Fidelity --- */}
            <div style={{ width: '280px', background: '#1a2b4b', color: 'white', position: 'fixed', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', padding: '40px 0', zIndex: 100, boxShadow: '10px 0 50px rgba(0,0,0,0.1)' }}>
                {/* Profile Section at Top (Match Image) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '3rem', padding: '0 30px' }}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ 
                            background: 'white', 
                            width: '85px', 
                            height: '85px', 
                            borderRadius: '30px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            overflow: 'hidden', 
                            border: '4px solid #233863',
                            position: 'relative',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                    >
                        <img src="/logo_new.webp" alt="Admin Profile Avatar" style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                    </motion.div>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>Feriman</h1>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '4px 0 0', color: '#94a3b8', letterSpacing: '0.8px', opacity: 0.8 }}>admin@alfakhir.sch.id</p>
                    </div>
                </div>

                {/* Nav Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                    {[
                        { tab: 'overview', label: 'HOME', icon: LayoutDashboard },
                        { tab: 'registrations', label: 'REGISTRATIONS', icon: BookOpen },
                        { tab: 'students', label: 'SELECTION', icon: Search },
                        { tab: 'active-students', label: 'DATABASE', icon: UserCheck },
                        { tab: 'gallery', label: 'GALLERY', icon: ImageIcon },
                        { tab: 'staff', label: 'STAFF', icon: Users },
                        { tab: 'messages', label: 'MESSAGES', icon: Mail, badge: messages.filter(m => m.status === 'unread').length }
                    ].map((item) => (
                        <motion.button 
                            key={item.tab}
                            whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                            onClick={() => setActiveTab(item.tab)} 
                            style={{ 
                                padding: '18px 40px', border: 'none', 
                                background: activeTab === item.tab ? 'rgba(255,255,255,0.03)' : 'transparent', 
                                color: activeTab === item.tab ? 'white' : '#94a3b8',
                                display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 800, cursor: 'pointer', transition: '0.3s',
                                textAlign: 'left', position: 'relative', fontSize: '0.85rem', letterSpacing: '1px'
                            }}
                        >
                            <item.icon size={20} style={{ opacity: activeTab === item.tab ? 1 : 0.6 }} /> 
                            {item.label}
                            {item.badge > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '10px' }}>{item.badge}</span>}
                            {activeTab === item.tab && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f98c1d' }} />}
                        </motion.button>
                    ))}
                </div>

                <div style={{ padding: '0 30px', marginTop: 'auto' }}>
                    <button 
                        onClick={handleLogout} 
                        style={{ 
                            width: '100%', padding: '15px', borderRadius: '16px', border: 'none', 
                            background: '#233863', color: 'white', fontWeight: 900, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s', fontSize: '0.8rem'
                        }}
                    >
                        <AlertCircle size={18} /> LOGOUT
                    </button>
                </div>
            </div>

            <div style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
                <div style={{ maxWidth: '1450px', margin: '0 auto' }}>
                    
                    {/* Premium Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>
                                    CLOUD INTERFACE ACTIVE
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString('id-ID')}
                                </div>
                            </div>
                              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', margin: 0 }}>
                                {activeTab === 'overview' ? 'Al-Fakhir Management System'
                                    : activeTab === 'students' ? 'Observation & Selection Management' 
                                    : activeTab === 'active-students' ? 'Accepted / Active Students Database'
                                    : activeTab === 'registrations' ? 'Registration Data (Online Forms)'
                                    : activeTab === 'gallery' ? 'Multimedia Content' 
                                    : activeTab === 'staff' ? 'Teaching Team'
                                    : 'Message Center'}
                            </h2>
                            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginTop: '5px' }}>
                                Welcome back, Admin. Manage the Al-Fakhir ecosystem in real-time.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave} 
                                disabled={isSaving} 
                                style={{ 
                                    background: '#0f172a', color: 'white', border: 'none', padding: '16px 32px', 
                                    borderRadius: '24px', fontWeight: 900, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', 
                                    alignItems: 'center', gap: '12px', transition: '0.3s',
                                    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.2)', fontSize: '0.95rem'
                                }}
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} 
                                {isSaving ? 'SYNCING...' : 'SAVE ALL'}
                            </motion.button>
                            
                            {(activeTab === 'students' || activeTab === 'active-students' || activeTab === 'gallery' || activeTab === 'staff') && (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
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
                                        background: 'white', border: '2px solid #f1f5f9', color: '#0f172a', 
                                        padding: '16px 28px', borderRadius: '24px', fontWeight: 900, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <Plus size={22} style={{ color: '#f59e0b' }} /> ADD NEW
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {validationErrors.length > 0 && activeTab !== 'profile' && activeTab !== 'config' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '15px 25px', borderRadius: '24px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px', color: '#92400e' }}
                            >
                                <AlertCircle size={20} />
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                    TERDETEKSI {validationErrors.filter(e => e.tab === activeTab).length} DATA YANG PERLU DIPERBAIKI PADA TAB INI.
                                </div>
                                <button 
                                    onClick={() => setError(validationErrors.filter(e => e.tab === activeTab).map(e => e.msg).join('\n'))}
                                    style={{ marginLeft: 'auto', background: '#f59e0b', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    LIHAT DETAIL
                                </button>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ background: '#059669', color: 'white', padding: '20px 30px', borderRadius: '24px', marginBottom: '3rem', textAlign: 'center', fontWeight: 800, boxShadow: '0 20px 40px rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}><UserCheck size={24} /></div>
                                {success}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fef2f2', color: '#dc2626', padding: '16px 20px', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left', fontWeight: 700, border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                                <AlertCircle size={20} style={{ flexShrink: 0 }} /> 
                                <div style={{ flex: 1, lineHeight: 1.5 }}>{error}</div>
                                <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: '5px' }}>
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>



                    <div style={{ background: 'white', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f1f5f9', minHeight: '600px', position: 'relative' }}>
                        {isLoading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <RefreshCw size={48} color="var(--primary)" />
                                </motion.div>
                                <p style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '2px' }}>FETCHING CLOUD DATA...</p>
                            </div>
                        )}
                        {activeTab === 'overview' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* Top Row: Stat Cards (Match Image) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
                                    {[
                                        { label: 'CANDIDATE REGISTRANTS', count: registrations.length, dark: true, icon: BookOpen, color: '#f98c1d' },
                                        { label: 'ACTIVE STUDENTS', count: students.filter(s => s.status === 'Lolos' || s.status === 'Diterima' || s.status === 'Lolos Seleksi' || s.status === 'Lulus Seleksi' || s.status === 'Passed Selection').length, icon: UserCheck, color: '#f98c1d' },
                                        { label: 'INBOX MESSAGES', count: messages.filter(m => m.status === 'unread').length, icon: Mail, color: '#f98c1d' },
                                        { label: 'ACCREDITATION', count: 'EXCELLENT', icon: () => <span style={{fontSize:'1.2rem'}}>⭐</span>, color: '#f98c1d' }
                                    ].map((stat, i) => (
                                        <motion.div 
                                            key={i}
                                            whileHover={{ y: -5 }}
                                            style={{ 
                                                background: stat.dark ? '#1a2b4b' : 'white', 
                                                padding: '25px', 
                                                borderRadius: '20px', 
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '15px',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: stat.dark ? '#94a3b8' : '#64748b', letterSpacing: '1px' }}>{stat.label}</span>
                                                <div style={{ color: stat.color }}>
                                                    {typeof stat.icon === 'function' ? stat.icon() : <stat.icon size={18} />}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: stat.label === 'AKREDITASI' ? '1.5rem' : '2.2rem', fontWeight: 950, color: stat.dark ? 'white' : '#1a2b4b' }}>
                                                {stat.count}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Middle Row: Results Chart & Capacities */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
                                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1a2b4b' }}>Registration Statistics</h3>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                {availableYears.length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>
                                                        <div style={{ width: '10px', height: '10px', background: '#f98c1d', borderRadius: '3px' }} /> {availableYears[0]}
                                                    </div>
                                                )}
                                                {availableYears.length > 1 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>
                                                        <div style={{ width: '10px', height: '10px', background: '#1a2b4b', borderRadius: '3px' }} /> {availableYears[1]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Simple Visual Bar Chart */}
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '0 10px', gap: '10px' }}>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => (
                                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ display: 'flex', gap: '4px', height: '180px', alignItems: 'flex-end' }}>
                                                        <motion.div initial={{ height: 0 }} animate={{ height: `${20 + (i * 10) % 60}%` }} style={{ width: '8px', background: '#f98c1d', borderRadius: '4px 4px 0 0' }} />
                                                        <motion.div initial={{ height: 0 }} animate={{ height: `${30 + (i * 8) % 50}%` }} style={{ width: '8px', background: '#1a2b4b', borderRadius: '4px 4px 0 0' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>{month}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Capacities Right Sidebar Card */}
                                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                        <h3 style={{ margin: '0 0 30px 0', fontSize: '1rem', fontWeight: 900, color: '#1a2b4b', width: '100%', textAlign: 'left' }}>Building Capacity</h3>
                                        {/* Radial Progress Placeholder */}
                                        <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '25px' }}>
                                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0f2f5" strokeWidth="3" />
                                                <motion.path 
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 0.45 }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                                    fill="none" stroke="#1a2b4b" strokeWidth="3" strokeDasharray="100, 100"
                                                />
                                            </svg>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1a2b4b' }}>45%</span>
                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>OCCUPIED</span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', borderTop: '1px solid #f0f2f5', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Quota: 320 Students</div>
                                            <motion.button whileHover={{ scale: 1.05 }} style={{ background: '#f98c1d', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem' }}>MANAGE CAPACITY</motion.button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row: Growth Wave & Calendar */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
                                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900, color: '#1a2b4b' }}>New Student Growth</h3>
                                        <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                                            {/* Visual Wave Filler */}
                                            <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
                                                <motion.path 
                                                    initial={{ d: "M0,150 L0,100 Q125,120 250,100 T500,100 L500,150 Z" }}
                                                    animate={{ d: "M0,150 L0,120 Q125,60 250,100 T500,80 L500,150 Z" }}
                                                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                                                    fill="rgba(249, 140, 29, 0.1)" stroke="#f98c1d" strokeWidth="2" 
                                                />
                                                <motion.path 
                                                    initial={{ d: "M0,150 L0,130 Q125,100 250,130 T500,110 L500,150 Z" }}
                                                    animate={{ d: "M0,150 L0,100 Q125,130 250,80 T500,50 L500,150 Z" }}
                                                    transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
                                                    fill="rgba(26, 43, 75, 0.05)" stroke="#1a2b4b" strokeWidth="2" 
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
                                            {['S','M','T','W','T','F','S'].map(d => <span key={d} style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8' }}>{d}</span>)}
                                            {Array.from({length: 31}).map((_, i) => (
                                                <div key={i} style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 800, 
                                                    padding: '8px', 
                                                    borderRadius: '8px', 
                                                    background: (i+1) === 15 ? '#1a2b4b' : (i+1) === 22 ? '#f98c1d' : 'transparent',
                                                    color: (i+1) === 15 || (i+1) === 22 ? 'white' : '#64748b'
                                                }}>{i+1}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'students' ? (
                            <>
                                    {/* Compact Configuration Row */}
                                    <div style={{ background: '#f8fafc', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ padding: '6px 12px', background: '#0f172a', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 1000, letterSpacing: '1px' }}>FORM CONTROL:</div>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <motion.button 
                                                    onClick={() => setShowConfig(!showConfig)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
                                                >
                                                    <Settings size={16} color="#f59e0b" /> Form Settings
                                                </motion.button>

                                                <AnimatePresence>
                                                    {showConfig && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            style={{ position: 'absolute', top: 'calc(100% + 15px)', left: 0, width: '300px', background: 'white', borderRadius: '28px', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', padding: '25px', zIndex: 1000 }}
                                                        >
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                                {/* Compact Year Manage */}
                                                                <div>
                                                                    <h5 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', fontWeight: 1000, color: '#94a3b8' }}>ACADEMIC YEAR SETTINGS</h5>
                                                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                                                        <input placeholder="20xx..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }} value={newYearInput} onChange={e => setNewYearInput(e.target.value)} />
                                                                        <button onClick={handleAddYear} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Plus size={16} /></button>
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                                                        {availableYears.map(y => {
                                                                            const config = yearConfigs.find(c => c.year === y) || { videoUrl: '' };
                                                                            return (
                                                                                <div key={y} style={{ background: '#f8fafc', borderRadius: '15px', padding: '15px', border: '1px solid #e2e8f0' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                                                        <span style={{ fontWeight: 900, color: '#0f172a' }}>{y}</span>
                                                                                        <X size={14} style={{ cursor: 'pointer', color: '#f87171' }} onClick={() => handleDeleteYear(y)} />
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                                        <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>YOUTUBE DOCUMENTATION LINK</label>
                                                                                        <input 
                                                                                            placeholder="https://youtube.com/watch?v=..." 
                                                                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}
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

                                <div style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', background: 'white', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '14px', gap: '8px', border: '1px solid #e2e8f0' }}>
                                            {(() => {
                                                // Synchronized with managed settings
                                                const uYears = availableYears;
                                                const uWaves = availableWaves;
                                                return (
                                                    <>

                                                        <datalist id="datalist-years">{uYears.map(y => <option key={y} value={y} />)}</datalist>
                                                        <datalist id="datalist-waves">{uWaves.map(w => <option key={w} value={w} />)}</datalist>
                                                         <select 
                                                            value={filterYear}
                                                            onChange={(e) => setFilterYear(e.target.value)}
                                                            style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 700, outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#0f172a' }}
                                                        >
                                                            <option value="Semua">All Years</option>
                                                            {uYears.map(y => <option key={`f-${y}`} value={y}>{y}</option>)}
                                                        </select>
                                                        <select 
                                                            value={filterWave}
                                                            onChange={(e) => setFilterWave(e.target.value)}
                                                            style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 700, outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#0f172a' }}
                                                        >
                                                            <option value="Semua">All Waves</option>
                                                            <option value="1">Gelombang 1</option>
                                                            <option value="2">Gelombang 2</option>
                                                            <option value="3">Gelombang 3</option>
                                                        </select>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <button onClick={handleDownloadTemplate} style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '10px 18px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><Download size={16} /> TEMPLATE</button>
                                        <button onClick={() => fileInputRef.current.click()} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '10px 18px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}><Upload size={16} /> IMPORT</button>

                                    </div>
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Search Name / Reg No..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '12px 20px 12px 45px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600, outline: 'none', transition: '0.3s' }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: '0 30px 40px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed', border: '1px solid #e2e8f0' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                                <th style={{ padding: '15px 10px', width: '45px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>NO</th>
                                                <th style={{ padding: '15px 10px', width: '140px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>ID / NO REG</th>
                                                <th style={{ padding: '15px 10px', width: '220px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>STUDENT NAME</th>
                                                <th style={{ padding: '15px 10px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>PREVIOUS SCHOOL</th>
                                                <th style={{ padding: '15px 10px', width: '100px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>YEAR</th>
                                                <th style={{ padding: '15px 10px', width: '60px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>WAVE</th>
                                                <th style={{ padding: '15px 10px', width: '150px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>STATUS</th>
                                                <th style={{ padding: '15px 10px', width: '180px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>PDF LINK (DRIVE)</th>
                                                <th style={{ padding: '15px 10px', width: '70px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.filter(s => {
                                                const matchYear = filterYear === 'Semua' || (s.year || '2026/2027') === filterYear;
                                                const matchWave = filterWave === 'Semua' || String(s.wave) === filterWave;
                                                const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
                                                return matchYear && matchWave && matchSearch;
                                            })
                                            .map((s, idx) => {
                                                const originalIndex = students.indexOf(s);
                                                return (
                                                    <motion.tr 
                                                        key={s._id || `temp-${originalIndex}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        whileHover={{ background: '#f8fafc' }}
                                                        style={{ background: 'white', borderBottom: '1px solid #e2e8f0', transition: '0.2s' }}
                                                    >
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#94a3b8' }}>{idx + 1}</div>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                            <input 
                                                                style={{ 
                                                                    padding: '6px 12px', 
                                                                    background: '#f0f9ff', 
                                                                    color: '#0369a1', 
                                                                    borderRadius: '10px', 
                                                                    fontSize: '0.75rem', 
                                                                    fontWeight: 900, 
                                                                    border: '1px solid transparent',
                                                                    width: '100%',
                                                                    textAlign: 'center', 
                                                                    outline: 'none',
                                                                    transition: '0.3s'
                                                                }} 
                                                                onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                                                                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                                                                value={s.id || ''} 
                                                                onChange={e => handleStudentChange(originalIndex, 'id', e.target.value)} 
                                                            />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #e2e8f0' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 900, fontSize: '0.85rem', color: '#0f172a', width: '100%', outline: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} value={s.name} onChange={e => handleStudentChange(originalIndex, 'name', e.target.value)} />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #e2e8f0' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#64748b', width: '100%', outline: 'none' }} value={s.school || s.schoolName || ''} onChange={e => handleStudentChange(originalIndex, 'school', e.target.value)} />
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                            <select value={s.year} onChange={e => handleStudentChange(originalIndex, 'year', e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', outline: 'none', textAlign: 'center' }}>
                                                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                            <select value={s.wave} onChange={e => handleStudentChange(originalIndex, 'wave', e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', outline: 'none', textAlign: 'center' }}>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '14px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                            <select 
                                                                value={s.status || 'Not Yet Passed'} 
                                                                onChange={e => handleStudentChange(originalIndex, 'status', e.target.value)}
                                                                style={{ background: 'transparent', border: 'none', fontWeight: 950, fontSize: '0.75rem', color: s.status === 'Lolos' || s.status === 'Diterima' || s.status === 'Lolos Seleksi' || s.status === 'Lulus Seleksi' || s.status === 'Passed Selection' ? '#059669' : '#f59e0b', cursor: 'pointer', outline: 'none', textAlign: 'center' }}
                                                            >
                                                                <option value="Passed Selection">Passed Selection</option>
                                                                <option value="Not Yet Passed">Not Yet Passed</option>
                                                            </select>
                                                        </td>

                                                        <td style={{ padding: '14px 10px', borderRight: '1px solid #e2e8f0' }}>
                                                            <input style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#3b82f6', width: '100%', outline: 'none', textDecoration: s.pdfLink ? 'underline' : 'none' }} placeholder="https://drive.google.com/..." value={s.pdfLink || ''} onChange={e => handleStudentChange(originalIndex, 'pdfLink', e.target.value)} />
                                                        </td>

                                                        <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                                            <button 
                                                                onClick={() => handleDeleteStudent(originalIndex)} 
                                                                style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', transition: '0.2s' }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
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
                                <div style={{ padding: '30px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', background: 'white', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '14px', gap: '8px', border: '1px solid #e2e8f0' }}>
                                        <select 
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                            style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'white', fontSize: '0.85rem', fontWeight: 700, outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#0f172a' }}
                                        >
                                            <option value="Semua">All Years</option>
                                            {availableYears.map(y => <option key={`af-${y}`} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.4rem', color: '#09090b', letterSpacing: '-0.5px' }}>Database of Accepted Students</h3>
                                    <div style={{ position: 'relative', width: '320px' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Search Active Students..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600 }}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: '40px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                                        {students.filter(s => {
                                            const matchYear = filterYear === 'Semua' || (s.year || '2026/2027') === filterYear;
                                            const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.id || '').toLowerCase().includes(searchQuery.toLowerCase());
                                            const isActive = s.status === 'Lolos' || s.status === 'Diterima' || s.status === 'Lolos Seleksi' || s.status === 'Lulus Seleksi' || s.status === 'Passed Selection';
                                            return matchYear && matchSearch && isActive;
                                        }).map((s, idx) => (
                                            <motion.div 
                                                key={s._id || idx}
                                                whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
                                                style={{ 
                                                    background: 'white', 
                                                    padding: '35px', 
                                                    borderRadius: '40px', 
                                                    border: '1px solid #f1f5f9', 
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.04)', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '25px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Decorative Background Accent */}
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'linear-gradient(135deg, transparent 50%, #f98c1d05 100%)', zIndex: 0 }} />
                                                <div style={{ position: 'absolute', top: '20px', left: '25px', width: '38px', height: '38px', background: '#0f172a', color: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 1000, zIndex: 1, boxShadow: '0 10px 20px rgba(15,23,42,0.2)' }}>{idx + 1}</div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2, marginLeft: '50px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <input 
                                                            style={{ 
                                                                padding: '6px 16px', 
                                                                background: '#f0f9ff', 
                                                                color: '#0369a1', 
                                                                borderRadius: '12px', 
                                                                fontSize: '0.75rem', 
                                                                fontWeight: 950, 
                                                                letterSpacing: '0.5px', 
                                                                boxShadow: '0 4px 12px rgba(3,105,161,0.08)',
                                                                border: '1px solid transparent',
                                                                width: '180px',
                                                                textAlign: 'center',
                                                                outline: 'none',
                                                                transition: '0.3s'
                                                            }} 
                                                            onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                                                            onBlur={(e) => e.target.style.border = '1px solid transparent'}
                                                            value={s.id || ''} 
                                                            onChange={e => handleStudentChange(students.indexOf(s), 'id', e.target.value)} 
                                                        />
                                                    </div>
                                                    <div style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                                        background: '#ecfdf5', color: '#059669', padding: '10px 22px', 
                                                        borderRadius: '99px', fontSize: '0.7rem', fontWeight: 1000,
                                                        boxShadow: '0 4px 15px rgba(5,150,105,0.12)',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                                        {s.status?.toUpperCase() || 'ACCEPTED'}
                                                    </div>
                                                </div>

                                                <div style={{ position: 'relative', zIndex: 2 }}>
                                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 950, color: '#09090b', letterSpacing: '-0.8px', lineHeight: 1.2 }}>{s.name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
                                                        <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Users size={16} color="#cbd5e1" />
                                                        </div>
                                                        {s.school || s.schoolName || 'Previous School Not Set'}
                                                    </div>
                                                </div>

                                                <div style={{ background: '#f8fafc', padding: '20px 25px', borderRadius: '28px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>ACADEMIC YEAR</span>
                                                        <span style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0f172a' }}>{s.year}</span>
                                                    </div>
                                                    <motion.div 
                                                        whileHover={{ scale: 1.1, x: 5 }}
                                                        style={{ width: '48px', height: '48px', borderRadius: '18px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}
                                                    >
                                                        <ChevronRight size={22} />
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'registrations' ? (
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '30px' }}>
                                    {students.filter(s => s.registrationDate).map((reg, idx) => (
                                        <motion.div 
                                            key={reg._id || idx}
                                            whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.05)' }}
                                            style={{ background: 'white', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflow: 'hidden' }}
                                        >
                                            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', background: '#f98c1d', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 950, zIndex: 10, boxShadow: '0 10px 20px rgba(249,140,29,0.3)' }}>{idx + 1}</div>
                                            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'linear-gradient(135deg, transparent 50%, #f98c1d08 100%)', zIndex: 0 }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                                <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', boxShadow: '0 8px 20px rgba(249,115,22,0.1)', marginLeft: '35px' }}>
                                                    <BookOpen size={30} />
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Registered On</span>
                                                    <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 900 }}>{reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : '-'}</span>
                                                </div>
                                            </div>

                                            <div style={{ position: 'relative', zIndex: 1 }}>
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.6rem', fontWeight: 950, color: '#09090b', letterSpacing: '-1px', lineHeight: 1.2 }}>{reg.name}</h4>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <span style={{ padding: '6px 14px', background: '#f4f4f5', color: '#71717a', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{reg.gender === 'L' ? 'Male' : 'Female'}</span>
                                                    <span style={{ padding: '6px 14px', background: '#fefce8', color: '#854d0e', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900 }}>YEAR {reg.year || '-'}</span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '25px', borderRadius: '32px', border: '1px solid #e2e8f0', position: 'relative', zIndex: 1 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Parent Name</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>{reg.parentName || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>WA Contact</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Phone size={16} /> {reg.whatsapp}
                                                    </div>
                                                </div>
                                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '5px' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Previous School</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{reg.school || reg.schoolName || '-'}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px', position: 'relative', zIndex: 1 }}>
                                                {reg.paymentProof ? (
                                                    <motion.button 
                                                        whileHover={{ scale: 1.02 }}
                                                        onClick={() => window.open(reg.paymentProof, '_blank')} 
                                                        style={{ flex: 1, padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(15,23,42,0.15)' }}
                                                    >
                                                        <Eye size={20} /> VIEW PAYMENT PROOF
                                                    </motion.button>
                                                ) : (
                                                    <div style={{ flex: 1, padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '18px', fontSize: '0.85rem', fontWeight: 900, textAlign: 'center', border: '1px solid #fee2e2' }}>PAYMENT PROOF MISSING</div>
                                                )}
                                                <motion.button 
                                                    whileHover={{ scale: 1.05, background: '#fef2f2' }}
                                                    onClick={async () => { if(window.confirm('Delete this registration record?')) { await mutationClient.delete(reg._id); fetchAllData(); } }} 
                                                    style={{ padding: '16px', background: 'white', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '18px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={22} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {students.filter(s => s.registrationDate).length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '6rem', color: '#cbd5e1', fontWeight: 800, gridColumn: 'span 2' }}>
                                            <BookOpen size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                            <p>No online registrations received yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'gallery' ? (
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                    {gallery.map((item, index) => (
                                        <motion.div key={index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '1.5rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
                                            <div style={{ aspectRatio: '16 / 10', background: '#f8fafc', borderRadius: '22px', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative', border: item.imageUrl ? '1px solid #f1f5f9' : '2px dashed #f87171' }}>
                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.title || "Gallery Item"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f87171', gap: '10px' }}><ImageIcon size={48} /><span style={{ fontSize: '0.7rem', fontWeight: 800 }}>IMAGE MISSING</span></div>}
                                                <label style={{ position: 'absolute', bottom: '15px', right: '15px', background: item.imageUrl ? '#0f172a' : '#f87171', color: 'white', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                                                    {item.imageUrl ? 'CHANGE IMAGE' : 'UPLOAD NOW'}
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleImageUpload(index, e.target.files[0])} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <div style={{ flex: 2 }}>
                                                        <label htmlFor={`gallery-title-${index}`} style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', marginBottom: '5px' }}>CONTENT TITLE</label>
                                                        <input id={`gallery-title-${index}`} placeholder="Event Title" style={{ width: '100%', padding: '12px 15px', border: item.title ? '1px solid #e2e8f0' : '1px solid #f87171', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem' }} value={item.title} onChange={e => handleGalleryChange(index, 'title', e.target.value)} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label htmlFor={`gallery-cat-${index}`} style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', marginBottom: '5px' }}>TYPE</label>
                                                        <select id={`gallery-cat-${index}`} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'white', fontWeight: 700, fontSize: '0.8rem' }} value={item.category || 'acara'} onChange={e => handleGalleryChange(index, 'category', e.target.value)}>
                                                            <option value="acara">Event</option>
                                                            <option value="berita">News</option>
                                                            <option value="penghargaan">Award</option>
                                                            <option value="lain-lain">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input placeholder="Date (e.g. 12 Mar 2026)" aria-label="Event Date" style={{ flex: 1, padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '14px', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }} value={item.date} onChange={e => handleGalleryChange(index, 'date', e.target.value)} />
                                                    <input type="date" aria-label="Pick Date" style={{ width: '45px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'white', cursor: 'pointer' }} onChange={e => {
                                                        const d = new Date(e.target.value);
                                                        const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                                        handleGalleryChange(index, 'date', formatted);
                                                    }} />
                                                </div>
                                                <textarea placeholder="Full agenda description..." style={{ width: '100%', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '14px', height: '100px', resize: 'none', fontSize: '0.85rem', color: '#445164' }} value={item.agenda} onChange={e => handleGalleryChange(index, 'agenda', e.target.value)} />
                                                <button onClick={() => handleDeleteGallery(index)} style={{ width: '100%', padding: '12px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fef2f2', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s' }}><Trash2 size={18} /> DELETE CONTENT</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'staff' ? (
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                    {staff.map((member, index) => (
                                        <motion.div key={index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '1.5rem', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
                                            <div style={{ aspectRatio: '1/1', background: '#f8fafc', borderRadius: '22px', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative', border: member.imageUrl ? '1px solid #f1f5f9' : '2px dashed #f87171' }}>
                                                {member.imageUrl ? (
                                                    <img 
                                                        src={member.imageUrl} 
                                                        alt={member.name || "Staff Photo"} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null; // Prevent infinite loop
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement.innerHTML = '<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f87171; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span style="font-size: 0.6rem; font-weight: 800;">BROKEN IMAGE</span></div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f87171', gap: '8px' }}>
                                                        <Users size={48} />
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>NO PHOTO</span>
                                                    </div>
                                                )}
                                                <label style={{ position: 'absolute', bottom: '15px', right: '15px', background: member.imageUrl ? '#0f172a' : '#f87171', color: 'white', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {member.imageUrl ? 'REPLACE' : 'ADD PHOTO'}
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleStaffImageUpload(index, e.target.files[0])} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <input placeholder="Full Name & Titles" aria-label="Staff Full Name" style={{ width: '100%', padding: '12px 15px', border: member.name ? '1px solid #e2e8f0' : '1px solid #f87171', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem' }} value={member.name} onChange={e => handleStaffChange(index, 'name', e.target.value)} />
                                                <input placeholder="Role / Position" aria-label="Staff Role" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', color: '#1a2b4b' }} value={member.role} onChange={e => handleStaffChange(index, 'role', e.target.value)} />
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '18px', border: '1px solid #f1f5f9' }}>
                                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8' }}>PROFESSIONAL DETAILS</label>
                                                    <input placeholder="Short Vision (One sentence)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }} value={member.vision || ''} onChange={e => handleStaffChange(index, 'vision', e.target.value)} />
                                                    <input placeholder="Latest Education (e.g. S1 IT)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }} value={member.education || ''} onChange={e => handleStaffChange(index, 'education', e.target.value)} />
                                                    <input placeholder="Official Email" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }} value={member.email || ''} onChange={e => handleStaffChange(index, 'email', e.target.value)} />
                                                </div>

                                                <button onClick={() => handleDeleteStaff(index)} style={{ width: '100%', padding: '12px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fef2f2', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Trash2 size={18} /> DELETE</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'messages' ? (
                            <div style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {messages.map((msg, idx) => (
                                        <motion.div 
                                            key={msg._id || idx} 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{ background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Mail size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>{msg.name}</h4>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{msg.email}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                                                        {msg.receivedAt ? new Date(msg.receivedAt).toLocaleString('en-GB') : '-'}
                                                    </span>
                                                    <button 
                                                        onClick={async () => {
                                                            if (window.confirm('Delete message?')) {
                                                                await mutationClient.delete(msg._id);
                                                                fetchAllData();
                                                            }
                                                        }} 
                                                        style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Subject: {msg.subject || 'No Subject'}</div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                            </div>
                                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    {msg.status === 'unread' && (
                                                        <button 
                                                            onClick={async () => {
                                                                await mutationClient.patch(msg._id).set({ status: 'read' }).commit();
                                                                fetchAllData();
                                                            }}
                                                            style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#f0fdf4', border: '1px solid #dcfce7', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}
                                                        >
                                                            MARK AS READ
                                                        </button>
                                                    )}
                                                </div>
                                                <a href={`mailto:${msg.email}?subject=Reply to: ${msg.subject}`} style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    REPLY VIA EMAIL <ChevronRight size={14} />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {messages.length === 0 && <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8', fontWeight: 700 }}>No messages yet.</div>}
                                </div>
                            </div>
                        ) : null}

                    {!isLoading && (
                        (activeTab === 'students' && students.length === 0) || 
                        (activeTab === 'gallery' && gallery.length === 0) ||
                        (activeTab === 'staff' && staff.length === 0)
                    ) && (
                        <div style={{ padding: '8rem', textAlign: 'center', color: '#cbd5e1' }}>
                            <LayoutDashboard size={80} style={{ opacity: 0.2, margin: '0 auto 1.5rem' }} />
                            <p style={{ fontWeight: 800, color: '#94a3b8' }}>No data available in cloud yet.</p>
                            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Click "Add New" to start.</p>
                        </div>
                    )}

                    </div>
                </div>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImportExcel} />
        </div>
    );
};

export default AdminPage;

