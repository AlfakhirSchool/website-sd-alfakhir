"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { C, radius } from './ui';

// The Google button is rendered into #google-signIn-btn-container by page.jsx.
export default function LoginScreen({ error }) {
    return (
        <div style={{ minHeight: '100vh', background: C.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '"DM Sans", "Poppins", sans-serif' }}>
            <div style={{ width: '100%', maxWidth: 420, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: '44px 36px', textAlign: 'center', boxShadow: '0 20px 60px rgba(28,24,20,0.07)' }}>
                <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 20 }} />
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.5px' }}>Admin sign in</h1>
                <p style={{ margin: '8px 0 28px', fontSize: '0.9rem', color: C.muted }}>SD Islam Modern Al-Fakhir. Sign in with the school Google account.</p>

                {error && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', padding: '12px 14px', marginBottom: 20, borderRadius: radius.md, background: C.redSoft, color: C.red, fontSize: '0.84rem', fontWeight: 500 }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} /> <span>{error}</span>
                    </div>
                )}

                <div id="google-signIn-btn-container" style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
                <p style={{ margin: '28px 0 0', fontSize: '0.74rem', color: C.muted }}>Only the school administrator account can access this page.</p>
            </div>
        </div>
    );
}
