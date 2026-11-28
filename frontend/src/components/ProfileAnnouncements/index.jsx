"use client";

import React, { useState } from "react";
import { Search, ArrowUpRight, CalendarDays, ShieldCheck, Loader2, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import "./ProfileAnnouncements.css";

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Parents see nothing until they enter their child's NIS; the server returns
// only the profiles that match it, never the full list.
const ProfileAnnouncements = () => {
  const { t, langCode } = useLanguage();
  const locale = langCode === "GB" ? "en-GB" : "id-ID";
  const [nis, setNis] = useState("");
  const [results, setResults] = useState(null);
  const [searchedAt, setSearchedAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState("");

  const search = async (e) => {
    e.preventDefault();
    if (!nis.trim() || loading) return;
    setLoading(true);
    setProblem("");
    try {
      const res = await fetch(`/api/profiles/lookup?nis=${encodeURIComponent(nis.trim())}`);
      if (res.status === 429) { setProblem("tooMany"); setResults(null); return; }
      if (res.status === 400) { setProblem("invalid"); setResults(null); return; }
      if (!res.ok) throw new Error(String(res.status));
      setResults(await res.json());
      setSearchedAt(Date.now());
    } catch {
      setProblem("error");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const periodDate = (s) => { const [y, m] = s.period.split("-").map(Number); return new Date(y, m - 1, 1); };
  const monthYear = (s) => periodDate(s).toLocaleDateString(locale, { month: "long", year: "numeric" });
  const fullDate = (s) =>
    s.publishedAt ? new Date(s.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "-";
  const isNew = (s) => s.publishedAt && searchedAt - new Date(s.publishedAt).getTime() < NEW_WINDOW_MS;
  // Translation titles mark the accent word with *asterisks*, rendered in the display serif.
  const accentTitle = (s) => s.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
  const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const thisMonth = new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });

  const latest = results?.[0];
  const earlier = results?.slice(1) ?? [];

  return (
    <>
      <header className="pa-hero">
        <div className="pa-hero-grid">
          <div className="pa-hero-copy">
            <span className="pa-eyebrow">{t("profile_results", "badge")}</span>
            <h1 className="pa-title">{accentTitle(t("profile_results", "title"))}</h1>
            <p className="pa-sub">{t("profile_results", "subtitle")}</p>

            <form className="pa-form" onSubmit={search}>
              <label htmlFor="pa-nis">{t("profile_results", "nisLabel")}</label>
              <div className="pa-form-row">
                <div className="pa-input">
                  <Search size={20} />
                  <input
                    id="pa-nis"
                    value={nis}
                    onChange={(e) => setNis(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("profile_results", "nisPlaceholder")}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={25}
                  />
                </div>
                <button className="pa-submit" type="submit" disabled={loading || !nis.trim()}>
                  {loading ? <Loader2 size={18} className="pa-spin" /> : null}
                  {loading ? t("profile_results", "searching") : t("profile_results", "search")}
                </button>
              </div>
              <p className="pa-hint"><ShieldCheck size={14} /> {t("profile_results", "inputHint")}</p>
            </form>
          </div>

          <figure className="pa-photo" aria-hidden="true">
            <img src="/program-2.webp" alt="" />
            <figcaption className="pa-chip">
              <FileText size={20} />
              <span>
                <small>{t("profile_results", "latest")}</small>
                <strong>{thisMonth}</strong>
              </span>
            </figcaption>
          </figure>
        </div>
      </header>

      <main className="pa-col pa-main">
        {problem && <p className="pa-problem" role="alert">{t("profile_results", problem)}</p>}

        {results === null && !problem && (
          <section className="pa-steps">
            <h2>{t("profile_results", "hintTitle")}</h2>
            <ol>
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <span className="pa-step-no">{n}</span>
                  <div>
                    <strong>{t("profile_results", `stepTitle${n}`)}</strong>
                    <p>{t("profile_results", `hint${n}`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {results && results.length === 0 && (
          <div className="pa-empty">
            <FileText size={28} />
            <h3>{t("profile_results", "notFoundTitle")}</h3>
            <p>{t("profile_results", "notFoundDesc")}</p>
          </div>
        )}

        {latest && (
          <section className="pa-doc">
            <span className="pa-avatar" aria-hidden="true">{initials(latest.name)}</span>
            <div className="pa-doc-info">
              <div className="pa-doc-top">
                <span className="pa-doc-label">{t("profile_results", "latest")}</span>
                {isNew(latest) && <span className="pa-new">{t("profile_results", "newBadge")}</span>}
              </div>
              <h2>{latest.name}</h2>
              <p>
                <span><CalendarDays size={15} /> {t("profile_results", "period")} {monthYear(latest)}</span>
                <span>{t("profile_results", "uploadedOn")} {fullDate(latest)}</span>
              </p>
            </div>
            <a className="pa-cta" href={latest.pdfLink} target="_blank" rel="noopener noreferrer">
              <FileText size={18} /> {t("profile_results", "open")} <ArrowUpRight size={16} />
            </a>
          </section>
        )}

        {earlier.length > 0 && (
          <section className="pa-group">
            <h3 className="pa-month">{t("profile_results", "earlier")}</h3>
            <ol className="pa-ledger">
              {earlier.map((s) => (
                <li key={s.pdfLink}>
                  <a className="pa-row" href={s.pdfLink} target="_blank" rel="noopener noreferrer">
                    <span className="pa-row-period">{monthYear(s)}</span>
                    <span className="pa-row-date">{t("profile_results", "uploadedOn")} {fullDate(s)}</span>
                    <span className="pa-row-go" aria-label={t("profile_results", "open")}><ArrowUpRight size={18} /></span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="pa-note">
          <ShieldCheck size={18} /> {t("profile_results", "note")}
        </p>
      </main>
    </>
  );
};

export default ProfileAnnouncements;
