"use client";

import React, { useState } from "react";
import { Search, ArrowUpRight, CalendarDays, ShieldCheck, Loader2, Hash, FileText } from "lucide-react";
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
  const monthShort = (s) => periodDate(s).toLocaleDateString(locale, { month: "short" });
  const monthYear = (s) => periodDate(s).toLocaleDateString(locale, { month: "long", year: "numeric" });
  const fullDate = (s) =>
    s.publishedAt ? new Date(s.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : "-";
  const isNew = (s) => s.publishedAt && searchedAt - new Date(s.publishedAt).getTime() < NEW_WINDOW_MS;

  const latest = results?.[0];
  const earlier = results?.slice(1) ?? [];

  return (
    <>
      <header className="pa-hero">
        <div className="pa-wrap pa-hero-inner">
          <img className="pa-logo" src="/logo_new.webp" alt="SD Islam Modern Al-Fakhir" />
          <span className="pa-eyebrow">{t("profile_results", "badge")}</span>
          <h1 className="pa-title">{t("profile_results", "title")}</h1>
          <p className="pa-sub">{t("profile_results", "subtitle")}</p>

          <form className="pa-form" onSubmit={search}>
            <label className="pa-field">
              <span>{t("profile_results", "nisLabel")}</span>
              <div className="pa-input">
                <Search size={18} />
                <input
                  value={nis}
                  onChange={(e) => setNis(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("profile_results", "nisPlaceholder")}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={25}
                />
              </div>
            </label>
            <button className="pa-submit" type="submit" disabled={loading || !nis.trim()}>
              {loading ? <Loader2 size={18} className="pa-spin" /> : null}
              {loading ? t("profile_results", "searching") : t("profile_results", "search")}
            </button>
          </form>
        </div>
      </header>

      <main className="pa-wrap pa-main">
        {problem && <p className="pa-problem">{t("profile_results", problem)}</p>}

        {results === null && !problem && (
          <section className="pa-steps">
            <h2>{t("profile_results", "hintTitle")}</h2>
            <ol>
              {[[Hash, 1], [Search, 2], [FileText, 3]].map(([Icon, n]) => (
                <li key={n}>
                  <span className="pa-step-icon"><Icon size={20} /></span>
                  <strong>{t("profile_results", `stepTitle${n}`)}</strong>
                  <p>{t("profile_results", `hint${n}`)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {results && results.length === 0 && (
          <div className="pa-empty">
            <h3>{t("profile_results", "notFoundTitle")}</h3>
            <p>{t("profile_results", "notFoundDesc")}</p>
          </div>
        )}

        {latest && (
          <section className="pa-featured">
            <div className="pa-featured-date">
              <span className="pa-featured-label">{t("profile_results", "latest")}</span>
              <span className="pa-featured-day">{monthShort(latest)}</span>
              <span className="pa-featured-month">{periodDate(latest).getFullYear()}</span>
            </div>
            <div className="pa-featured-body">
              {isNew(latest) && <span className="pa-new pa-new-dark">{t("profile_results", "newBadge")}</span>}
              <h2>{latest.name}</h2>
              <p><CalendarDays size={15} /> {t("profile_results", "period")} {monthYear(latest)}</p>
              <p><CalendarDays size={15} /> {t("profile_results", "uploadedOn")} {fullDate(latest)}</p>
              <a className="pa-btn pa-btn-light" href={latest.pdfLink} target="_blank" rel="noopener noreferrer">
                {t("profile_results", "open")} <ArrowUpRight size={16} />
              </a>
            </div>
          </section>
        )}

        {earlier.length > 0 && (
          <section className="pa-group">
            <h3 className="pa-month">{t("profile_results", "earlier")}</h3>
            <ol className="pa-timeline">
              {earlier.map((s) => (
                <li key={s.pdfLink} className="pa-item">
                  <div className="pa-item-date">
                    <span className="pa-day">{monthShort(s)}</span>
                    <span className="pa-mon">{periodDate(s).getFullYear()}</span>
                  </div>
                  <article className="pa-card">
                    <div className="pa-card-main">
                      <h4>{s.name}</h4>
                      <p className="pa-meta">
                        {t("profile_results", "period")} {monthYear(s)} · {t("profile_results", "uploadedOn")} {fullDate(s)}
                      </p>
                    </div>
                    <a className="pa-btn" href={s.pdfLink} target="_blank" rel="noopener noreferrer">
                      {t("profile_results", "open")} <ArrowUpRight size={16} />
                    </a>
                  </article>
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
