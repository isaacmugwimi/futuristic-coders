"use client";

import "./CertificateView.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/800.css";
import "@fontsource/playfair-display/500-italic.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/mrs-saint-delafield/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Printer, X } from "lucide-react";
import {
  CERTIFICATE_TYPES,
  PUBLIC_SITE_URL,
  SIGNATORIES,
  formatLongDate,
  honorsFor,
} from "@/src/data/students";

/**
 * CertificateView.jsx
 * The certificate artwork (two designs: Completion and Participation; it scales
 * to any width and prints on A4 landscape), the popup that shows it, and a small
 * dialog shell the Certificates page reuses.
 *
 * Layers (bottom to top): background image (frame, corner ribbons, top-left medal,
 * wave lines) -> watermark -> text/logo -> signatures -> QR + badge -> footer.
 *
 * Assets (in /public/images):
 *   certificate-bg.png     1536x1024 blank background (3:2)
 *   certificate-badge.png  1207x1303 transparent gold F> medal
 *   flogo.png              existing logo (unchanged)
 *
 * Needs:  npm i qrcode.react @fontsource/playfair-display @fontsource/great-vibes @fontsource/mrs-saint-delafield @fontsource/montserrat
 */

/* ============================== certificate artwork ============================== */

const COPY = {
  completion: {
    word: "Completion",
    lead: "for successfully completing the course",
  },
  participation: {
    word: "Participation",
    lead: "in recognition of participation in",
  },
};

/** Font sizes (in cqw) that keep long names / course titles on one line inside the frame. */
function nameSizeFor(name) {
  const n = name.length;
  if (n <= 12) return 8.2;
  if (n <= 16) return 7;
  if (n <= 22) return 5.6;
  if (n <= 30) return 4.4;
  if (n <= 40) return 3.4;
  return 2.8;
}

function programSizeFor(program) {
  const n = program.length;
  if (n <= 28) return 2.7;
  if (n <= 40) return 2.2;
  return 1.8;
}

function Ornament({ className = "" }) {
  return (
    <div className={`cv-orn ${className}`.trim()} aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  );
}

/** Pass a student that HAS a certificate (completion or participation). */
export function CertificateArtwork({ student, className = "" }) {
  const { certificate } = student;
  const type =
    certificate.type === "participation" ? "participation" : "completion";
  const copy = COPY[type];
  const honors = type === "completion" ? honorsFor(student.finalScore) : null;
  const verifyUrl = `${PUBLIC_SITE_URL}/verify/${certificate.number}`;
  const host = PUBLIC_SITE_URL.replace(/^https?:\/\//, "");
  const [director, instructor] = SIGNATORIES;

  return (
    <div
      className={`cv-cert cv-cert--${type} ${className}`.trim()}
      role="img"
      aria-label={`${CERTIFICATE_TYPES[type].label} for ${student.fullName}`}
    >
      {/* base layer: frame, ribbons, top-left medal and wave lines are all in this image */}
      <Image
        src="/images/certificate-bg.png"
        alt=""
        fill
        sizes="1536px"
        quality={90}
        priority
        className="cv-cert__bg"
      />
      <Image
        src="/images/flogo.png"
        alt=""
        width={400}
        height={400}
        style={{ width: "56cqw", height: "56cqw" }}
        className="cv-cert__watermark"
      />

      <p className="cv-cert__side">
        Empowering
        <br />
        the next
        <br />
        generation
        <br />
        of creators
      </p>

      {/* header */}
      <Image
        src="/images/flogo.png"
        alt=""
        width={80}
        height={80}
        style={{ width: "5.2cqw", height: "5.2cqw" }}
        className="cv-cert__logo"
      />
      <p className="cv-cert__brand">
        Futuristic <span>Coders</span>
      </p>
      <p className="cv-cert__tagline">Learn • Build • Innovate</p>
      <Ornament className="cv-orn--tag" />

      <h2 className="cv-cert__title">Certificate of {copy.word}</h2>
      <Ornament className="cv-orn--title" />

      {/* body */}
      <p className="cv-cert__presented">
        This certificate is proudly presented to
      </p>
      <div className="cv-cert__namebox">
        <p
          className="cv-cert__name"
          style={{ fontSize: `${nameSizeFor(student.fullName)}cqw` }}
        >
          {student.fullName}
        </p>
      </div>
      <Ornament className="cv-orn--name" />

      <p className="cv-cert__lead">{copy.lead}</p>
      <div className="cv-cert__programbox">
        <p
          className="cv-cert__program"
          style={{ fontSize: `${programSizeFor(student.program)}cqw` }}
        >
          {student.program}
        </p>
      </div>
      {honors ? (
        <p className="cv-cert__honors">With {honors}</p>
      ) : (
        <Ornament className="cv-orn--short" />
      )}

      {/* signatures, QR and badge */}
      <div className="cv-cert__sig cv-cert__sig--left">
        <span className="cv-cert__script">{director.name}</span>
        <i />
        <small>{director.title}</small>
      </div>

      <div className="cv-cert__qr">
        <QRCodeSVG
          value={verifyUrl}
          size={160}
          level="M"
          fgColor="#0b1450"
          bgColor="transparent"
        />
        <small>Scan to verify</small>
      </div>

      <Image
        src="/images/certificate-badge2.png"
        alt=""
        width={1207}
        height={1303}
        sizes="300px"
        className="cv-cert__badge"
      />

      <div className="cv-cert__sig cv-cert__sig--right">
        <span className="cv-cert__script">{instructor.name}</span>
        <i />
        <small>{instructor.title}</small>
      </div>

      <footer className="cv-cert__foot">
        <span>
          Certificate No: <strong>{certificate.number}</strong>
        </span>
        <b aria-hidden="true" />
        <span>
          Issued on: <strong>{formatLongDate(certificate.issuedOn)}</strong>
        </span>
        <b aria-hidden="true" />
        <span>
          Verify at: <strong>{host}/verify</strong>
        </span>
      </footer>
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
      title={
        CERTIFICATE_TYPES[
          student.certificate.type === "participation"
            ? "participation"
            : "completion"
        ].label
      }
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
