"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <Navbar theme="light" />

            {/* Subtle decorative blurred glowing elements */}
            <motion.div 
                animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                    position: 'absolute', top: '25%', left: '-10%', width: '400px', height: '400px', 
                    background: 'rgba(249, 140, 29, 0.04)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' 
                }} 
            />
            <motion.div 
                animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                    position: 'absolute', bottom: '20%', right: '-10%', width: '450px', height: '450px', 
                    background: 'rgba(31, 134, 146, 0.04)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' 
                }} 
            />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '160px 20px 100px', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                    {/* Glowing Error Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            display: 'inline-block', padding: '8px 24px', background: 'rgba(249, 140, 29, 0.1)', 
                            borderRadius: '100px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, 
                            letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1.5rem',
                            border: '1px solid rgba(249, 140, 29, 0.2)'
                        }}
                    >
                        Error 404
                    </motion.div>

                    {/* Massive 404 Heading */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ 
                            fontSize: 'clamp(5rem, 15vw, 9rem)', fontWeight: 700, margin: 0, 
                            lineHeight: 0.9, letterSpacing: '-4px', 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #0f172a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'var(--font-display)',
                            fontStyle: 'italic'
                        }}
                    >
                        404
                    </motion.h1>

                    {/* Subheading */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginTop: '20px', marginBottom: '12px', letterSpacing: '-0.5px' }}
                    >
                        Halaman Tidak Ditemukan
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 35px' }}
                    >
                        Maaf, halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau Anda salah memasukkan alamat URL. Mari kembali ke halaman utama.
                    </motion.p>

                    {/* Action Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, translateY: -3 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    padding: '18px 40px', background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '100px', fontWeight: 600, fontSize: '0.95rem',
                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
                                    boxShadow: '0 15px 30px rgba(31, 134, 146, 0.25)', transition: 'box-shadow 0.3s ease',
                                    textTransform: 'uppercase', letterSpacing: '1px'
                                }}
                            >
                                <Home size={18} strokeWidth={2.5} />
                                <span>Kembali ke Beranda</span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
