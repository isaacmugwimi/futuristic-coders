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

  const [formData, setFormData] = useState({
    // Parent
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    emergencyContact: "",
    location: "",

    // Child
    childName: "",
    ageGroup: "",
    gender: "",
    schoolGrade: "",
    codingExperience: "",

    // Program
    programId: "",
    preferredTime: "",
    preferredMode: "",
    deviceType: "",
    internetAccess: "",
    heardAboutUs: "",
    startDate: "",

    // Extra
    medicalNotes: "",
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
      if (!formData.gender) newErrors.gender = true;
    }

    if (step === 3) {
      if (!formData.programId) newErrors.programId = true;
      if (!formData.preferredTime) newErrors.preferredTime = true;
      if (!formData.deviceType) newErrors.deviceType = true;
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

  // Maps the form to what the backend expects.
  // Core fields go to real columns; the rest travel in `details`.
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
      details: clean({
        gender: f.gender,
        schoolGrade: f.schoolGrade.trim(),
        codingExperience: f.codingExperience,
        emergencyContact: f.emergencyContact.trim(),
        parentOccupation: f.parentOccupation.trim(),
        preferredTime: f.preferredTime,
        preferredMode: f.preferredMode,
        deviceType: f.deviceType,
        internetAccess: f.internetAccess,
        heardAboutUs: f.heardAboutUs,
        startDate: f.startDate,
        medicalNotes: f.medicalNotes.trim(),
      }),
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

                  <div className="reg-field">
                    <label>Emergency Contact</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      placeholder="+254 700 111 222"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="reg-field">
                    <label>Parent Occupation</label>
                    <input
                      type="text"
                      name="parentOccupation"
                      placeholder="e.g. Teacher"
                      value={formData.parentOccupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>Location / City</label>
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

                  <div className="reg-field">
                    <label>School Grade / Class</label>
                    <input
                      type="text"
                      name="schoolGrade"
                      placeholder="e.g. Grade 6"
                      value={formData.schoolGrade}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="reg-field">
                    <label>Coding Experience</label>
                    <select
                      name="codingExperience"
                      value={formData.codingExperience}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="None">None</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                    </select>
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
                      maxLength={1000}
                      placeholder="Any special requirements or questions..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="reg-field">
                    <label>Learning Mode</label>
                    <select
                      name="preferredMode"
                      value={formData.preferredMode}
                      onChange={handleChange}
                    >
                      <option value="">Choose Mode</option>
                      <option value="Online">Online</option>
                      <option value="Physical">Physical</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="reg-field">
                    <label>Internet Access</label>
                    <select
                      name="internetAccess"
                      value={formData.internetAccess}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>

                  <div className="reg-field">
                    <label>How Did You Hear About Us?</label>
                    <select
                      name="heardAboutUs"
                      value={formData.heardAboutUs}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Friend">Friend</option>
                      <option value="School">School</option>
                      <option value="Google">Google</option>
                    </select>
                  </div>

                  <div className="reg-field">
                    <label>Preferred Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="reg-field reg-field--full">
                    <label>Medical Conditions / Special Needs</label>
                    <textarea
                      name="medicalNotes"
                      rows={3}
                      maxLength={1000}
                      placeholder="Optional..."
                      value={formData.medicalNotes}
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
                      <span>Emergency Contact</span>
                      <strong>{formData.emergencyContact || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Occupation</span>
                      <strong>{formData.parentOccupation || "—"}</strong>
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

                    <div className="reg-summary-row">
                      <span>Gender</span>
                      <strong>{formData.gender || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>School Grade</span>
                      <strong>{formData.schoolGrade || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Coding Experience</span>
                      <strong>{formData.codingExperience || "—"}</strong>
                    </div>
                  </div>

                  {/* PROGRAM */}
                  <div className="reg-summary-group">
                    <h4>Program & Preferences</h4>

                    <div className="reg-summary-row">
                      <span>Course</span>
                      <strong>{selectedProgram?.title || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Preferred Time</span>
                      <strong>{formData.preferredTime || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Learning Mode</span>
                      <strong>{formData.preferredMode || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Device</span>
                      <strong>{formData.deviceType || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Internet Access</span>
                      <strong>{formData.internetAccess || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Start Date</span>
                      <strong>{formData.startDate || "—"}</strong>
                    </div>

                    <div className="reg-summary-row">
                      <span>Heard About Us</span>
                      <strong>{formData.heardAboutUs || "—"}</strong>
                    </div>
                  </div>

                  {/* NOTES */}
                  {(formData.notes || formData.medicalNotes) && (
                    <div className="reg-summary-group">
                      <h4>Additional Information</h4>

                      {formData.notes && (
                        <div className="reg-summary-block">
                          <span>Notes</span>
                          <p>{formData.notes}</p>
                        </div>
                      )}

                      {formData.medicalNotes && (
                        <div className="reg-summary-block">
                          <span>Medical / Special Needs</span>
                          <p>{formData.medicalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
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
