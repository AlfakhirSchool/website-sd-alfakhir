"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Quote } from 'lucide-react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';
import SmartImage from '@/components/SmartImage';

const SambutanPage = () => {
    const { t } = useLanguage();
    const [welcomeData, setWelcomeData] = useState({ name: '', content: '', imageUrl: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWelcome = async () => {
            try {
                const data = await apiFetch('/api/profile/welcome');
                setWelcomeData(data || { name: 'Arifah Hilyati, S.S, M.Pd.', content: '', imageUrl: '' });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWelcome();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <motion.div 
                animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '20%', right: '-5%', width: '300px', height: '300px', background: 'rgba(249, 140, 29, 0.02)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} 
            />
            <motion.div 
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(15, 23, 42, 0.01)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} 
            />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '600px', backgroundImage: 'radial-gradient(#f1f5f9 1.2px, transparent 1.2px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }}></div>

            <div style={{ position: 'absolute', top: '100px', left: '12%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
                    <MessageSquare size={70} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '250px', right: '10%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}>
                    <Sparkles size={65} />
                </motion.div>
            </div>

            <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', opacity: 0.02, zIndex: 0, pointerEvents: 'none' }}>
                <SmartImage src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Watermark" style={{ width: '450px', height: 'auto', filter: 'grayscale(1)' }} />
            </div>

            <div style={{ background: 'transparent', padding: '140px 0 40px', color: '#0f172a', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div
                        style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(249, 140, 29, 0.08)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}
                    >
                        {t('sambutan', 'badge')}
                    </div>
                    
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <h1 
                            style={{ fontSize: '1.3rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '3px', color: '#0f172a', position: 'relative', zIndex: 2 }}
                        >
                            {t('sambutan', 'title')}
                        </h1>
                        <div 
                            style={{ position: 'absolute', bottom: '6px', left: 0, width: '100%', height: '10px', background: 'rgba(249, 140, 29, 0.06)', zIndex: 1, borderRadius: '4px' }}
                        />
                    </div>
                </div>
            </div>

            <main style={{ padding: '40px 0 150px', position: 'relative', zIndex: 1, color: '#0f172a' }}>
                <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 25px' }}>
                    <div className="sambutan-grid">
                        <div style={{ position: 'sticky', top: '120px' }}>
                            <div style={{ position: 'relative' }}>
                                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', inset: '-40px', background: 'radial-gradient(circle, rgba(249, 140, 29, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0 }}></motion.div>
                                <div style={{
                                    maxWidth: '380px',
                                    borderRadius: '45px',
                                    background: 'white',
                                    boxShadow: '0 40px 100px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(249,140,29,0.06)',
                                    border: '3px solid rgba(249,140,29,0.15)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <div style={{ aspectRatio: '0.9', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
                                        <SmartImage
                                            src={welcomeData.imageUrl || "/arifah.webp"}
                                            lqip={welcomeData.lqip}
                                            alt="Principal"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 55%, transparent 100%)' }}></div>
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(249,140,29,0.95)', borderRadius: '100px', padding: '6px 14px', boxShadow: '0 8px 20px rgba(249,140,29,0.35)' }}>
                                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>★ {t('sambutan', 'role')}</p>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '25px', left: '30px', right: '30px' }}>
                                            <div style={{ width: '32px', height: '3px', background: 'var(--primary)', borderRadius: '10px', marginBottom: '10px' }}></div>
                                            <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 950, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{t('history', 'principalName')}</h4>
                                        </div>
                                    </div>
                                    <div className="card-padding-mobile" style={{ padding: '30px', background: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', opacity: 0.8 }}>
                                            <div style={{ width: '20px', height: '2px', background: 'var(--primary)', borderRadius: '10px' }}></div>
                                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t('sambutan', 'academicBg')}</p>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>{t('history', 'principalBio')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center-mobile">
                            <Quote size={40} style={{ color: 'var(--primary)', opacity: 0.1, marginBottom: '10px' }} className="mobile-hide" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', marginBottom: '15px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                                {t('sambutan', 'greeting')}
                            </h2>
                            
                            <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
                                {welcomeData.content ? (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{welcomeData.content}</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <p dangerouslySetInnerHTML={{ __html: t('sambutan', 'contentPara1') }} />
                                        <p dangerouslySetInnerHTML={{ __html: t('sambutan', 'contentPara2') }} />
                                        <p dangerouslySetInnerHTML={{ __html: t('sambutan', 'contentPara3') }} />
                                    </div>
                                )}
                            </div>

                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                style={{ 
                                    marginTop: '40px', 
                                    padding: '30px 40px', 
                                    background: 'linear-gradient(135deg, rgba(249, 140, 29, 0.04) 0%, rgba(249, 140, 29, 0.01) 100%)', 
                                    borderRadius: '30px', 
                                    borderLeft: '5px solid var(--primary)',
                                    boxShadow: '0 15px 40px rgba(249, 140, 29, 0.05)',
                                    maxWidth: '600px'
                                }}>
                                <p style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.1rem', fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                                    "{t('sambutan', 'closing')}"
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx>{`
                .sambutan-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 80px;
                    align-items: start;
                }
                @media (max-width: 1000px) {
                    .sambutan-grid { grid-template-columns: 1fr !important; gap: 50px !important; }
                    .sambutan-grid > div { max-width: 100% !important; margin: 0 auto; }
                    h2 { font-size: 1.6rem !important; margin-bottom: 20px !important; }
                    h4 { font-size: 1.3rem !important; }
                    main { padding: 40px 0 60px !important; }
                    .mobile-hide { display: none !important; }
                    .card-padding-mobile { padding: 30px !important; }
                }
                @media (max-width: 480px) {
                    h2 { font-size: 1.4rem !important; }
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default SambutanPage;
