"use client";

import "./RecordPaymentModal.css";
import { useEffect, useMemo, useState } from "react";
import { Banknote, X } from "lucide-react";
import {
  PAYMENT_METHODS,
  formatKSh,
  paymentInfo,
  todayISO,
} from "@/src/data/students";

/**
 * RecordPaymentModal.jsx
 * Records a payment against ONE enrollment (a student in a program), so a
 * student who is in Module 1 and Module 2 pays each module separately.
 *
 * Props
 *   enrollments          enrollment rows that can still be paid
 *                        (from toUiEnrollment: id, enrollmentId, fullName,
 *                         studentNo, program, fee, amountPaid)
 *   initialEnrollmentId  optional. Pre-selects an enrollment.
 *   onSave(data)         async; data = { enrollmentId, amount, paymentMethod,
 *                        reference?, paidAt? }. The parent shows errors and
 *                        closes on success.
 *   onClose              close without saving
 */
export default function RecordPaymentModal({
  enrollments,
  initialEnrollmentId = "",
  onSave,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState(initialEnrollmentId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(todayISO());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = enrollments.find((e) => e.enrollmentId === enrollmentId);
  const balance = selected ? paymentInfo(selected).balance : 0;

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(
      (e) =>
        `${e.fullName} ${e.studentNo} ${e.program}`.toLowerCase().includes(q) ||
        e.enrollmentId === enrollmentId,
    );
  }, [enrollments, search, enrollmentId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    if (!selected) return setError("Choose the student and program.");

    const value = Number(amount);
    if (amount === "" || !Number.isFinite(value) || value <= 0)
      return setError("Enter a valid amount.");
    if (value > balance + 0.001)
      return setError(
        `The amount is more than the balance of ${formatKSh(balance)}.`,
      );
    if (method === "mpesa" && !reference.trim())
      return setError("Enter the M-Pesa transaction code.");

    setSaving(true);
    setError("");
    try {
      await onSave({
        enrollmentId,
        amount: value,
        paymentMethod: method,
        reference: reference.trim() || undefined,
        // Today's payments use the server's current time.
        paidAt: paidOn && paidOn !== todayISO() ? paidOn : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rp-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        className="rp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rp-title"
        onSubmit={submit}
      >
        <header className="rp__head">
          <span className="rp__icon">
            <Banknote size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="rp-title">Record payment</h2>
            <p>Payments are recorded per program.</p>
          </div>
          <button
            type="button"
            className="rp__close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="rp__body">
          {enrollments.length === 0 ? (
            <p className="rp__empty">
              Every enrollment is fully paid, so there is nothing to record.
            </p>
          ) : (
            <>
              <label className="rp__field">
                Find student
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, number or program…"
                  autoComplete="off"
                  autoFocus={!initialEnrollmentId}
                />
              </label>

              <label className="rp__field">
                Student and program
                <select
                  value={enrollmentId}
                  onChange={(e) => {
                    setEnrollmentId(e.target.value);
                    setError("");
                  }}
                >
                  <option value="">
                    {options.length ? "Select…" : "No match"}
                  </option>
                  {options.map((e) => (
                    <option key={e.enrollmentId} value={e.enrollmentId}>
                      {e.fullName} ({e.studentNo}) · {e.program} · owes{" "}
                      {formatKSh(paymentInfo(e).balance)}
                    </option>
                  ))}
                </select>
              </label>

              {selected && (
                <p className="rp__summary">
                  Fee {formatKSh(selected.fee)} · Paid{" "}
                  {formatKSh(selected.amountPaid)} · <b>Balance {formatKSh(balance)}</b>
                </p>
              )}

              <div className="rp__row">
                <label className="rp__field">
                  Amount (KSh)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                  {selected && balance > 0 && (
                    <button
                      type="button"
                      className="rp__link"
                      onClick={() => setAmount(String(balance))}
                    >
                      Pay full balance
                    </button>
                  )}
                </label>
                <label className="rp__field">
                  Date paid
                  <input
                    type="date"
                    value={paidOn}
                    max={todayISO()}
                    onChange={(e) => setPaidOn(e.target.value)}
                  />
                </label>
              </div>

              <div className="rp__row">
                <label className="rp__field">
                  Method
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rp__field">
                  {method === "mpesa"
                    ? "M-Pesa transaction code"
                    : "Reference (optional)"}
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    autoComplete="off"
                  />
                </label>
              </div>
            </>
          )}

          {error && (
            <p className="rp__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="rp__foot">
          <button
            type="button"
            className="rp__btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rp__btn rp__btn--primary"
            disabled={saving || enrollments.length === 0}
          >
            {saving ? "Saving…" : "Record payment"}
          </button>
        </footer>
      </form>
    </div>
  );
}
