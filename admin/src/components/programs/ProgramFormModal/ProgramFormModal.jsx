"use client";

import "./ProgramFormModal.css";
import { useId, useRef, useState } from "react";
import { Plus, Save } from "lucide-react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { AGE_GROUPS, CATEGORIES, LEVELS, MODES } from "@/src/data/programs";
import { slugify } from "@/src/utils/format";

const EMPTY = {
  title: "",
  code: "",
  slug: "",
  category: "Web Development",
  level: LEVELS[0],
  ageGroup: AGE_GROUPS[1],
  mode: MODES[0],
  durationWeeks: "8",
  sessionsPerWeek: "1",
  capacity: "20",
  price: "",
  instructor: "",
  startDate: "",
  schedule: "",
  summary: "",
  description: "",
  outcomes: "",
  prerequisites: "",
  tools: "",
  publish: false,
  featured: false,
};

function toValues(p) {
  return {
    title: p.title,
    code: p.code,
    slug: p.slug,
    category: p.category,
    level: p.level,
    ageGroup: p.ageGroup,
    mode: p.mode,
    durationWeeks: String(p.durationWeeks),
    sessionsPerWeek: String(p.sessionsPerWeek),
    capacity: String(p.capacity),
    price: String(p.price),
    instructor: p.instructor,
    startDate: p.startDate ?? "",
    schedule: p.schedule ?? "",
    summary: p.summary ?? "",
    description: p.description ?? "",
    outcomes: (p.outcomes ?? []).join("\n"),
    prerequisites: (p.prerequisites ?? []).join("\n"),
    tools: (p.tools ?? []).join(", "),
    publish: p.status === "published",
    featured: Boolean(p.featured),
  };
}

const lines = (text) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const list = (text) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const cleanSlug = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function Field({ id, label, required, error, hint, className = "", children }) {
  return (
    <div className={`fc-pform__field ${className}`.trim()}>
      <label className="fc-pform__label" htmlFor={id}>
        {label}
        {required && (
          <span className="fc-pform__req" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="fc-pform__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="fc-pform__hint">{hint}</p>
      )}
    </div>
  );
}

