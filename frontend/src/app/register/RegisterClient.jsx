"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaUser,
  FaChild,
  FaGraduationCap,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { useSubmitRegistration } from "../../hooks/registrations/useRegistrationMutation";
import { usePublishedPrograms } from "../../hooks/programs/useProgramQueries";
import "./register.css";
import "../../global.css";

const STEPS = [
  { id: 1, label: "Parent Info", icon: <FaUser /> },
  { id: 2, label: "Child Info", icon: <FaChild /> },
  { id: 3, label: "Program Info", icon: <FaGraduationCap /> },
  { id: 4, label: "Confirmation", icon: <FiCheck /> },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{7,30}$/;

// Drops empty values so we never send "" to the API.
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) =>
      typeof v === "string" ? v.trim() !== "" : v != null,
    ),
  );

function RegisterForm() {
  const searchParams = useSearchParams();
  const selectedCourse = searchParams.get("course") || "";

  const { data: programsData, isLoading: programsLoading } =
    usePublishedPrograms();

  // The API may send an array or { data: [...] } / { programs: [...] }.
  const programs = Array.isArray(programsData)
    ? programsData
    : (programsData?.data ?? programsData?.programs ?? []);

  const {
    mutateAsync: sendRegistration,
    isPending: submitting,
    isSuccess: succeeded,
  } = useSubmitRegistration();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Only the fields the backend stores.
  const [formData, setFormData] = useState({
    // Parent
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    location: "",

    // Child
    childName: "",
    ageGroup: "",

    // Program
    programId: "",
    notes: "",
  });

  // Preselect the program from ?course= once the list has loaded.
  // Matches the program's slug, id or title.
  useEffect(() => {
    if (!programs.length || !selectedCourse) return;

    const wanted = selectedCourse.trim().toLowerCase();
    const match = programs.find((p) =>
      [p.slug, p.id, p.title].some(
        (v) => v && String(v).toLowerCase() === wanted,
      ),
    );

    if (match) {
      setFormData((f) => (f.programId ? f : { ...f, programId: match.id }));
    }
  }, [programs, selectedCourse]);

  const selectedProgram = programs.find((p) => p.id === formData.programId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.parentName.trim()) newErrors.parentName = true;
      if (!PHONE_RE.test(formData.parentPhone.trim()))
        newErrors.parentPhone = true;
      if (!EMAIL_RE.test(formData.parentEmail.trim()))
        newErrors.parentEmail = true;
    }

    if (step === 2) {
      if (!formData.childName.trim()) newErrors.childName = true;
      if (!formData.ageGroup) newErrors.ageGroup = true;
    }

    if (step === 3) {
      if (!formData.programId) newErrors.programId = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => {
    setErrors({});
    setSubmitError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  // Sends exactly what the backend accepts (see submitRegistrationSchema).
  const buildPayload = () => {
    const f = formData;
    return clean({
      fullName: f.childName.trim(),
      guardianName: f.parentName.trim(),
      guardianPhone: f.parentPhone.trim(),
      email: f.parentEmail.trim(),
      ageGroup: f.ageGroup,
      county: f.location.trim(),
      programId: f.programId,
      notes: f.notes.trim(),
      website: honeypot, // honeypot: stays empty for real visitors
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (step !== 4 || submitting) return;

    setSubmitError("");
    try {
      await sendRegistration(buildPayload());
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    }
  };

  /* ── SUCCESS ── */
  if (succeeded) {
    return (
      <div className="reg-success">
        <div className="reg-success-icon">
          <FaCheckCircle />
        </div>
        <h1>Registration Received! 🎉</h1>
        <p>
          Our team will review it and contact you shortly to confirm your
          child's spot.
        </p>
        <a href="/" className="reg-success-btn">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <section className="reg-page">
      <div className="reg-bg-grid"></div>
      <div className="reg-bg-glow reg-bg-glow--1"></div>
      <div className="reg-bg-glow reg-bg-glow--2"></div>

      <div className="reg-wrapper">
        {/* HEADER */}
        <div className="reg-header">
          <div className="reg-label">
            <span className="reg-label-dot"></span>
            Enroll Today
          </div>
          <h1 className="reg-title">Student Registration</h1>
          <p className="reg-subtitle">
            Complete the steps below to secure your child's spot.
          </p>
        </div>

        {/* STEPPER */}
        <div className="reg-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="reg-stepper-item">
              <div
                className={`reg-step-circle ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}
              >
                {step > s.id ? <FiCheck size={16} /> : s.icon}
              </div>
              <span
                className={`reg-step-label ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`reg-step-line ${step > s.id ? "done" : ""}`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="reg-card">
          <form
            onSubmit={handleFormSubmit}
            onKeyDown={(e) => {
              // Stop Enter from submitting, but allow new lines in textareas.
              if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
          >
            {/* ── STEP 1: PARENT ── */}
            {step === 1 && (
              <div className="reg-step-content">
                <div className="reg-step-heading">
                  <div className="reg-step-icon">
                    <FaUser />
                  </div>
                  <div>
                    <h2>Parent / Guardian Details</h2>
                    <p>
                      Tell us about the parent or guardian enrolling the child.
                    </p>
                  </div>
                </div>

                <div className="reg-fields">
                  <div className="reg-field">
                    <label>
                      Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      placeholder="e.g. Jane Kamau"
                      value={formData.parentName}
                      onChange={handleChange}
                      className={errors.parentName ? "reg-input-error" : ""}
                    />
                    {errors.parentName && (
                      <p className="reg-error-msg">Full name is required</p>
                    )}
                  </div>

                  <div className="reg-field">
                    <label>
                      Phone Number <span>*</span>
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      placeholder="+254 757 810 818"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className={errors.parentPhone ? "reg-input-error" : ""}
                    />
                    {errors.parentPhone && (
                      <p className="reg-error-msg">
                        Enter a valid phone number
                      </p>
                    )}
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>
                      Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      placeholder="jane@example.com"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      className={errors.parentEmail ? "reg-input-error" : ""}
                    />
                    {errors.parentEmail && (
                      <p className="reg-error-msg">
                        Enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>Location / County</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Nairobi"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: CHILD ── */}
            {step === 2 && (
              <div className="reg-step-content">
                <div className="reg-step-heading">
                  <div className="reg-step-icon">
                    <FaChild />
                  </div>
                  <div>
                    <h2>Child's Details</h2>
                    <p>
                      We need a few details about your child to place them
                      correctly.
                    </p>
                  </div>
                </div>

                <div className="reg-fields">
                  <div className="reg-field reg-field--full">
                    <label>
                      Child's Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="childName"
                      placeholder="e.g. Brian Kamau"
                      value={formData.childName}
                      onChange={handleChange}
                      className={errors.childName ? "reg-input-error" : ""}
                    />
                    {errors.childName && (
                      <p className="reg-error-msg">Child's name is required</p>
                    )}
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>
                      Age Group <span>*</span>
                    </label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleChange}
                      className={errors.ageGroup ? "reg-input-error" : ""}
                    >
                      <option value="">Select Age Group</option>
                      <option value="7-11">7 – 11 yrs</option>
                      <option value="12-15">12 – 15 yrs</option>
                      <option value="15-18">15 – 18 yrs</option>
                    </select>
                    {errors.ageGroup && (
                      <p className="reg-error-msg">
                        Please select an age group
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: PROGRAM ── */}
            {step === 3 && (
              <div className="reg-step-content">
                <div className="reg-step-heading">
                  <div className="reg-step-icon">
                    <FaGraduationCap />
                  </div>
                  <div>
                    <h2>Program</h2>
                    <p>Choose the program you want to join.</p>
                  </div>
                </div>

                <div className="reg-fields">
                  <div className="reg-field reg-field--full">
                    <label>
                      Program <span>*</span>
                    </label>
                    <select
                      name="programId"
                      value={formData.programId}
                      onChange={handleChange}
                      disabled={programsLoading}
                      className={errors.programId ? "reg-input-error" : ""}
                    >
                      <option value="">
                        {programsLoading
                          ? "Loading programs…"
                          : "Select a program"}
                      </option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    {errors.programId && (
                      <p className="reg-error-msg">Please choose a program</p>
                    )}
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      rows={4}
                      maxLength={1000}
                      placeholder="Preferred class time, special requirements or questions..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: CONFIRM ── */}
            {step === 4 && (
              <div className="reg-step-content">
                <div className="reg-step-heading">
                  <div className="reg-step-icon">
                    <FiCheck />
                  </div>
                  <div>
                    <h2>Review & Confirm</h2>
                    <p>Please review your details before submitting.</p>
                  </div>
                </div>

                <div className="reg-summary">
                  {/* PARENT */}
                  <div className="reg-summary-group">
                    <h4>Parent / Guardian</h4>

                    <div className="reg-summary-row">
                      <span>Name</span>
                      <strong>{formData.parentName || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Phone</span>
                      <strong>{formData.parentPhone || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Email</span>
                      <strong>{formData.parentEmail || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Location</span>
                      <strong>{formData.location || "—"}</strong>
                    </div>
                  </div>

                  {/* CHILD */}
                  <div className="reg-summary-group">
                    <h4>Child Information</h4>

                    <div className="reg-summary-row">
                      <span>Name</span>
                      <strong>{formData.childName || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Age Group</span>
                      <strong>{formData.ageGroup || "—"}</strong>
                    </div>
                  </div>

                  {/* PROGRAM */}
                  <div className="reg-summary-group">
                    <h4>Program</h4>

                    <div className="reg-summary-row">
                      <span>Course</span>
                      <strong>{selectedProgram?.title || "—"}</strong>
                    </div>

                    {formData.notes && (
                      <div className="reg-summary-block">
                        <span>Notes</span>
                        <p>{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Honeypot: hidden from people, bots tend to fill it in */}
                <input
                  type="text"
                  name="website"
                  className="reg-hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />

                {submitError && (
                  <p className="reg-error-msg" role="alert">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            {/* ── NAV BUTTONS ── */}
            <div className="reg-nav">
              {step > 1 && (
                <button
                  type="button"
                  className="reg-btn-back"
                  onClick={prev}
                  disabled={submitting}
                >
                  <FaArrowLeft size={14} /> Back
                </button>
              )}

              {step < 4 ? (
                <button type="button" className="reg-btn-next" onClick={next}>
                  Continue <FaArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="reg-btn-submit"
                  onClick={handleFormSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Complete Registration ✓"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TRUST STRIP */}
        <div className="reg-trust">
          <span>🔒 Secure & Private</span>
          <span>✅ Every request is reviewed by our team</span>
          <span>📞 We'll call within 24 hours</span>
        </div>
      </div>
    </section>
  );
}

// Wrapper with Suspense
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#080d1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
