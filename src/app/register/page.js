"use client";

import { useSearchParams } from "next/navigation";
import { useForm, ValidationError } from "@formspree/react";
import { useState } from "react";
import "./register.css";

export default function RegisterPage() {
  const searchParams = useSearchParams();

  const selectedCourse = searchParams.get("course") || "";

  const [state, handleSubmit] = useForm("xpqblykn");

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (state.succeeded) {
    return (
      <div className="success-container">
        <h1>Registration Successful 🎉</h1>
        <p>We have received your registration.</p>
      </div>
    );
  }

  return (
    <section className="register-page">
      <div className="register-card">
        <h1>Student Registration</h1>
        <p>Fill in the details below to enroll.</p>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Parent Details */}
          <div className="form-group">
            <label>Parent Name</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Parent Phone</label>
            <input
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              required
            />
            <ValidationError
              prefix="Email"
              field="parentEmail"
              errors={state.errors}
            />
          </div>

          {/* Child Details */}
          <div className="form-group">
            <label>Child Name</label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Age Group</label>
            <select
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Age Group</option>
              <option value="7-11">7 – 11</option>
              <option value="12-15">12 – 15</option>
              <option value="15-18">15 – 18</option>
            </select>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Boy</option>
              <option value="Female">Girl</option>
            </select>
          </div>

          {/* Course */}
          <div className="form-group">
            <label>Selected Program</label>
            <input type="text" name="course" value={formData.course} readOnly />
          </div>

          {/* Preferences */}
          <div className="form-group">
            <label>Preferred Class Time</label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
            >
              <option value="">Choose Time</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
            </select>
          </div>

          <div className="form-group">
            <label>Available Device</label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select Device</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="submit-btn"
          >
            {state.submitting ? "Submitting..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </section>
  );
}
