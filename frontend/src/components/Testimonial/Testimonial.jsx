// components/Testimonials/Testimonials.jsx
"use client";

import { useState } from "react";
import {
  useTestimonials,
  useSubmitTestimonial,
} from "../../hooks/testimonial/useTestimonial";
import "./Testimonial.css";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "oldest", label: "Oldest first" },
];

function Stars({ value, size = 16 }) {
  return (
    <span
      className="tm-stars"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={n <= Math.round(value) ? "on" : ""}
          aria-hidden="true"
        >
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", { month: "short", year: "numeric" });

function Summary({ stats, active, onPick }) {
  if (!stats?.count) return null;
  return (
    <div className="tm-summary">
      <div className="tm-score">
        <strong>{stats.average.toFixed(1)}</strong>
        <Stars value={stats.average} size={22} />
        <span>
          from {stats.count} {stats.count === 1 ? "review" : "reviews"}
        </span>
      </div>
      <ul className="tm-bars" aria-label="Filter reviews by rating">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = stats.breakdown?.[n] ?? 0;
          const pct = stats.count ? (count / stats.count) * 100 : 0;
          return (
            <li key={n}>
              <button
                type="button"
                className={active === n ? "active" : ""}
                onClick={() => onPick(active === n ? 0 : n)}
                aria-pressed={active === n}
              >
                <span className="tm-bar-label">{n} star</span>
                <span className="tm-bar-track">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="tm-bar-count">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Card({ t }) {
  return (
    <li className="tm-card">
      <Stars value={t.rating} />
      <blockquote>{t.message}</blockquote>
      <footer>
        <span className="tm-avatar" aria-hidden="true">
          {initials(t.name)}
        </span>
        <span>
          <strong>{t.name}</strong>
          <small>
            {t.relationship}
            {t.createdAt ? ` · ${formatDate(t.createdAt)}` : ""}
          </small>
        </span>
      </footer>
    </li>
  );
}

function ReviewForm() {
  const { status, message, submit, reset } = useSubmitTestimonial();
  const [form, setForm] = useState({
    name: "",
    email: "",
    relationship: "Parent",
    rating: 0,
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.rating) e.rating = "Choose a star rating.";
    if (form.message.trim().length < 20)
      e.message = "Write at least 20 characters.";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (form.website) return; // honeypot: bots fill hidden fields
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const { website, ...payload } = form;
    const ok = await submit({
      ...payload,
      name: payload.name.trim(),
      message: payload.message.trim(),
    });
    if (ok)
      setForm({
        name: "",
        email: "",
        relationship: "Parent",
        rating: 0,
        message: "",
        website: "",
      });
  };

  if (status === "success") {
    return (
      <div className="tm-success" role="status">
        <h3>Review received</h3>
        <p>{message}</p>
        <button type="button" className="tm-btn ghost" onClick={reset}>
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form className="tm-form" onSubmit={onSubmit} noValidate>
      <div className="tm-row">
        <label>
          Your name
          <input
            value={form.name}
            onChange={set("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <em>{errors.name}</em>}
        </label>
        <label>
          Email (kept private)
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <em>{errors.email}</em>}
        </label>
      </div>

      <div className="tm-row">
        <label>
          You are a
          <select value={form.relationship} onChange={set("relationship")}>
            <option>Parent</option>
            <option>Student</option>
            <option>Alumni</option>
          </select>
        </label>
        <div className="tm-field" role="radiogroup" aria-label="Your rating">
          <span className="tm-field-label">Your rating</span>
          <div className="tm-pick">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={form.rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={n <= form.rating ? "on" : ""}
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
                </svg>
              </button>
            ))}
          </div>
          {errors.rating && <em>{errors.rating}</em>}
        </div>
      </div>

      <label>
        Your experience
        <textarea
          rows={5}
          value={form.message}
          onChange={set("message")}
          maxLength={600}
          aria-invalid={!!errors.message}
          placeholder="What did you or your child learn? What stood out?"
        />
        <small className="tm-count">{form.message.length}/600</small>
        {errors.message && <em>{errors.message}</em>}
      </label>

      <input
        className="tm-hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={set("website")}
        name="website"
      />

      {status === "error" && (
        <p className="tm-alert" role="alert">
          {message}
        </p>
      )}
      <button
        className="tm-btn"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Submit review"}
      </button>
      <p className="tm-note">
        Reviews are checked by our team before they appear.
      </p>
    </form>
  );
}

export default function Testimonials({ initial = null }) {
  const t = useTestimonials(initial);

  return (
    <div className="tm">
      <section className="tm-hero">
        <p className="tm-badge">Reviews from Nairobi families</p>
        <h1>What parents and students say</h1>
        <p className="tm-lead">
          Honest feedback from the families learning to code with Futuristic
          Coders.
        </p>
        <Summary stats={t.stats} active={t.rating} onPick={t.setRating} />
      </section>

      <section className="tm-list" aria-labelledby="tm-list-title">
        <div className="tm-toolbar">
          <h2 id="tm-list-title">
            {t.rating ? `${t.rating}-star reviews` : "All reviews"}{" "}
            <span>({t.total})</span>
          </h2>
          <div className="tm-controls">
            {t.rating > 0 && (
              <button
                type="button"
                className="tm-btn ghost sm"
                onClick={() => t.setRating(0)}
              >
                Clear filter
              </button>
            )}
            <label className="tm-sort">
              Sort
              <select
                value={t.sort}
                onChange={(e) => t.setSort(e.target.value)}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {t.error && (
          <div className="tm-state" role="alert">
            <p>{t.error}</p>
            <button type="button" className="tm-btn ghost" onClick={t.retry}>
              Try again
            </button>
          </div>
        )}

        {!t.error && t.loading && t.items.length === 0 && (
          <ul className="tm-grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="tm-card tm-skeleton" />
            ))}
          </ul>
        )}

        {!t.error && !t.loading && t.items.length === 0 && (
          <div className="tm-state">
            <p>
              {t.rating
                ? "No reviews with this rating yet."
                : "No reviews yet. Be the first to share yours below."}
            </p>
          </div>
        )}

        {t.items.length > 0 && (
          <ul className="tm-grid">
            {t.items.map((item) => (
              <Card key={item.id} t={item} />
            ))}
          </ul>
        )}

        {t.hasMore && (
          <div className="tm-more">
            <button
              type="button"
              className="tm-btn ghost"
              onClick={t.loadMore}
              disabled={t.loading}
            >
              {t.loading ? "Loading..." : "Show more reviews"}
            </button>
          </div>
        )}
      </section>

      <section
        className="tm-write"
        id="write-review"
        aria-labelledby="tm-write-title"
      >
        <div>
          <h2 id="tm-write-title">Share your experience</h2>
          <p>
            Your review helps other parents choose with confidence. It takes
            about a minute.
          </p>
        </div>
        <ReviewForm />
      </section>
    </div>
  );
}
