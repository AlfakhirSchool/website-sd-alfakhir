"use client";

import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LogOut, Menu, RefreshCw, X } from 'lucide-react';
import { C, Avatar, IconButton, radius } from './ui';
import { useIsMobile } from '@/hooks/useIsMobile';

// Toast and "Syncing" live in their own components and are driven through refs,
// so showing a message or toggling the spinner never re-renders the page or the
// active tab underneath.
export const Toaster = forwardRef(function Toaster(_, ref) {
    const [toast, setToast] = useState(null);
    const timer = useRef(null);
    useImperativeHandle(ref, () => ({
        show(tone, text) {
            clearTimeout(timer.current);
            setToast({ tone, text });
            timer.current = setTimeout(() => setToast(null), tone === 'bad' ? 8000 : 3500);
        },
    }), []);

    if (!toast) return null;
    const bad = toast.tone === 'bad';
    return (
        <div role="status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1300, maxWidth: 420, display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: radius.md, background: C.surface, border: `1px solid ${bad ? '#e6b3ac' : '#bfe0d9'}`, boxShadow: '0 12px 40px rgba(28,24,20,0.14)' }}>
            {bad ? <AlertCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} /> : <CheckCircle2 size={18} color={C.teal} style={{ flexShrink: 0, marginTop: 1 }} />}
            <span style={{ fontSize: '0.86rem', lineHeight: 1.5, fontWeight: 500 }}>{toast.text}</span>
            <IconButton icon={X} size={14} label="Dismiss" onClick={() => setToast(null)} style={{ padding: 2, marginLeft: 4 }} />
        </div>
    );
});

export const SyncBadge = forwardRef(function SyncBadge(_, ref) {
    const [count, setCount] = useState(0);
    useImperativeHandle(ref, () => ({ set: (on) => setCount(c => Math.max(0, c + (on ? 1 : -1))) }), []);
    if (count === 0) return null;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600, color: C.muted }}>
            <RefreshCw size={14} style={{ animation: 'shell-spin 0.9s linear infinite' }} /> Syncing
        </span>
    );
});

const Sidebar = memo(function Sidebar({ nav, active, onNavigate, onPrefetch, adminEmail, onLogout, onClose, mobile }) {
    return (
        <aside style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: 248, zIndex: 100, background: C.surface, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir" width={36} height={36} style={{ objectFit: 'contain' }} />
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>Al-Fakhir</div>
                        <div style={{ fontSize: '0.72rem', color: C.muted }}>School admin</div>
                    </div>
                </div>
                {mobile && <IconButton icon={X} label="Close menu" onClick={onClose} />}
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px' }}>
                {nav.map(group => (
                    <div key={group.label} style={{ marginTop: 18 }}>
                        <div style={{ padding: '0 10px 8px', fontSize: '0.7rem', fontWeight: 600, color: C.muted }}>{group.label}</div>
                        {group.items.map(item => {
                            const on = active === item.tab;
                            return (
                                <button
                                    key={item.tab}
                                    onClick={() => onNavigate(item.tab)}
                                    onMouseEnter={() => onPrefetch?.(item.tab)}
                                    onFocus={() => onPrefetch?.(item.tab)}
                                    aria-current={on ? 'page' : undefined}
                                    className="shell-nav"
                                    data-on={on ? '1' : undefined}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 2, border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.86rem', fontWeight: on ? 600 : 500, textAlign: 'left', background: on ? C.accentSoft : 'transparent', color: on ? C.accentDark : C.text }}
                                >
                                    <item.icon size={18} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {item.badge > 0 && (
                                        <span style={{ minWidth: 20, padding: '1px 7px', borderRadius: 100, background: C.red, color: '#fff', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>{item.badge}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div style={{ padding: 14, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={adminEmail || 'Admin'} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Administrator</div>
                    <div style={{ fontSize: '0.7rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail || 'sdialfakhir@gmail.com'}</div>
                </div>
                <IconButton icon={LogOut} label="Log out" onClick={onLogout} />
            </div>
        </aside>
    );
});

/**
 * Dashboard frame: grouped sidebar, page header, toast area.
 *
 * Props: nav: {label, items: {tab, label, icon, badge?}[]}[] (keep referentially stable);
 * active; onNavigate(tab); onPrefetch(tab); title; subtitle; adminEmail; onLogout;
 * toastRef -> <Toaster/> handle; syncRef -> <SyncBadge/> handle; children.
 */
export default function Shell({ nav, active, onNavigate, onPrefetch, title, subtitle, adminEmail, onLogout, toastRef, syncRef, children }) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    const go = useCallback((tab) => { onNavigate(tab); setOpen(false); }, [onNavigate]);
    const close = useCallback(() => setOpen(false), []);

    return (
        <div style={{ minHeight: '100vh', background: C.page, color: C.ink, fontFamily: '"DM Sans", "Poppins", sans-serif' }}>
            {isMobile && (
                <div style={{ position: 'sticky', top: 0, zIndex: 90, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
                    <IconButton icon={Menu} size={20} label="Open menu" onClick={() => setOpen(true)} />
                    <img src="/logo_new.webp" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
                    <strong style={{ fontSize: '0.95rem' }}>Al-Fakhir admin</strong>
                </div>
            )}

            {isMobile && open && <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(28,24,20,0.35)', zIndex: 99 }} />}

            {(!isMobile || open) && (
                <Sidebar nav={nav} active={active} onNavigate={go} onPrefetch={onPrefetch} adminEmail={adminEmail} onLogout={onLogout} onClose={close} mobile={isMobile} />
            )}

            <main style={{ marginLeft: isMobile ? 0 : 248, padding: isMobile ? '24px 16px 60px' : '36px 44px 80px', overflowX: 'clip' }}>
                <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                    <header style={{ marginBottom: 26, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{title}</h1>
                            {subtitle && <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: C.muted }}>{subtitle}</p>}
                        </div>
                        <SyncBadge ref={syncRef} />
                    </header>
                    {children}
                </div>
            </main>

            <Toaster ref={toastRef} />
            <style>{`
                @keyframes shell-spin { to { transform: rotate(360deg); } }
                .shell-nav { transition: background-color 0.12s; }
                .shell-nav:not([data-on]):hover { background: ${C.neutralSoft} !important; }
            `}</style>
        </div>
    );
}
