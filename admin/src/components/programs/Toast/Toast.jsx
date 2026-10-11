"use client";

import "./Toast.css";
import { useEffect } from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";

const ICONS = { success: CircleCheck, danger: CircleAlert, info: Info };

/** toast: { id, message, tone: success | info | danger } or null */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const Icon = ICONS[toast.tone] ?? CircleCheck;

  return (
    <div className={`fc-toast fc-toast--${toast.tone}`} role="status" aria-live="polite">
      <Icon size={20} aria-hidden="true" />
      <span className="fc-toast__text">{toast.message}</span>
      <button type="button" className="fc-toast__close" onClick={onDismiss} aria-label="Dismiss message">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
