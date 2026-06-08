"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Programs from '@/components/Programs';
import Footer from '@/components/Footer';

/**
 * Homepage mengikuti struktur Pribadi Bandung:
 * 1. Floating Pill Navbar
 * 2. Hero — full-screen 3D gedung bergerak
 * 3. Program Cards — 3 kartu keunggulan
 * 4. Footer — Sosmed cards + 3 CTA buttons + info footer
 */

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Programs />
      </main>
      <Footer />
    </>
  );
}
