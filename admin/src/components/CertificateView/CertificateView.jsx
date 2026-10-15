"use client";

import "./CertificateView.css";
import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { Award, Copy, Printer, X } from "lucide-react";
import {
  PUBLIC_SITE_URL,
  formatDate,
  honorsFor,
  programWeeks,
} from "../../data/students";

/**
 * CertificateView.jsx
 * The certificate artwork (scales to any width, prints on A4 landscape), the
 * popup that shows it, and a small dialog shell the Certificates page reuses.
 */

/* ============================== certificate artwork ============================== */

/** Only call this for a COMPLETED student that has a certificate. */
export function CertificateArtwork({ student, className = "" }) {
  const { certificate } = student;
  const weeks = programWeeks(student.program);
  const honors = honorsFor(student.finalScore);
  const host = PUBLIC_SITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className={`cv-cert ${className}`.trim()}>
      <div className="cv-cert__frame">
        <header className="cv-cert__brand">
          <Image
            src="/images/flogo.png"
            alt=""
            width={64}
            height={64}
            style={{ width: "6.4cqw", height: "6.4cqw" }}
            className="cv-cert__logo"
          />
          <div>
            <strong>
              Futuristic <span>Coders</span>
            </strong>
            <small>Learn · Build · Innovate</small>
          </div>
        </header>

        <p className="cv-cert__kicker">Certificate of</p>
        <h2 className="cv-cert__title">Completion</h2>

        <p className="cv-cert__lead">This is to certify that</p>
        <p className="cv-cert__name">{student.fullName}</p>
        <p className="cv-cert__lead">has successfully completed the program</p>
        <p className="cv-cert__program">{student.program}</p>
        <p className="cv-cert__meta">
          {weeks ? `${weeks}-week program · ` : ""}Completed{" "}
          {formatDate(student.completedOn)}
          {student.finalScore != null
            ? ` · Final score ${student.finalScore}%`
            : ""}
        </p>
        {honors && <p className="cv-cert__honors">With {honors}</p>}

        <div className="cv-cert__sign">
          <div>
            <span />
            Academy Director
          </div>
          <div className="cv-cert__seal" aria-hidden="true">
            <Award size={40} style={{ width: "55%", height: "55%" }} />
          </div>
          <div>
            <span />
            Lead Instructor
          </div>
        </div>

        <footer className="cv-cert__foot">
          Certificate No. <strong>{certificate.number}</strong> · Issued{" "}
          {formatDate(certificate.issuedOn)} · Verify at {host}/verify
        </footer>
      </div>
    </div>
  );
}

/* ============================== dialog shell ============================== */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** size: sm | xl */
export function Dialog({
  title,
  subtitle,
  size = "sm",
  onClose,
  footer,
  children,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") return closeRef.current();
      if (event.key !== "Tab" || !dialog) return;
      const items = dialog.querySelectorAll(FOCUSABLE);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="cv-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`cv-dialog cv-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="cv-dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="cv-dialog__body">{children}</div>
        {footer && <div className="cv-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ============================== certificate popup ============================== */

export function CertificateModal({ student, onClose, onCopyLink }) {
  return (
    <Dialog
      size="xl"
      title="Certificate"
      subtitle={`${student.fullName} · ${student.certificate.number}`}
      onClose={onClose}
      footer={
        <>
          <p className="cv-tip">
            Tip: choose “Save as PDF” in the print window to download it.
          </p>
          <button type="button" className="cv-btn" onClick={onCopyLink}>
            <Copy size={16} aria-hidden="true" />
            Copy verification link
          </button>
          <button
            type="button"
            className="cv-btn cv-btn--primary"
            onClick={() => window.print()}
          >
            <Printer size={16} aria-hidden="true" />
            Print / Save as PDF
          </button>
        </>
      }
    >
      <CertificateArtwork student={student} className="cv-print" />
    </Dialog>
  );
}
