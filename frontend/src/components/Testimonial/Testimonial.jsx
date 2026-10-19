// components/Testimonials/Testimonials.jsx
"use client";

import { useRef, useState } from "react";
import {
  useTestimonials,
  useSubmitTestimonial,
} from "../../hooks/testimonial/useTestimonial";
import "./Testimonial.css";

// ============================================================================
// CONSTANTS
// ============================================================================

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "oldest", label: "Oldest first" },
];

const RATING_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

// These match the backend's validation. Longer values are rejected there.
const LIMITS = { name: 100, email: 255, message: 600 };
const MIN_MESSAGE = 20;

const EMPTY_FORM = {
  name: "",
  email: "",
  relationship: "Parent",
  rating: 0,
  message: "",
  website: "", // honeypot
};

// Light colors only, so the dark initials always stay readable.
const AVATARS = [
  "linear-gradient(135deg, #38bdf8, #60a5fa)",
  "linear-gradient(135deg, #c4b5fd, #a78bfa)",
  "linear-gradient(135deg, #6ee7b7, #34d399)",
  "linear-gradient(135deg, #fcd34d, #fb923c)",
  "linear-gradient(135deg, #f9a8d4, #c4b5fd)",
  "linear-gradient(135deg, #5eead4, #38bdf8)",
];

const STAR_PATH =
  "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";

// ============================================================================
// HELPERS
// ============================================================================

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// Same name, same color, every time.
const avatarFor = (name = "") =>
  AVATARS[
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATARS.length
  ];

// Fixed timezone so the server and the browser always print the same month.
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-KE", {
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      });
};

// ============================================================================
// STARS (supports partial fill, so an average of 4.6 looks like 4.6)
// ============================================================================

