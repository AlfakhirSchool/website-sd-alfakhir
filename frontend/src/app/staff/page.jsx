"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Sparkles, CheckCircle, Star } from 'lucide-react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import { apiFetch, urlFor } from '@/lib/api';
import SmartImage from '@/components/SmartImage';
import { useLanguage } from '@/context/LanguageContext';

const StaffPage = () => {
    const { t } = useLanguage();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await apiFetch('/api/staff');
                setStaff(data || []);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const StaffImage = ({ member, size = 160 }) => {
        const imageUrl = member.imageUrl;
        const image = member.image;
        const resolvedSrc = urlFor(image || imageUrl).width(size * 2).height(size * 2).auto('format').url();

        return (
            <SmartImage 
                src={resolvedSrc} 
                lqip={member.lqip}
                alt={member.name} 
                fallback="/images/placeholder-user.png"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top'
                }}
            />
        );
    };

    if (loading) return <LoadingSpinner />;

    const teachers = staff.filter(m => m.role?.toLowerCase().includes('pendidik') || m.role?.toLowerCase().includes('guru'));
    const adminStaff = staff.filter(m => !m.role?.toLowerCase().includes('pendidik') && !m.role?.toLowerCase().includes('guru'));

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

            <div style={{ position: 'absolute', top: '130px', left: '12%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                    <User size={80} />
                </motion.div>
            </div>

            <div style={{ 
                background: 'radial-gradient(circle at top right, #fff, #f8fafc)', 
                padding: '130px 0 40px', 
                color: '#0f172a', 
                textAlign: 'center', 
                position: 'relative', 
                zIndex: 1,
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
                    <div
                        style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', background: 'rgba(249, 140, 29, 0.08)', border: '1px solid rgba(249, 140, 29, 0.2)', marginBottom: '20px' }}
                    >
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#b45309' }}>
                            {t('staff', 'teamTag')}
                        </span>
                    </div>
                    
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 950, color: '#0f172a', marginBottom: '15px', letterSpacing: '-0.5px' }}>
                        {t('staff', 'title')}
                    </h1>
                </div>
            </div>

            <section style={{ paddingBottom: '100px', position: 'relative', zIndex: 1, background: '#fff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="group-photo-container">
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.15))', zIndex: 1 }} />
                        <motion.img
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            src="/images/teachers_group_new.webp"
                            alt="Al Fakhir Teachers Group"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
                        />
                    </div>

                    <div className="banner-grid">
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '45px', height: '3.5px', background: 'var(--primary)', borderRadius: '2px', marginBottom: '20px' }} />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#0f172a', lineHeight: 1.25, letterSpacing: '-0.8px' }}>
                                {t('staff', 'meetTitle1')} <br/>
                                <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontWeight: 900 }}>{t('staff', 'meetTitle2')}</span>
                            </h2>
                        </div>
                        <div>
                            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, margin: 0, fontWeight: 500, letterSpacing: '0.2px', opacity: 0.9 }}>
                                {t('staff', 'meetDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <main style={{ padding: '60px 0 80px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    {staff.length > 0 ? (
                        <>
                            {teachers.length > 0 && (
                                <>
                                    <div style={{ marginBottom: '40px' }} className="section-header">
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                                            {t('staff', 'teacherTitle')} <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>({t('staff', 'categories.teacher')}s)</span>
                                        </h3>
                                        <div className="accent-line" />
                                    </div>
                                    <div className="staff-grid">
                                        {teachers.map((member, i) => (
                                            <div 
                                                key={`teacher-${i}`}
                                                onClick={() => setSelectedMember(member)}
                                                className="staff-card"
                                            >
                                                <div className="avatar-container">
                                                    <StaffImage member={member} size={160} />
                                                </div>
                                                <h4 className="staff-name">{member.name}</h4>
                                                <p className="staff-role">{member.role}</p>
                                                <div className="view-profile-btn">{t('staff', 'viewProfile')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {adminStaff.length > 0 && (
                                <div style={{ marginTop: '80px' }}>
                                    <div style={{ marginBottom: '40px' }} className="section-header">
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                                            {t('staff', 'staffTitle')} <span style={{ color: '#64748b', fontStyle: 'italic' }}>({t('staff', 'categories.staff')})</span>
                                        </h3>
                                        <div className="accent-line gray" />
                                    </div>
                                    <div className="staff-grid">
                                        {adminStaff.map((member, i) => (
                                            <div 
                                                key={`staff-${i}`}
                                                onClick={() => setSelectedMember(member)}
                                                className="staff-card staff-accent"
                                            >
                                                <div className="avatar-container">
                                                    <StaffImage member={member} size={160} />
                                                </div>
                                                <h4 className="staff-name">{member.name}</h4>
                                                <p className="staff-role">{member.role}</p>
                                                <div className="view-profile-btn">{t('staff', 'viewProfile')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ color: '#64748b' }}>{t('staff', 'updating')}</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedMember && (
                    <div className="modal-backdrop" onClick={() => setSelectedMember(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'white', maxWidth: '500px', width: '100%', borderRadius: '45px', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
                        >
                            <div className="modal-header">
                                <div className="modal-avatar">
                                    <StaffImage member={selectedMember} size={180} />
                                </div>
                                <button onClick={() => setSelectedMember(null)} className="close-btn">✕</button>
                            </div>

                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <h3 className="modal-name">{selectedMember.name}</h3>
                                <p className="modal-role">{selectedMember.role}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'center' }}>
                                    {selectedMember.vision && (
                                        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '25px' }}>
                                            <p className="meta-label">{t('staff', 'visionTitle')}</p>
                                            <p className="vision-text">"{selectedMember.vision}"</p>
                                        </div>
                                    )}

                                    <div className="meta-grid">
                                        <div>
                                            <p className="meta-label">{t('staff', 'eduTitle')}</p>
                                            <p className="meta-value">{selectedMember.education || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="meta-label">{t('staff', 'emailTitle')}</p>
                                            <p className="meta-value">{selectedMember.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .group-photo-container {
                    width: 100%;
                    max-width: 850px;
                    margin: 0 auto 40px;
                    aspect-ratio: 2.1 / 1.1;
                    background: #f1f5f9;
                    border-radius: 35px;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(15, 23, 42, 0.12);
                    position: relative;
                }
                .banner-grid {
                    display: grid;
                    grid-template-columns: 0.8fr 1.2fr;
                    gap: 80px;
                    align-items: start;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 40px;
                }
                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 30px;
                }
                .staff-card {
                    background: white;
                    border-radius: 35px;
                    padding: 35px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .staff-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    border-color: var(--primary);
                    box-shadow: 0 30px 60px rgba(249, 140, 29, 0.1);
                }
                .staff-accent:hover {
                    border-color: #94a3b8;
                    box-shadow: 0 30px 60px rgba(148, 163, 184, 0.1);
                }
                .avatar-container {
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin: 0 auto 25px;
                    border: 4px solid #fff;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
                    background: #f8fafc;
                }
                .staff-name { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 950; color: #0f172a; letter-spacing: -0.3px; }
                .staff-role { margin: 0; font-size: 0.75rem; color: var(--primary); font-weight: 1000; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; }
                .view-profile-btn { margin-top: 15px; font-size: 0.6rem; font-weight: 900; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; }
                .accent-line { width: 60px; height: 3px; background: var(--primary); border-radius: 2px; }
                .accent-line.gray { background: #e2e8f0; }

                .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal-header { height: 240px; background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%); display: flex; align-items: center; justify-content: center; position: relative; }
                .modal-avatar { width: 180px; height: 180px; border-radius: 50%; overflow: hidden; border: 6px solid white; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .close-btn { position: absolute; top: 25px; right: 25px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .modal-name { font-size: 1.8rem; font-weight: 950; color: #0f172a; margin: 0 0 5px 0; }
                .modal-role { font-size: 0.9rem; color: var(--primary); font-weight: 1000; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; }
                .meta-label { font-size: 0.75rem; font-weight: 900; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 12px; text-transform: uppercase; }
                .vision-text { font-size: 1.1rem; color: #0f172a; font-weight: 600; font-style: italic; line-height: 1.6; }
                .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .meta-value { font-size: 0.95rem; color: #0f172a; font-weight: 800; }

                @media (max-width: 768px) {
                    .group-photo-container { aspect-ratio: 4/3; }
                    .banner-grid { grid-template-columns: 1fr; gap: 30px; padding: 0 10px; }
                    .section-header { text-align: center; }
                    .accent-line { margin: 0 auto; }
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default StaffPage;
