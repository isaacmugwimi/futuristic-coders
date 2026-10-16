"use client";

import "./ProgramFormModal.css";
import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Link2, Plus, Save, Trash2, Upload } from "lucide-react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { AGE_GROUPS, CATEGORIES, LEVELS, MODES } from "@/src/data/programs";
import { slugify } from "@/src/utils/format";

const NEW_CATEGORY = "__new__";
const THUMB_TYPES = ["image/png", "image/jpeg", "image/webp"];
const THUMB_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const EMPTY = {
  title: "",
  code: "",
  slug: "",
  category: "",
  newCategory: "",
  newCategoryDescription: "",
  level: LEVELS[0],
  ageGroup: AGE_GROUPS[1],
  mode: MODES[0],
  durationWeeks: "8",
  sessionsPerWeek: "1",
  sessionMinutes: "90",
  capacity: "20",
  price: "",
  instructor: "",
  startDate: "",
  schedule: "",
  displayOrder: "",
  summary: "",
  description: "",
  outcomes: "",
  prerequisites: "",
  requirements: "",
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
    newCategory: "",
    newCategoryDescription: "",
    level: p.level,
    ageGroup: p.ageGroup,
    mode: p.mode,
    durationWeeks: String(p.durationWeeks),
    sessionsPerWeek: String(p.sessionsPerWeek),
    sessionMinutes: String(p.sessionMinutes ?? 90),
    capacity: String(p.capacity),
    price: String(p.price),
    instructor: p.instructor,
    startDate: p.startDate ?? "",
    schedule: p.schedule ?? "",
    displayOrder: p.displayOrder != null ? String(p.displayOrder) : "",
    summary: p.summary ?? "",
    description: p.description ?? "",
    outcomes: (p.outcomes ?? []).join("\n"),
    prerequisites: (p.prerequisites ?? []).join("\n"),
    requirements: (p.requirements ?? []).join("\n"),
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

const isHttpUrl = (text) => {
  try {
    const u = new URL(text);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

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

/**
 * Props
 *  - program:    existing program when editing (omit when creating)
 *  - categories: string[] of categories already used on the site
 *                (falls back to CATEGORIES from data/programs)
 *  - onSave(data): receives the cleaned payload. For the thumbnail it passes:
 *        thumbnailFile    File | null   -> a NEW image to upload
 *        thumbnail        string | null -> the existing image URL to keep
 *        removeThumbnail  boolean       -> true if the admin removed the image
 *    For categories it passes:
 *        category, isNewCategory, categoryDescription
 */
export default function ProgramFormModal({
  program,
  categories,
  onSave,
  onClose,
}) {
  const editing = Boolean(program);

  const categoryOptions = (() => {
    const base = [...(categories?.length ? categories : CATEGORIES)];
    if (program?.category && !base.includes(program.category))
      base.push(program.category);
    return base;
  })();

  const [values, setValues] = useState(() =>
    program
      ? toValues(program)
      : { ...EMPTY, category: categoryOptions[0] ?? NEW_CATEGORY },
  );
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(editing);

  // Thumbnail state
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [removeThumb, setRemoveThumb] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [thumbMode, setThumbMode] = useState("upload"); // "upload" | "link"
  const [thumbLink, setThumbLink] = useState("");
  const [linkBroken, setLinkBroken] = useState(false);
  const fileRef = useRef(null);

  const formRef = useRef(null);
  const uid = useId();
  const formId = `${uid}-form`;
  const id = (name) => `${uid}-${name}`;

  const existingThumb = editing && !removeThumb ? program.thumbnail : null;
  const linkValue = thumbLink.trim();
  const linkValid = isHttpUrl(linkValue);
  // Priority: a file just picked, then a pasted link, then the saved image.
  const shownThumb =
    thumbPreview || (linkValid ? linkValue : null) || existingThumb;
  const creatingCategory = values.category === NEW_CATEGORY;

  // Build / clean up the local preview URL for a freshly picked file.
  useEffect(() => {
    if (!thumbFile) {
      setThumbPreview(null);
      return;
    }
    const url = URL.createObjectURL(thumbFile);
    setThumbPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbFile]);

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

  /* ---------- Thumbnail handling ---------- */
  function pickFile(file) {
    if (!file) return;
    if (!THUMB_TYPES.includes(file.type)) {
      setErrors((e) => ({
        ...e,
        thumbnail: "Use a PNG, JPG or WebP image.",
      }));
      return;
    }
    if (file.size > THUMB_MAX_BYTES) {
      setErrors((e) => ({
        ...e,
        thumbnail: "That image is over 2 MB. Choose a smaller file.",
      }));
      return;
    }
    setErrors((e) => ({ ...e, thumbnail: undefined }));
    setRemoveThumb(false);
    setThumbLink("");
    setLinkBroken(false);
    setThumbFile(file);
  }

  function onLinkChange(value) {
    setThumbLink(value);
    setLinkBroken(false);
    setThumbFile(null);
    setRemoveThumb(false);
    if (fileRef.current) fileRef.current.value = "";
    if (errors.thumbnail) setErrors((e) => ({ ...e, thumbnail: undefined }));
  }

  function clearThumb() {
    setThumbFile(null);
    setThumbLink("");
    setLinkBroken(false);
    setRemoveThumb(true);
    setErrors((e) => ({ ...e, thumbnail: undefined }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  }

  /* ---------- Validation ---------- */
  function validate(v) {
    const e = {};
    const whole = (x, min) =>
      x !== "" && Number.isInteger(Number(x)) && Number(x) >= min;

    if (v.title.trim().length < 3)
      e.title = "Enter a program title (at least 3 characters).";

    const link = thumbLink.trim();
    if (link && !isHttpUrl(link))
      e.thumbnail = "Enter a full link starting with https://";
    else if (link && linkBroken)
      e.thumbnail =
        "We couldn't load an image from that link. Check it, or upload the file instead.";

    if (v.category === NEW_CATEGORY) {
      const name = v.newCategory.trim();
      if (name.length < 2) e.newCategory = "Enter a category name.";
      else if (
        categoryOptions.some((c) => c.toLowerCase() === name.toLowerCase())
      )
        e.newCategory = "That category already exists. Pick it from the list.";
    }

    if (!v.instructor.trim()) e.instructor = "Add the lead instructor.";
    if (!v.summary.trim())
      e.summary = "Add a short summary for the website card.";
    if (v.price === "" || Number.isNaN(Number(v.price)) || Number(v.price) < 0)
      e.price = "Enter a price in KSh (0 for free).";
    if (!whole(v.durationWeeks, 1)) e.durationWeeks = "Whole weeks, 1 or more.";
    if (!whole(v.sessionsPerWeek, 1))
      e.sessionsPerWeek = "Whole number, 1 or more.";
    if (!whole(v.sessionMinutes, 15)) e.sessionMinutes = "Minutes, 15 or more.";
    if (!whole(v.capacity, 1)) e.capacity = "Whole number, 1 or more.";
    else if (editing && Number(v.capacity) < program.enrolled)
      e.capacity = `${program.enrolled} learners are already enrolled.`;
    if (v.displayOrder !== "" && !whole(v.displayOrder, 1))
      e.displayOrder = "Whole number, 1 or more.";
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

    const isNewCategory = values.category === NEW_CATEGORY;

     const programData = {
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      slug: slugify(values.slug || values.title),
      category: isNewCategory ? values.newCategory.trim() : values.category,
      isNewCategory,
      categoryDescription: isNewCategory
        ? values.newCategoryDescription.trim()
        : null,
      level: values.level,
      ageGroup: values.ageGroup,
      mode: values.mode,
      durationWeeks: Number(values.durationWeeks),
      sessionsPerWeek: Number(values.sessionsPerWeek),
      sessionMinutes: Number(values.sessionMinutes),
      capacity: Number(values.capacity),
      price: Number(values.price),
      instructor: values.instructor.trim(),
      startDate: values.startDate || null,
      schedule: values.schedule.trim(),
      displayOrder: values.displayOrder ? Number(values.displayOrder) : null,
      summary: values.summary.trim(),
      description: values.description.trim(),
      outcomes: lines(values.outcomes),
      prerequisites: lines(values.prerequisites),
      requirements: lines(values.requirements),
      tools: list(values.tools),
      thumbnailFile: thumbFile,
      thumbnail: thumbFile
        ? null
        : thumbLink.trim() || (removeThumb ? null : (program?.thumbnail ?? null)),
      thumbnailSource: thumbFile
        ? "upload"
        : thumbLink.trim()
          ? "link"
          : removeThumb
            ? null
            : program?.thumbnail
              ? "existing"
              : null,
      removeThumbnail: removeThumb && !thumbFile && !thumbLink.trim(),
      publish: values.publish,
      featured: values.featured,
    };

    console.log("Program form data:", programData);

    onSave(programData);
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

  // Mirrors the "Schedule" tile on the public modal.
  const sessionPreview = (() => {
    const s = Number(values.sessionsPerWeek);
    const m = Number(values.sessionMinutes);
    if (!s || !m) return "";
    return `${s} session${s === 1 ? "" : "s"} per week, ${m} minutes each`;
  })();

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
                placeholder="e.g. JavaScript Essentials"
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
                placeholder="javascript-essentials"
              />
            </Field>

            <Field
              id={id("category")}
              label="Category"
              hint="Programs are grouped by category on the website."
              className="fc-pform__full"
            >
              <select
                id={id("category")}
                className="fc-pform__input"
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={NEW_CATEGORY}>+ Create new category…</option>
              </select>
            </Field>

            {creatingCategory && (
              <div className="fc-pform__full fc-pform__newcat">
                <div className="fc-pform__grid">
                  <Field
                    id={id("newCategory")}
                    label="New category name"
                    required
                    error={errors.newCategory}
                  >
                    <input
                      id={id("newCategory")}
                      className="fc-pform__input"
                      value={values.newCategory}
                      onChange={(e) => set("newCategory", e.target.value)}
                      placeholder="e.g. Data & AI"
                      {...aria("newCategory")}
                    />
                  </Field>
                  <Field
                    id={id("newCategoryDescription")}
                    label="Category tagline"
                    hint="Shown under the category heading on the website."
                  >
                    <input
                      id={id("newCategoryDescription")}
                      className="fc-pform__input"
                      maxLength={140}
                      value={values.newCategoryDescription}
                      onChange={(e) =>
                        set("newCategoryDescription", e.target.value)
                      }
                      placeholder="e.g. From spreadsheets to machine learning."
                    />
                  </Field>
                </div>
              </div>
            )}

            <Field id={id("level")} label="Level">
              {select("level", LEVELS)}
            </Field>
            <Field id={id("ageGroup")} label="Age group">
              {select("ageGroup", AGE_GROUPS)}
            </Field>
            <Field id={id("mode")} label="Format">
              {select("mode", MODES)}
            </Field>
            <Field
              id={id("displayOrder")}
              label="Order in category"
              error={errors.displayOrder}
              hint="1 shows first. Leave empty to add it last."
            >
              <input
                id={id("displayOrder")}
                className="fc-pform__input"
                type="number"
                min="1"
                inputMode="numeric"
                value={values.displayOrder}
                onChange={(e) => set("displayOrder", e.target.value)}
                {...aria("displayOrder")}
              />
            </Field>
          </div>
        </section>

        {/* ---------- Thumbnail ---------- */}
        <section className="fc-pform__section">
          <h3>Thumbnail</h3>
          <div className="fc-pform__field">
            <input
              ref={fileRef}
              id={id("thumbnail")}
              className="fc-pform__file"
              type="file"
              accept={THUMB_TYPES.join(",")}
              tabIndex={-1}
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {shownThumb && (
              <div className="fc-pform__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shownThumb}
                  alt="Program thumbnail preview"
                  onError={() =>
                    linkValid && !thumbPreview && setLinkBroken(true)
                  }
                  onLoad={() => setLinkBroken(false)}
                />
                <div className="fc-pform__thumb-actions">
                  <button
                    type="button"
                    className="fc-pform__chip fc-pform__chip--danger"
                    onClick={clearThumb}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Remove
                  </button>
                </div>
              </div>
            )}

            <div
              className="fc-pform__seg"
              role="group"
              aria-label="Thumbnail source"
            >
              <button
                type="button"
                aria-pressed={thumbMode === "upload"}
                onClick={() => setThumbMode("upload")}
              >
                <Upload size={15} aria-hidden="true" /> Upload a file
              </button>
              <button
                type="button"
                aria-pressed={thumbMode === "link"}
                onClick={() => setThumbMode("link")}
              >
                <Link2 size={15} aria-hidden="true" /> Use an image link
              </button>
            </div>

            {thumbMode === "upload" ? (
              <button
                type="button"
                className={`fc-pform__drop${dragging ? " is-dragging" : ""}${
                  shownThumb ? " is-compact" : ""
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <ImagePlus size={shownThumb ? 20 : 26} aria-hidden="true" />
                <strong>
                  {shownThumb
                    ? "Choose a different image"
                    : "Upload a thumbnail"}
                </strong>
                <small>Drag an image here or click to browse</small>
              </button>
            ) : (
              <input
                id={id("thumbnailLink")}
                className="fc-pform__input"
                type="url"
                inputMode="url"
                value={thumbLink}
                onChange={(e) => onLinkChange(e.target.value)}
                placeholder="https://example.com/images/course.jpg"
                aria-label="Image link"
                {...aria("thumbnail")}
              />
            )}

            {errors.thumbnail ? (
              <p
                className="fc-pform__error"
                id={`${id("thumbnail")}-error`}
                role="alert"
              >
                {errors.thumbnail}
              </p>
            ) : linkBroken && thumbMode === "link" ? (
              <p className="fc-pform__error" role="alert">
                That link didn&apos;t load as an image. Use a direct image link, or
                upload the file instead.
              </p>
            ) : (
              <p className="fc-pform__hint">
                {thumbMode === "upload"
                  ? "Shown at the top of the program card and details window. 16:9 works best. PNG, JPG or WebP, up to 2 MB."
                  : "Paste a direct link to the image (usually ending in .jpg, .png or .webp). Some sites block other websites from showing their images. If the preview stays empty, upload the file instead."}
              </p>
            )}
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
              id={id("sessionMinutes")}
              label="Minutes / session"
              required
              error={errors.sessionMinutes}
            >
              <input
                id={id("sessionMinutes")}
                className="fc-pform__input"
                type="number"
                min="15"
                step="5"
                inputMode="numeric"
                value={values.sessionMinutes}
                onChange={(e) => set("sessionMinutes", e.target.value)}
                {...aria("sessionMinutes")}
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
          </div>
          {sessionPreview && (
            <p className="fc-pform__hint fc-pform__preview">
              Shown on the website as: <strong>{sessionPreview}</strong>
            </p>
          )}
          <div className="fc-pform__grid">
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
              label="Class days & time"
              hint="Optional, e.g. Saturdays, 9:00–11:00 AM."
            >
              <input
                id={id("schedule")}
                className="fc-pform__input"
                value={values.schedule}
                onChange={(e) => set("schedule", e.target.value)}
                placeholder="Saturdays, 9:00–11:00 AM"
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
              hint={`${values.summary.length}/140 · shown on the program card`}
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
              hint="Shown at the top of the details window when someone opens the program."
              className="fc-pform__full"
            >
              <textarea
                id={id("description")}
                className="fc-pform__input fc-pform__textarea"
                rows={5}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                {...aria("description")}
              />
            </Field>
            <Field
              id={id("outcomes")}
              label="What you'll learn"
              hint="One per line. Each line gets a tick on the website."
              className="fc-pform__full"
            >
              <textarea
                id={id("outcomes")}
                className="fc-pform__input fc-pform__textarea"
                rows={5}
                value={values.outcomes}
                onChange={(e) => set("outcomes", e.target.value)}
                placeholder={
                  "Write variables, functions, loops and conditions\nUpdate pages dynamically with the DOM"
                }
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
                placeholder="HTML & CSS Foundations, or equivalent experience"
              />
            </Field>
            <Field
              id={id("requirements")}
              label="What you'll need"
              hint="One per line."
            >
              <textarea
                id={id("requirements")}
                className="fc-pform__input fc-pform__textarea"
                rows={4}
                value={values.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder="A laptop and internet access"
              />
            </Field>
            <Field
              id={id("tools")}
              label="Tools & topics"
              hint="Separate with commas. Shown as tags on the card and in the details window."
              className="fc-pform__full"
            >
              <input
                id={id("tools")}
                className="fc-pform__input"
                value={values.tools}
                onChange={(e) => set("tools", e.target.value)}
                placeholder="JavaScript, DOM, Git Basics"
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
