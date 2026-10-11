"use client";

import "./ConfirmDialog.css";
import { TriangleAlert, Info } from "lucide-react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

/** tone: primary | danger. items: optional list of names affected (bulk actions) */
export default function ConfirmDialog({
  title,
  message,
  items = [],
  confirmLabel = "Confirm",
  tone = "primary",
  onConfirm,
  onCancel,
}) {
  const Icon = tone === "danger" ? TriangleAlert : Info;
  const shown = items.slice(0, 5);
  const extra = items.length - shown.length;

  return (
    <Modal
      size="sm"
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="fc-confirm">
        <span className={`fc-confirm__icon fc-confirm__icon--${tone}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="fc-confirm__content">
          <p className="fc-confirm__message">{message}</p>
          {shown.length > 1 && (
            <ul className="fc-confirm__list">
              {shown.map((name) => (
                <li key={name}>{name}</li>
              ))}
              {extra > 0 && <li className="fc-confirm__more">and {extra} more</li>}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
