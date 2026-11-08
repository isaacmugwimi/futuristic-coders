"use client";

import "./EnrollModal.css";
import { useEffect, useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { PAYMENT_METHODS, formatKSh, todayISO } from "@/src/data/students";

/**
 * EnrollModal.jsx
 * Enrols an EXISTING student in a program. No new registration.
 *
 * Two ways to use it
 *   1. One student already known (Students page): pass `student`.
 *   2. Student not known yet (Enrollments page): pass `students` and
 *      the modal shows a search + picker.
 *
 * Props
 *   student          optional. { id | studentId, fullName, studentNo }
 *   students         optional. [{ studentId, fullName, studentNo }] for the picker
 *   programs         published programs (raw backend rows: id, title, price)
 *   enrollments      optional. all enrollment rows ({ studentId, programId, status });
 *                    used to hide programs the student is already active in
 *   takenProgramIds  optional. overrides the list worked out from `enrollments`
 *   onSave(data)     async; data = { studentId, programId, fee, enrolledOn, payment? }
 *                    The parent shows errors and closes on success.
 *   onClose          close without saving
 */
export default function EnrollModal({
  student = null,
  students = [],
  programs,
  enrollments = [],
  takenProgramIds,
  onSave,
  onClose,
}) {
  const fixedId = student ? (student.studentId ?? student.id) : null;

  const [pickedId, setPickedId] = useState("");
  const [search, setSearch] = useState("");
  const [programId, setProgramId] = useState("");
  const [fee, setFee] = useState("");
  const [enrolledOn, setEnrolledOn] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const studentId = fixedId ?? pickedId;

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      `${s.fullName} ${s.studentNo}`.toLowerCase().includes(q),
    );
  }, [students, search]);

  // Programs the student is already active or on hold in can't be joined again.
  const taken =
    takenProgramIds ??
    enrollments
      .filter(
        (e) =>
          e.studentId === studentId &&
          (e.status === "active" || e.status === "on_hold"),
      )
      .map((e) => e.programId);

  const available = programs.filter((p) => !taken.includes(p.id));

  const person = student ?? students.find((s) => s.studentId === pickedId);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  function pickStudent(id) {
    setPickedId(id);
    setProgramId("");
    setFee("");
    setError("");
  }

  function pickProgram(id) {
    setProgramId(id);
    const program = available.find((p) => p.id === id);
    setFee(program ? String(Number(program.price ?? 0)) : "");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    if (!studentId) return setError("Choose a student.");
    if (!programId) return setError("Choose a program.");

    const feeNumber = Number(fee);
    if (fee === "" || !Number.isFinite(feeNumber) || feeNumber < 0)
      return setError("Enter a valid fee.");

    let payment;
    if (amount !== "") {
      const amountNumber = Number(amount);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0)
        return setError("Enter a valid first payment amount.");
      if (amountNumber > feeNumber)
        return setError("The first payment can't be more than the fee.");
      if (method === "mpesa" && !reference.trim())
        return setError("Enter the M-Pesa transaction code.");

      payment = {
        amount: amountNumber,
        paymentMethod: method,
        reference: reference.trim() || undefined,
      };
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        studentId,
        programId,
        fee: feeNumber,
        enrolledOn,
        payment,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="em-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        className="em"
        role="dialog"
        aria-modal="true"
        aria-labelledby="em-title"
        onSubmit={submit}
      >
        <header className="em__head">
          <span className="em__icon">
            <UserPlus size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="em-title">
              {student ? "Enroll in another program" : "New enrollment"}
            </h2>
            <p>
              {person
                ? `${person.fullName} · ${person.studentNo}`
                : "Choose a student and a program"}
            </p>
          </div>
          <button
            type="button"
            className="em__close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="em__body">
          {!student && (
            <>
              <label className="em__field">
                Find student
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or student number…"
                  autoComplete="off"
                  autoFocus
                />
              </label>
              <label className="em__field">
                Student
                <select
                  value={pickedId}
                  onChange={(e) => pickStudent(e.target.value)}
                >
                  <option value="">
                    {matches.length
                      ? "Select a student…"
                      : "No student matches"}
                  </option>
                  {matches.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.studentNo})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {studentId &&
            (available.length === 0 ? (
              <p className="em__empty">
                There are no other published programs this student can join
                right now.
              </p>
            ) : (
              <>
                <label className="em__field">
                  Program
                  <select
                    value={programId}
                    onChange={(e) => pickProgram(e.target.value)}
                    autoFocus={Boolean(student)}
                  >
                    <option value="">Select a program…</option>
                    {available.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({formatKSh(p.price)})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="em__row">
                  <label className="em__field">
                    Agreed fee (KSh)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                    />
                  </label>
                  <label className="em__field">
                    Enrolled on
                    <input
                      type="date"
                      value={enrolledOn}
                      onChange={(e) => setEnrolledOn(e.target.value)}
                    />
                  </label>
                </div>

                <fieldset className="em__payment">
                  <legend>First payment (optional)</legend>
                  <div className="em__row">
                    <label className="em__field">
                      Amount (KSh)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label className="em__field">
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
                  </div>
                  {amount !== "" && (
                    <label className="em__field">
                      {method === "mpesa"
                        ? "M-Pesa transaction code"
                        : "Reference (optional)"}
                      <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        autoComplete="off"
                      />
                    </label>
                  )}
                </fieldset>
              </>
            ))}

          {error && (
            <p className="em__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="em__foot">
          <button
            type="button"
            className="em__btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="em__btn em__btn--primary"
            disabled={saving || !studentId || available.length === 0}
          >
            {saving ? "Enrolling…" : "Enroll student"}
          </button>
        </footer>
      </form>
    </div>
  );
}