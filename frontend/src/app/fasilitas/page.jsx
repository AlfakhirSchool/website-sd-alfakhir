"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
    School, 
    BookOpen, 
    Monitor, 
    Wind, 
    Dribbble, 
    Waves,
    Plus
} from 'lucide-react';
import SmartImage from '@/components/SmartImage';
import { useLanguage } from '@/context/LanguageContext';

const FacilityCard = ({ fac, hasImage, primaryColor, gridImage, index }) => {
    const { t } = useLanguage();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
    
    const ghostX = useTransform(mouseXSpring, [-0.5, 0.5], ["-15px", "15px"]);
    const ghostY = useTransform(mouseYSpring, [-0.5, 0.5], ["-15px", "15px"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.8, type: "spring", stiffness: 100 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1200px", position: 'relative', zIndex: 1 }}
        >
            <motion.div 
                style={{
                    position: 'absolute', inset: 0, background: 'rgba(249, 140, 29, 0.05)', borderRadius: '24px',
                    x: ghostX, y: ghostY, zIndex: 0, scale: 0.98, filter: 'blur(10px)', pointerEvents: 'none'
                }}
            />

            <motion.div
                style={{
                    rotateX, rotateY, transformStyle: "preserve-3d", background: 'white', borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.04)', border: '1px solid #f1f5f9',
                    overflow: 'hidden', textAlign: 'center', position: 'relative', height: '100%', zIndex: 1
                }}
                whileHover={{ y: -5, boxShadow: '0 30px 70px rgba(15, 23, 42, 0.08)', borderColor: 'rgba(249, 140, 29, 0.2)' }}
            >
                <div style={{ width: '100%', height: '200px', background: hasImage ? 'white' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {hasImage ? (
                        <SmartImage
                            isMotion={true}
                            motionProps={{ whileHover: { scale: 1.15 }, transition: { duration: 1.2 } }}
                            src={gridImage}
                            alt={fac.name}
                            loading="eager"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: "translateZ(30px)" }}>
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ color: primaryColor, opacity: 0.6 }}>{fac.icon}</motion.div>
                            <div style={{ marginTop: '15px', padding: '6px 12px', background: 'rgba(249, 140, 29, 0.05)', borderRadius: '8px', border: '1px solid rgba(249, 140, 29, 0.1)' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: primaryColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{t('facilities', 'comingSoon')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '30px 25px', transform: "translateZ(40px)" }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' }}>{fac.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 500 }}>{fac.desc}</p>
                </div>

                <motion.div 
                    whileHover={{ rotate: 90, scale: 1.2 }}
                    style={{ position: 'absolute', bottom: '20px', right: '20px', width: '32px', height: '32px', background: 'rgba(249, 140, 29, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', color: primaryColor, transform: "translateZ(50px)" }}
                >
                    <Plus size={16} strokeWidth={3} />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const FacilitiesPage = () => {
    const { t } = useLanguage();
    const primaryColor = '#f98c1d';

    const mainFacilities = [
        { key: 'ruangKelas', icon: <School size={30} /> },
        { key: 'mushola', icon: <Waves size={30} /> },
        { key: 'labKomputer', icon: <Monitor size={30} /> },
        { key: 'perpustakaan', icon: <BookOpen size={30} /> },
        { key: 'lapangan', icon: <Dribbble size={30} /> },
        { key: 'aula', icon: <Waves size={30} /> },
        { key: 'saung', icon: <Wind size={30} /> },
        { key: 'kolamRenang', icon: <Waves size={30} /> },
    ].map(f => ({ ...f, name: t('facilities', `list.${f.key}.name`), desc: t('facilities', `list.${f.key}.desc`) }));

    // Routed through /api/image: a direct <img src> to lh3.googleusercontent.com
    // gets rejected by Chrome's Opaque Response Blocking once the request
    // carries our site's Referer header, so the server fetches it instead.
    const proxied = (id) => `/api/image?url=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${id}=w1000`)}`;
    const gridImages = {
        mushola: proxied('10etl3hmil68_s_xYBytVfRCSAQohnKLS'),
        aula: proxied('1i97Pi9UPMce3Y-IeBF4khkY-fuT2iBsq'),
        saung: proxied('1iCCLVqOERSE72t8cgPnO8xQmxp9TJm-9'),
        kolamRenang: proxied('10NnVjW1RywTIo40fMvTmpQhKh72HIq2-')
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                <motion.div 
                    animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(249, 140, 29, 0.02)', filter: 'blur(80px)', borderRadius: '50%' }}
                />
            </div>

            <header style={{ padding: '140px 20px 30px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: primaryColor, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                        {t('facilities', 'badge')}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '15px', letterSpacing: '-1.5px', lineHeight: 1.1 }}
                    >
                        {t('facilities', 'title')}
                    </motion.h1>
                    <div style={{ width: '40px', height: '4px', background: primaryColor, margin: '0 auto', borderRadius: '10px' }} />
                </div>
            </header>

            <main style={{ padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="facilities-grid">
                        {mainFacilities.map((fac, i) => (
                            <FacilityCard 
                                key={i} 
                                index={i}
                                fac={fac} 
                                hasImage={gridImages[fac.key]}
                                primaryColor={primaryColor}
                                gridImage={gridImages[fac.key]}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .facilities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 40px;
                }
            `}</style>
            <Footer />
        </div>
    );
};

export default FacilitiesPage;
