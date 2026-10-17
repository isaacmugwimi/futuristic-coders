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
import { CalendarDays, Copy, FileText, Link2, Printer, X } from "lucide-react";
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
 * Needs:  npm i qrcode.react @fontsource/playfair-display @fontsource/great-vibes @fontsource/mrs-saint-delafield @fontsource/montserrat
 */

/* ============================== certificate artwork ============================== */

const COPY = {
  completion: { word: "Completion", lead: "for successfully completing the course" },
  participation: { word: "Participation", lead: "in recognition of participation in" },
};

/** Gold laurel wreath with a star row, drawn as SVG. */
function Laurel() {
  const angles = Array.from({ length: 10 }, (_, i) => 98 + i * 15.5); // degrees along the arc, from the bottom up the side
  const leaf = (angle, mirror, index) => {
    const a = (angle * Math.PI) / 180;
    const outer = index % 2 === 0;
    const r = outer ? 41 : 35;
    const x = 50 + r * Math.cos(a) * (mirror ? -1 : 1) * 1.02;
    const y = 55 + (r - 3) * Math.sin(a);
    const rotate = (mirror ? -1 : 1) * (angle + (outer ? 28 : -28));
    return (
      <path
        key={`${angle}-${mirror}`}
        d="M0,-8.5 C3.8,-3.5 3.8,3.5 0,8.5 C-3.8,3.5 -3.8,-3.5 0,-8.5 Z"
        transform={`translate(${x} ${y}) rotate(${rotate})`}
      />
    );
  };
  const stem = (mirror) => {
    const pts = angles.map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `${50 + 38 * Math.cos(a) * (mirror ? -1 : 1) * 1.02},${55 + 35 * Math.sin(a)}`;
    });
    return <polyline key={`stem-${mirror}`} points={pts.join(" ")} fill="none" stroke="url(#cv-gold)" strokeWidth="1.1" />;
  };

  return (
    <svg className="cv-cert__laurel" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="cv-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d98a" />
          <stop offset="0.5" stopColor="#c9a14a" />
          <stop offset="1" stopColor="#a67c28" />
        </linearGradient>
      </defs>
      {stem(false)}
      {stem(true)}
      <g fill="url(#cv-gold)">
        {angles.map((a, i) => leaf(a, false, i))}
        {angles.map((a, i) => leaf(a, true, i))}
        {[30, 40, 50, 60, 70].map((x, i) => (
          <polygon
            key={x}
            points="0,-3.2 0.9,-1 3.2,-1 1.4,0.5 2,2.9 0,1.5 -2,2.9 -1.4,0.5 -3.2,-1 -0.9,-1"
            transform={`translate(${x} ${i === 2 ? 5 : i === 1 || i === 3 ? 7 : 10})`}
          />
        ))}
        <polygon points="0,-4.4 1.3,-1.4 4.4,-1.4 2,0.7 2.8,4 0,2.1 -2.8,4 -2,0.7 -4.4,-1.4 -1.3,-1.4" transform="translate(50 95)" />
      </g>
    </svg>
  );
}

/** Gold rosette with ribbon tails for the top-left corner. */
function Rosette() {
  const scallops = Array.from({ length: 30 }, (_, i) => (i * 360) / 30);
  return (
    <svg className="cv-cert__rosette" viewBox="0 0 100 130" aria-hidden="true">
      <defs>
        <radialGradient id="cv-rosette" cx="0.38" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.55" stopColor="#d4a948" />
          <stop offset="1" stopColor="#a67c28" />
        </radialGradient>
        <linearGradient id="cv-tail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a35e6" />
          <stop offset="1" stopColor="#14186b" />
        </linearGradient>
      </defs>
      <g transform="rotate(16 36 80)">
        <polygon points="22,68 50,68 50,128 36,114 22,128" fill="url(#cv-tail)" stroke="#e6c46a" strokeWidth="1.6" />
      </g>
      <g transform="rotate(-10 64 80)">
        <polygon points="50,68 78,68 78,130 64,116 50,130" fill="url(#cv-tail)" stroke="#e6c46a" strokeWidth="1.6" />
      </g>
      <g fill="url(#cv-rosette)">
        {scallops.map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <circle key={deg} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="5.2" />;
        })}
        <circle cx="50" cy="50" r="44" />
      </g>
      <circle cx="50" cy="50" r="37" fill="none" stroke="#fff3c4" strokeWidth="1.2" strokeOpacity="0.8" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#8c6a1f" strokeWidth="0.6" strokeDasharray="1.4 2" />
    </svg>
  );
}

