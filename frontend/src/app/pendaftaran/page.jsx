"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Send, CheckCircle2, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationForm from '@/components/Registration';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';

const RegistrationPage = () => {
    const { t } = useLanguage();
    const [registeredData, setRegisteredData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const printCertificate = () => {
        window.print();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <main style={{ padding: '140px 0 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    {!registeredData ? (
                        <div className="registration-grid">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <RegistrationForm onSuccess={setRegisteredData} />
                                </div>
                            </motion.div>

                            <div className="hide-mobile">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', color: 'white', marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>{t('reg', 'whyTitle') || "Why Al-Fakhir?"}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {[
                                            { title: t('about', 'card1'), desc: t('about', 'card1Desc') },
                                            { title: t('about', 'card2'), desc: t('about', 'card2Desc') },
                                            { title: t('about', 'card4'), desc: t('about', 'card4Desc') }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '5px' }}>{item.title}</h4>
                                                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <div style={{ padding: '30px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(249,140,29,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <MessageCircle size={18} color="var(--primary)" />
                                        </div>
                                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>{t('reg', 'consultTitle')}</p>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                                        {t('reg', 'consultDesc')}
                                    </p>
                                    <a href="https://wa.me/628139526221" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ y: -2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageCircle size={16} /> +62 813-9526-221</span>
                                            <ArrowUpRight size={16} />
                                        </motion.div>
                                    </a>
                                    <a href="mailto:sdialfakhir@gmail.com" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ y: -2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} color="#64748b" /> sdialfakhir@gmail.com</span>
                                            <ArrowUpRight size={16} color="#64748b" />
                                        </motion.div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                            <div className="hide-print" style={{ marginBottom: '6rem' }}>
                                <div style={{ width: '120px', height: '120px', background: 'var(--primary)', color: 'white', borderRadius: '50%', margin: '0 auto 3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(249,140,29,0.3)' }}>
                                    <CheckCircle2 size={60} />
                                </div>
                                <h2 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-3px', marginBottom: '1.5rem' }}>{t('reg', 'success.title')}</h2>
                                <p style={{ fontSize: '1.3rem', color: '#64748b', fontFamily: "'Poppins', sans-serif", maxWidth: '600px', margin: '0 auto 4rem' }}>
                                    {t('reg', 'success.desc')}
                                </p>
                                
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <motion.button whileHover={{ y: -5 }} onClick={printCertificate} style={{ background: '#0f172a', color: 'white', padding: '22px 50px', borderRadius: '100px', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1rem', boxShadow: '0 20px 40px rgba(15,23,42,0.2)' }}>
                                        <Send size={20} /> {t('reg', 'success.btnPrint')}
                                    </motion.button>
                                    <motion.button whileHover={{ background: '#f8fafc' }} onClick={() => setRegisteredData(null)} style={{ background: 'transparent', color: '#64748b', padding: '22px 50px', borderRadius: '100px', border: '1px solid #f1f5f9', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
                                        {t('reg', 'success.btnBack')}
                                    </motion.button>
                                </div>
                            </div>

                            <div id="pendaftaran-certificate" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '80px', borderRadius: '40px', textAlign: 'left', position: 'relative', overflow: 'hidden', boxShadow: '0 80px 150px -40px rgba(15,23,42,0.1)' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', opacity: 0.03, fontSize: '10rem', fontWeight: 950, pointerEvents: 'none', whiteSpace: 'nowrap' }}>AL-FAKHIR MODERN</div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', borderBottom: '2px solid #0f172a', paddingBottom: '30px', marginBottom: '40px' }}>
                                    <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Official Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    <div>
                                        <h1 style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>SD ISLAM MODERN AL-FAKHIR</h1>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800 }}>{t('reg', 'success.labelRegistry')}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <div style={{ background: '#f8fafc', padding: '15px 25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900 }}>Registration No.</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', margin: 0 }}>{registeredData?.id}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
                                    <div>
                                        <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '2px' }}>{t('reg', 'success.labelProfile')}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelName')}</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#0f172a' }}>{registeredData?.name}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelBirth')}</span>
                                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>{registeredData?.birthPlace}, {registeredData?.birthDate}</span>
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelGender')}</span>
                                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>{registeredData?.gender}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelAddress')}</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#475569', lineHeight: 1.5 }}>{registeredData?.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '2px' }}>{t('nav', 'profile')}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelGuardian')}</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0f172a' }}>{registeredData?.parentName}</span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelContact')}</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0f172a' }}>{registeredData?.whatsapp}</span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase' }}>{t('reg', 'success.labelYear')}</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--primary)' }}>{registeredData?.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ maxWidth: '450px' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>{t('reg', 'success.footerNote')}</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '80px', fontWeight: 900, color: '#0f172a' }}>{t('reg', 'success.labelAuthority')}</p>
                                        <div style={{ width: '120px', height: '120px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CheckCircle2 size={40} color="#cbd5e1" opacity={0.5} />
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('reg', 'success.labelRegistry')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
            
            <Footer className="hide-print" />

            <style jsx>{`
                .registration-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 350px;
                    gap: 40px;
                    align-items: start;
                }
                @media print {
                    .hide-print { display: none !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; }
                    #pendaftaran-certificate { box-shadow: none !important; border: 2px solid #1e1b4b !important; }
                }
                @media (max-width: 991px) {
                    .registration-grid { grid-template-columns: 1fr !important; }
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default RegistrationPage;
