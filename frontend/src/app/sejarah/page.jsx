"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AmbientBlobs from '@/components/AmbientBlobs';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, GraduationCap, Star, Quote } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';

const HistoryPage = () => {
    const { t, langCode } = useLanguage();
    const [historyData, setHistoryData] = useState({ content: '', imageUrl: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await apiFetch('/api/profile/history');
                setHistoryData(data || { content: '', imageUrl: '' });
            } catch (err) {
                console.error("History fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <LoadingSpinner />;

    const fallbackContent = {
        GB: "By means of the Yayasan Prestasi Belia Indonesia, the Modern Islamic Primary School SD Islam Modern Al Fakhir was founded, owned and managed by Mr. Deni Irawan, M.Pd (Teacher of Mathematics, Chemistry and student mentor in scientific research).\n\nMr. Deni Irawan also established an institution that have been conducting national and international scientific research competition/olympiad since 2018 which is named Indonesian Young Scientist Association (IYSA).",
        ID: "Melalui Yayasan Prestasi Belia Indonesia, Sekolah Dasar Islam Modern Al Fakhir didirikan, dimiliki, dan dikelola langsung oleh Bapak Deni Irawan, M.Pd (Guru Matematika, Kimia, dan mentor siswa dalam penelitian ilmiah).\n\nBapak Deni Irawan juga mendirikan institusi penyelenggara kompetisi/olimpiade penelitian ilmiah tingkat nasional dan internasional sejak tahun 2018 yang beroperasi dengan nama Indonesian Young Scientist Association (IYSA)."
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <AmbientBlobs />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '650px', backgroundImage: 'radial-gradient(#f1f5f9 1.2px, transparent 1.2px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }}></div>

            <div style={{ position: 'absolute', top: '100px', left: '10%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                    <BookOpen size={80} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '250px', right: '12%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ scale: [1, 1.1, 1], y: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles size={60} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '140px', right: '25%', opacity: 0.02, pointerEvents: 'none' }}>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}>
                    <Star size={40} />
                </motion.div>
            </div>

            <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', opacity: 0.02, zIndex: 0, pointerEvents: 'none' }}>
                <SmartImage src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Watermark" style={{ width: '450px', height: 'auto', filter: 'grayscale(1)' }} />
            </div>

            <div style={{ background: 'transparent', padding: '140px 0 40px', color: '#0f172a', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div
                        style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(249, 140, 29, 0.08)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', opacity: 1 }}
                    >
                        {t('history', 'badge')}
                    </div>
                    
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <h1 
                            style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '4px', color: '#0f172a', position: 'relative', zIndex: 2, opacity: 1 }}
                        >
                            {t('history', 'title')}
                        </h1>
                        <div 
                            style={{ position: 'absolute', bottom: '8px', left: 0, width: '100%', height: '12px', background: 'rgba(249, 140, 29, 0.06)', zIndex: 1, borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ width: '40px', height: '3.5px', background: 'var(--primary)', margin: '22px auto', borderRadius: '10px' }}></div>
                </div>
            </div>

            <main style={{ background: 'transparent', position: 'relative', zIndex: 1 }}>
                <section style={{ padding: '60px 0 100px' }}>
                    <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 25px' }}>
                        <div className="history-grid">
                            <div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(circle, rgba(249, 140, 29, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0, opacity: 0.4 }}></div>
                                    <div className="img-compact" style={{ 
                                        width: '100%', maxWidth: '380px', aspectRatio: '0.9', borderRadius: '45px', overflow: 'hidden', 
                                        boxShadow: '0 40px 100px rgba(15, 23, 42, 0.08)', border: '1px solid rgba(255,255,255,0.8)', position: 'relative', zIndex: 2, background: 'white'
                                    }}>
                                        <SmartImage 
                                            src={historyData.imageUrl || "/deni_highres.webp"} 
                                            lqip={historyData.lqip}
                                            alt="Founder" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <div className="floated-name">
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, letterSpacing: '-0.3px' }}>Deni Irawan, M.Pd.</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                            <div style={{ width: '15px', height: '1.5px', background: 'rgba(255,255,255,0.6)' }}></div>
                                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t('history', 'founderBadge')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mobile-hide" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', background: 'rgba(15, 23, 42, 0.04)', borderRadius: '100px', color: '#0f172a', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                                    <Sparkles size={14} color="#f98c1d" /> {t('history', 'founderBadge')}
                                </div>
                                <h2 className="mobile-title" style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '1.5rem', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                                    {t('history', 'visionaryPart1')} <br/><span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{t('history', 'visionaryPart2')}</span>
                                </h2>
                                <div style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, marginBottom: '2.5rem', fontWeight: 500, opacity: 0.9 }}>
                                    {historyData.content || fallbackContent[langCode] || fallbackContent.ID}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px 35px', background: 'white', borderRadius: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', maxWidth: '550px' }}>
                                    <div style={{ width: '50px', height: '50px', background: 'rgba(249, 140, 29, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <GraduationCap size={28} color="var(--primary)" />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.4 }}>{t('history', 'iysaTitle')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: '60px 0 150px', position: 'relative' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 25px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '50px' }}>
                            <div style={{ width: '35px', height: '3.5px', background: 'var(--primary)', margin: '0 auto 30px', borderRadius: '10px' }}></div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0f172a', marginBottom: '0', letterSpacing: '-0.5px' }}>{t('about', 'historyMeaningTitle')}</h3>
                        </div>

                        <div className="card-compact">
                            <Quote size={60} style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', color: 'var(--primary)', opacity: 0.1 }} className="mobile-hide" />
                             <p className="mobile-quote" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#475569', lineHeight: 1.7, margin: 0, fontStyle: 'italic', letterSpacing: '-0.2px' }}>
                                "{t('about', 'historyMeaningText')}"
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .history-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 80px;
                    align-items: center;
                }
                .floated-name {
                    position: absolute;
                    bottom: 25px;
                    left: -25px;
                    background: linear-gradient(135deg, var(--primary) 0%, #f97316 100%);
                    padding: 22px 40px;
                    border-radius: 25px;
                    color: white;
                    z-index: 3;
                    box-shadow: 0 20px 50px rgba(249, 140, 29, 0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .card-compact {
                    background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 100%);
                    backdrop-filter: blur(20px);
                    padding: 60px 80px;
                    border-radius: 45px;
                    box-shadow: 0 40px 100px rgba(15, 23, 42, 0.05);
                    border: 1px solid rgba(255,255,255,0.8);
                    position: relative;
                    max-width: 850px;
                    margin: 0 auto;
                }
                @media (max-width: 1000px) {
                    .history-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
                    .history-grid > div { max-width: 100% !important; margin: 0 auto; text-align: center !important; }
                    .floated-name { left: 50% !important; transform: translateX(-50%) !important; bottom: -20px !important; width: 85%; white-space: nowrap; position: absolute; }
                    .mobile-title { font-size: 1.4rem !important; }
                    .card-compact { padding: 40px 25px !important; }
                    .mobile-quote { font-size: 0.95rem !important; }
                    .mobile-hide { display: none !important; }
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default HistoryPage;
