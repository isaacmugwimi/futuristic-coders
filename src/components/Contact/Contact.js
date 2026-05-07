"use client";

import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import {
  FaMapPin,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaXTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";
import "./Contact.css";

const CONTACT_INFO = [
  {
    icon: <FaMapPin />,
    label: "Location",
    value: "Nairobi, Kenya",
    sub: "Visit us at our campus",
    accent: "#38bdf8",
  },
  {
    icon: <FaPhone />,
    label: "Phone",
    value: "+254 700 000 000",
    sub: "Mon – Sat, 8am – 6pm",
    accent: "#818cf8",
  },
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "hello@futuristiccoders.com",
    sub: "We reply within 24 hours",
    accent: "#34d399",
  },
  {
    icon: <FaClock />,
    label: "Hours",
    value: "Mon – Sat: 8am – 6pm",
    sub: "Sunday: Closed",
    accent: "#f59e0b",
  },
];

const SOCIALS = [
  { icon: <FaXTwitter />, label: "X / Twitter", href: "#" },
  { icon: <FaFacebook />, label: "Facebook", href: "#" },
  { icon: <FaInstagram />, label: "Instagram", href: "#" },
  { icon: <FaLinkedin />, label: "LinkedIn", href: "#" },
];

export default function ContactPage() {
  const [state, handleSubmit] = useForm("xpqblykn");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = true;
    if (!formData.email) newErrors.email = true;
    if (!formData.subject) newErrors.subject = true;
    if (!formData.message) newErrors.message = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await handleSubmit(e);
  };

  if (state.succeeded) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">✉️</div>
        <h1>Message Sent!</h1>
        <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        <a href="/" className="contact-success-btn">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <section className="contact-page">
      {/* BG */}
      <div className="contact-bg-grid"></div>
      <div className="contact-bg-glow contact-bg-glow--1"></div>
      <div className="contact-bg-glow contact-bg-glow--2"></div>

      <div className="contact-wrapper">
        {/* HEADER */}
        <div className="contact-header">
          <div className="contact-label">
            <span className="contact-label-dot"></span>
            Get In Touch
          </div>
          <h1 className="contact-title">
            We'd Love to{" "}
            <span className="contact-title-accent">Hear From You</span>
          </h1>
          <p className="contact-subtitle">
            Have questions about our programs? Ready to enroll? Or just want to
            learn more? Drop us a message and we'll be in touch.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="contact-grid">
          {/* LEFT — INFO */}
          <div className="contact-info-col">
            {/* INFO CARDS */}
            <div className="contact-info-cards">
              {CONTACT_INFO.map((item) => (
                <div
                  key={item.label}
                  className="contact-info-card"
                  style={{ "--accent": item.accent }}
                >
                  <div className="contact-info-icon">{item.icon}</div>
                  <div className="contact-info-text">
                    <span className="contact-info-label">{item.label}</span>
                    <strong className="contact-info-value">{item.value}</strong>
                    <span className="contact-info-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SOCIALS */}
            <div className="contact-socials">
              <p className="contact-socials-label">Follow Us</p>
              <div className="contact-socials-row">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="contact-social-btn"
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* MAP PLACEHOLDER */}
            <div className="contact-map">
              <div className="contact-map-inner">
                <FaMapPin className="contact-map-pin" />
                <p>Nairobi, Kenya</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-map-link"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <div className="contact-form-header">
                <h2>Send a Message</h2>
                <p>Fill in the form and we'll respond within 24 hours.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="contact-form">
                <div className="contact-fields">
                  <div className="contact-field">
                    <label>
                      Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Jane Kamau"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "field-error" : ""}
                    />
                    {errors.name && (
                      <p className="field-error-msg">Name is required</p>
                    )}
                  </div>

                  <div className="contact-field">
                    <label>
                      Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "field-error" : ""}
                    />
                    {errors.email && (
                      <p className="field-error-msg">Email is required</p>
                    )}
                    <ValidationError
                      prefix="Email"
                      field="email"
                      errors={state.errors}
                    />
                  </div>

                  <div className="contact-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="contact-field">
                    <label>
                      Subject <span>*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "field-error" : ""}
                    >
                      <option value="">Select a subject</option>
                      <option value="Program Inquiry">Program Inquiry</option>
                      <option value="Enrollment">Enrollment</option>
                      <option value="Pricing">Pricing & Fees</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="field-error-msg">Please select a subject</p>
                    )}
                  </div>

                  <div className="contact-field contact-field--full">
                    <label>
                      Message <span>*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? "field-error" : ""}
                    />
                    {errors.message && (
                      <p className="field-error-msg">Message is required</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={state.submitting}
                >
                  {state.submitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      Send Message <FaArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
