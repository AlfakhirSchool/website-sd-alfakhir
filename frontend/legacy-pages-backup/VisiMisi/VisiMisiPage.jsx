import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
    Target, 
    Sparkles, 
    Star, 
    Check, 
    BookOpen, 
    Globe, 
    Monitor, 
    Camera,
    ChevronRight,
    Award,
    Circle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const VisiMisiPage = () => {
    const { t } = useLanguage();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const orangePrimary = '#f98c1d';
    const deepSlate = '#0f172a';
    const softCream = '#fffcf9';

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
            <Navbar theme="light" />
            
            {/* Progress Bar */}
            <motion.div style={{ scaleX, position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: orangePrimary, transformOrigin: '0%', zIndex: 200 }} />

            {/* 1. HERO SECTION */}
            <header style={{ padding: '180px 20px 80px', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: orangePrimary, letterSpacing: '5px', textTransform: 'uppercase' }}>
                            SD Islam Modern Al-Fakhir
                        </span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3rem', fontWeight: 950, color: deepSlate, marginBottom: '25px', letterSpacing: '-2px' }}>
                        Visi & Misi <span style={{ color: orangePrimary }}>Sekolah</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500, maxWidth: '700px', margin: '0 auto', fontStyle: 'italic' }}>
                        "Every Child is a Star, Every Day is an Adventure, Every Step is an Ibadah."
                    </motion.p>
                </div>
            </header>

            {/* 2. MINIMALIST 3-CARD SECTION (As requested from image) */}
            <section style={{ padding: '0 20px 100px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                    
                    {/* VISION CARD - RED */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        style={{ background: '#c2185b', borderRadius: '32px', padding: '50px 40px', color: 'white', boxShadow: '0 20px 40px rgba(194,24,91,0.2)' }}
                    >
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                            <Target size={26} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>School Vision</h2>
                        <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.4)', marginBottom: '30px' }} />
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5, opacity: 0.95 }}>
                            "{t('visimisi', 'visionText')}"
                        </p>
                    </motion.div>

                    {/* MISSION CARD - GREEN */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        style={{ background: '#00897b', borderRadius: '32px', padding: '50px 40px', color: 'white', boxShadow: '0 20px 40px rgba(0,137,123,0.2)' }}
                    >
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                            <Sparkles size={26} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>School Mission</h2>
                        <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.4)', marginBottom: '30px' }} />
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {Array.isArray(t('visimisi', 'missionList')) && t('visimisi', 'missionList').map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 600, fontSize: '1.05rem', opacity: 0.95 }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* GOALS CARD - ORANGE */}
                    <motion.div 
                        whileHover={{ y: -10 }}
                        style={{ background: orangePrimary, borderRadius: '32px', padding: '50px 40px', color: 'white', boxShadow: `0 20px 40px ${orangePrimary}40` }}
                    >
                        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                            <Star size={26} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>School Goals</h2>
                        <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.4)', marginBottom: '30px' }} />
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                'To produce students who are devoted in worship and possess noble character',
                                'To cultivate healthy and disciplined habits',
                                'To develop critical, creative, and communicative thinking skills',
                                'To instill a love for knowledge and technology',
                                'To encourage students to interact in accordance with Islamic values'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', fontWeight: 600, fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.4 }}>
                                    <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'white', marginTop: '8px' }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </section>

            {/* 3. CURRICULUM SECTION - CLEAN & MINIMAL */}
            <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
                    <div style={{ borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.05)', background: 'white', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Camera size={80} strokeWidth={1} color={orangePrimary} opacity={0.2} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 950, color: deepSlate, marginBottom: '35px', letterSpacing: '-1.5px' }}>
                            Modern <span style={{ color: orangePrimary }}>Curriculum</span>
                        </h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {Array.isArray(t('curriculum', 'list')) && t('curriculum', 'list').map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', background: 'white', borderRadius: '15px' }}>
                                    <CheckCircle2 size={20} color={orangePrimary} />
                                    <span style={{ fontWeight: 700, color: '#334155' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. ACADEMIC IMPLEMENTATION */}
            <section style={{ padding: '100px 20px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 950, color: deepSlate, textAlign: 'center', marginBottom: '60px', letterSpacing: '-1.5px' }}>Academic Implementation</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {['bilingual', 'digital', 'active'].map((key) => (
                            <div key={key} style={{ padding: '40px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <div style={{ height: '120px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '20px' }}>
                                    <Camera size={40} opacity={0.1} />
                                </div>
                                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: deepSlate }}>{t('implementation', key)}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. ISLAMIC & LANGUAGES */}
            <section style={{ background: '#f8fafc', padding: '100px 20px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
                    <div style={{ background: 'white', padding: '50px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                            <BookOpen size={28} color={orangePrimary} />
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: deepSlate }}>Islamic Values</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                'Fiqh', 'Alquran Hadist', 'Islamic History', 
                                'Implementing Islamic Practices based on Syariah Law', 
                                'Tahsin', 'Tahfiz', 'Dhuha & Murojaah'
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '12px 20px', background: '#f8fafc', borderRadius: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '6px', height: '6px', background: orangePrimary, borderRadius: '50%' }}></div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'white', padding: '50px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                            <Globe size={28} color={orangePrimary} />
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: deepSlate }}>Foreign Languages</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {['English', 'Arabic', 'Korean', 'Japanese'].map((item, i) => (
                                <div key={i} style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px', fontWeight: 900, color: deepSlate, textAlign: 'center' }}>{item}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. NON-ACADEMIC EXCELLENCE */}
            <section style={{ padding: '100px 20px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 950, color: deepSlate, textAlign: 'center', marginBottom: '60px', letterSpacing: '-1.5px' }}>Non-Academic Excellence</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        {[
                            { type: 'Sport', list: ['Futsal', 'Taekwondo', 'Archery', 'Swimming'], icon: <Target size={24} />, color: '#ef4444' },
                            { type: 'Technology', list: ['IOT and Robotic', 'Research'], icon: <Monitor size={24} />, color: '#0ea5e9' },
                            { type: 'Art & Creativity', list: ['Drumband', 'Hadroh', 'Graphic Design', 'Traditional Dance', 'Fun Cooking'], icon: <Sparkles size={24} />, color: orangePrimary }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '40px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ color: item.color, marginBottom: '20px' }}>{item.icon}</div>
                                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: deepSlate, marginBottom: '25px' }}>{item.type}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {item.list.map((li, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontWeight: 700 }}>
                                            <ChevronRight size={16} color={item.color} /> {li}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. ROUTINE AGENDA */}
            <section style={{ padding: '100px 20px', background: deepSlate, color: 'white' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '40px', letterSpacing: '-1px' }}>Routine Agenda</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                'Dhuha & Murojaah', 'Dzuhur Prayer', 'Sunnah Fasting', 'English Day', 'Entrepreneur Expo', 
                                'Outing Class Activities', 'Social Awareness Program', 'Dear Time', 'Meet the Guest Star', 
                                'Art and Research Project Corner', 'End of Performance'
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>
                                    <div style={{ width: '6px', height: '6px', background: orangePrimary, borderRadius: '50%' }} />
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={40} opacity={0.1} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default VisiMisiPage;
