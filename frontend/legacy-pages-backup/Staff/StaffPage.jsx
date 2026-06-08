import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import { motion } from 'framer-motion';
import { Heart, User, Sparkles, CheckCircle, Star } from 'lucide-react';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import { apiFetch, urlFor } from '../../lib/api';
import SmartImage from '../../components/SmartImage';
import { useLanguage } from '../../context/LanguageContext';

const StaffPage = () => {
    const { t, langCode } = useLanguage();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        window.scrollTo(0, 0);
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);

        const fetchStaff = async () => {
            try {
                const data = await apiFetch('/api/staff');
                const staffList = data || [];
                setStaff(staffList);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();

        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [selectedMember, setSelectedMember] = useState(null);

    // Robust Image Component with Fallback
    const StaffImage = ({ member, size = 160 }) => {
        const imageUrl = member.imageUrl;
        const image = member.image;
        
        // Final resolution for the image URL
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
                    objectPosition: 'center top' // Prevent head cutoff
                }} 
            />
        );
    };

    if (loading) return <LoadingSpinner />;

    const isRTL = langCode === 'SA';


    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative', direction: isRTL ? 'rtl' : 'ltr' }}>
            <Navbar theme="light" />
            
            {/* Soft Background Motion Elements */}
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

            {/* Texture Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '600px', backgroundImage: 'radial-gradient(#f1f5f9 1.2px, transparent 1.2px)', backgroundSize: '24px 24px', opacity: 0.6, pointerEvents: 'none' }}></div>

            {/* Decorative Header Elements */}
            <div style={{ position: 'absolute', top: '100px', left: '12%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                    <User size={80} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '250px', right: '10%', opacity: 0.03, pointerEvents: 'none' }}>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
                    <Heart size={70} />
                </motion.div>
            </div>
            <div style={{ position: 'absolute', top: '140px', right: '28%', opacity: 0.02, pointerEvents: 'none' }}>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}>
                    <Star size={45} />
                </motion.div>
            </div>

            {/* Background Watermark Logo */}
            <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', opacity: 0.02, zIndex: 0, pointerEvents: 'none' }}>
                <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir Watermark" style={{ width: '450px', height: 'auto', filter: 'grayscale(1)' }} />
            </div>

            {/* Enhanced Minimalist Header */}
            <div style={{ 
                background: 'radial-gradient(circle at top right, #fff, #f8fafc)', 
                padding: '130px 0 40px', 
                color: '#0f172a', 
                textAlign: 'center', 
                position: 'relative', 
                zIndex: 1,
                overflow: 'hidden'
            }}>
                {/* Floating Decorative Elements */}
                <div style={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.05 }}><Sparkles size={120} /></div>
                <div style={{ position: 'absolute', top: '30%', left: '5%', opacity: 0.03, transform: 'rotate(-15deg)' }}><CheckCircle size={150} /></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div
                        style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', background: 'rgba(249, 140, 29, 0.08)', border: '1px solid rgba(249, 140, 29, 0.2)', marginBottom: '20px' }}
                    >
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#b45309' }}>
                            {t('staff', 'teamTag')}
                        </span>
                    </div>
                    
                    <h1 
                        style={{ fontSize: '2.2rem', fontWeight: 950, color: '#0f172a', marginBottom: '15px', letterSpacing: '-0.5px' }}
                    >
                        {t('staff', 'title')}
                    </h1>
                </div>
            </div>

            {/* Main Content Section — Editorial Gallery Style */}
            <section style={{ paddingBottom: '100px', position: 'relative', zIndex: 1, background: '#fff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    
                    {/* Primary Group Photo — Central Feature */}
                    <div
                        style={{ 
                            width: '100%', 
                            maxWidth: '850px',
                            margin: '0 auto 40px',
                            aspectRatio: isMobile ? '4/3' : '2.1 / 1.1', 
                            background: '#f1f5f9', 
                            borderRadius: isMobile ? '25px' : '35px', 
                            overflow: 'hidden',
                            boxShadow: '0 40px 100px rgba(15, 23, 42, 0.12)',
                            position: 'relative'
                        }}
                    >
                        {/* Soft overlay gradient */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.15))', zIndex: 1 }} />
                        
                        <motion.img 
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                            src="/images/teachers_group_new.webp" 
                            alt="Al Fakhir Teachers Group" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                objectPosition: 'center 82%',
                                filter: 'brightness(1.1) contrast(1.05) saturate(1.08)' 
                            }}
                            onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1544717297-fa95ec97e68e?q=80&w=2070&auto=format&fit=crop";
                            }}
                        />
                    </div>

                    {/* Banner Content Grid — Responsive Spacing */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : '0.8fr 1.2fr', 
                        gap: isMobile ? '30px' : '80px', 
                        alignItems: 'start', 
                        maxWidth: '1000px', 
                        margin: '0 auto',
                        padding: isMobile ? '0 10px' : '0 40px'
                    }}>
                        <div
                            style={{ position: 'relative' }}
                        >
                            <div style={{ width: '45px', height: '3.5px', background: 'var(--primary)', borderRadius: '2px', marginBottom: '20px' }} />
                            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 950, color: '#0f172a', lineHeight: 1.25, letterSpacing: '-0.8px' }}>
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
                            {/* TEACHERS SECTION */}
                            {staff.filter(m => m.role?.toLowerCase().includes('pendidik') || m.role?.toLowerCase().includes('guru')).length > 0 && (
                                <>
                                    <div style={{ marginBottom: '40px', textAlign: isMobile ? 'center' : 'left' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                                            {t('staff', 'teacherTitle')} <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>({t('staff', 'categories.teacher')}s)</span>
                                        </h3>
                                        <div style={{ width: '60px', height: '3px', background: 'var(--primary)', borderRadius: '2px', margin: isMobile ? '0 auto' : '0' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                                        {staff.filter(m => m.role?.toLowerCase().includes('pendidik') || m.role?.toLowerCase().includes('guru')).map((member, i) => (
                                            <div 
                                                key={`teacher-${i}`}
                                                onClick={() => setSelectedMember(member)}
                                                style={{ 
                                                    background: 'white', 
                                                    borderRadius: '35px', 
                                                    padding: '35px', 
                                                    border: '1px solid #f1f5f9', 
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', 
                                                    textAlign: 'center',
                                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(249, 140, 29, 0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '160px', 
                                                    height: '160px', 
                                                    borderRadius: '50%', 
                                                    overflow: 'hidden', 
                                                    margin: '0 auto 25px', 
                                                    border: '4px solid #fff',
                                                    boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                                                    background: '#f8fafc'
                                                }}>
                                                    <StaffImage member={member} size={160} />
                                                </div>
                                                
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.3px' }}>
                                                    {member.name}
                                                </h4>
                                                
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8 }}>
                                                    {member.role}
                                                </p>

                                                <div style={{ marginTop: '15px', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>
                                                    {t('staff', 'viewProfile')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* ADMINISTRATIVE STAFF SECTION */}
                            {staff.filter(m => !m.role?.toLowerCase().includes('pendidik') && !m.role?.toLowerCase().includes('guru')).length > 0 && (
                                <>
                                    <div style={{ marginBottom: '40px', textAlign: isMobile ? 'center' : 'left' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                                            {t('staff', 'staffTitle')} <span style={{ color: '#64748b', fontStyle: 'italic' }}>({t('staff', 'categories.staff')})</span>
                                        </h3>
                                        <div style={{ width: '60px', height: '3px', background: '#e2e8f0', borderRadius: '2px', margin: isMobile ? '0 auto' : '0' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                        {staff.filter(m => !m.role?.toLowerCase().includes('pendidik') && !m.role?.toLowerCase().includes('guru')).map((member, i) => (
                                            <div 
                                                key={`staff-${i}`}
                                                onClick={() => setSelectedMember(member)}
                                                style={{ 
                                                    background: 'white', 
                                                    borderRadius: '35px', 
                                                    padding: '35px', 
                                                    border: '1px solid #f1f5f9', 
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', 
                                                    textAlign: 'center',
                                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                                    e.currentTarget.style.borderColor = '#94a3b8';
                                                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(148, 163, 184, 0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '160px', 
                                                    height: '160px', 
                                                    borderRadius: '50%', 
                                                    overflow: 'hidden', 
                                                    margin: '0 auto 25px', 
                                                    border: '4px solid #fff',
                                                    boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                                                    background: '#f8fafc'
                                                }}>
                                                    <StaffImage member={member} size={160} />
                                                </div>
                                                
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.3px' }}>
                                                    {member.name}
                                                </h4>
                                                
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8 }}>
                                                    {member.role}
                                                </p>

                                                <div style={{ marginTop: '15px', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px' }}>
                                                    {t('staff', 'viewProfile')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ color: '#64748b' }}>{t('staff', 'updating')}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Profile Detail Modal */}
            {selectedMember && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedMember(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', maxWidth: '500px', width: '100%', borderRadius: '45px', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
                    >
                        {/* Modal Header/Image */}
                        <div style={{ position: 'relative', height: '240px', background: 'radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                <StaffImage member={selectedMember} size={180} />
                            </div>
                            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', color: '#0f172a' }}>✕</button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#0f172a', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>{selectedMember.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>{selectedMember.role}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'center' }}>
                                {/* Vision Section */}
                                {selectedMember.vision && (
                                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '25px' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '12px', textTransform: 'uppercase' }}>{t('staff', 'visionTitle')}</p>
                                        <p style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>"{selectedMember.vision}"</p>
                                    </div>
                                )}

                                {/* Extra Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' }}>{t('staff', 'eduTitle')}</p>
                                        <p style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>{selectedMember.education || '-'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' }}>{t('staff', 'emailTitle')}</p>
                                        <p style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>{selectedMember.email || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Decorative */}
                        <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <img src="/logo_new.webp" alt="Logo" style={{ height: '30px', opacity: 0.2 }} />
                        </div>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default StaffPage;