/** Curved ribbon in the bottom-right corner. */
function Swoosh() {
  return (
    <svg className="cv-cert__swoosh" viewBox="0 0 330 265" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="cv-sw-navy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b1fa0" />
          <stop offset="0.5" stopColor="#0f1675" />
          <stop offset="1" stopColor="#070b45" />
        </linearGradient>
        <radialGradient id="cv-sw-glow" cx="0.72" cy="0.92" r="0.45">
          <stop offset="0" stopColor="#c58bff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#6a35e6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#6a35e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cv-sw-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3a3" />
          <stop offset="0.5" stopColor="#c99a35" />
          <stop offset="1" stopColor="#f6e3a3" />
        </linearGradient>
      </defs>
      <path d="M330 4 Q 120 120 22 265 L330 265 Z" fill="url(#cv-sw-navy)" />
      <path d="M330 4 Q 120 120 22 265 L330 265 Z" fill="url(#cv-sw-glow)" />
      <path d="M330 70 Q 205 150 100 265" fill="none" stroke="#7b5cff" strokeOpacity="0.45" strokeWidth="16" />
      <path d="M330 4 Q 120 120 22 265" fill="none" stroke="url(#cv-sw-gold)" strokeWidth="9" />
      <path d="M330 46 Q 175 140 66 265" fill="none" stroke="url(#cv-sw-gold)" strokeWidth="3.5" />
    </svg>
  );
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
  const type = certificate.type === "participation" ? "participation" : "completion";
  const copy = COPY[type];
  const honors = type === "completion" ? honorsFor(student.finalScore) : null;
  const verifyUrl = `${PUBLIC_SITE_URL}/verify/${certificate.number}`;
  const host = PUBLIC_SITE_URL.replace(/^https?:\/\//, "");
  const [director, instructor] = SIGNATORIES;
  const nameSize = student.fullName.length > 40 ? 3.8 : student.fullName.length > 30 ? 5.2 : student.fullName.length > 22 ? 6.4 : student.fullName.length > 16 ? 7.6 : 8.8;

  return (
    <div className={`cv-cert cv-cert--${type} ${className}`.trim()} role="img" aria-label={`${CERTIFICATE_TYPES[type].label} for ${student.fullName}`}>
      <Image src="/images/flogo.png" alt="" width={400} height={400} style={{ width: "58cqw", height: "58cqw" }} className="cv-cert__watermark" />
      <div className="cv-cert__frame" />

      <div className="cv-cert__ribbon cv-cert__ribbon--tl" />
      <Swoosh />
      <div className="cv-cert__badge">
        <Rosette />
        <Image src="/images/flogo.png" alt="" width={64} height={64} style={{ width: "5cqw", height: "5cqw" }} className="cv-cert__badge-logo" />
      </div>

      <p className="cv-cert__side">
        Empowering
        <br />
        the next
        <br />
        generation
        <br />
        of creators
      </p>

      <div className="cv-cert__content">
        <Image src="/images/flogo.png" alt="" width={80} height={80} style={{ width: "5.2cqw", height: "5.2cqw" }} className="cv-cert__logo" />
        <p className="cv-cert__brand">
          Futuristic <span>Coders</span>
        </p>
        <p className="cv-cert__tagline">Learn • Build • Innovate</p>

        <p className="cv-cert__kicker">Certificate of</p>
        <h2 className="cv-cert__title">{copy.word}</h2>
        <Ornament className="cv-orn--wide" />

        <p className="cv-cert__presented">This certificate is proudly presented to</p>
        <p className="cv-cert__name" style={{ fontSize: `${nameSize}cqw` }}>
          {student.fullName}
        </p>
        <Ornament className="cv-orn--name" />

        <p className="cv-cert__lead">{copy.lead}</p>
        <p className="cv-cert__program">{student.program}</p>
        <Ornament className="cv-orn--short" />
        {honors && <p className="cv-cert__honors">With {honors}</p>}
        <p className="cv-cert__quote">Celebrating curiosity, creativity, and a passion for learning.</p>
      </div>

      <div className="cv-cert__sig cv-cert__sig--left">
        <span className="cv-cert__script">{director.name}</span>
        <i />
        <small>{director.title}</small>
      </div>

      <div className="cv-cert__emblem">
        <Laurel />
        <Image src="/images/flogo.png" alt="" width={64} height={64} style={{ width: "4.2cqw", height: "4.2cqw" }} className="cv-cert__emblem-logo" />
      </div>

      <div className="cv-cert__sig cv-cert__sig--right">
        <span className="cv-cert__script">{instructor.name}</span>
        <i />
        <small>{instructor.title}</small>
      </div>

      <div className="cv-cert__qr">
        <QRCodeSVG value={verifyUrl} size={160} level="M" fgColor="#0b1450" bgColor="transparent" style={{ width: "100%", height: "100%" }} />
        <small>Scan to verify</small>
      </div>

      <footer className="cv-cert__foot">
        <span>
          <FileText size={26} aria-hidden="true" />
          Certificate No: <strong>{certificate.number}</strong>
        </span>
        <b aria-hidden="true" />
        <span>
          <CalendarDays size={26} aria-hidden="true" />
          Issued on: <strong>{formatLongDate(certificate.issuedOn)}</strong>
        </span>
        <b aria-hidden="true" />
        <span>
          <Link2 size={26} aria-hidden="true" />
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
export function Dialog({ title, subtitle, size = "sm", onClose, footer, children }) {
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
      <div ref={dialogRef} className={`cv-dialog cv-dialog--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
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
      title={CERTIFICATE_TYPES[student.certificate.type === "participation" ? "participation" : "completion"].label}
      subtitle={`${student.fullName} · ${student.certificate.number}`}
      onClose={onClose}
      footer={
        <>
          <p className="cv-tip">Tip: choose “Save as PDF” in the print window to download it.</p>
          <button type="button" className="cv-btn" onClick={onCopyLink}>
            <Copy size={16} aria-hidden="true" />
            Copy verification link
          </button>
          <button type="button" className="cv-btn cv-btn--primary" onClick={() => window.print()}>
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
