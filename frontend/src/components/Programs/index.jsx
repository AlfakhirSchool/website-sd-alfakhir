"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../SmartImage';
import { useIsMobile } from '../../hooks/useIsMobile';
import "./Programs.css";

const Programs = () => {
    const { t } = useLanguage();
    const isMobile = useIsMobile();

    const cards = [
        {
            label: t('programs', 'card1_lbl'),
            subtitle: t('programs', 'card1_sub'),
            href: '/sejarah',
            imgSrc: '/program-1.webp',
        },
        {
            label: t('programs', 'card2_lbl'),
            subtitle: t('programs', 'card2_sub'),
            href: '/pendaftaran',
            imgSrc: '/program-2.webp',
        },
        {
            label: t('programs', 'card3_lbl'),
            subtitle: t('programs', 'card3_sub'),
            href: '/galeri',
            imgSrc: '/program-3.webp',
        },
    ];

    return (
        <section className="programs-section">
            {/* Decorative circle emblems at the edges */}
            {!isMobile && (
                <>
                <div
                    className="programs-watermark"
                    style={{
                        left: '-120px', top: '50%', transform: 'translateY(-50%)',
                        width: '380px', height: '380px'
                    }}
                >
                    <img src="/logo_new.webp" alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div
                    className="programs-watermark"
                    style={{
                        right: '-140px', top: '20%', width: '320px', height: '320px',
                        opacity: 0.04
                    }}
                >
                    <img src="/logo_new.webp" alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                </>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                    className="programs-header"
                >
                    <div className="programs-header-line" />
                    <span className="programs-header-text">
                        {t('programs', 'explore')}
                    </span>
                    <div className="programs-header-line" />
                </div>

                {/* 3 Cards — narrow container with small gaps, rounded corners like Pribadi Bandung */}
                <div className="programs-grid">
                    {cards.map((c, i) => (
                        <Link key={i} href={c.href} className="program-card-link">
                            <motion.div
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="program-card"
                            >
                                {/* 1. The Original Image - Zooms on hover */}
                                <motion.img
                                    variants={{ hover: { scale: 1.12 } }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    src={c.imgSrc}
                                    alt={c.label}
                                    className="program-card-img"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                />

                                {/* 2. Dark Tint Overlay - Fades on hover */}
                                <motion.div
                                    variants={{
                                        rest: { opacity: 1 },
                                        hover: { opacity: 0 }
                                    }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="program-card-tint"
                                />

                                {/* 3. The Bottom Shadow Gradient - Stronger for text readability */}
                                <motion.div
                                    variants={{
                                        rest: { opacity: 1 },
                                        hover: { opacity: 0.8 }
                                    }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="program-card-gradient"
                                />

                                {/* 4. Text Content - Always remains bright and high contrast */}
                                <div className="program-card-content">
                                    <h3 className="program-card-title">
                                        {c.label}
                                    </h3>
                                    <p className="program-card-subtitle">
                                        {c.subtitle}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Programs;
