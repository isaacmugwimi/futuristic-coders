"use client";

import "./RegisterWizard.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, UserPlus } from "lucide-react";
import {
  INITIAL_VALUES,
  STEPS,
  StepPersonal,
  StepReview,
  StepRole,
  StepSecurity,
  normalizeKenyanPhone,
  validateField,
  validateStep,
} from "../RegisterSteps/RegisterSteps";

/**
 * RegisterWizard.jsx
 * The white card: logo, stepper, step panels, buttons and the success screen.
 */

/* ============================== small building blocks ============================== */

/** tone: light (for dark backgrounds) | dark (for white cards) */
export function BrandLogo({ tone = "dark", size = 48 }) {
  return (
    <div className={`brand-logo brand-logo--${tone}`}>
      <Image
        src="/images/flogo.png"
        alt="Futuristic Coders logo"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="brand-logo__mark"
        priority
      />
      <div className="brand-logo__text">
        <span className="brand-logo__name">
          Futuristic <span className="brand-logo__accent">Coders</span>
        </span>
        <span className="brand-logo__sub">Admin Portal</span>
      </div>
    </div>
  );
}

/**
 * variant: primary | secondary | ghost
 * icon shows before the label, or after it with iconAfter.
 * Pass href to render a link that looks like the button.
 */
function AuthButton({
  variant = "primary",
  icon: Icon,
  iconAfter = false,
  loading = false,
  href,
  className = "",
  children,
  disabled,
  ...props
}) {
  const classes = `auth-btn auth-btn--${variant} ${className}`.trim();
  const icon = Icon && !loading ? <Icon size={19} aria-hidden="true" /> : null;
  const content = (
    <>
      {loading && <span className="auth-btn__spinner" aria-hidden="true" />}
      {!iconAfter && icon}
      {children}
      {iconAfter && icon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}

/** steps: [{ id, label }]. Completed steps are clickable so people can go back. */
function WizardStepper({ steps, current, onStepClick }) {
  return (
    <ol className="wz-steps" aria-label="Registration progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const dot = (
          <>
            <span className="wz-steps__dot">{done ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : index + 1}</span>
            <span className="wz-steps__label">{step.label}</span>
          </>
        );

        return (
          <li
            key={step.id}
            className={`wz-steps__item${done ? " is-done" : ""}${active ? " is-current" : ""}`}
            aria-current={active ? "step" : undefined}
          >
            {done ? (
              <button
                type="button"
                className="wz-steps__inner wz-steps__inner--button"
                onClick={() => onStepClick(index)}
                aria-label={`Go back to ${step.label}`}
              >
                {dot}
              </button>
            ) : (
              <span className="wz-steps__inner">{dot}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function RegisterSuccess({ fullName, email, staffCode }) {
  const firstName = fullName.trim().split(/\s+/)[0];

  return (
    <div className="reg-success" role="status">
      <span className="reg-success__icon">
        <BadgeCheck size={40} aria-hidden="true" />
      </span>
      <h2 className="reg-success__title">Account created{firstName ? `, ${firstName}` : ""}!</h2>
      <p className="reg-success__text">
        You can now sign in with <strong>{email}</strong>.
      </p>

      {staffCode && (
        <div className="reg-success__code">
          <span>Your staff code</span>
          <strong>{staffCode}</strong>
        </div>
      )}

      <AuthButton href="/" icon={ArrowRight} iconAfter className="reg-success__link">
        Go to sign in
      </AuthButton>
    </div>
  );
}

/* ============================== the wizard ============================== */

// TODO: point this at your backend (set NEXT_PUBLIC_API_URL in .env.local)
const REGISTER_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/users/create-user`;

export default function RegisterWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState(null); // { staffCode } after success

  const formRef = useRef(null);
  const headingRef = useRef(null);
  const mounted = useRef(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Move focus to the new step's heading so screen-reader and keyboard users know it changed
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function focusFirstInvalid() {
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
  }

  function handleChange(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    setFormError("");
  }

  function handleBlur(name) {
    if (values[name] === "" || values[name] === false) return; // don't nag empty fields before they're submitted
    setErrors((e) => ({ ...e, [name]: validateField(name, values) || undefined }));
  }

  function goTo(index, dir) {
    setDirection(dir);
    setStep(index);
  }

  function goNext() {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstInvalid();
      return;
    }
    goTo(step + 1, "forward");
  }

  async function handleSubmit() {
    // Re-check every step, and jump back to the first one with a problem
    for (let i = 0; i < STEPS.length; i += 1) {
      const found = validateStep(i, values);
      if (Object.keys(found).length) {
        setErrors(found);
        if (i !== step) goTo(i, "back");
        focusFirstInvalid();
        return;
      }
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: normalizeKenyanPhone(values.phone),
          password: values.password,
          role: values.role,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setErrors({ email: data.message || "An account with this email already exists." });
        goTo(0, "back");
        focusFirstInvalid();
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "We couldn't create your account. Please try again.");
      }

      setValues((v) => ({ ...v, password: "", confirmPassword: "" })); // don't keep passwords around
      setResult({ staffCode: data.user?.staff_code ?? data.user?.staffCode ?? data.staffCode ?? null });
    } catch (error) {
      setFormError(
        error instanceof TypeError
          ? "We couldn't reach the server. Check your connection and try again."
          : error.message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (isLast) handleSubmit();
    else goNext();
  }

  const stepProps = { values, errors, onChange: handleChange, onBlur: handleBlur };

  if (result) {
    return (
      <section className="reg-wizard">
        <RegisterSuccess fullName={values.fullName} email={values.email.trim().toLowerCase()} staffCode={result.staffCode} />
      </section>
    );
  }

  return (
    <section className="reg-wizard" aria-labelledby="reg-wizard-title">
      <header className="reg-wizard__header">
        <BrandLogo tone="dark" size={44} />
        <p className="reg-wizard__count">
          Step {step + 1} of {STEPS.length}
        </p>
      </header>

      <WizardStepper steps={STEPS} current={step} onStepClick={(index) => goTo(index, "back")} />

      <form ref={formRef} className="reg-wizard__form" onSubmit={onSubmit} noValidate>
        <div className="reg-wizard__body">
          <div key={step} className="reg-wizard__panel" data-direction={direction}>
            <h2 id="reg-wizard-title" ref={headingRef} tabIndex={-1} className="reg-wizard__title">
              {current.title}
            </h2>
            <p className="reg-wizard__subtitle">{current.subtitle}</p>

            {step === 0 && <StepPersonal {...stepProps} />}
            {step === 1 && <StepSecurity {...stepProps} />}
            {step === 2 && <StepRole {...stepProps} />}
            {step === 3 && <StepReview {...stepProps} onEdit={(index) => goTo(index, "back")} />}
          </div>
        </div>

        {formError && (
          <p className="reg-wizard__error" role="alert">
            {formError}
          </p>
        )}

        <div className="reg-wizard__actions">
          {step > 0 ? (
            <AuthButton variant="secondary" icon={ArrowLeft} onClick={() => goTo(step - 1, "back")} disabled={submitting}>
              Back
            </AuthButton>
          ) : (
            <span />
          )}

          {isLast ? (
            <AuthButton type="submit" icon={UserPlus} loading={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </AuthButton>
          ) : (
            <AuthButton type="submit" icon={ArrowRight} iconAfter>
              Continue
            </AuthButton>
          )}
        </div>
      </form>

      <p className="reg-wizard__signin">
        Already have an account? <Link href="/">Sign in</Link>
      </p>
    </section>
  );
}