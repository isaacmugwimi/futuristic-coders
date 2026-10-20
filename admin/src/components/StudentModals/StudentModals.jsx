"use client";

import "./StudentModals.css";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  TriangleAlert,
  User,
  Wallet,
  X,
} from "lucide-react";

import {
  CERTIFICATE_TYPES,
  PAYMENT_METHODS,
  STATUS_META,
  avatarTone,
  certificateEligibility,
  formatDate,
  formatKSh,
  formatPhone,
  honorsFor,
  initials,
  isChildAgeGroup,
  normalizeKenyanPhone,
  paymentInfo,
  todayISO,
} from "@/src/data/students";

import { useEnrollmentCertificates } from "@/src/hooks/students/useStudentQueries";

/**
 * StudentModals.jsx
 * Every popup on the Students page: details, add/edit form, confirmations,
 * the "mark as completed" dialog and the toast message.
 * Programs, age groups and certificates all come from the backend.
 */

/* ============================== modal shell ============================== */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({
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
      className="sm-overlay"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`sm-dialog sm-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="sm-dialog__header">
          <div>
            <h2 id={titleId} className="sm-dialog__title">
              {title}
            </h2>
            {subtitle && <p className="sm-dialog__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="sm-dialog__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="sm-dialog__body">{children}</div>
        {footer && <div className="sm-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

function Btn({
  variant = "primary",
  icon: Icon,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`sm-btn sm-btn--${variant} ${className}`.trim()}
      {...props}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      {children}
    </button>
  );
}

function Badge({ tone = "neutral", icon: Icon, children }) {
  return (
    <span className={`sm-badge sm-badge--${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

/* ============================== toast ============================== */

const TOAST_ICONS = { success: CircleCheck, danger: CircleAlert, info: Info };

/** toast: { id, message, tone: success | info | danger } or null */
export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const Icon = TOAST_ICONS[toast.tone] ?? CircleCheck;

  return (
    <div
      className={`sm-toast sm-toast--${toast.tone}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={20} aria-hidden="true" />
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ============================== confirm + complete dialogs ============================== */

/** tone: primary | danger. items: names affected by a bulk action */
export function ConfirmDialog({
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
          <Btn variant="secondary" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Btn>
        </>
      }
    >
      <div className="sm-confirm">
        <span className={`sm-confirm__icon sm-confirm__icon--${tone}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="sm-confirm__message">{message}</p>
          {shown.length > 1 && (
            <ul className="sm-confirm__list">
              {shown.map((name) => (
                <li key={name}>{name}</li>
              ))}
              {extra > 0 && (
                <li className="sm-confirm__more">and {extra} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Marks one or many students as completed. For a single student a final score can be entered. */
export function CompleteDialog({ students, onConfirm, onCancel }) {
  const single = students.length === 1 ? students[0] : null;
  const [score, setScore] = useState(
    single?.finalScore != null ? String(single.finalScore) : "",
  );
  const [error, setError] = useState("");

  function submit() {
    if (single && score.trim() !== "") {
      const n = Number(score);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setError("Enter a score from 0 to 100, or leave it empty.");
        return;
      }
      onConfirm({ finalScore: n });
      return;
    }
    onConfirm({});
  }

  const lowAttendance = students.filter(
    (s) => s.attendance != null && s.attendance < 75,
  );

  return (
    <Modal
      size="sm"
      title={
        single
          ? "Mark as completed?"
          : `Mark ${students.length} students as completed?`
      }
      onClose={onCancel}
      footer={
        <>
          <Btn variant="secondary" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn icon={GraduationCap} onClick={submit}>
            Mark as completed
          </Btn>
        </>
      }
    >
      <div className="sm-confirm">
        <span className="sm-confirm__icon sm-confirm__icon--violet">
          <GraduationCap size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="sm-confirm__message">
            {single ? (
              <strong>{single.fullName}</strong>
            ) : (
              `${students.length} students`
            )}{" "}
            will move to <strong>Completed students</strong>, their progress
            becomes 100%, and they become eligible for a certificate.
          </p>
          {lowAttendance.length > 0 && (
            <p className="sm-confirm__warning">
              <TriangleAlert size={15} aria-hidden="true" />
              {lowAttendance.length === 1
                ? `${lowAttendance[0].fullName}'s attendance is only ${lowAttendance[0].attendance}%.`
                : `${lowAttendance.length} of these students have attendance below 75%.`}
            </p>
          )}
          {single && (
            <label className="sm-complete__score">
              <span>Final score (optional)</span>
              <input
                type="number"
                min="0"
                max="100"
                inputMode="numeric"
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 85"
                aria-invalid={error ? "true" : undefined}
              />
              {error ? (
                <small role="alert">{error}</small>
              ) : (
                <small>
                  Used for Distinction / Merit / Pass on the certificate.
                </small>
              )}
            </label>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============================== details ============================== */

function Info2({ icon: Icon, label, children }) {
  return (
    <div className="sm-info">
      <dt>
        <Icon size={14} aria-hidden="true" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

function Meter({ value, label }) {
  return (
    <div className="sm-meter">
      <div className="sm-meter__top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <span
        className="sm-meter__bar"
        role="img"
        aria-label={`${label}: ${value}%`}
      >
        <span style={{ width: `${Math.min(100, value)}%` }} />
      </span>
    </div>
  );
}

export function StudentDetailsModal({
  student: s,
  onClose,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
}) {
  const meta = STATUS_META[s.status] ?? STATUS_META.active;
  const completed = s.status === "completed";
  const pay = paymentInfo(s);
  const honors = honorsFor(s.finalScore);
  const weeks = s.programWeeks;
  const elig = certificateEligibility(s);
  const cert = s.certificate;

  // The list only says whether a certificate exists. Its type and issue date
  // come from the certificates endpoint, fetched only when there is one.
  const { data: certResponse } = useEnrollmentCertificates(
    cert ? s.enrollmentId : null,
  );
  const issuedCert = (certResponse?.data ?? []).find(
    (c) => c.status === "issued",
  );
  const certTypeKey =
    issuedCert?.certificate_type ??
    (completed ? "completion" : "participation");
  const certNo = issuedCert?.certificate_no ?? cert?.no;

  return (
    <Modal
      size="lg"
      title="Student profile"
      subtitle={s.studentNo}
      onClose={onClose}
      footer={
        <>
          <Btn
            variant="ghost-danger"
            icon={Trash2}
            onClick={onDelete}
            className="sm-btn--left"
          >
            Delete
          </Btn>
          {completed ? (
            <Btn variant="secondary" icon={RotateCcw} onClick={onReopen}>
              Move back to active
            </Btn>
          ) : (
            <Btn variant="secondary" icon={GraduationCap} onClick={onComplete}>
              Mark as completed
            </Btn>
          )}
          <Btn icon={Pencil} onClick={onEdit}>
            Edit student
          </Btn>
        </>
      }
    >
      <div className="sm-profile">
        <div className="sm-profile__head">
          <span
            className={`sm-avatar sm-avatar--lg sm-avatar--tone${avatarTone(s.fullName)}`}
          >
            {initials(s.fullName)}
          </span>
          <div>
            <h3>{s.fullName}</h3>
            <p>{s.program}</p>
            <div className="sm-profile__badges">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              {s.ageGroup && <Badge>{s.ageGroup}</Badge>}
              {honors && (
                <Badge tone="gold" icon={Award}>
                  {honors}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <dl className="sm-info-grid">
          <Info2 icon={Mail} label="Email">
            {s.email || "—"}
          </Info2>
          <Info2 icon={Phone} label="Phone">
            {formatPhone(s.phone)}
          </Info2>
          <Info2 icon={MapPin} label="County">
            {s.county || "—"}
          </Info2>
          <Info2 icon={User} label="Guardian">
            {s.guardianName
              ? `${s.guardianName} · ${formatPhone(s.guardianPhone)}`
              : "—"}
          </Info2>
          <Info2 icon={CalendarDays} label="Enrolled">
            {formatDate(s.enrolledOn)}
          </Info2>
          <Info2
            icon={GraduationCap}
            label={completed ? "Completed" : "Duration"}
          >
            {completed
              ? formatDate(s.completedOn)
              : weeks
                ? `${weeks} weeks`
                : "—"}
          </Info2>
        </dl>

        <section className="sm-section">
          <h4>Progress</h4>
          <Meter value={s.progress} label="Course progress" />
          <Meter value={s.attendance ?? 0} label="Attendance" />
          {s.finalScore != null && (
            <p className="sm-section__line">
              Final score: <strong>{s.finalScore}%</strong>
            </p>
          )}
        </section>

        <section className="sm-section">
          <h4>Fees</h4>
          <div className="sm-pay">
            <div>
              <span>Total fee</span>
              <strong>{formatKSh(s.fee)}</strong>
            </div>
            <div>
              <span>Paid</span>
              <strong>{formatKSh(s.amountPaid)}</strong>
            </div>
            <div>
              <span>Balance</span>
              <strong className={pay.balance ? "is-due" : "is-clear"}>
                {formatKSh(pay.balance)}
              </strong>
            </div>
            <Badge
              tone={
                pay.status === "paid"
                  ? "success"
                  : pay.status === "partial"
                    ? "warning"
                    : "danger"
              }
              icon={Wallet}
            >
              {pay.status === "paid"
                ? "Fully paid"
                : pay.status === "partial"
                  ? "Part paid"
                  : "Not paid"}
            </Badge>
          </div>
        </section>

        <section
          className={`sm-cert${cert ? " is-issued" : elig.type ? "" : " is-locked"}`}
        >
          <span className="sm-cert__icon">
            <Award size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>
              {cert
                ? `${CERTIFICATE_TYPES[certTypeKey]?.label ?? "Certificate"} · ${certNo}`
                : elig.type
                  ? `Eligible for a ${CERTIFICATE_TYPES[elig.type].label}`
                  : "No certificate yet"}
            </strong>
            <span>
              {cert
                ? issuedCert
                  ? `Issued ${formatDate(issuedCert.issued_at)}`
                  : "Issued"
                : elig.reason}
            </span>
          </div>
          {(cert || elig.type) && (
            <Link
              href={`/dashboard/certificates?student=${s.id}`}
              className="sm-btn sm-btn--secondary"
            >
              {cert ? "View certificate" : "Issue certificate"}
            </Link>
          )}
        </section>

        {s.notes && (
          <section className="sm-section">
            <h4>Notes</h4>
            <p className="sm-notes">{s.notes}</p>
          </section>
        )}
      </div>
    </Modal>
  );
}

/* ============================== add / edit form ============================== */

// Payment fields are only sent when an amount is entered.
const EMPTY_PAYMENT = { payAmount: "", payMethod: "mpesa", payReference: "" };

function toValues(s) {
  return {
    fullName: s.fullName ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    ageGroup: s.ageGroup ?? "",
    county: s.county ?? "",
    guardianName: s.guardianName ?? "",
    guardianPhone: s.guardianPhone ?? "",
    programId: s.programId ?? "",
    enrolledOn: s.enrolledOn ?? todayISO(),
    status: s.status,
    progress: String(s.progress ?? 0),
    finalScore: s.finalScore == null ? "" : String(s.finalScore),
    fee: String(s.fee ?? 0),
    notes: s.notes ?? "",
    ...EMPTY_PAYMENT,
  };
}

const newValues = () => ({
  fullName: "",
  email: "",
  phone: "",
  ageGroup: "",
  county: "",
  guardianName: "",
  guardianPhone: "",
  programId: "",
  enrolledOn: todayISO(),
  status: "active",
  progress: "0",
  finalScore: "",
  fee: "",
  notes: "",
  ...EMPTY_PAYMENT,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MPESA_CODE_PATTERN = /^[A-Za-z0-9]{8,12}$/;

function Field({ id, label, required, error, hint, className = "", children }) {
  return (
    <div className={`sm-field ${className}`.trim()}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="sm-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="sm-field__hint">{hint}</p>
      )}
    </div>
  );
}

/**
 * programs: published programs the student can be enrolled in.
 * ageGroups: age group labels taken from the programs and students.
 *
 * onSave receives:
 *   fullName, email, phone, ageGroup, county, guardianName, guardianPhone,
 *   enrolledOn, status, finalScore, fee, notes,
 *   programId (adding only), progress (editing only),
 *   payment: { amount, paymentMethod, reference } or null
 */
export function StudentFormModal({
  student,
  programs = [],
  programsLoading = false,
  ageGroups = [],
  onSave,
  onClose,
}) {
  const editing = Boolean(student);
  // A student with no enrollment has no program, fees or progress to edit.
  const showEnrollment = !editing || Boolean(student.enrollmentId);
  const paidSoFar = editing ? Number(student.amountPaid ?? 0) : 0;

  const [values, setValues] = useState(() =>
    student ? toValues(student) : newValues(),
  );
  const [errors, setErrors] = useState({});
  const [feeTouched, setFeeTouched] = useState(editing);
  const formRef = useRef(null);
  const uid = useId();
  const formId = `${uid}-form`;
  const id = (name) => `${uid}-${name}`;
  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  });

  const childGroup = isChildAgeGroup(values.ageGroup);

  // Keep an existing student's age group selectable even if no program uses it.
  const ageOptions =
    !values.ageGroup || ageGroups.includes(values.ageGroup)
      ? ageGroups
      : [values.ageGroup, ...ageGroups];

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  // Picking a program fills in its price until the fee is edited by hand.
  function onProgramChange(programId) {
    const program = programs.find((p) => p.id === programId);
    setValues((v) => ({
      ...v,
      programId,
      fee: !feeTouched && program ? String(Number(program.price ?? 0)) : v.fee,
    }));
    if (errors.programId) setErrors((e) => ({ ...e, programId: undefined }));
  }

  function validate(v) {
    const e = {};
    const num = (x) => (String(x).trim() === "" ? NaN : Number(x));

    if (v.fullName.trim().length < 3) e.fullName = "Enter the student's name.";
    if (v.email.trim() && !EMAIL_PATTERN.test(v.email.trim()))
      e.email = "Enter a valid email address.";

    if (v.phone.trim() && !normalizeKenyanPhone(v.phone))
      e.phone = "Enter a valid Kenyan number, e.g. 0712 345 678.";
    // The backend needs at least one way to reach the student.
    if (!v.phone.trim() && !v.guardianPhone.trim() && !v.email.trim())
      e.phone = "Add a phone number, a guardian phone or an email.";

    // Kids need a parent or guardian; for everyone else it's optional.
    if (childGroup && !v.guardianName.trim())
      e.guardianName = "Kids need a parent or guardian name.";
    if (
      v.guardianPhone.trim()
        ? !normalizeKenyanPhone(v.guardianPhone)
        : childGroup
    )
      e.guardianPhone = "Enter a valid guardian phone number.";

    if (showEnrollment) {
      if (!editing && !v.programId) e.programId = "Choose a program.";
      if (!v.enrolledOn) e.enrolledOn = "Pick the enrollment date.";

      if (editing) {
        const progress = num(v.progress);
        if (!(Number.isInteger(progress) && progress >= 0 && progress <= 100))
          e.progress = "Enter a whole number from 0 to 100.";
      }

      if (
        v.finalScore.trim() !== "" &&
        !(num(v.finalScore) >= 0 && num(v.finalScore) <= 100)
      )
        e.finalScore = "Enter 0 to 100.";

      const fee = num(v.fee);
      if (!(fee >= 0)) e.fee = "Enter the fee in KSh.";
      else if (fee < paidSoFar)
        e.fee = `Fee can't be lower than the ${formatKSh(paidSoFar)} already paid.`;

      if (v.payAmount.trim() !== "") {
        const amount = num(v.payAmount);
        if (!(amount > 0)) e.payAmount = "Enter an amount above 0.";
        else if (fee >= 0 && amount > fee - paidSoFar + 0.001)
          e.payAmount = `Can't be more than the balance of ${formatKSh(Math.max(fee - paidSoFar, 0))}.`;

        if (
          v.payMethod === "mpesa" &&
          !MPESA_CODE_PATTERN.test(v.payReference.trim())
        )
          e.payReference = "Enter the M-Pesa transaction code.";
      }
    }

    return e;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    const payAmount =
      values.payAmount.trim() === "" ? 0 : Number(values.payAmount);

    onSave({
      fullName: values.fullName.trim().replace(/\s+/g, " "),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() ? normalizeKenyanPhone(values.phone) : "",
      ageGroup: values.ageGroup,
      county: values.county.trim(),
      guardianName: values.guardianName.trim(),
      guardianPhone: values.guardianPhone.trim()
        ? normalizeKenyanPhone(values.guardianPhone)
        : "",
      notes: values.notes.trim(),
      ...(showEnrollment && {
        ...(editing
          ? { progress: Number(values.progress) }
          : { programId: values.programId }),
        enrolledOn: values.enrolledOn,
        status: values.status,
        finalScore:
          values.finalScore.trim() === "" ? null : Number(values.finalScore),
        fee: Number(values.fee),
        payment:
          payAmount > 0
            ? {
                amount: payAmount,
                paymentMethod: values.payMethod,
                reference: values.payReference.trim(),
              }
            : null,
      }),
    });
  }

  const input = (name, extra = {}) => (
    <input
      id={id(name)}
      className="sm-input"
      value={values[name]}
      onChange={(e) => set(name, e.target.value)}
      {...aria(name)}
      {...extra}
    />
  );

  const select = (name, options, onChange, extra = {}) => (
    <select
      id={id(name)}
      className="sm-input"
      value={values[name]}
      onChange={(e) => (onChange ?? ((v) => set(name, v)))(e.target.value)}
      {...aria(name)}
      {...extra}
    >
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  );

  const balanceNow = Math.max(Number(values.fee || 0) - paidSoFar, 0);

  return (
    <Modal
      size="lg"
      title={editing ? "Edit student" : "Add student"}
      subtitle={
        editing
          ? `${student.studentNo} · ${student.fullName}`
          : "Register a new learner."
      }
      onClose={onClose}
      closeOnBackdrop={false}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" form={formId} icon={editing ? Save : Plus}>
            {editing ? "Save changes" : "Add student"}
          </Btn>
        </>
      }
    >
      <form
        id={formId}
        ref={formRef}
        className="sm-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <section>
          <h3>Personal details</h3>
          <div className="sm-grid">
            <Field
              id={id("fullName")}
              label="Full name"
              required
              error={errors.fullName}
              hint="This name is printed on the certificate."
              className="sm-full"
            >
              {input("fullName", {
                placeholder: "e.g. Amina Wanjiru",
                autoFocus: true,
              })}
            </Field>
            <Field id={id("ageGroup")} label="Age group">
              {ageOptions.length > 0
                ? select("ageGroup", [
                    { value: "", label: "Select age group" },
                    ...ageOptions.map((a) => ({ value: a, label: a })),
                  ])
                : input("ageGroup", { placeholder: "e.g. Kids (7–12)" })}
            </Field>
            <Field id={id("county")} label="County / town">
              {input("county", { placeholder: "e.g. Kirinyaga" })}
            </Field>
            <Field
              id={id("phone")}
              label="Phone number"
              error={errors.phone}
              hint="Student or guardian phone, or an email, is needed."
            >
              {input("phone", { type: "tel", placeholder: "0712 345 678" })}
            </Field>
            <Field
              id={id("email")}
              label="Email"
              error={errors.email}
              hint="Optional"
            >
              {input("email", {
                type: "email",
                placeholder: "name@example.com",
              })}
            </Field>
          </div>
        </section>

        <section>
          <h3>Parent / guardian</h3>
          <div className="sm-grid">
            <Field
              id={id("guardianName")}
              label="Guardian name"
              required={childGroup}
              error={errors.guardianName}
            >
              {input("guardianName")}
            </Field>
            <Field
              id={id("guardianPhone")}
              label="Guardian phone"
              required={childGroup}
              error={errors.guardianPhone}
            >
              {input("guardianPhone", {
                type: "tel",
                placeholder: "0722 000 000",
              })}
            </Field>
          </div>
        </section>

        {showEnrollment && (
          <section>
            <h3>Program &amp; progress</h3>
            <div className="sm-grid">
              <Field
                id={id("programId")}
                label="Program"
                required={!editing}
                error={errors.programId}
                hint={
                  editing
                    ? "The program can't be changed after enrolling."
                    : programs.length === 0 && !programsLoading
                      ? "No published programs yet. Publish a program first."
                      : undefined
                }
                className="sm-full"
              >
                {editing ? (
                  <input
                    id={id("programId")}
                    className="sm-input"
                    value={student.program}
                    readOnly
                    disabled
                  />
                ) : (
                  select(
                    "programId",
                    [
                      {
                        value: "",
                        label: programsLoading
                          ? "Loading programs…"
                          : "Select a program",
                      },
                      ...programs.map((p) => ({ value: p.id, label: p.title })),
                    ],
                    onProgramChange,
                    { disabled: programsLoading },
                  )
                )}
              </Field>
              <Field
                id={id("enrolledOn")}
                label="Enrolled on"
                required
                error={errors.enrolledOn}
              >
                {input("enrolledOn", { type: "date" })}
              </Field>
              <Field
                id={id("status")}
                label="Status"
                hint={
                  values.status === "completed"
                    ? "Completed sets progress to 100%."
                    : undefined
                }
              >
                {select(
                  "status",
                  Object.entries(STATUS_META).map(([value, meta]) => ({
                    value,
                    label: meta.label,
                  })),
                )}
              </Field>
              {editing && (
                <Field
                  id={id("progress")}
                  label="Progress (%)"
                  error={errors.progress}
                  hint="Attendance is worked out from recorded sessions."
                >
                  {input("progress", {
                    type: "number",
                    min: 0,
                    max: 100,
                    inputMode: "numeric",
                  })}
                </Field>
              )}
              {(editing || values.status === "completed") && (
                <Field
                  id={id("finalScore")}
                  label="Final score (%)"
                  error={errors.finalScore}
                  hint="Optional"
                >
                  {input("finalScore", {
                    type: "number",
                    min: 0,
                    max: 100,
                    inputMode: "numeric",
                  })}
                </Field>
              )}
            </div>
          </section>
        )}

        {showEnrollment && (
          <section>
            <h3>Fees (KSh)</h3>
            <div className="sm-grid">
              <Field
                id={id("fee")}
                label="Total fee"
                required
                error={errors.fee}
                hint={
                  editing
                    ? `Paid so far ${formatKSh(paidSoFar)} · Balance ${formatKSh(balanceNow)}`
                    : "Filled in from the program's price."
                }
              >
                {input("fee", {
                  type: "number",
                  min: 0,
                  inputMode: "numeric",
                  onChange: (e) => {
                    setFeeTouched(true);
                    set("fee", e.target.value);
                  },
                })}
              </Field>
              <Field
                id={id("payAmount")}
                label={editing ? "Record a payment" : "First payment"}
                error={errors.payAmount}
                hint="Optional"
              >
                {input("payAmount", {
                  type: "number",
                  min: 0,
                  inputMode: "numeric",
                  placeholder: "Amount in KSh",
                })}
              </Field>
              {values.payAmount.trim() !== "" && (
                <>
                  <Field id={id("payMethod")} label="Payment method">
                    {select("payMethod", PAYMENT_METHODS)}
                  </Field>
                  <Field
                    id={id("payReference")}
                    label={
                      values.payMethod === "mpesa"
                        ? "M-Pesa transaction code"
                        : "Reference"
                    }
                    required={values.payMethod === "mpesa"}
                    error={errors.payReference}
                    hint={
                      values.payMethod === "mpesa"
                        ? undefined
                        : "Optional, e.g. a receipt number"
                    }
                  >
                    {input("payReference", {
                      placeholder:
                        values.payMethod === "mpesa" ? "e.g. QGH7XYZ123" : "",
                    })}
                  </Field>
                </>
              )}
            </div>
          </section>
        )}

        <section>
          <h3>Notes</h3>
          <Field id={id("notes")} label="Internal notes">
            <textarea
              id={id("notes")}
              className="sm-input sm-textarea"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything the team should know about this student"
            />
          </Field>
        </section>
      </form>
    </Modal>
  );
}