export default function ProgramFormModal({ program, onSave, onClose }) {
  const editing = Boolean(program);
  const [values, setValues] = useState(() =>
    program ? toValues(program) : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(editing);
  const formRef = useRef(null);
  const uid = useId();
  const formId = `${uid}-form`;
  const id = (name) => `${uid}-${name}`;

  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  });

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function onTitleChange(value) {
    setValues((v) => ({
      ...v,
      title: value,
      slug: slugTouched ? v.slug : slugify(value),
    }));
    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
  }

  function onSlugChange(value) {
    setSlugTouched(true);
    set("slug", cleanSlug(value));
  }

  function validate(v) {
    const e = {};
    const whole = (x, min) =>
      x !== "" && Number.isInteger(Number(x)) && Number(x) >= min;

    if (v.title.trim().length < 3)
      e.title = "Enter a program title (at least 3 characters).";
    if (!v.instructor.trim()) e.instructor = "Add the lead instructor.";
    if (!v.summary.trim())
      e.summary = "Add a short summary for the website card.";
    if (v.price === "" || Number.isNaN(Number(v.price)) || Number(v.price) < 0)
      e.price = "Enter a price in KSh (0 for free).";
    if (!whole(v.durationWeeks, 1)) e.durationWeeks = "Whole weeks, 1 or more.";
    if (!whole(v.sessionsPerWeek, 1))
      e.sessionsPerWeek = "Whole number, 1 or more.";
    if (!whole(v.capacity, 1)) e.capacity = "Whole number, 1 or more.";
    else if (editing && Number(v.capacity) < program.enrolled)
      e.capacity = `${program.enrolled} learners are already enrolled.`;
    if (v.publish && !v.description.trim())
      e.description =
        "Add a full description before publishing to the website.";
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

    onSave({
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      slug: slugify(values.slug || values.title),
      category: values.category,
      level: values.level,
      ageGroup: values.ageGroup,
      mode: values.mode,
      durationWeeks: Number(values.durationWeeks),
      sessionsPerWeek: Number(values.sessionsPerWeek),
      capacity: Number(values.capacity),
      price: Number(values.price),
      instructor: values.instructor.trim(),
      startDate: values.startDate || null,
      schedule: values.schedule.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      outcomes: lines(values.outcomes),
      prerequisites: lines(values.prerequisites),
      tools: list(values.tools),
      publish: values.publish,
      featured: values.featured,
    });
  }

  const select = (name, options) => (
    <select
      id={id(name)}
      className="fc-pform__input"
      value={values[name]}
      onChange={(e) => set(name, e.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <Modal
      size="lg"
      title={editing ? "Edit program" : "New program"}
      subtitle={
        editing
          ? `${program.code} · ${program.title}`
          : "Fill in the details below. You can publish it later."
      }
      onClose={onClose}
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} icon={editing ? Save : Plus}>
            {editing ? "Save changes" : "Create program"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        ref={formRef}
        className="fc-pform"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* ---------- Basics ---------- */}
        <section className="fc-pform__section">
          <h3>Basics</h3>
          <div className="fc-pform__grid">
            <Field
              id={id("title")}
              label="Program title"
              required
              error={errors.title}
              className="fc-pform__full"
            >
              <input
                id={id("title")}
                className="fc-pform__input"
                value={values.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Web Development Foundations"
                autoFocus
                {...aria("title")}
              />
            </Field>
            <Field
              id={id("code")}
              label="Program code"
              hint="Leave empty to auto-generate."
            >
              <input
                id={id("code")}
                className="fc-pform__input"
                value={values.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="FC-WEB-101"
              />
            </Field>
            <Field
              id={id("slug")}
              label="Website URL"
              hint="futuristic-coders.co.ke/programs/…"
            >
              <input
                id={id("slug")}
                className="fc-pform__input"
                value={values.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="web-development-foundations"
              />
            </Field>
            <Field id={id("category")} label="Category">
              {select("category", CATEGORIES)}
            </Field>
            <Field id={id("level")} label="Level">
              {select("level", LEVELS)}
            </Field>
            <Field id={id("ageGroup")} label="Age group">
              {select("ageGroup", AGE_GROUPS)}
            </Field>
            <Field id={id("mode")} label="Mode">
              {select("mode", MODES)}
            </Field>
          </div>
        </section>

        {/* ---------- Schedule & pricing ---------- */}
        <section className="fc-pform__section">
          <h3>Schedule, pricing &amp; capacity</h3>
          <div className="fc-pform__grid fc-pform__grid--4">
            <Field
              id={id("durationWeeks")}
              label="Duration (weeks)"
              required
              error={errors.durationWeeks}
            >
              <input
                id={id("durationWeeks")}
                className="fc-pform__input"
                type="number"
                min="1"
                inputMode="numeric"
                value={values.durationWeeks}
                onChange={(e) => set("durationWeeks", e.target.value)}
                {...aria("durationWeeks")}
              />
            </Field>
            <Field
              id={id("sessionsPerWeek")}
              label="Sessions / week"
              required
              error={errors.sessionsPerWeek}
            >
              <input
                id={id("sessionsPerWeek")}
                className="fc-pform__input"
                type="number"
                min="1"
                inputMode="numeric"
                value={values.sessionsPerWeek}
                onChange={(e) => set("sessionsPerWeek", e.target.value)}
                {...aria("sessionsPerWeek")}
              />
            </Field>
            <Field
              id={id("capacity")}
              label="Capacity"
              required
              error={errors.capacity}
            >
              <input
                id={id("capacity")}
                className="fc-pform__input"
                type="number"
                min="1"
                inputMode="numeric"
                value={values.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                {...aria("capacity")}
              />
            </Field>
            <Field
              id={id("price")}
              label="Price (KSh)"
              required
              error={errors.price}
            >
              <input
                id={id("price")}
                className="fc-pform__input"
                type="number"
                min="0"
                inputMode="numeric"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="9500"
                {...aria("price")}
              />
            </Field>
          </div>
          <div className="fc-pform__grid">
            <Field
              id={id("instructor")}
              label="Lead instructor"
              required
              error={errors.instructor}
            >
              <input
                id={id("instructor")}
                className="fc-pform__input"
                value={values.instructor}
                onChange={(e) => set("instructor", e.target.value)}
                {...aria("instructor")}
              />
            </Field>
            <Field id={id("startDate")} label="Start date">
              <input
                id={id("startDate")}
                className="fc-pform__input"
                type="date"
                value={values.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field
              id={id("schedule")}
              label="Schedule"
              className="fc-pform__full"
            >
              <input
                id={id("schedule")}
                className="fc-pform__input"
                value={values.schedule}
                onChange={(e) => set("schedule", e.target.value)}
                placeholder="e.g. Saturdays, 9:00–11:00 AM"
              />
            </Field>
          </div>
        </section>

        {/* ---------- Website content ---------- */}
        <section className="fc-pform__section">
          <h3>Website content</h3>
          <div className="fc-pform__grid">
            <Field
              id={id("summary")}
              label="Short summary"
              required
              error={errors.summary}
              hint={`${values.summary.length}/140 · shown on the course card`}
              className="fc-pform__full"
            >
              <input
                id={id("summary")}
                className="fc-pform__input"
                maxLength={140}
                value={values.summary}
                onChange={(e) => set("summary", e.target.value)}
                {...aria("summary")}
              />
            </Field>
            <Field
              id={id("description")}
              label="Full description"
              error={errors.description}
              className="fc-pform__full"
            >
              <textarea
                id={id("description")}
                className="fc-pform__input fc-pform__textarea"
                rows={4}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                {...aria("description")}
              />
            </Field>
            <Field
              id={id("outcomes")}
              label="What learners will achieve"
              hint="One per line."
            >
              <textarea
                id={id("outcomes")}
                className="fc-pform__input fc-pform__textarea"
                rows={4}
                value={values.outcomes}
                onChange={(e) => set("outcomes", e.target.value)}
              />
            </Field>
            <Field
              id={id("prerequisites")}
              label="Prerequisites"
              hint="One per line."
            >
              <textarea
                id={id("prerequisites")}
                className="fc-pform__input fc-pform__textarea"
                rows={4}
                value={values.prerequisites}
                onChange={(e) => set("prerequisites", e.target.value)}
              />
            </Field>
            <Field
              id={id("tools")}
              label="Tools & technologies"
              hint="Separate with commas."
              className="fc-pform__full"
            >
              <input
                id={id("tools")}
                className="fc-pform__input"
                value={values.tools}
                onChange={(e) => set("tools", e.target.value)}
                placeholder="React, Node.js, PostgreSQL"
              />
            </Field>
          </div>
        </section>

        {/* ---------- Visibility ---------- */}
        <section className="fc-pform__section">
          <h3>Visibility</h3>
          <label className="fc-pform__check">
            <input
              type="checkbox"
              checked={values.publish}
              onChange={(e) => set("publish", e.target.checked)}
            />
            <span>
              <strong>Publish to the public website</strong>
              <small>
                Visible to everyone as soon as you save. Leave unticked to keep
                it as a draft.
              </small>
            </span>
          </label>
          <label className="fc-pform__check">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            <span>
              <strong>Mark as featured</strong>
              <small>
                Featured programs are highlighted on the website (once
                published).
              </small>
            </span>
          </label>
        </section>
      </form>
    </Modal>
  );
}
