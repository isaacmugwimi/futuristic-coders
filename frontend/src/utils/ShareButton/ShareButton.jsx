"use client";

import { useEffect, useRef, useState } from "react";
import "./ShareButton.css";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function absolute(path) {
  if (/^https?:\/\//.test(path)) return path;
  const base =
    SITE || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${path}`;
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

/**
 * variant="pill"  -> "Share" button that opens a menu (post page)
 * variant="icon"  -> round icon; uses the device share sheet, else copies link (cards)
 */
export default function ShareButton({
  path,
  title,
  text = "",
  variant = "pill",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [canNative, setCanNative] = useState(false);
  const wrap = useRef(null);

  useEffect(
    () => setCanNative(typeof navigator !== "undefined" && !!navigator.share),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e) =>
      wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const url = () => absolute(path);

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url: url() });
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  }

  async function copyLink() {
    setToast((await copy(url())) ? "Link copied" : "Couldn’t copy the link");
    setOpen(false);
  }

  async function onPrimary(e) {
    e.preventDefault();
    e.stopPropagation();
    if (variant === "icon") {
      if (canNative) return nativeShare();
      return copyLink();
    }
    setOpen((o) => !o);
  }

  const u = encodeURIComponent;
  const targets = () => {
    const link = u(url());
    const t = u(title);
    return [
      {
        name: "X",
        href: `https://twitter.com/intent/tweet?text=${t}&url=${link}`,
      },
      {
        name: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
      },
      { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${link}` },
      {
        name: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
      },
      {
        name: "Email",
        href: `mailto:?subject=${t}&body=${u(text ? text + "\n\n" : "")}${link}`,
      },
    ];
  };

  return (
    <div className={`sb sb--${variant} ${className}`} ref={wrap}>
      <button
        type="button"
        className="sb-btn"
        onClick={onPrimary}
        aria-label={variant === "icon" ? `Share ${title}` : undefined}
        aria-haspopup={variant === "pill" ? "menu" : undefined}
        aria-expanded={variant === "pill" ? open : undefined}
      >
        <ShareIcon />
        {variant === "pill" && <span>Share</span>}
      </button>

      {open && variant === "pill" && (
        <div className="sb-menu" role="menu">
          {canNative && (
            <button
              type="button"
              role="menuitem"
              className="sb-item sb-item--main"
              onClick={nativeShare}
            >
              Share via device…
            </button>
          )}
          {targets().map((t) => (
            <a
              key={t.name}
              role="menuitem"
              className="sb-item"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {t.name}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            className="sb-item sb-item--copy"
            onClick={copyLink}
          >
            Copy link
          </button>
        </div>
      )}

      <span className="sb-toast" role="status" aria-live="polite">
        {toast}
      </span>
    </div>
  );
}
