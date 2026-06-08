import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { ChevronDown, X, Sparkles, UserCheck, Search as SearchIcon, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '../../lib/api'
import LoadingSpinner from '../../components/Loading/LoadingSpinner'
import { useLanguage } from '../../context/LanguageContext'

// Import Sub-Components
import PPDBVideoDocumentation from '../../components/PPDB/PPDBVideoDocumentation'
import AcceptedStudents from '../../components/PPDB/AcceptedStudents'

const PPDBPage = () => {
    const { t } = useLanguage();
    const [selectedYear, setSelectedYear] = useState('2026/2027');
    const [selectedWave, setSelectedWave] = useState('1'); 
    const [showMenu, setShowMenu] = useState(false);
    const [years, setYears] = useState(['2026/2027']);
    const [yearConfigs, setYearConfigs] = useState([]);
    const [availableWaves, setAvailableWaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const [data, configs] = await Promise.all([
                    apiFetch('/api/students/public'),
                    apiFetch('/api/year-configs')
                ]);
                setYearConfigs(configs || []);
                if (data && data.length > 0) {
                    const uYears = Array.from(new Set(data.map(item => item.year).filter(Boolean))).sort((a, b) => b.localeCompare(a));
                    setYears(uYears);
                    if (uYears.length > 0 && !uYears.includes(selectedYear)) {
                        setSelectedYear(uYears[0]);
                    }
                    // Waves 1, 2, 3 are now standard and always available
                    setAvailableWaves(['1', '2', '3']);
                    
                    if (selectedWave !== 'doc' && !['1', '2', '3'].includes(selectedWave)) {
                        setSelectedWave('1');
                    }
                }
            } catch (err) { 
                console.error("Failed to fetch dynamic configs:", err); 
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, [selectedYear, selectedWave]);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative', fontFamily: "'Poppins', sans-serif" }}>
            <Navbar theme="light" />
            
            <div style={{ padding: '140px 0 40px', textAlign: 'center' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}
                    >
                        {t('ppdb_results', 'title')}
                    </motion.h1>
                </div>
            </div>

            <main style={{ paddingBottom: '100px' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    
                    {/* INFO BLOCK: Surat Pengumuman */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '40px 30px', marginBottom: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'var(--primary)' }} />
                        
                        <div style={{ position: 'relative', zIndex: 1, maxWidth: '850px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '65px', height: '65px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', marginBottom: '15px', padding: '10px' }}>
                                    <img src="/logo_new.webp" alt="SD Al-Fakhir" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 950, color: '#0f172a', letterSpacing: '0.5px' }}>{t('ppdb_results', 'letter.title')}</h3>
                                <div style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '4px' }} />
                            </div>

                            <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.8 }}>
                                <p style={{ fontWeight: 800, marginBottom: '8px', color: '#0f172a', fontSize: '1rem' }}>{t('ppdb_results', 'letter.greeting')}</p>
                                <p style={{ marginBottom: '20px', fontWeight: 600 }}>{t('ppdb_results', 'letter.salutation')}</p>

                                <p style={{ marginBottom: '20px', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: t('ppdb_results', 'letter.p1') }} />

                                <div style={{ background: '#f8fafc', padding: '20px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
                                        <FileText size={18} color="var(--primary)" strokeWidth={2.5} />
                                        {t('ppdb_results', 'letter.howToTitle')}
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#475569' }}>
                                        <li dangerouslySetInnerHTML={{ __html: t('ppdb_results', 'letter.howTo1') }} />
                                        <li dangerouslySetInnerHTML={{ __html: t('ppdb_results', 'letter.howTo2') }} />
                                        <li dangerouslySetInnerHTML={{ __html: t('ppdb_results', 'letter.howTo3') }} />
                                    </ul>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', padding: '20px 25px', background: '#fffbeb', borderRadius: '16px', border: '1px solid #fef08a', marginBottom: '30px' }}>
                                    <AlertCircle size={24} color="#d97706" style={{ flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 900, color: '#92400e', marginBottom: '4px', fontSize: '1rem' }}>{t('ppdb_results', 'letter.noteTitle')}</div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: 1.6 }}>
                                            {t('ppdb_results', 'letter.noteText')}
                                        </p>
                                    </div>
                                </div>

                                <p style={{ marginBottom: '10px' }}>{t('ppdb_results', 'letter.closing')}</p>
                                <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '25px', fontSize: '1rem' }}>{t('ppdb_results', 'letter.salam')}</p>

                                <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                                    <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>{t('ppdb_results', 'letter.signature1')}</p>
                                    <p style={{ margin: 0, fontWeight: 950, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{t('ppdb_results', 'letter.signature2')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar - Clean & Functional */}
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '15px', 
                        alignItems: 'center', 
                        marginBottom: '25px' 
                    }}>
                        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                            <SearchIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder={t('ppdb_results', 'searchPlaceholder')} 
                                style={{ 
                                    width: '100%',
                                    padding: '14px 14px 14px 45px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    fontWeight: 500,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setShowMenu(true)}
                                style={{ 
                                    background: 'white', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <ChevronDown size={18} /> {selectedYear}
                            </button>
                            <Link to="/pendaftaran" style={{ textDecoration: 'none' }}>
                                <button style={{ 
                                    background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(249, 140, 29, 0.2)'
                                }}>
                                    <UserCheck size={18} /> {t('ppdb_results', 'onlineBtn')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div style={{ 
                        background: 'white', 
                        borderRadius: '20px', 
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                        border: '1px solid #eef2f6'
                    }}>
                        {selectedWave === 'doc' ? (
                            <PPDBVideoDocumentation 
                                selectedYear={selectedYear} 
                                videoUrl={yearConfigs.find(c => c.year === selectedYear)?.videoUrl} 
                            />
                        ) : (
                            <AcceptedStudents selectedYear={selectedYear} selectedWave={selectedWave} hideSearch={true} externalSearchQuery={searchId} />
                        )}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showMenu && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', padding: '30px', borderRadius: '24px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontWeight: 800 }}>{t('ppdb_results', 'modalTitle')}</h3>
                                <button onClick={() => setShowMenu(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={18}/></button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>{t('ppdb_results', 'yearLabel')}</label>
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>{t('ppdb_results', 'waveLabel')}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                        <button onClick={() => { setSelectedWave('doc'); setShowMenu(false); }} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: selectedWave === 'doc' ? 'var(--primary)' : '#f8fafc', color: selectedWave === 'doc' ? 'white' : '#475569', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>🎬 {t('ppdb_results', 'videoDoc')}</button>
                                        {availableWaves.map(w => (
                                            <button key={w} onClick={() => { setSelectedWave(w); setShowMenu(false); }} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: selectedWave === w ? 'var(--primary)' : '#f8fafc', color: selectedWave === w ? 'white' : '#475569', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>📅 {t('ppdb_results', 'waveName')} {w}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    )
}

export default PPDBPage;
