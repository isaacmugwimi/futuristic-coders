"use client";

import "./Modal.css";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: Escape closes, focus is trapped and restored.
 * size: sm | md | lg
 */
export default function Modal({
  title,
  subtitle,
  size = "md",
  onClose,
  closeOnBackdrop = true,
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
    const previouslyFocused = document.activeElement;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
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
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fc-modal__overlay"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`fc-modal fc-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="fc-modal__header">
          <div className="fc-modal__heading">
            <h2 id={titleId} className="fc-modal__title">
              {title}
            </h2>
            {subtitle && <p className="fc-modal__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="fc-modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="fc-modal__body">{children}</div>

        {footer && <div className="fc-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
