"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileAnnouncements from '@/components/ProfileAnnouncements';

export default function ProfilSiswaPage() {
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar theme="light" />
            <ProfileAnnouncements />
            <Footer />
        </div>
    );
}
