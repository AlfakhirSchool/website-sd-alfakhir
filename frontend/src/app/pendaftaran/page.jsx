"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Send, CheckCircle2, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationForm from '@/components/Registration';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch } from '@/lib/api';

const RegistrationPage = () => {
    const { t } = useLanguage();
    const [registeredData, setRegisteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationClosed, setRegistrationClosed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        apiFetch('/api/settings').then(settings => {
            if (settings?.registrationEnabled === false) setRegistrationClosed(true);
        });
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
                    {registrationClosed ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '15px' }}>Pendaftaran Online Ditutup</h2>
                            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
                                Mohon maaf, pendaftaran online untuk saat ini sedang ditutup. Silakan hubungi kami langsung untuk informasi lebih lanjut.
                            </p>
                        </motion.div>
                    ) : !registeredData ? (
                        <div className="registration-grid">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <RegistrationForm onSuccess={setRegisteredData} />
                                </div>
                            </motion.div>

                            <div className="hide-mobile">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#0f172a', padding: '30px', borderRadius: '16px', color: 'white', marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px' }}>{t('reg', 'whyTitle') || "Why Al-Fakhir?"}</h3>
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
                                        <p style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{t('reg', 'consultTitle')}</p>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                                        {t('reg', 'consultDesc')}
                                    </p>
                                    <a href="https://wa.me/628139526221" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ y: -2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.85rem', marginBottom: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MessageCircle size={16} /> +62 813-9526-221</span>
                                            <ArrowUpRight size={16} />
                                        </motion.div>
                                    </a>
                                    <a href="mailto:sdialfakhir@gmail.com" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ y: -2 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
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
                                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-3px', marginBottom: '1.5rem' }}>{t('reg', 'success.title')}</h2>
                                <p style={{ fontSize: '1.3rem', color: '#64748b', fontFamily: "'Poppins', sans-serif", maxWidth: '600px', margin: '0 auto 4rem' }}>
                                    {t('reg', 'success.desc')}
                                </p>
                                
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <motion.button whileHover={{ y: -5 }} onClick={printCertificate} style={{ background: '#0f172a', color: 'white', padding: '22px 50px', borderRadius: '100px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1rem', boxShadow: '0 20px 40px rgba(15,23,42,0.2)' }}>
                                        <Send size={20} /> {t('reg', 'success.btnPrint')}
                                    </motion.button>
                                    <motion.button whileHover={{ background: '#f8fafc' }} onClick={() => setRegisteredData(null)} style={{ background: 'transparent', color: '#64748b', padding: '22px 50px', borderRadius: '100px', border: '1px solid #f1f5f9', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                                        {t('reg', 'success.btnBack')}
                                    </motion.button>
                                </div>
                            </div>

                            <div id="pendaftaran-certificate" className="receipt-card">
                                <div className="receipt-header">
                                    <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Official Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 12px' }} />
                                    <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>SD ISLAM MODERN AL-FAKHIR</h1>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--primary)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>{t('reg', 'success.labelRegistry')}</p>
                                </div>

                                <div className="receipt-divider" />

                                {[
                                    [t('reg', 'success.labelName'), registeredData?.name],
                                    [t('reg', 'success.labelBirth'), `${registeredData?.birthPlace}, ${registeredData?.birthDate}`],
                                    [t('reg', 'success.labelGender'), registeredData?.gender],
                                    ['NIK', registeredData?.nik || '-'],
                                    [t('reg', 'form.labelReligion'), registeredData?.religion || '-'],
                                    [t('reg', 'success.labelAddress'), `${registeredData?.address || ''}${registeredData?.city ? `, ${registeredData.city}` : ''}`],
                                    [t('reg', 'form.labelPrevSchool'), registeredData?.schoolName || '-'],
                                ].map(([label, value], i) => (
                                    <div className="receipt-row" key={i}>
                                        <span className="receipt-label">{label}</span>
                                        <span className="receipt-value">{value}</span>
                                    </div>
                                ))}

                                <div className="receipt-divider" />

                                {[
                                    [t('reg', 'success.labelGuardian'), registeredData?.parentName],
                                    [t('reg', 'success.labelContact'), registeredData?.whatsapp],
                                    [t('reg', 'form.labelKip'), registeredData?.kip || '-'],
                                    [t('reg', 'success.labelYear'), registeredData?.year],
                                ].map(([label, value], i) => (
                                    <div className="receipt-row" key={i}>
                                        <span className="receipt-label">{label}</span>
                                        <span className="receipt-value">{value}</span>
                                    </div>
                                ))}

                                <div className="receipt-divider" />

                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center', margin: '20px 0' }}>{t('reg', 'success.footerNote')}</p>

                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <CheckCircle2 size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{t('reg', 'success.labelAuthority')}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 0' }}>{t('reg', 'success.labelRegistry')}</p>
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
                .receipt-card {
                    background: white;
                    max-width: 420px;
                    margin: 0 auto;
                    padding: 36px 32px;
                    border-radius: 4px;
                    text-align: left;
                    box-shadow: 0 30px 60px -20px rgba(15,23,42,0.15);
                    background-image: radial-gradient(circle at 0 0, transparent 10px, white 10px), radial-gradient(circle at 100% 0, transparent 10px, white 10px);
                }
                .receipt-header { text-align: center; }
                .receipt-divider {
                    border-top: 1px dashed #cbd5e1;
                    margin: 16px 0;
                }
                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 16px;
                    padding: 6px 0;
                }
                .receipt-label {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex-shrink: 0;
                }
                .receipt-value {
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0f172a;
                    text-align: right;
                }
                @media print {
                    .hide-print { display: none !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; }
                    .receipt-card { box-shadow: none !important; border: 1px dashed #94a3b8 !important; }
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
