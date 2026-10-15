"use client";

import "./CertificatesPage.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  BadgeCheck,
  CircleCheck,
  CircleX,
  Copy,
  Eye,
  GraduationCap,
  Hourglass,
  Info,
  ScanSearch,
  Search,
  X,
} from "lucide-react";
import {
  PROGRAM_OPTIONS,
  PUBLIC_SITE_URL,
  findCertificate,
  formatDate,
  honorsFor,
  issueCertificates,
  useStudents,
} from "../../data/students";
import {
  CertificateArtwork,
  CertificateModal,
  Dialog,
} from "../CertificateView/CertificateView";

/**
 * CertificatesPage.jsx
 * Certificates exist only for COMPLETED students. This page lists them, issues
 * certificates, opens/prints them and verifies a certificate number.
 * Opening /dashboard/certificates?student=<id> jumps straight to that student.
 */

export default function CertificatesPage() {
  const students = useStudents();
  const paramId = useSearchParams().get("student");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [program, setProgram] = useState("all");
  const [viewId, setViewId] = useState(null);
  const [issueIds, setIssueIds] = useState(null);
  const [dismissed, setDismissed] = useState(false); // closed a popup that was opened from the URL
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null); // { text, student }
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, tone = "success") => setToast({ id: Date.now(), message, tone }),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------------- derived ---------------- */
  const completed = useMemo(
    () => students.filter((s) => s.status === "completed"),
    [students],
  );
  const issued = completed.filter((s) => s.certificate);
  const pending = completed.filter((s) => !s.certificate);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return completed
      .filter((s) => {
        if (status === "issued" && !s.certificate) return false;
        if (status === "pending" && s.certificate) return false;
        if (program !== "all" && s.program !== program) return false;
        if (!q) return true;
        return [
          s.fullName,
          s.program,
          s.studentNo,
          s.certificate?.number ?? "",
        ].some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => (b.completedOn ?? "").localeCompare(a.completedOn ?? ""));
  }, [completed, query, status, program]);

  const hasFilters = query !== "" || status !== "all" || program !== "all";

  // A student passed in the URL (from the Students page)
  const paramStudent = !dismissed
    ? students.find((s) => s.id === paramId)
    : null;
  const paramIsCompleted = paramStudent?.status === "completed";
  const notEligible = paramStudent && !paramIsCompleted ? paramStudent : null;
  const activeViewId =
    viewId ??
    (paramIsCompleted && paramStudent.certificate ? paramStudent.id : null);
  const activeIssueIds =
    issueIds ??
    (paramIsCompleted && !paramStudent.certificate ? [paramStudent.id] : null);

  const viewStudent = activeViewId
    ? students.find(
        (s) =>
          s.id === activeViewId && s.certificate && s.status === "completed",
      )
    : null;
  const issueTargets = activeIssueIds
    ? students.filter(
        (s) =>
          activeIssueIds.includes(s.id) &&
          s.status === "completed" &&
          !s.certificate,
      )
    : [];

  /* ---------------- actions ---------------- */
  function closeAll() {
    setViewId(null);
    setIssueIds(null);
    setDismissed(true);
  }

  function confirmIssue() {
    const ids = issueTargets.map((s) => s.id);
    const count = issueCertificates(ids);
    setIssueIds(null);
    setDismissed(true);
    if (ids.length === 1) setViewId(ids[0]); // open the new certificate straight away
    showToast(
      count === 1 ? "Certificate issued" : `${count} certificates issued`,
    );
  }

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast("Couldn't copy to the clipboard", "danger");
    }
  }

  function verify(event) {
    event.preventDefault();
    const text = verifyInput.trim();
    if (!text) return;
    setVerifyResult({ text, student: findCertificate(students, text) });
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setProgram("all");
  }

  /* ---------------- render ---------------- */
  return (
    <div className="cp">
      <div className="cp-rule" role="note">
        <Info size={18} aria-hidden="true" />
        <p>
          Certificates are only available for{" "}
          <strong>completed students</strong>. To make a student eligible, mark
          them as completed on the{" "}
          <Link href="/dashboard/students">Students page</Link>.
        </p>
      </div>

      <section className="cp-stats" aria-label="Certificates summary">
        <article className="cp-stat">
          <span className="cp-stat__icon cp-stat__icon--violet">
            <GraduationCap size={22} aria-hidden="true" />
          </span>
          <div>
            <p>{completed.length}</p>
            <span>Eligible (completed)</span>
          </div>
        </article>
        <article className="cp-stat">
          <span className="cp-stat__icon cp-stat__icon--green">
            <BadgeCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <p>{issued.length}</p>
            <span>Certificates issued</span>
          </div>
        </article>
        <article className="cp-stat">
          <span className="cp-stat__icon cp-stat__icon--amber">
            <Hourglass size={22} aria-hidden="true" />
          </span>
          <div>
            <p>{pending.length}</p>
            <span>Waiting to be issued</span>
          </div>
        </article>
      </section>

      <section className="cp-card cp-verify">
        <div className="cp-verify__head">
          <span>
            <ScanSearch size={22} aria-hidden="true" />
          </span>
          <div>
            <h2>Verify a certificate</h2>
            <p>Enter the certificate number to confirm it is genuine.</p>
          </div>
        </div>
        <form className="cp-verify__form" onSubmit={verify}>
          <input
            value={verifyInput}
            onChange={(e) => {
              setVerifyInput(e.target.value);
              setVerifyResult(null);
            }}
            placeholder="e.g. FC-CERT-2026-0001"
            aria-label="Certificate number"
            autoComplete="off"
          />
          <button type="submit" className="cp-btn cp-btn--primary">
            Verify
          </button>
        </form>
        {verifyResult &&
          (verifyResult.student ? (
            <div className="cp-result cp-result--valid" role="status">
              <CircleCheck size={22} aria-hidden="true" />
              <div>
                <strong>Valid certificate</strong>
                <span>
                  {verifyResult.student.fullName} completed{" "}
                  <b>{verifyResult.student.program}</b> on{" "}
                  {formatDate(verifyResult.student.completedOn)}. Issued{" "}
                  {formatDate(verifyResult.student.certificate.issuedOn)}.
                </span>
              </div>
              <button
                type="button"
                className="cp-btn"
                onClick={() => setViewId(verifyResult.student.id)}
              >
                View
              </button>
            </div>
          ) : (
            <div className="cp-result cp-result--invalid" role="status">
              <CircleX size={22} aria-hidden="true" />
              <div>
                <strong>No certificate found</strong>
                <span>
                  “{verifyResult.text}” doesn&apos;t match any issued
                  certificate. Check the number and try again.
                </span>
              </div>
            </div>
          ))}
      </section>

      <section className="cp-card">
        <div className="cp-toolbar">
          <label className="cp-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, program, certificate number…"
              aria-label="Search certificates"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>
          <select
            className="cp-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by certificate status"
          >
            <option value="all">All</option>
            <option value="issued">Issued</option>
            <option value="pending">Not issued yet</option>
          </select>
          <select
            className="cp-select"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            aria-label="Filter by program"
          >
            <option value="all">All programs</option>
            {PROGRAM_OPTIONS.map((p) => (
              <option key={p.title}>{p.title}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              className="cp-btn cp-btn--ghost"
              onClick={clearFilters}
            >
              <X size={15} aria-hidden="true" />
              Clear
            </button>
          )}
          {pending.length > 0 && (
            <button
              type="button"
              className="cp-btn cp-btn--primary cp-toolbar__issue"
              onClick={() => setIssueIds(pending.map((s) => s.id))}
            >
              <Award size={17} aria-hidden="true" />
              Issue all pending ({pending.length})
            </button>
          )}
        </div>

        {completed.length === 0 ? (
          <div className="cp-empty">
            <span>
              <GraduationCap size={28} aria-hidden="true" />
            </span>
            <h3>No completed students yet</h3>
            <p>Certificates appear here once students finish their program.</p>
            <Link href="/dashboard/students" className="cp-btn cp-btn--primary">
              Go to Students
            </Link>
          </div>
        ) : list.length === 0 ? (
          <div className="cp-empty">
            <span>
              <Search size={28} aria-hidden="true" />
            </span>
            <h3>Nothing matches</h3>
            <p>Try a different search or clear your filters.</p>
            <button type="button" className="cp-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="cp-grid">
            {list.map((s) => {
              const honors = honorsFor(s.finalScore);
              return (
                <li
                  key={s.id}
                  className={`cp-item${s.certificate ? "" : " is-pending"}`}
                >
                  {s.certificate ? (
                    <button
                      type="button"
                      className="cp-thumb"
                      onClick={() => setViewId(s.id)}
                      aria-label={`View certificate for ${s.fullName}`}
                    >
                      <CertificateArtwork student={s} />
                    </button>
                  ) : (
                    <div className="cp-thumb cp-thumb--empty">
                      <Hourglass size={28} aria-hidden="true" />
                      <span>Not issued yet</span>
                    </div>
                  )}

                  <div className="cp-item__info">
                    <h3>{s.fullName}</h3>
                    <p>{s.program}</p>
                    <p className="cp-item__meta">
                      Completed {formatDate(s.completedOn)}
                      {honors ? ` · ${honors}` : ""}
                    </p>
                    <p
                      className={`cp-item__number${s.certificate ? " is-issued" : ""}`}
                    >
                      {s.certificate
                        ? s.certificate.number
                        : "No certificate number yet"}
                    </p>
                  </div>

                  <div className="cp-item__actions">
                    {s.certificate ? (
                      <>
                        <button
                          type="button"
                          className="cp-btn cp-btn--primary"
                          onClick={() => setViewId(s.id)}
                        >
                          <Eye size={16} aria-hidden="true" />
                          View / Print
                        </button>
                        <button
                          type="button"
                          className="cp-icon"
                          onClick={() =>
                            copy(
                              s.certificate.number,
                              "Certificate number copied",
                            )
                          }
                          aria-label={`Copy certificate number for ${s.fullName}`}
                          title="Copy certificate number"
                        >
                          <Copy size={16} aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="cp-btn cp-btn--primary"
                        onClick={() => setIssueIds([s.id])}
                      >
                        <Award size={16} aria-hidden="true" />
                        Issue certificate
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------- popups ---------- */}
      {viewStudent && (
        <CertificateModal
          student={viewStudent}
          onClose={closeAll}
          onCopyLink={() =>
            copy(
              `${PUBLIC_SITE_URL}/verify/${viewStudent.certificate.number}`,
              "Verification link copied",
            )
          }
        />
      )}

      {issueTargets.length > 0 && (
        <Dialog
          title={
            issueTargets.length === 1
              ? "Issue certificate?"
              : `Issue ${issueTargets.length} certificates?`
          }
          onClose={closeAll}
          footer={
            <>
              <button type="button" className="cp-btn" onClick={closeAll}>
                Cancel
              </button>
              <button
                type="button"
                className="cp-btn cp-btn--primary"
                onClick={confirmIssue}
              >
                <Award size={16} aria-hidden="true" />
                Issue{" "}
                {issueTargets.length === 1 ? "certificate" : "certificates"}
              </button>
            </>
          }
        >
          <p className="cp-dialog-text">
            {issueTargets.length === 1 ? (
              <>
                A certificate of completion will be issued to{" "}
                <strong>{issueTargets[0].fullName}</strong> for{" "}
                <strong>{issueTargets[0].program}</strong>.
              </>
            ) : (
              "A certificate of completion will be issued to each of these students:"
            )}{" "}
            Certificate numbers are assigned automatically.
          </p>
          {issueTargets.length > 1 && (
            <ul className="cp-dialog-list">
              {issueTargets.slice(0, 6).map((s) => (
                <li key={s.id}>
                  {s.fullName} <span>{s.program}</span>
                </li>
              ))}
              {issueTargets.length > 6 && (
                <li>and {issueTargets.length - 6} more</li>
              )}
            </ul>
          )}
        </Dialog>
      )}

      {notEligible && (
        <Dialog
          title="Not eligible for a certificate"
          onClose={closeAll}
          footer={
            <>
              <button type="button" className="cp-btn" onClick={closeAll}>
                Close
              </button>
              <Link
                href="/dashboard/students"
                className="cp-btn cp-btn--primary"
              >
                Go to Students
              </Link>
            </>
          }
        >
          <p className="cp-dialog-text">
            <strong>{notEligible.fullName}</strong> hasn&apos;t completed their
            program yet, and certificates are only available for completed
            students. Mark them as completed on the Students page first.
          </p>
        </Dialog>
      )}

      {toast && (
        <div
          className={`cp-toast cp-toast--${toast.tone}`}
          role="status"
          aria-live="polite"
        >
          {toast.tone === "danger" ? (
            <CircleX size={20} aria-hidden="true" />
          ) : (
            <CircleCheck size={20} aria-hidden="true" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss message"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
