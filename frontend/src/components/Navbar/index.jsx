"use client";
import React, { useState, useEffect } from "react";
import { X, Menu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import "./Navbar.css";


const logo = "/logo_new.webp";


// Inline SVG flags for reliable cross-platform rendering
const FlagID = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" className="navbar-flag-svg">
    <rect width="22" height="8" fill="#CE1126"/>
    <rect y="8" width="22" height="8" fill="#FFFFFF"/>
  </svg>
);

const FlagGB = () => (
  <svg width="22" height="16" viewBox="0 0 60 40" className="navbar-flag-svg">
    <rect width="60" height="40" fill="#012169"/>
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8"/>
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5"/>
    <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12"/>
    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7"/>
  </svg>
);

const Navbar = () => {
  const { t, langCode, changeLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 1024);
    const onResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", onResize);
    return () => {
        window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Lock body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);


  return (
    <>
      {/* ── Floating Pill Navbar ── */}
      <nav className="navbar-nav">
        <div className="navbar-container">
          {/* LEFT: Registration (Desktop) + Flags (Mobile Only) */}
          <div className="navbar-left">
            <Link href="/pendaftaran" style={{ textDecoration: "none" }} className="hide-mobile">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="navbar-reg-btn"
              >
                <span>👤</span>
                <span>{t('nav', 'ppdbBtn')}</span>
              </motion.button>
            </Link>

            {/* Language Flags (Mobile Side) */}
            {isMobile && (
              <div className="navbar-flags">
                <button
                  onClick={() => changeLanguage('GB')}
                  className="navbar-flag-btn"
                  style={{ 
                    background: langCode === 'GB' ? 'rgba(249,140,29,0.12)' : 'transparent', 
                    border: langCode === 'GB' ? '1.5px solid rgba(249,140,29,0.5)' : '1.5px solid transparent'
                  }}
                ><FlagGB /></button>
                <button
                  onClick={() => changeLanguage('ID')}
                  className="navbar-flag-btn"
                  style={{ 
                    background: langCode === 'ID' ? 'rgba(249,140,29,0.12)' : 'transparent', 
                    border: langCode === 'ID' ? '1.5px solid rgba(249,140,29,0.5)' : '1.5px solid transparent'
                  }}
                ><FlagID /></button>
              </div>
            )}
          </div>

          {/* CENTER: Logo (Absolute Center) */}
          <Link href="/" className="navbar-center-logo">
            <img src={logo} alt="SD Islam Modern Al-Fakhir Logo" style={{ height: isMobile ? "32px" : "38px", width: "auto" }} />
            <div className="navbar-logo-text-container hide-mobile">
              <span className="navbar-logo-title">AL-FAKHIR</span>
              <span className="navbar-logo-subtitle">Islamic Modern</span>
            </div>
          </Link>

          {/* RIGHT: Flags (Desktop Side) + Hamburger Menu */}
          <div className="navbar-right">
            
            {/* Flags for Desktop only */}
            {!isMobile && (
              <div className="navbar-flags">
                <button
                  onClick={() => changeLanguage('GB')}
                  className="navbar-flag-btn navbar-flag-btn-desktop"
                  style={{ 
                    background: langCode === 'GB' ? 'rgba(249,140,29,0.12)' : 'transparent', 
                    border: langCode === 'GB' ? '1.5px solid rgba(249,140,29,0.5)' : '1.5px solid transparent' 
                  }}
                ><FlagGB /></button>
                <button
                  onClick={() => changeLanguage('ID')}
                  className="navbar-flag-btn navbar-flag-btn-desktop"
                  style={{ 
                    background: langCode === 'ID' ? 'rgba(249,140,29,0.12)' : 'transparent', 
                    border: langCode === 'ID' ? '1.5px solid rgba(249,140,29,0.5)' : '1.5px solid transparent' 
                  }}
                ><FlagID /></button>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="navbar-menu-btn"
              style={{ padding: isMobile ? "8px 14px" : "8px 20px" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(15,23,42,0.1)"}
            >
              <Menu size={18} strokeWidth={3} />
              <span>{t('nav', 'menuBtn')}</span>
            </button>
          </div>
        </div>

      </nav>

      {/* ── MOBILE MENU DROPDOWN — Full-Width Grid, i18n Labels ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="menu-backdrop"
            />

            {/* Menu Panel — Side Drawer (HP) or Compact Grid (Laptop) */}
            <motion.div
              initial={isMobile ? { x: "100%" } : { opacity: 0, y: -20, scale: 0.98, x: "-50%" }}
              animate={isMobile ? { x: 0 } : { opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={isMobile ? { x: "100%" } : { opacity: 0, y: -20, scale: 0.98, x: "-50%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="menu-panel"
              style={{
                top: isMobile ? 0 : "100px",
                right: isMobile ? 0 : "auto",
                left: isMobile ? "auto" : "50%",
                width: isMobile ? "85%" : "880px",
                height: isMobile ? "100vh" : "auto",
                maxHeight: isMobile ? "none" : "80vh",
                boxShadow: isMobile ? "-10px 0 50px rgba(0,0,0,0.1)" : "0 40px 100px -20px rgba(0,0,0,0.25)",
                padding: isMobile ? "24px 20px" : "32px",
                borderTopLeftRadius: "32px",
                borderBottomLeftRadius: isMobile ? "32px" : "0",
                borderTopRightRadius: isMobile ? "0" : "32px",
                borderBottomRightRadius: isMobile ? "0" : "32px",
                borderRadius: isMobile ? "none" : "32px",
              }}
            >
              {/* ── Header ── */}
              <div className="menu-header">
                <div className="menu-directory-label">
                  <div className="menu-dot" />
                  <span className="menu-directory-text">
                    {t('nav', 'menu.directory')}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="menu-close-btn"
                  onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#f1f5f9"}
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              {/* ── Navigation List — Vertical Single Column ── */}
              <div
                className="menu-nav-list"
                style={{
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: isMobile ? "2px" : "12px",
                }}
              >
                {[
                  { label: t('nav','menu.home'),       sub: t('nav','menu.home_sub'),       href: "/"          },
                  { label: t('nav','menu.principal'),  sub: t('nav','menu.principal_sub'),  href: "/sambutan"  },
                  { label: t('nav','menu.history'),    sub: t('nav','menu.history_sub'),    href: "/sejarah"   },
                  { label: t('nav','menu.vision'),     sub: t('nav','menu.vision_sub'),     href: "/visimisi"  },
                  { label: t('nav','menu.structure'),  sub: t('nav','menu.structure_sub'),  href: "/struktur"  },
                  { label: t('nav','menu.faculty'),    sub: t('nav','menu.faculty_sub'),    href: "/staff"     },
                  { label: t('nav','menu.facilities'), sub: t('nav','menu.facilities_sub'), href: "/fasilitas" },
                  { label: t('nav','menu.gallery'),    sub: t('nav','menu.gallery_sub'),    href: "/galeri"    },
                  { label: t('nav','menu.ppdb'),       sub: t('nav','menu.ppdb_sub'),       href: "/ppdb"      },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ease: "easeOut" }}
                  >
                    <Link
                      href={item.label === t('nav','menu.ppdb') ? "/ppdb" : item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="menu-link-item"
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(249,140,29,0.05)";
                        e.currentTarget.children[0].children[0].style.color = "var(--primary)";
                        e.currentTarget.children[1].style.opacity = "1";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.children[0].children[0].style.color = "#0f172a";
                        e.currentTarget.children[1].style.opacity = "0";
                      }}
                    >
                      <div>
                        <div className="menu-link-label">{item.label}</div>
                        <div className="menu-link-sub">{item.sub}</div>
                      </div>
                      <ChevronRight size={16} strokeWidth={3} className="menu-chevron" />
                    </Link>
                    {i < (isMobile ? 8 : 0) && <div className="menu-separator" />}
                  </motion.div>
                ))}
              </div>

              {/* ── Bottom Actions ── */}
              <div className="menu-bottom-actions" style={{ flexDirection: isMobile ? "column" : "row" }}>
                <Link href="/ppdb" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none", flex: 2 }}>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="menu-cta-primary"
                  >
                    {t('nav', 'menu.cta_primary')}
                    <ChevronRight size={18} strokeWidth={3} />
                  </motion.button>
                </Link>
                <Link href="/kontak" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', flex: 1 }}>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2, background: "#f8fafc" }}
                    whileTap={{ scale: 0.97 }}
                    className="menu-cta-secondary"
                  >
                    {t('nav', 'menu.cta_secondary')}
                  </motion.button>
                </Link>
              </div>

              <img
                src={logo}
                alt="SD Islam Modern Al-Fakhir Watermark Logo"
                className="menu-watermark"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
  </>
);
};

export default Navbar;
