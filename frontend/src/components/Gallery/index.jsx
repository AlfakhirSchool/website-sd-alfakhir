"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Calendar, ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, urlFor } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../SmartImage';
import { useIsMobile } from '../../hooks/useIsMobile';
import "./Gallery.css";

const Gallery = ({ isSlider = false, defaultCategory = 'ALL' }) => {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);
    const [activeCategory, setActiveCategory] = useState(defaultCategory);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImg, setSelectedImg] = useState(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();
    const autoPlayRef = useRef(null);

    const categories = ['ALL', 'EVENTS', 'NEWS', 'AWARDS', 'OTHERS'];

    const filteredImages = useMemo(() => {
        if (activeCategory === 'ALL') return images;
        const filtered = images.filter(img => img.category === activeCategory);
        return filtered.length > 0 ? filtered : images;
    }, [images, activeCategory]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await apiFetch('/api/gallery');
                
                if (data && data.length > 0) {
                    const formattedData = data.map(item => ({
                        id: item._id,
                        url: item.imageUrl,
                        image: item.image,
                        title: item.title,
                        category: (item.category || 'events').toUpperCase(),
                        agenda: item.agenda,
                        date: item.date
                    })).filter(img => img.url || img.image);
                    
                    setImages(formattedData);
                    setIsLoading(false);
                    setCurrentIndex(0);
                } else {
                    setImages([]);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Fetch error:', err.message);
                setImages([]);
                setIsLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setCurrentIndex(0);
    };

    // Selection/Auto-sliding logic
    useEffect(() => {
        if (isSlider && isAutoPlaying && filteredImages.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
            }, 6000);
        }
        return () => clearInterval(autoPlayRef.current);
    }, [isSlider, isAutoPlaying, filteredImages.length]);

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    };

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    };

    if (isLoading) return (
        <section id="gallery" style={{ padding: '80px 0', textAlign: 'center', background: '#fcfdfe' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>{t('gallery', 'loading')}</p>
        </section>
    );

    if (images.length === 0) return (
        <section id="gallery" className="gallery-section" style={{ padding: '80px 0', textAlign: 'center', background: '#fcfdfe' }}>
            <div className="gallery-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, marginBottom: '1.2rem', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', background: 'rgba(249, 140, 29, 0.1)', padding: '6px 16px', borderRadius: '99px' }}>
                    <Sparkles size={14} /> {isSlider ? t('gallery', 'labelNews') : t('gallery', 'labelGallery')}
                </div>
                <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', color: 'var(--accent)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.2rem' }}>
                    {t('gallery', 'noStories')}
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
                    {t('gallery', 'noStoriesDesc')}
                </p>
            </div>
        </section>
    );

    return (
        <section id="gallery" className="gallery-section" style={{ 
            background: isSlider ? 'transparent' : '#fcfdfe',
            padding: isSlider ? (isMobile ? '20px 0' : '40px 0') : (isMobile ? '40px 0 60px' : '60px 0 100px')
        }}>
            <div className="gallery-container" style={{ padding: isMobile ? '0 20px' : '0 40px' }}>
                
                {/* Refined Header */}
                <div className="gallery-header-row">
                    <div style={{ flex: 1, minWidth: isMobile ? '100% voice' : '300px' }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <span className="gallery-label">
                                {isSlider ? t('gallery', 'labelNews') : t('gallery', 'labelGallery')}
                            </span>
                            <h2 className="gallery-title" style={{ fontSize: isMobile ? '1.8rem' : '2.8rem' }}>
                                {isSlider ? t('gallery', 'titleNews') : t('gallery', 'titleGallery')}
                            </h2>
                            <p className="gallery-subtitle" style={{ fontSize: isMobile ? '0.95rem' : '1.05rem' }}>
                                {isSlider 
                                    ? t('gallery', 'descNews') 
                                    : t('gallery', 'descGallery')}
                            </p>
                        </motion.div>
                    </div>

                    {!isSlider && (
                        <div className="gallery-filter-group">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`gallery-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                    style={{
                                        padding: isMobile ? '8px 16px' : '10px 22px',
                                        fontSize: '0.7rem',
                                    }}
                                >
                                {t('common', cat === 'ALL' ? 'all' : cat.toLowerCase()) || cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isSlider ? (
                    <div style={{ position: 'relative' }}>
                        <div className="gallery-slider-grid">
                            {/* Main Featured Slide */}
                            <motion.div 
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="featured-slide"
                                onClick={() => setSelectedImg(filteredImages[currentIndex])}
                            >
                                <SmartImage 
                                    src={urlFor(filteredImages[currentIndex]?.image || filteredImages[currentIndex]?.url).width(isMobile ? 800 : 1200).auto('format').url()}
                                    lqip={filteredImages[currentIndex]?.lqip}
                                    className="featured-img"
                                    alt={filteredImages[currentIndex]?.title || "Gallery Showcase Image"} 
                                    loading="eager"
                                />
                                <div className="featured-overlay" style={{ padding: isMobile ? '30px 20px' : '60px 50px 50px' }}>
                                    <div className="featured-meta" style={{ marginBottom: isMobile ? '8px' : '15px' }}>
                                        <Calendar size={12}/> {filteredImages[currentIndex]?.date}
                                        <span style={{ opacity: 0.4 }}>|</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{filteredImages[currentIndex]?.category}</span>
                                    </div>
                                    <h3 className="gallery-title" style={{ fontSize: isMobile ? '1.3rem' : '2.2rem', color: 'white' }}>{filteredImages[currentIndex]?.title}</h3>
                                </div>
                            </motion.div>

                            {/* Sidebar - Up Next */}
                            <div className="gallery-sidebar" style={{ display: isMobile ? 'none' : 'flex' }}>
                                <div className="sidebar-label">{t('gallery', 'upNext')}</div>
                                {filteredImages.length > 1 ? (
                                    filteredImages.map((img, index) => (
                                        index !== currentIndex && (
                                            <motion.div 
                                                key={img.id}
                                                onClick={() => setCurrentIndex(index)}
                                                whileHover={{ x: 10, background: 'white' }}
                                                className="sidebar-item"
                                            >
                                                <div className="sidebar-thumb">
                                                    <SmartImage 
                                                        src={urlFor(img.image || img.url).width(200).height(200).auto('format').url()} 
                                                        lqip={img.lqip}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        alt={img.title || "Gallery Item thumb"} 
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ fontWeight: 800, margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{img.title}</h5>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>{t('gallery', 'viewStory')} <ArrowRight size={12} /></p>
                                                </div>
                                            </motion.div>
                                        )
                                    )).slice(0, 3)
                                ) : (
                                    <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
                                        Check back soon for more stories.
                                    </div>
                                )}
                                
                                <div className="sidebar-nav">
                                    <button onClick={prevSlide} className="nav-btn"><ChevronLeft size={20} /></button>
                                    <button onClick={nextSlide} className="nav-btn"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                        {isMobile && (
                             <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button onClick={prevSlide} className="nav-btn" style={{ width: '40px', height: '40px' }}><ChevronLeft size={18} /></button>
                                <button onClick={nextSlide} className="nav-btn" style={{ width: '40px', height: '40px' }}><ChevronRight size={18} /></button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="gallery-grid">
                        <AnimatePresence mode="popLayout">
                            {filteredImages.map((img) => (
                                <motion.div 
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSelectedImg(img)}
                                    className="gallery-card"
                                    whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(15, 23, 42, 0.1)' }}
                                >
                                    <div className="card-img-wrapper">
                                        <SmartImage 
                                            isMotion={true}
                                            motionProps={{ whileHover: { scale: 1.05 } }}
                                            src={urlFor(img.image || img.url).width(600).auto('format').url()} 
                                            lqip={img.lqip}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            alt={img.title || "Gallery Card"}
                                        />
                                        <div className="category-badge">{img.category}</div>
                                    </div>
                                    <div style={{ padding: '20px 10px 15px' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{(img.date || '').toUpperCase()}</div>
                                        <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '10px', fontSize: '1.25rem', lineHeight: 1.3 }}>{img.title}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{img.agenda}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Refined Immersive Lightbox */}
                <AnimatePresence>
                    {selectedImg && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="lightbox-overlay"
                            onClick={() => setSelectedImg(null)}
                        >
                            <button 
                                onClick={() => setSelectedImg(null)}
                                style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '54px', height: '54px', cursor: 'pointer', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: '0.3s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <X size={28} />
                            </button>

                            <motion.div 
                                initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }}
                                className="lightbox-content"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="lightbox-grid">
                                    <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SmartImage 
                                            src={urlFor(selectedImg.image || selectedImg.url).width(1200).auto('format').url()} 
                                            lqip={selectedImg.lqip}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            alt={selectedImg.title} 
                                            loading="eager"
                                        />
                                    </div>
                                    <div style={{ padding: '60px 50px', display: 'flex', flexDirection: 'column', background: 'white' }}>
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px' }}>{selectedImg.date}</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#e2e8f0' }}></span>
                                            <span style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px' }}>{selectedImg.category}</span>
                                        </div>
                                        <h3 className="gallery-title" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>{selectedImg.title}</h3>
                                        <div style={{ height: '3px', width: '60px', background: 'var(--primary)', marginBottom: '35px' }}></div>
                                        <div style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 500, overflowY: 'auto', maxHeight: '40vh' }}>
                                            {selectedImg.agenda}
                                        </div>
                                        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                                             <button 
                                                onClick={() => setSelectedImg(null)}
                                                style={{ padding: '15px 40px', borderRadius: '99px', border: '1.5px solid #0f172a', background: 'transparent', color: '#0f172a', fontWeight: 800, cursor: 'pointer', transition: '0.3s' }}
                                                onMouseOver={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = 'white'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0f172a'; }}
                                             >
                                                {t('gallery', 'closeStory')}
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default Gallery;
