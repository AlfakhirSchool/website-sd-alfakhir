"use client";

// Shared look for every admin tab. Keep tabs on these primitives so the
// dashboard stays consistent: one accent colour, white cards on a warm page,
// 1px borders, 12-16px radii.

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export const C = {
    page: '#f5f2ec',
    surface: '#ffffff',
    soft: '#faf8f4',
    line: '#e8e2d8',
    ink: '#1c1814',
    text: '#4a4238',
    muted: '#8a8076',
    accent: '#c97a0a',
    accentDark: '#a86208',
    accentSoft: '#fcf0dc',
    teal: '#0f766e',
    tealSoft: '#e3f3f0',
    blue: '#3b5bb5',
    blueSoft: '#e8eefb',
    red: '#c0392b',
    redSoft: '#fbeaea',
    amberSoft: '#fdf1dc',
    neutralSoft: '#f1ece3',
};

export const radius = { sm: 10, md: 14, lg: 18 };

const VARIANTS = {
    primary: { background: C.accent, color: '#fff', border: `1px solid ${C.accent}`, hover: C.accentDark },
    dark: { background: C.ink, color: '#fff', border: `1px solid ${C.ink}`, hover: '#000' },
    secondary: { background: C.surface, color: C.ink, border: `1px solid ${C.line}`, hover: C.soft },
    ghost: { background: 'transparent', color: C.text, border: '1px solid transparent', hover: C.neutralSoft },
    danger: { background: 'transparent', color: C.red, border: '1px solid transparent', hover: C.redSoft },
};

export function Button({ variant = 'secondary', icon: Icon, size = 'md', children, style, disabled, ...rest }) {
    const v = VARIANTS[variant];
    return (
        <button
            disabled={disabled}
            {...rest}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: size === 'sm' ? '7px 12px' : '10px 16px', borderRadius: radius.md,
                background: v.background, color: v.color, border: v.border,
                fontSize: size === 'sm' ? '0.78rem' : '0.84rem', fontWeight: 600, fontFamily: 'inherit',
                cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
                transition: 'background-color 0.15s, border-color 0.15s', whiteSpace: 'nowrap', ...style,
            }}
            onMouseOver={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
            onMouseOut={e => { e.currentTarget.style.background = v.background; }}
        >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
            {children}
        </button>
    );
}

export function IconButton({ icon: Icon, tone = 'neutral', size = 16, label, style, ...rest }) {
    const hoverBg = tone === 'danger' ? C.redSoft : C.neutralSoft;
    const hoverFg = tone === 'danger' ? C.red : C.ink;
    return (
        <button
            aria-label={label}
            title={label}
            {...rest}
            style={{ background: 'transparent', border: 'none', padding: 8, borderRadius: radius.sm, cursor: 'pointer', color: C.muted, display: 'inline-flex', transition: 'background-color 0.15s, color 0.15s', ...style }}
            onMouseOver={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverFg; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
        >
            <Icon size={size} />
        </button>
    );
}

export function Card({ children, padding = 24, style, ...rest }) {
    return (
        <div {...rest} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: radius.lg, padding, ...style }}>
            {children}
        </div>
    );
}

export function SectionTitle({ title, hint, action }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: C.ink }}>{title}</h3>
                {hint && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: C.muted }}>{hint}</p>}
            </div>
            {action}
        </div>
    );
}

const TONES = {
    ok: [C.tealSoft, C.teal], wait: [C.amberSoft, '#a8650a'], idle: [C.neutralSoft, '#6f6558'],
    info: [C.blueSoft, C.blue], bad: [C.redSoft, C.red],
};
export function Pill({ tone = 'idle', dot = true, children }) {
    const [bg, fg] = TONES[tone];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, background: bg, color: fg, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: fg }} />}
            {children}
        </span>
    );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'idle', active, onClick }) {
    const [bg, fg] = TONES[tone];
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            onClick={onClick}
            style={{
                textAlign: 'left', padding: '18px 20px', borderRadius: radius.lg, background: C.surface, fontFamily: 'inherit',
                border: `1px solid ${active ? fg : C.line}`, boxShadow: active ? `0 0 0 3px ${bg}` : 'none',
                display: 'flex', alignItems: 'center', gap: 16, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
        >
            {Icon && (
                <span style={{ width: 44, height: 44, borderRadius: radius.md, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} />
                </span>
            )}
            <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '1.55rem', fontWeight: 700, color: C.ink, lineHeight: 1 }}>{value}</span>
                <span style={{ display: 'block', marginTop: 6, fontSize: '0.74rem', fontWeight: 600, color: C.muted }}>{label}</span>
                {hint && <span style={{ display: 'block', marginTop: 2, fontSize: '0.7rem', color: C.muted }}>{hint}</span>}
            </span>
        </Tag>
    );
}

export function StatGrid({ children, min = 210 }) {
    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 14 }}>{children}</div>;
}

export function Toolbar({ left, right, style }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', ...style }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>{left}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>{right}</div>
        </div>
    );
}

