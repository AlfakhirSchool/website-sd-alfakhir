"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

const ContactPage = () => {
    const { t } = useLanguage();
    
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

            <div style={{ background: 'transparent', padding: '120px 0 30px', color: '#0f172a', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div
                        style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(249, 140, 29, 0.08)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}
                    >
                        Get In Touch
                    </div>
                    <h1 
                        style={{ fontSize: '1.6rem', fontWeight: 850, margin: 0, textTransform: 'uppercase', letterSpacing: '3px', color: '#0f172a' }}
                    >
                        {t('nav', 'contact').toUpperCase()}
                    </h1>
                    <div 
                        style={{ height: '3px', background: 'var(--primary)', margin: '20px auto', borderRadius: '2px', width: '40px' }}
                    ></div>
                </div>
            </div>

            <main style={{ padding: '20px 0 80px', position: 'relative', zIndex: 1, color: '#0f172a' }}>
                <Contact />
            </main>
            
            <Footer />
        </div>
    );
};

export default ContactPage;
