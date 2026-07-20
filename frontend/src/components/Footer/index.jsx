"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import SmartImage from '../SmartImage';
import "./Footer.css";

const logo = '/logo_new.webp';

const Footer = () => {
    const { t } = useLanguage();
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        setIsMobile(window.innerWidth <= 768);
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <footer>

            {/* ━━━ SOCIAL + CTA SECTION ━━━ */}
            {isHome && (
                <section className="footer-social-section">
                    <div className="footer-social-container">

                        {/* Title Section - Centered Quick Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="footer-social-title-container"
                        >
                            <h2 className="footer-social-title">
                                {t('footer', 'linksTitle')}
                            </h2>
                        </motion.div>

                        {/* Instagram + YouTube cards - Grid 1x2 */}
                        <div className="footer-cards-grid">
                            {/* Instagram */}
                            <motion.a
                                href="https://www.instagram.com/sdi.alfakhir"
                                target="_blank" rel="noopener noreferrer"
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="footer-social-card"
                                style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                            >
                                {/* Interactive Tint Overlay */}
                                <motion.div
                                    variants={{
                                        rest: { opacity: 0 },
                                        hover: { opacity: 0.15 }
                                    }}
                                    transition={{ duration: 0.4 }}
                                    className="footer-card-overlay"
                                    style={{ background: '#000' }}
                                />

                                <div className="footer-card-content">
                                    <div className="footer-card-icon-wrapper">
                                        <Instagram size={30} color="white" strokeWidth={2.5} />
                                    </div>
                                    <div className="footer-card-text">
                                        <h3 className="footer-card-h3" style={{ fontSize: isMobile ? '1.4rem' : '1.7rem' }}>{t('footer', 'instaTitle')}</h3>
                                        <p className="footer-card-p" style={{ fontSize: isMobile ? '0.8rem' : '0.92rem' }}>{t('footer', 'instaDesc')}</p>
                                    </div>
                                    <ArrowUpRight size={24} color="white" style={{ opacity: 0.8 }} />
                                </div>
                            </motion.a>

                            {/* YouTube */}
                            <motion.a
                                href="https://www.youtube.com/@alfakhirdepok"
                                target="_blank" rel="noopener noreferrer"
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="footer-social-card"
                                style={{ background: '#CC0000' }}
                            >
                                {/* Interactive Tint Overlay */}
                                <motion.div
                                    variants={{
                                        rest: { opacity: 0 },
                                        hover: { opacity: 0.15 }
                                    }}
                                    transition={{ duration: 0.4 }}
                                    className="footer-card-overlay"
                                    style={{ background: '#000' }}
                                />

                                <div className="footer-card-content">
                                    <div className="footer-card-icon-wrapper">
                                        <Youtube size={30} color="white" strokeWidth={2.5} />
                                    </div>
                                    <div className="footer-card-text">
                                        <h3 className="footer-card-h3" style={{ fontSize: isMobile ? '1.4rem' : '1.7rem' }}>{t('footer', 'ytTitle')}</h3>
                                        <p className="footer-card-p" style={{ fontSize: isMobile ? '0.8rem' : '0.92rem' }}>{t('footer', 'ytDesc')}</p>
                                    </div>
                                    <ArrowUpRight size={24} color="white" style={{ opacity: 0.8 }} />
                                </div>
                            </motion.a>
                        </div>

                        {/* 3-Button CTA row — EXACTLY Pribadi Bandung */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="footer-cta-grid"
                        >
                            <Link href="/news" style={{ textDecoration: 'none' }}>
                                <motion.button 
                                    whileHover={{ background: '#cbd5e1', scale: 1.02 }}
                                    className="footer-cta-btn footer-cta-secondary"
                                >
                                    <span>📰 {t('footer', 'latestNews')}</span>
                                </motion.button>
                            </Link>

                            <Link href="/pendaftaran" style={{ textDecoration: 'none' }}>
                                <motion.button 
                                    whileHover={{ background: '#f59e0b', scale: 1.02 }}
                                    className="footer-cta-btn footer-cta-primary"
                                >
                                    <span>👤 {t('footer', 'registerNow')}</span>
                                </motion.button>
                            </Link>

                            <Link href="/kontak" style={{ textDecoration: 'none' }}>
                                <motion.button 
                                    whileHover={{ background: '#cbd5e1', scale: 1.02 }}
                                    className="footer-cta-btn footer-cta-secondary"
                                >
                                    <span>💬 {t('footer', 'anyQuestions')}</span>
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ━━━ LIGHT FOOTER — exactly Pribadi Bandung #eef0f3 ━━━ */}
            <div className="footer-main">
                {/* ── Decorative circle emblems at the edges — like Pribadi Bandung ── */}
                <div className="footer-main-watermark" style={{ right: '-80px', bottom: '-60px', width: '340px', height: '340px', opacity: 0.06 }}>
                    <img src="/logo_new.webp" alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="footer-main-watermark" style={{ left: '-100px', top: '-40px', width: '280px', height: '280px', opacity: 0.04 }}>
                    <img src="/logo_new.webp" alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="footer-main-grid">

                    {/* Left: Logo + tagline + social icons */}
                    <div className="footer-brand-info">
                        <div className="footer-brand-logo-row">
                            <img src={logo} alt="SD Islam Modern Al-Fakhir Official Logo" style={{ height: '50px', width: 'auto' }} />
                            <div>
                                <div className="footer-brand-text-small">SD Islam Modern</div>
                                <div className="footer-brand-text-large">AL-FAKHIR</div>
                            </div>
                        </div>
                        <p className="footer-brand-desc">
                            {t('footer', 'desc')}
                        </p>
                        {/* Social circle icons — like Pribadi Bandung */}
                        <div className="footer-social-circles">
                            {[
                                { href: 'https://www.youtube.com/@alfakhirdepok', icon: <Youtube size={17} /> },
                                { href: 'https://www.instagram.com/sdi.alfakhir', icon: <Instagram size={17} /> },
                            ].map((s, i) => (
                                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                                    className="footer-social-circle"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right: Email + Alamat — like Pribadi Bandung */}
                    <div className="footer-contact-col">
                        <div>
                            <p className="footer-contact-title">{t('footer', 'emailTitle')}</p>
                            <a href="mailto:sdialfakhir@gmail.com" className="footer-contact-link">
                                sdialfakhir@gmail.com
                            </a>
                        </div>
                        <div>
                            <p className="footer-contact-title">{t('footer', 'addressTitle')}</p>
                            <p className="footer-contact-p">
                                Jl. Kemang, Pasir Putih, Kec. Sawangan,<br />
                                Kota Depok, Jawa Barat 16519
                            </p>
                        </div>
                        <div>
                            <p className="footer-contact-title">{t('footer', 'waTitle')}</p>
                            <a href="https://wa.me/628139526221" className="footer-contact-link">
                                +62 813-9526-221
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom copyright — centered like Pribadi Bandung */}
                <div className="footer-copyright-section">
                    <p className="footer-copyright-text">
                        {t('footer', 'copyright')}
                    </p>
                    <p className="footer-dev-text">
                        Developer by Feri
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
