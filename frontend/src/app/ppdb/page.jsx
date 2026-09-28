"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search as SearchIcon, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';

// Import Sub-Components
import PPDBVideoDocumentation from '@/components/PPDB/PPDBVideoDocumentation';
import AcceptedStudents from '@/components/PPDB/AcceptedStudents';

const PPDBPage = () => {
    const { t } = useLanguage();
    const [selectedYear, setSelectedYear] = useState('2026/2027');
    const [selectedWave, setSelectedWave] = useState('1'); 
    const [years, setYears] = useState(['2026/2027']);
    const [yearConfigs, setYearConfigs] = useState([]);
    const [availableWaves, setAvailableWaves] = useState(['1', '2', '3']);
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
                }
            } catch (err) { 
                console.error("Failed to fetch dynamic configs:", err); 
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, [selectedYear]);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
            <Navbar theme="light" />
            
            <div style={{ padding: '140px 0 40px', textAlign: 'center' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}
                    >
                        {t('ppdb_results', 'title')}
                    </motion.h1>
                </div>
            </div>

            <main style={{ paddingBottom: '100px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    
                    <div style={{ background: 'white', borderRadius: '24px', padding: '40px 30px', marginBottom: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'var(--primary)' }} />
                        
                        <div style={{ position: 'relative', zIndex: 1, maxWidth: '850px', margin: '0 auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '65px', height: '65px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', marginBottom: '15px', padding: '10px' }}>
                                    <img src="/logo_new.webp" alt="SD Al-Fakhir" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>{t('ppdb_results', 'letter.title')}</h3>
                                <div style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '4px' }} />
                            </div>

                            <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.8 }}>
                                <p style={{ fontWeight: 600, marginBottom: '8px', color: '#0f172a', fontSize: '1rem' }}>{t('ppdb_results', 'letter.greeting')}</p>
                                <p style={{ marginBottom: '20px', fontWeight: 600 }}>{t('ppdb_results', 'letter.salutation')}</p>

                                <p style={{ marginBottom: '20px', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: t('ppdb_results', 'letter.p1') }} />

                                <div style={{ background: '#f8fafc', padding: '20px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
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
                                        <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px', fontSize: '1rem' }}>{t('ppdb_results', 'letter.noteTitle')}</div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: 1.6 }}>
                                            {t('ppdb_results', 'letter.noteText')}
                                        </p>
                                    </div>
                                </div>

                                <p style={{ marginBottom: '10px' }}>{t('ppdb_results', 'letter.closing')}</p>
                                <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '25px', fontSize: '1rem' }}>{t('ppdb_results', 'letter.salam')}</p>

                                <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                                    <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>{t('ppdb_results', 'letter.signature1')}</p>
                                    <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{t('ppdb_results', 'letter.signature2')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '25px' }}>
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

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ background: 'white', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
                        <button
                            onClick={() => setSelectedWave('doc')}
                            style={{ padding: '10px 18px', borderRadius: '100px', border: 'none', background: selectedWave === 'doc' ? 'var(--primary)' : 'white', color: selectedWave === 'doc' ? 'white' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                        >
                            🎬 {t('ppdb_results', 'videoDoc')}
                        </button>
                        {availableWaves.map(w => (
                            <button
                                key={w}
                                onClick={() => setSelectedWave(w)}
                                style={{ padding: '10px 18px', borderRadius: '100px', border: 'none', background: selectedWave === w ? 'var(--primary)' : 'white', color: selectedWave === w ? 'white' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
                            >
                                📅 {t('ppdb_results', 'waveName')} {w}
                            </button>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #eef2f6' }}>
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

            <Footer />
        </div>
    );
};

export default PPDBPage;
