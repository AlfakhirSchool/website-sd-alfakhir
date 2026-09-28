import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useLanguage } from "../../../context/LanguageContext";
import "./AcceptedStudents.css";

const PASSED_STATUSES = ["Lolos", "Diterima", "Lolos Seleksi", "Lulus Seleksi", "Passed Selection"];
const isAcceptedStatus = (status) => PASSED_STATUSES.includes(status);

const AcceptedStudents = ({
  selectedYear,
  selectedWave,
  externalSearchQuery = "",
}) => {
  const { t } = useLanguage();
  const [students, setStudents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedWave, externalSearchQuery]);

  React.useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch("/api/students/public");
        const studentList = Array.isArray(data) ? data : [];
        const filtered = studentList.filter(
          (s) =>
            String(s.year) === String(selectedYear) &&
            String(s.wave) === String(selectedWave),
        );
        setStudents(filtered);
      } catch (err) {
        console.error("Failed to fetch students:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedYear, selectedWave]);

  const cleanSearch = (externalSearchQuery || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const lolosStudents = students
    .filter(
      (s) => isAcceptedStatus(s.status) || (s.score && s.score !== ""),
    )
    .filter((s) => {
      const nameMatch = (s.name || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(cleanSearch);
      const idMatch = (s.id || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(cleanSearch);
      return nameMatch || idMatch;
    });

  const totalPages = Math.ceil(lolosStudents.length / ITEMS_PER_PAGE);
  const currentStudents = lolosStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <div className="loading-spinner" />
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600 }}>
          {t("common", "loading") || "Syncing data..."}
        </p>
      </div>
    );

  return (
    <div className="accepted-students-container">
      <table className="accepted-table">
        <thead>
          <tr className="accepted-table-header">
            <th className="accepted-table-th center width-small">#</th>
            <th
              className="accepted-table-th"
              style={{ textAlign: "left", paddingLeft: "20px" }}
            >
              {t("ppdb_results", "table.name")} &{" "}
              {t("ppdb_results", "table.id")}
            </th>
            <th className="accepted-table-th center width-medium">
              {t("ppdb_results", "table.status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.length > 0 ? (
            currentStudents.map((student, index) => (
              <motion.tr
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={student._id || student.id || index}
                className="accepted-row"
              >
                <td className="accepted-cell index-cell" data-label="#">
                  <div className="student-index-badge">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </div>
                </td>

                <td className="accepted-cell name-cell" data-label={t("ppdb_results", "table.name")}>
                  <div className="student-name-row-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', width: '100%' }}>
                    {/* Left Side: Info */}
                    <div className="student-info-stack" style={{ flex: 1, minWidth: 0 }}>
                      <div className="student-name">{student.name}</div>

                      <div className="student-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                        <span className="student-id-badge">
                          ID: {student.id}
                        </span>
                        
                        <div className="student-school">
                          <GraduationCap size={14} color="#94a3b8" />
                          {student.school || student.schoolName || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Button */}
                    {student.pdfLink && (
                      <div style={{ flexShrink: 0 }}>
                        <a 
                          href={student.pdfLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-pdf-btn-mobile"
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '0.75rem', 
                            color: 'var(--primary, #f98c1d)', 
                            textDecoration: 'none', 
                            background: 'rgba(249, 140, 29, 0.08)', 
                            border: '1px solid rgba(249, 140, 29, 0.2)',
                            padding: '6px 14px', 
                            borderRadius: '10px', 
                            fontWeight: 800,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(249, 140, 29, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(249, 140, 29, 0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(249, 140, 29, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <FileText size={14} strokeWidth={2.5} />
                          {t('ppdb_results', 'table.view_report') || 'Hasil Observasi'}
                        </a>
                      </div>
                    )}
                  </div>
                </td>

                <td className="accepted-cell status-cell" data-label={t("ppdb_results", "table.status")}>
                  {(() => {
                    const isPassed = isAcceptedStatus(student.status);
                    const isFailed =
                      student.status === "Belum Lolos" ||
                      student.status === "Not Yet Passed" ||
                      student.status === "Tidak Lulus";

                    const baseColor = isPassed
                      ? "#10b981"
                      : isFailed
                        ? "#ef4444"
                        : "#f59e0b";

                    return (
                      <div
                        className="status-badge-outer"
                        style={{
                          background: `linear-gradient(135deg, ${baseColor}40, transparent)`,
                        }}
                      >
                        <div
                          className="status-badge-inner"
                          style={{
                            color: baseColor,
                            border: `1px solid ${baseColor}20`,
                            boxShadow: `0 10px 20px -5px ${baseColor}20, inset 0 1px 0 rgba(255,255,255,0.8)`,
                          }}
                        >
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 3,
                              ease: "linear",
                            }}
                            className="shimmer"
                          />

                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="status-icon-frame"
                            style={{
                              background: `${baseColor}15`,
                              border: `1px solid ${baseColor}30`,
                            }}
                          >
                            {isPassed ? (
                              <CheckCircle size={12} strokeWidth={3} />
                            ) : isFailed ? (
                              <AlertCircle size={12} strokeWidth={3} />
                            ) : (
                              <Clock size={12} strokeWidth={3} />
                            )}
                          </motion.div>

                          <span style={{ position: "relative", zIndex: 1 }}>
                            {isPassed
                              ? t("ppdb_results", "table.status_passed")
                              : isFailed
                                ? t("ppdb_results", "table.status_failed")
                                : student.status ||
                                  t("ppdb_results", "table.accepted")}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="decorative-bar" />
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-state">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="empty-icon-frame">
                    <Search size={32} />
                  </div>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "1.2rem",
                      fontWeight: 900,
                      color: "#475569",
                    }}
                  >
                    {t("ppdb_results", "empty.title")}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#94a3b8",
                      maxWidth: "300px",
                      margin: "0 auto",
                    }}
                  >
                    {t("ppdb_results", "empty.desc")}
                  </p>
                </motion.div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-container-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', background: 'white', borderTop: '1px solid #f1f5f9', borderRadius: '0 0 20px 20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, lolosStudents.length)} dari {lolosStudents.length} siswa
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#cbd5e1' : '#475569', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', transition: '0.2s', fontSize: '0.8rem' }}
            >
              Prev
            </button>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Array.from({length: totalPages}).map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <button 
                      key={p} 
                      onClick={() => setCurrentPage(p)}
                      style={{ height: '34px', minWidth: '34px', padding: '0 10px', borderRadius: '8px', border: 'none', background: currentPage === p ? 'var(--primary)' : 'transparent', color: currentPage === p ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer', transition: '0.2s', fontSize: '0.8rem' }}
                    >
                      {p}
                    </button>
                  );
                } else if (p === currentPage - 2 || p === currentPage + 2) {
                  return <span key={p} style={{ padding: '0 6px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800 }}>...</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#cbd5e1' : '#475569', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', transition: '0.2s', fontSize: '0.8rem' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedStudents;