export const inputStyle = (bad) => ({
    width: '100%', padding: '11px 14px', borderRadius: radius.md, border: `1px solid ${bad ? '#e6b3ac' : C.line}`,
    background: bad ? '#fdf4f2' : C.surface, fontSize: '0.88rem', fontWeight: 500, color: C.ink, outline: 'none', fontFamily: 'inherit',
});

export function SearchInput({ value, onChange, placeholder, width = 340 }) {
    return (
        <div style={{ position: 'relative', flex: 1, maxWidth: width, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle(false), paddingLeft: 40 }} />
        </div>
    );
}

export function Select({ style, children, ...rest }) {
    return <select {...rest} style={{ ...inputStyle(false), width: 'auto', cursor: 'pointer', fontWeight: 600, ...style }}>{children}</select>;
}

export function Field({ label, error, hint, children }) {
    return (
        <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: '0.78rem', fontWeight: 600, color: C.text }}>{label}</span>
            {children}
            {hint && !error && <span style={{ display: 'block', marginTop: 6, fontSize: '0.74rem', color: C.muted }}>{hint}</span>}
            {error && <span style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', fontWeight: 600, color: C.red }}>{error}</span>}
        </label>
    );
}

export function Notice({ tone = 'ok', children, onClose, style }) {
    const [bg, fg] = TONES[tone];
    return (
        <div style={{ padding: '12px 16px', borderRadius: radius.md, background: bg, color: fg, fontSize: '0.84rem', fontWeight: 600, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', ...style }}>
            <span>{children}</span>
            {onClose && <button onClick={onClose} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: fg, cursor: 'pointer', display: 'flex', padding: 2 }}><X size={16} /></button>}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text, children }) {
    return (
        <div style={{ padding: '56px 24px', borderRadius: radius.lg, border: `1px dashed ${C.line}`, background: C.soft, textAlign: 'center' }}>
            {Icon && <Icon size={34} color={C.muted} style={{ opacity: 0.6, marginBottom: 14 }} />}
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: C.ink }}>{title}</div>
            {text && <div style={{ margin: '8px auto 0', maxWidth: 420, fontSize: '0.86rem', lineHeight: 1.6, color: C.muted }}>{text}</div>}
            {children && <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>{children}</div>}
        </div>
    );
}

export function Avatar({ name = '', size = 44, src }) {
    const palette = [[C.amberSoft, '#a8650a'], [C.tealSoft, C.teal], [C.blueSoft, C.blue], ['#f6e8f1', '#a23a7c'], ['#eef3e2', '#5b7a1f'], [C.redSoft, '#b4482c']];
    const [bg, fg] = palette[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % palette.length];
    if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: radius.md, objectFit: 'cover', flexShrink: 0 }} />;
    const text = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
    return (
        <div style={{ width: size, height: size, borderRadius: radius.md, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700, flexShrink: 0 }}>
            {text}
        </div>
    );
}

export function Segmented({ value, onChange, options }) {
    return (
        <div style={{ display: 'inline-flex', padding: 4, background: C.neutralSoft, borderRadius: radius.md, gap: 2 }}>
            {options.map(o => (
                <button
                    key={o.value}
                    onClick={() => onChange(o.value)}
                    style={{ padding: '7px 14px', borderRadius: radius.sm, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, background: value === o.value ? C.surface : 'transparent', color: value === o.value ? C.ink : C.muted, boxShadow: value === o.value ? '0 1px 2px rgba(28,24,20,0.08)' : 'none' }}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

// Table look shared by data-heavy tabs.
export const table = {
    wrap: { position: 'relative', overflowX: 'auto', border: `1px solid ${C.line}`, borderRadius: radius.lg, background: C.surface },
    el: { width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', background: C.soft, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' },
    td: { padding: '12px 16px', borderBottom: `1px solid ${C.line}`, verticalAlign: 'middle', color: C.text },
};

export function Drawer({ open, title, subtitle, onClose, footer, children, width = 440 }) {
    const closeRef = useRef(onClose);
    useEffect(() => { closeRef.current = onClose; });
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && closeRef.current();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div key="shade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(28,24,20,0.35)', zIndex: 1200 }} />
                    <motion.aside
                        key="panel" role="dialog" aria-modal="true" aria-label={title}
                        initial={{ x: width + 20 }} animate={{ x: 0 }} exit={{ x: width + 20 }} transition={{ type: 'tween', duration: 0.22 }}
                        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: `min(${width}px, 100vw)`, background: C.surface, zIndex: 1201, boxShadow: '-20px 0 60px rgba(28,24,20,0.15)', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '22px 26px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.ink }}>{title}</div>
                                {subtitle && <div style={{ marginTop: 4, fontSize: '0.78rem', color: C.muted }}>{subtitle}</div>}
                            </div>
                            <IconButton icon={X} label="Close" size={20} onClick={onClose} />
                        </div>
                        <div style={{ padding: 26, overflowY: 'auto', flex: 1 }}>{children}</div>
                        {footer && <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{footer}</div>}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

export const isUrl = (v) => /^https?:\/\/\S+$/i.test((v || '').trim());
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
