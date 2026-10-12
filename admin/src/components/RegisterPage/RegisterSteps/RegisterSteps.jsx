"use client";

import "./RegisterSteps.css";
import { useState } from "react";
import { Check, Circle, Crown, Eye, EyeOff, Lock, Mail, Pencil, Phone, User, UserCog } from "lucide-react";

/**
 * RegisterSteps.jsx
 * Everything the four wizard steps need: validation rules, the labelled input,
 * the password strength meter and the four step screens.
 */

/* ============================== validation & config ============================== */

// Steps, roles and validation rules for the register wizard.

export const STEPS = [
  {
    id: "personal",
    label: "Personal",
    title: "Tell us about you",
    subtitle: "We use these details to create your staff profile.",
    fields: ["fullName", "email", "phone"],
  },
  {
    id: "security",
    label: "Security",
    title: "Secure your account",
    subtitle: "Choose a strong password you don't use anywhere else.",
    fields: ["password", "confirmPassword"],
  },
  {
    id: "role",
    label: "Role",
    title: "Choose your role",
    subtitle: "Pick the access level that matches your responsibilities.",
    fields: ["role"],
  },
  {
    id: "review",
    label: "Review",
    title: "Review and confirm",
    subtitle: "Check your details, then create your account.",
    fields: ["accepted"],
  },
];

// Edit the descriptions to match what each role can really do in your system.
export const ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Day-to-day running of the academy.",
    perks: ["Manage students, programs and enrollments", "Record payments and issue certificates"],
  },
  {
    value: "owner",
    label: "Owner",
    description: "Full control of the academy and its team.",
    perks: ["Everything an admin can do", "Manage staff accounts and system settings"],
  },
];

export const INITIAL_VALUES = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "admin",
  accepted: false,
};

/* ---------------- phone (Kenya) ---------------- */

