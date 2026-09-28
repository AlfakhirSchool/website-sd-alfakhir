"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';
import AmbientBlobs from '@/components/AmbientBlobs';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Network, Sparkles, Star } from 'lucide-react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';

const StrukturPage = () => {
    const { t } = useLanguage();
    const [structureImg, setStructureImg] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                const settings = await apiFetch('/api/settings');
                setStructureImg(settings?.structureUrl || '');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStructure();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <AmbientBlobs />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '600px', backgroundImage: 'radial-gradient(#f1f5f9 1.2px, transparent 1.2px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }}></div>

            <div style={{ position: 'absolute', top: '100px', left: '12%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                    <Network size={80} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '250px', right: '10%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles size={70} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '140px', right: '28%', opacity: 0.02, pointerEvents: 'none' }}>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}>
                    <Star size={45} />
                </motion.div>
            </div>

            <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', opacity: 0.02, zIndex: 0, pointerEvents: 'none' }}>
                <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Watermark" style={{ width: '450px', height: 'auto', filter: 'grayscale(1)' }} />
            </div>

            <div style={{ background: 'transparent', padding: '160px 0 60px', color: '#0f172a', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div
                        style={{ display: 'inline-block', padding: '8px 25px', background: 'rgba(249, 140, 29, 0.08)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1.5rem' }}
                    >
                        {t('struktur', 'badge')}
                    </div>
                    
                    <h1 
                        style={{ fontSize: '3rem', fontWeight: 950, margin: 0, letterSpacing: '-2px', color: '#0f172a', lineHeight: 1 }}
                    >
                        {t('struktur', 'title')}
                    </h1>

                    <div style={{ width: '50px', height: '4px', background: 'var(--primary)', margin: '30px auto', borderRadius: '10px' }}></div>
                </div>
            </div>

            <main style={{ padding: '40px 0 150px', position: 'relative', zIndex: 1, color: '#0f172a' }}>
                <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 25px' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto 150px' }}>
                        <div className="grid-stack">
                            <div style={{ position: 'relative' }}>
                                <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', top: '-30px', left: '-30px', width: '120px', height: '120px', background: 'rgba(249, 140, 29, 0.05)', borderRadius: '30px', zIndex: 0 }}></motion.div>
                                <div style={{ 
                                    width: '100%', maxWidth: '400px', aspectRatio: '0.9', borderRadius: '60px', overflow: 'hidden', 
                                    boxShadow: '0 50px 120px rgba(15, 23, 42, 0.1)', border: '1px solid rgba(255,255,255,0.8)', background: 'white', position: 'relative', zIndex: 1
                                }}>
                                    <img src="/anggraini.webp" alt="Deputy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                                </div>
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className="mobile-badge"
                                    style={{ position: 'absolute', bottom: '-20px', left: '20px', background: 'white', padding: '20px 35px', borderRadius: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #f8fafc', zIndex: 2 }}
                                >
                                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{t('history', 'deputyName')}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                        <div style={{ width: '12px', height: '2px', background: 'var(--primary)' }}></div>
                                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('history', 'deputyTitle1')} {t('history', 'deputyTitle2')}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="text-center-mobile">
                                <div className="mobile-hide" style={{ width: '50px', height: '5px', background: 'var(--primary)', marginBottom: '30px', borderRadius: '10px' }}></div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '2rem', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-2px' }}>
                                    {t('struktur', 'excellenceTitle')} <br/><span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{t('struktur', 'managementSub')}</span>
                                </h2>
                                <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8, fontWeight: 500, opacity: 0.9 }}>
                                    {t('history', 'deputyBio')}
                                </p>
                                <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                    <div style={{ padding: '12px 25px', background: '#f8fafc', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 800, color: '#64748b', border: '1px solid #f1f5f9' }}>{t('struktur', 'opLabel')}</div>
                                    <div style={{ padding: '12px 25px', background: '#f8fafc', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 800, color: '#64748b', border: '1px solid #f1f5f9' }}>{t('struktur', 'hrLabel')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(15, 23, 42, 0.04)', borderRadius: '100px', color: '#64748b', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '3px' }}>
                             {t('struktur', 'governanceBadge')}
                        </div>
                        <h3 style={{ fontSize: '2.4rem', fontWeight: 950, color: '#0f172a', marginBottom: '0', letterSpacing: '-1.5px' }}>
                            {t('struktur', 'mapTitle')}
                        </h3>
                    </div>

                    <div className="card-compact">
                        {structureImg ? (
                            <div style={{ borderRadius: '35px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
                                <img 
                                    src={structureImg} 
                                    alt="Organizational Structure" 
                                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                                />
                            </div>
                        ) : (
                            <div style={{ padding: '120px 0' }}>
                                <Network size={80} color="#cbd5e1" style={{ marginBottom: '30px', opacity: 0.5 }} />
                                <p style={{ color: '#94a3b8', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '1px' }}>{t('struktur', 'updating').toUpperCase()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .grid-stack {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 80px;
                    align-items: center;
                }
                .card-compact {
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(30px);
                    border-radius: 60px;
                    padding: 60px;
                    border: 1px solid rgba(255,255,255,0.8);
                    box-shadow: 0 60px 150px rgba(15, 23, 42, 0.05);
                    text-align: center;
                }
                @media (max-width: 768px) {
                    .grid-stack { grid-template-columns: 1fr; gap: 50px; }
                    .mobile-badge { left: 50% !important; transform: translateX(-50%) !important; width: 90%; }
                    .mobile-hide { display: none !important; }
                    .card-compact { padding: 20px; border-radius: 30px; }
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default StrukturPage;
