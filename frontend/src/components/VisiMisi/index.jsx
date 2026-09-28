"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Stars, Zap, Target, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import "./VisiMisi.css";

const VisiMisi = () => {
    const { t } = useLanguage();
    const isMobile = useIsMobile();

    // Helper to get Misi items
    const getMisiItems = () => {
        return t('about', 'misiList') || [];
    };

    // Helper to get Goals items
    const getGoalsItems = () => {
        return t('about', 'goalsList') || [];
    };

    return (
        <section id="visimisi" className="visimisi-section">
            <div className="visimisi-container">
                
                <div className="visimisi-header">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="visimisi-badge"
                    >
                        <Target size={14} /> {t('about', 'cardBadge')}
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="visimisi-title"
                        style={{ fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 4vw, 2.8rem)' }}
                    >
                        {t('about', 'visiMisiSubtitle')}
                    </motion.h2>
                </div>

                <div className="visimisi-grid">
                    {/* Visi Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={isMobile ? {} : { y: -10 }}
                        className="visimisi-card visi-card"
                    >
                        <div className="card-bg-icon">
                            <Stars size={200} />
                        </div>
                        <div className="card-icon-container">
                            <Stars size={isMobile ? 28 : 32} color="#ffffff" />
                        </div>
                        <h3 className="card-title">
                            {t('about', 'visiTitle')}
                        </h3>
                        <div className="card-divider"></div>
                        <p className="visi-text" style={{ fontSize: isMobile ? '1rem' : '1.15rem' }}>
                            "{t('about', 'visiText')}"
                        </p>
                    </motion.div>

                    {/* Misi Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={isMobile ? {} : { y: -10 }}
                        className="visimisi-card misi-card"
                    >
                        <div className="card-bg-icon">
                            <Zap size={200} />
                        </div>
                        <div className="card-icon-container">
                            <Award size={isMobile ? 28 : 32} color="#ffffff" />
                        </div>
                        <h3 className="card-title">
                            {t('about', 'misiTitle')}
                        </h3>
                        <div className="card-divider"></div>
                        <div className="list-container">
                            {getMisiItems().map((misi, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
                                    viewport={{ once: true }}
                                    className="list-item"
                                >
                                    <div className="item-dot"></div>
                                    <p style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>{misi}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Goals Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        whileHover={isMobile ? {} : { y: -10 }}
                        className="visimisi-card goals-card"
                    >
                        <div className="card-bg-icon">
                            <Target size={200} />
                        </div>
                        <div className="card-icon-container">
                            <Target size={isMobile ? 28 : 32} color="#ffffff" />
                        </div>
                        <h3 className="card-title">
                            {t('about', 'goalsTitle')}
                        </h3>
                        <div className="card-divider"></div>
                        <div className="list-container">
                            {getGoalsItems().map((goal, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    viewport={{ once: true }}
                                    className="list-item"
                                >
                                    <div className="item-dot"></div>
                                    <p style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>{goal}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default VisiMisi;