/** 0712 345 678, 0112345678, +254712345678, 254712345678 -> "+254712345678", else null */
export function normalizeKenyanPhone(input) {
  const compact = String(input ?? "").replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+?254|0)([17]\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

/** "+254712345678" -> "+254 712 345 678" */
export function formatPhone(normalized) {
  if (!normalized) return "";
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 10)} ${normalized.slice(10)}`;
}

/* ---------------- password ---------------- */

export function passwordChecks(password) {
  return [
    { id: "length", label: "At least 8 characters", required: true, passed: password.length >= 8 },
    {
      id: "case",
      label: "Upper and lower case letters",
      required: true,
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { id: "number", label: "A number", required: true, passed: /\d/.test(password) },
    { id: "symbol", label: "A symbol, e.g. ! @ # $ (recommended)", required: false, passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

/** score 0-4 and a label, for the strength meter */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: "" };
  const score = passwordChecks(password).filter((check) => check.passed).length;
  const labels = ["Too weak", "Too weak", "Weak", "Good", "Strong"];
  return { score, label: labels[score] };
}

/* ---------------- field rules (return "" when valid) ---------------- */

const NAME_PATTERN = /^[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*)+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const VALIDATORS = {
  fullName(value) {
    const text = value.trim();
    if (!text) return "Enter your full name.";
    if (!NAME_PATTERN.test(text)) return "Enter your first and last name (letters only).";
    return "";
  },
  email(value) {
    const text = value.trim();
    if (!text) return "Enter your email address.";
    if (!EMAIL_PATTERN.test(text)) return "Enter a valid email address, e.g. name@example.com.";
    return "";
  },
  phone(value) {
    if (!value.trim()) return "Enter your phone number.";
    if (!normalizeKenyanPhone(value)) return "Enter a valid Kenyan number, e.g. 0712 345 678.";
    return "";
  },
  password(value) {
    if (!value) return "Create a password.";
    const missing = passwordChecks(value).some((check) => check.required && !check.passed);
    return missing ? "Use 8+ characters with upper and lower case letters and a number." : "";
  },
  confirmPassword(value, all) {
    if (!value) return "Confirm your password.";
    if (value !== all.password) return "Passwords don't match.";
    return "";
  },
  role(value) {
    return ROLES.some((role) => role.value === value) ? "" : "Choose a role.";
  },
  accepted(value) {
    return value === true ? "" : "Please confirm this to create your account.";
  },
};

export function validateField(name, values) {
  return VALIDATORS[name](values[name], values);
}

/** { field: message } for every invalid field on that step (empty object when valid) */
export function validateStep(stepIndex, values) {
  const errors = {};
  for (const field of STEPS[stepIndex].fields) {
    const message = validateField(field, values);
    if (message) errors[field] = message;
  }
  return errors;
}

/* ============================== form pieces ============================== */

/** Label + input with a leading icon, optional trailing control, hint and error. */
function AuthField({ id, label, icon: Icon, error, hint, trailing, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`auth-field__control${error ? " has-error" : ""}`}>
        {Icon && <Icon className="auth-field__icon" size={20} aria-hidden="true" />}
        <input
          id={id}
          className={`auth-field__input${trailing ? " has-trailing" : ""}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {trailing}
      </div>
      {error ? (
        <p className="auth-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="auth-field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Strength meter + checklist of password rules. */
function PasswordStrength({ password }) {
  const { score, label } = passwordStrength(password);
  const checks = passwordChecks(password);

  return (
    <div className="pw-strength">
      <div className="pw-strength__top">
        <div className="pw-strength__bars" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={`pw-strength__bar${n <= score ? ` is-on is-level-${score}` : ""}`} />
          ))}
        </div>
        <span className="pw-strength__label" aria-live="polite">
          {label && `Strength: ${label}`}
        </span>
      </div>

      <ul className="pw-strength__list">
        {checks.map((check) => (
          <li key={check.id} className={check.passed ? "is-passed" : ""}>
            {check.passed ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            <span>{check.label}</span>
            <span className="pw-strength__sr">{check.passed ? " (done)" : " (not yet)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================== the four steps ============================== */

export function StepPersonal({ values, errors, onChange, onBlur }) {
  return (
    <div className="step-personal">
      <AuthField
        id="reg-fullName"
        label="Full name"
        icon={User}
        value={values.fullName}
        onChange={(e) => onChange("fullName", e.target.value)}
        onBlur={() => onBlur("fullName")}
        error={errors.fullName}
        placeholder="e.g. Mary Wanjiru"
        autoComplete="name"
        autoFocus
        required
      />
      <AuthField
        id="reg-email"
        label="Email address"
        icon={Mail}
        type="email"
        value={values.email}
        onChange={(e) => onChange("email", e.target.value)}
        onBlur={() => onBlur("email")}
        error={errors.email}
        placeholder="name@futuristic-coders.co.ke"
        autoComplete="email"
        required
      />
      <AuthField
        id="reg-phone"
        label="Phone number"
        icon={Phone}
        type="tel"
        inputMode="tel"
        value={values.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        onBlur={() => onBlur("phone")}
        error={errors.phone}
        hint="Kenyan number, e.g. 0712 345 678 or +254 712 345 678"
        placeholder="0712 345 678"
        autoComplete="tel"
        required
      />
    </div>
  );
}

function VisibilityToggle({ shown, onToggle, label }) {
  return (
    <button
      type="button"
      className="step-security__toggle"
      onClick={onToggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      aria-pressed={shown}
    >
      {shown ? <Eye size={20} aria-hidden="true" /> : <EyeOff size={20} aria-hidden="true" />}
    </button>
  );
}

export function StepSecurity({ values, errors, onChange, onBlur }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="step-security">
      <AuthField
        id="reg-password"
        label="Password"
        icon={Lock}
        type={showPassword ? "text" : "password"}
        value={values.password}
        onChange={(e) => onChange("password", e.target.value)}
        onBlur={() => onBlur("password")}
        error={errors.password}
        placeholder="Create a password"
        autoComplete="new-password"
        autoFocus
        required
        trailing={
          <VisibilityToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} label="password" />
        }
      />

      <PasswordStrength password={values.password} />

      <AuthField
        id="reg-confirmPassword"
        label="Confirm password"
        icon={Lock}
        type={showConfirm ? "text" : "password"}
        value={values.confirmPassword}
        onChange={(e) => onChange("confirmPassword", e.target.value)}
        onBlur={() => onBlur("confirmPassword")}
        error={errors.confirmPassword}
        placeholder="Type it again"
        autoComplete="new-password"
        required
        trailing={
          <VisibilityToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} label="confirmation" />
        }
      />
    </div>
  );
}

const ROLE_ICONS = { admin: UserCog, owner: Crown };

export function StepRole({ values, errors, onChange }) {
  return (
    <div className="step-role">
      <div className="step-role__options" role="radiogroup" aria-label="Role">
        {ROLES.map((role) => {
          const Icon = ROLE_ICONS[role.value] ?? UserCog;
          const selected = values.role === role.value;

          return (
            <label key={role.value} className={`step-role__option${selected ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selected}
                onChange={() => onChange("role", role.value)}
                className="step-role__input"
              />
              <span className="step-role__icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="step-role__body">
                <strong>{role.label}</strong>
                <span className="step-role__desc">{role.description}</span>
                <ul className="step-role__perks">
                  {role.perks.map((perk) => (
                    <li key={perk}>
                      <Check size={14} strokeWidth={3} aria-hidden="true" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </span>
              <span className="step-role__radio" aria-hidden="true" />
            </label>
          );
        })}
      </div>

      {errors.role && (
        <p className="step-role__error" role="alert">
          {errors.role}
        </p>
      )}

      <p className="step-role__note">Owner accounts have the widest access, so choose Owner only for the academy owner.</p>
    </div>
  );
}

export function StepReview({ values, errors, onChange, onEdit }) {
  const role = ROLES.find((r) => r.value === values.role);
  const phone = normalizeKenyanPhone(values.phone);

  const rows = [
    { label: "Full name", value: values.fullName.trim(), step: 0 },
    { label: "Email", value: values.email.trim().toLowerCase(), step: 0 },
    { label: "Phone", value: phone ? formatPhone(phone) : values.phone, step: 0 },
    { label: "Password", value: "•".repeat(Math.min(values.password.length, 12)), step: 1 },
    { label: "Role", value: role?.label ?? "", step: 2 },
  ];

  return (
    <div className="step-review">
      <dl className="step-review__list">
        {rows.map((row) => (
          <div key={row.label} className="step-review__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
            <button
              type="button"
              className="step-review__edit"
              onClick={() => onEdit(row.step)}
              aria-label={`Edit ${row.label.toLowerCase()}`}
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
          </div>
        ))}
      </dl>

      <label className={`step-review__accept${errors.accepted ? " has-error" : ""}`}>
        <input
          type="checkbox"
          checked={values.accepted}
          onChange={(e) => onChange("accepted", e.target.checked)}
          aria-invalid={errors.accepted ? "true" : undefined}
          aria-describedby={errors.accepted ? "reg-accepted-error" : undefined}
        />
        <span>I confirm I am authorised staff of Futuristic Coders and I accept the terms of use for this portal.</span>
      </label>
      {errors.accepted && (
        <p id="reg-accepted-error" className="step-review__error" role="alert">
          {errors.accepted}
        </p>
      )}

      <p className="step-review__note">Your staff code is generated automatically when the account is created.</p>
    </div>
  );
}