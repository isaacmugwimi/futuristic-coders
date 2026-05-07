"use client";

import { useSearchParams } from "next/navigation";
import { useForm, ValidationError } from "@formspree/react";
import { useState } from "react";
import {
  FaUser,
  FaChild,
  FaGraduationCap,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import "./register.css";
import "../../global.css";

const STEPS = [
  { id: 1, label: "Parent Info", icon: <FaUser /> },
  { id: 2, label: "Child Info", icon: <FaChild /> },
  { id: 3, label: "Program Info", icon: <FaGraduationCap /> },
  { id: 4, label: "Confirmation", icon: <FiCheck /> },
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const selectedCourse = searchParams.get("course") || "";

  const [state, handleSubmit] = useForm("xpqblykn");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    childName: "",
    ageGroup: "",
    gender: "",
    course: selectedCourse,
    preferredTime: "",
    deviceType: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.parentName) newErrors.parentName = true;
      if (!formData.parentPhone) newErrors.parentPhone = true;
      if (!formData.parentEmail) newErrors.parentEmail = true;
    }

    if (step === 2) {
      if (!formData.childName) newErrors.childName = true;
      if (!formData.ageGroup) newErrors.ageGroup = true;
      if (!formData.gender) newErrors.gender = true;
    }

    if (step === 3) {
      if (!formData.preferredTime) newErrors.preferredTime = true;
      if (!formData.deviceType) newErrors.deviceType = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (step !== 4) return;
    await handleSubmit(e);
  };

  /* ── SUCCESS ── */
  if (state.succeeded) {
    return (
      <div className="reg-success">
        <div className="reg-success-icon">
          <FaCheckCircle />
        </div>
        <h1>You're Enrolled! 🎉</h1>
        <p>We've received your registration and will be in touch shortly.</p>
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
                className={`reg-step-label ${step === s.id ? "active" : ""} ${step === s.id ? "done" : ""}`}
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
          <form onSubmit={(e) => e.preventDefault()}>
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
                      placeholder="+254 700 000 000"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className={errors.parentPhone ? "reg-input-error" : ""}
                    />
                    {errors.parentPhone && (
                      <p className="reg-error-msg">Phone number is required</p>
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
                      <p className="reg-error-msg">Email address is required</p>
                    )}
                    <ValidationError
                      prefix="Email"
                      field="parentEmail"
                      errors={state.errors}
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

                  <div className="reg-field">
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

                  <div className="reg-field">
                    <label>
                      Gender <span>*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={errors.gender ? "reg-input-error" : ""}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Boy</option>
                      <option value="Female">Girl</option>
                    </select>
                    {errors.gender && (
                      <p className="reg-error-msg">Please select a gender</p>
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
                    <h2>Program & Preferences</h2>
                    <p>Choose your program and let us know your preferences.</p>
                  </div>
                </div>

                <div className="reg-fields">
                  <div className="reg-field reg-field--full">
                    <label>Selected Program</label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="e.g. Web Development"
                    />
                  </div>

                  <div className="reg-field">
                    <label>
                      Preferred Class Time <span>*</span>
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className={errors.preferredTime ? "reg-input-error" : ""}
                    >
                      <option value="">Choose Time</option>
                      <option value="Morning">Morning (8am – 12pm)</option>
                      <option value="Afternoon">Afternoon (1pm – 5pm)</option>
                    </select>
                    {errors.preferredTime && (
                      <p className="reg-error-msg">
                        Please select a class time
                      </p>
                    )}
                  </div>

                  <div className="reg-field">
                    <label>
                      Available Device <span>*</span>
                    </label>
                    <select
                      name="deviceType"
                      value={formData.deviceType}
                      onChange={handleChange}
                      className={errors.deviceType ? "reg-input-error" : ""}
                    >
                      <option value="">Select Device</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Tablet">Tablet</option>
                    </select>
                    {errors.deviceType && (
                      <p className="reg-error-msg">Please select a device</p>
                    )}
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Any special requirements or questions..."
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
                  </div>

                  <div className="reg-summary-group">
                    <h4>Child</h4>
                    <div className="reg-summary-row">
                      <span>Name</span>
                      <strong>{formData.childName || "—"}</strong>
                    </div>
                    <div className="reg-summary-row">
                      <span>Age Group</span>
                      <strong>{formData.ageGroup || "—"}</strong>
                    </div>
                    <div className="reg-summary-row">
                      <span>Gender</span>
                      <strong>{formData.gender || "—"}</strong>
                    </div>
                  </div>

                  <div className="reg-summary-group">
                    <h4>Program</h4>
                    <div className="reg-summary-row">
                      <span>Course</span>
                      <strong>{formData.course || "—"}</strong>
                    </div>
                    <div className="reg-summary-row">
                      <span>Time</span>
                      <strong>{formData.preferredTime || "—"}</strong>
                    </div>
                    <div className="reg-summary-row">
                      <span>Device</span>
                      <strong>{formData.deviceType || "—"}</strong>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="reg-summary-group">
                      <h4>Notes</h4>
                      <p className="reg-summary-notes">{formData.notes}</p>
                    </div>
                  )}
                </div>

                {/* Hidden inputs so Formspree receives all data */}
                {Object.entries(formData).map(([key, val]) => (
                  <input key={key} type="hidden" name={key} value={val} />
                ))}
              </div>
            )}

            {/* ── NAV BUTTONS ── */}
            <div className="reg-nav">
              {step > 1 && (
                <button type="button" className="reg-btn-back" onClick={prev}>
                  <FaArrowLeft size={14} /> Back
                </button>
              )}

              {step < 4 ? (
                <button type="button" className="reg-btn-next" onClick={next}>
                  Continue <FaArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="reg-btn-submit"
                  disabled={state.submitting}
                  onClick={async (e) => {
                    await handleSubmit(e);
                  }}
                >
                  {state.submitting
                    ? "Submitting..."
                    : "Complete Registration ✓"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TRUST STRIP */}
        <div className="reg-trust">
          <span>🔒 Secure & Private</span>
          <span>📧 Confirmation sent to your email</span>
          <span>📞 We'll call within 24 hours</span>
        </div>
      </div>
    </section>
  );
}