function StarRow({ size }) {
  return (
    <span className="tm-stars-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

function Stars({ value, size = 16 }) {
  const safe = Math.min(Math.max(Number(value) || 0, 0), 5);
  const label = Number.isInteger(safe) ? safe : safe.toFixed(1);

  return (
    <span
      className="tm-stars"
      role="img"
      aria-label={`${label} out of 5 stars`}
      style={{ "--fill": `${(safe / 5) * 100}%` }}
    >
      <StarRow size={size} />
      <span className="tm-stars-on" aria-hidden="true">
        <StarRow size={size} />
      </span>
    </span>
  );
}

// ============================================================================
// RATING SUMMARY (the bars also work as filters)
// ============================================================================

function Summary({ stats, active, onPick }) {
  if (!stats?.count) return null;

  const fivePct = Math.round(((stats.breakdown?.[5] ?? 0) / stats.count) * 100);

  return (
    <aside className="tm-plate" aria-label="Rating summary">
      <div className="tm-score">
        <strong>{stats.average.toFixed(1)}</strong>
        <div>
          <Stars value={stats.average} size={22} />
          <span>
            {stats.count} {stats.count === 1 ? "review" : "reviews"}, {fivePct}%
            five-star
          </span>
        </div>
      </div>

      <ul className="tm-bars" aria-label="Filter reviews by rating">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = stats.breakdown?.[n] ?? 0;
          const pct = (count / stats.count) * 100;

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
    </aside>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

function Card({ review, ghost = false }) {
  const date = formatDate(review.createdAt);

  return (
    <article
      className={`tm-card${review.featured ? " is-featured" : ""}${ghost ? " is-ghost" : ""}`}
    >
      <div className="tm-card-top">
        <Stars value={review.rating} />
        <span
          className={`tm-tag tm-tag--${String(review.relationship).toLowerCase()}`}
        >
          {review.relationship}
        </span>
      </div>

      <blockquote>{review.message}</blockquote>

      <footer>
        <span
          className="tm-avatar"
          style={{ background: avatarFor(review.name) }}
          aria-hidden="true"
        >
          {initials(review.name) || "?"}
        </span>
        <span className="tm-who">
          <strong>{review.name}</strong>
          {date && <time dateTime={String(review.createdAt)}>{date}</time>}
        </span>
        {review.featured && <span className="tm-featured">Featured</span>}
      </footer>
    </article>
  );
}

// ============================================================================
// STAR PICKER (hover preview, arrow keys, word feedback)
// ============================================================================

function RatingPicker({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  const refs = useRef([]);
  const shown = hover || value;

  const move = (next) => {
    const n = Math.min(5, Math.max(1, next));
    onChange(n);
    refs.current[n - 1]?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      move((value || 0) + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      move((value || 2) - 1);
    }
  };

  return (
    <div className="tm-field">
      <span className="tm-field-label" id="tm-rating-label">
        Your rating
      </span>

      <div className="tm-pick-wrap">
        <div
          className="tm-pick"
          role="radiogroup"
          aria-labelledby="tm-rating-label"
          onKeyDown={onKeyDown}
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              ref={(el) => (refs.current[n - 1] = el)}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}, ${RATING_WORDS[n - 1]}`}
              tabIndex={(value ? value === n : n === 1) ? 0 : -1}
              className={n <= shown ? "on" : ""}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={STAR_PATH} />
              </svg>
            </button>
          ))}
        </div>
        <span className="tm-pick-word" aria-live="polite">
          {shown ? RATING_WORDS[shown - 1] : "Select a star"}
        </span>
      </div>

      {error && <em>{error}</em>}
    </div>
  );
}

// ============================================================================
// WRITE A REVIEW (form + live preview)
// ============================================================================

function WriteReview() {
  const { status, message, submit, reset } = useSubmitTestimonial();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear a field's error as soon as the person starts fixing it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };
  const set = (key) => (e) => update(key, e.target.value);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (!form.rating) e.rating = "Choose a star rating.";
    if (form.message.trim().length < MIN_MESSAGE)
      e.message = `Write at least ${MIN_MESSAGE} characters.`;
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (form.website) return; // honeypot: bots fill hidden fields

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const ok = await submit({
      name: form.name.trim(),
      email: form.email.trim(),
      relationship: form.relationship,
      rating: form.rating,
      message: form.message.trim(),
    });
    if (ok) setForm(EMPTY_FORM);
  };

  const typed = form.message.trim();
  const preview = {
    name: form.name.trim() || "Your name",
    relationship: form.relationship,
    rating: form.rating,
    message: typed || "Your review appears here as you type.",
    createdAt: null, // a draft has no date, and Date.now() breaks hydration
  };

  return (
    <section
      className="tm-write"
      id="write-review"
      aria-labelledby="tm-write-title"
    >
      <div className="tm-write-intro">
        <h2 id="tm-write-title">Share your experience</h2>
        <p>
          Your review helps other parents choose with confidence. It takes about
          a minute, and our team reads it before it appears.
        </p>

        <div className="tm-preview" aria-hidden="true">
          <span className="tm-preview-label">Live preview</span>
          <Card review={preview} ghost={!typed} />
        </div>
      </div>

      {status === "success" ? (
        <div className="tm-success" role="status">
          <span className="tm-check" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h3>Review sent</h3>
          <p>{message}</p>
          <button type="button" className="tm-btn ghost" onClick={reset}>
            Write another review
          </button>
        </div>
      ) : (
        <form className="tm-form" onSubmit={onSubmit} noValidate>
          <div className="tm-row">
            <label>
              Your name
              <input
                value={form.name}
                onChange={set("name")}
                maxLength={LIMITS.name}
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
                maxLength={LIMITS.email}
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
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
                <option value="Alumni">Alumni</option>
              </select>
            </label>
            <RatingPicker
              value={form.rating}
              onChange={(n) => update("rating", n)}
              error={errors.rating}
            />
          </div>

          <label>
            Your experience
            <textarea
              rows={5}
              value={form.message}
              onChange={set("message")}
              maxLength={LIMITS.message}
              aria-invalid={!!errors.message}
              placeholder="What did you or your child learn? What stood out?"
            />
            <small
              className={`tm-count${form.message.length >= LIMITS.message - 60 ? " is-near" : ""}`}
            >
              {form.message.length}/{LIMITS.message}
            </small>
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
            {status === "submitting" ? "Sending…" : "Send review"}
          </button>
        </form>
      )}
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function Testimonials({ initial = null }) {
  const t = useTestimonials(initial);

  const shownPct = t.total
    ? Math.min(100, (t.items.length / t.total) * 100)
    : 0;

  return (
    <div className="tm">
      {/* ---------- hero ---------- */}
      <section className="tm-hero">
        <div className="tm-hero-copy">
          <h1>What parents and students say</h1>
          <p className="tm-lead">
            Honest feedback from the Nairobi families learning to code with
            Futuristic Coders.
          </p>
          <div className="tm-actions">
            <a className="tm-btn" href="#reviews">
              Read the reviews
            </a>
            <a className="tm-btn ghost" href="#write-review">
              Write a review
            </a>
          </div>
        </div>

        <Summary stats={t.stats} active={t.rating} onPick={t.setRating} />
      </section>

      {/* ---------- reviews ---------- */}
      <section className="tm-list" id="reviews" aria-labelledby="tm-list-title">
        <div className="tm-toolbar">
          <h2 id="tm-list-title">
            {t.rating ? `${t.rating}-star reviews` : "All reviews"}
            <span className="tm-total">{t.total}</span>
          </h2>

          <label className="tm-sort">
            Sort by
            <select value={t.sort} onChange={(e) => t.setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="tm-chips" role="group" aria-label="Filter by rating">
          <button
            type="button"
            aria-pressed={!t.rating}
            onClick={() => t.setRating(0)}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((n) => {
            const count = t.stats?.breakdown?.[n];
            return (
              <button
                key={n}
                type="button"
                aria-pressed={t.rating === n}
                aria-label={`${n}-star reviews${count != null ? `, ${count}` : ""}`}
                onClick={() => t.setRating(t.rating === n ? 0 : n)}
              >
                {n}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={STAR_PATH} />
                </svg>
                {count != null && <small>{count}</small>}
              </button>
            );
          })}
        </div>

        {t.error && (
          <div className="tm-state" role="alert">
            <h3>Reviews didn’t load</h3>
            <p>{t.error}</p>
            <button type="button" className="tm-btn ghost" onClick={t.retry}>
              Try again
            </button>
          </div>
        )}

        {!t.error && t.loading && t.items.length === 0 && (
          <ul className="tm-grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <div className="tm-card tm-skeleton" />
              </li>
            ))}
          </ul>
        )}

        {!t.error && !t.loading && t.items.length === 0 && (
          <div className="tm-state">
            {t.rating ? (
              <>
                <h3>No {t.rating}-star reviews yet</h3>
                <p>Try another rating, or look at everything.</p>
                <button
                  type="button"
                  className="tm-btn ghost"
                  onClick={() => t.setRating(0)}
                >
                  Show all reviews
                </button>
              </>
            ) : (
              <>
                <h3>No reviews yet</h3>
                <p>Yours can be the first.</p>
                <a className="tm-btn ghost" href="#write-review">
                  Write a review
                </a>
              </>
            )}
          </div>
        )}

        {t.items.length > 0 && (
          <ul className={`tm-grid${t.loading ? " is-loading" : ""}`}>
            {t.items.map((item) => (
              <li key={item.id}>
                <Card review={item} />
              </li>
            ))}
          </ul>
        )}

        {t.items.length > 0 && (
          <div className="tm-more">
            <p aria-live="polite">
              Showing {t.items.length} of {t.total}
            </p>
            <div className="tm-progress" aria-hidden="true">
              <span style={{ width: `${shownPct}%` }} />
            </div>
            {t.hasMore && (
              <button
                type="button"
                className="tm-btn ghost"
                onClick={t.loadMore}
                disabled={t.loading}
              >
                {t.loading ? "Loading…" : "Show more reviews"}
              </button>
            )}
          </div>
        )}
      </section>

      {/* ---------- write ---------- */}
      <WriteReview />
    </div>
  );
}
