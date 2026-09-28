"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import AmbientBlobs from '@/components/AmbientBlobs';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

const GalleryPage = () => {
    const { t } = useLanguage();

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <Navbar theme="light" />
            
            <AmbientBlobs />

            <div style={{ background: 'transparent', padding: '140px 0 30px', color: '#0f172a', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div
                        style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(249, 140, 29, 0.08)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}
                    >
                        {t('contact', 'galleryBadge')}
                    </div>
                    <h1 
                        style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '3px', color: '#0f172a' }}
                    >
                        {t('contact', 'galleryTitle')}
                    </h1>
                    <div 
                        style={{ height: '3px', background: 'var(--primary)', margin: '20px auto', borderRadius: '2px', width: '40px' }}
                    ></div>
                </div>
            </div>

            <main style={{ padding: '20px 0 80px', position: 'relative', zIndex: 1 }}>
                <Gallery isSlider={false} />
            </main>
            <Footer />
        </div>
    );
};

export default GalleryPage;
