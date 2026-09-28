"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../SmartImage';
import { useIsMobile } from "../../hooks/useIsMobile";
import "./Hero.css";

const Hero = () => {
    const { t } = useLanguage();

    const isMobile = useIsMobile();

    const videoRef = React.useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay prevented", error);
            });
        }
    }, []);

    return (
        <section className="hero-section">

            {/* ── Background — video fills width, section height auto-matches ── */}
            <video
                ref={videoRef}
                className="hero-bg-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
            >
                <source src="/hero-video.mp4" type="video/mp4" />
            </video>

            {/* ── Dark tint overlay ── */}
            <div className="hero-overlay" />


            {/* ── CENTER content ── */}
            <div className="hero-content" style={{ gap: isMobile ? '25px' : '35px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-logo-row"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {/* International Badge */}
                        <div style={{ 
                            padding: '8px 20px', 
                            background: 'rgba(255,255,255,0.1)', 
                            backdropFilter: 'blur(10px)', 
                            borderRadius: '100px', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            marginBottom: '25px'
                        }}>
                            Modern Islamic Excellence
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '30px' }}>
                            <img
                                src="/logo_new.webp"
                                alt="SD Islam Modern Al-Fakhir"
                                className="hero-logo-img"
                                style={{ height: isMobile ? '65px' : '90px', width: 'auto' }}
                                fetchPriority="high"
                            />
                            <div className="hero-text-container" style={{ borderLeft: isMobile ? 'none' : '2px solid rgba(255,255,255,0.3)', paddingLeft: isMobile ? 0 : '30px', textAlign: 'left' }}>
                                <div className="hero-school-name" style={{ fontSize: isMobile ? '0.7rem' : '0.9rem', fontWeight: 600, opacity: 0.8 }}>
                                     {t('hero', 'schoolName')}
                                </div>
                                <h1 className="hero-school-type" style={{ 
                                    fontSize: isMobile ? '2.2rem' : '4.2rem', 
                                    fontFamily: 'var(--font-display)', 
                                    fontWeight: 400,
                                    margin: 0,
                                    fontStyle: 'italic',
                                    letterSpacing: '-1px'
                                }}>
                                     {t('hero', 'schoolType')}
                                </h1>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="hero-tagline"
                    style={{ 
                        fontSize: isMobile ? '0.95rem' : '1.3rem', 
                        maxWidth: '800px', 
                        lineHeight: 1.6, 
                        fontWeight: 400,
                        opacity: 0.9,
                        letterSpacing: '0.5px'
                    }}
                >
                    {t('hero', 'tagline')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="hero-actions"
                >
                    <div className="hero-btn-row">
                      <Link href="/pendaftaran" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                          <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              className="hero-btn-primary"
                          >
                              {t('hero', 'btn')}
                          </motion.button>
                      </Link>
                      <Link href="/fasilitas" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                          <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              className="hero-btn-secondary"
                          >
                              {t('hero', 'btn2')}
                          </motion.button>
                      </Link>
                    </div>
                </motion.div>
            </div>
        </section>

    );
};

export default Hero;
