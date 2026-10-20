// components/Testimonials/Testimonial.jsx  (public website)
"use client";

import { useMemo, useRef, useState } from "react";
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

// Who is speaking decides the bubble color.
const SPEAKERS = ["Parent", "Student", "Alumni"];

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

const toneOf = (relationship) =>
  SPEAKERS.includes(relationship) ? String(relationship).toLowerCase() : "parent";

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
// REVIEW (a speech bubble with the speaker underneath)
// ============================================================================

function Review({ review, size = "normal", ghost = false }) {
  const date = formatDate(review.createdAt);
  const long = String(review.message).length > 220;

  return (
    <article
      className={`tm-review tm-review--${toneOf(review.relationship)} tm-review--${size}${
        long ? " is-long" : ""
      }${ghost ? " is-ghost" : ""}`}
    >
      <div className="tm-bubble">
        <Stars value={review.rating} size={size === "spot" ? 20 : 16} />
        <blockquote>{review.message}</blockquote>
      </div>

      <footer>
        <span className="tm-avatar" aria-hidden="true">
          {initials(review.name) || "?"}
        </span>
        <span className="tm-who">
          <strong>{review.name}</strong>
          <small>
            {review.relationship}
            {date && (
              <>
                , <time dateTime={String(review.createdAt)}>{date}</time>
              </>
            )}
          </small>
        </span>
        {review.featured && size !== "spot" && (
          <span className="tm-featured">Featured</span>
        )}
      </footer>
    </article>
  );
}

// ============================================================================
// RATING STRIP (average plus a histogram that doubles as the rating filter)
// ============================================================================

function RatingStrip({ stats, active, onPick }) {
  if (!stats?.count) return null;

  const counts = [5, 4, 3, 2, 1].map((n) => stats.breakdown?.[n] ?? 0);
  const peak = Math.max(...counts, 1);
  const fivePct = Math.round(((stats.breakdown?.[5] ?? 0) / stats.count) * 100);

  return (
    <section className="tm-strip" aria-label="Rating summary">
      <div className="tm-avg">
        <strong>{stats.average.toFixed(1)}</strong>
        <div>
          <Stars value={stats.average} size={20} />
          <span>
            {stats.count} {stats.count === 1 ? "review" : "reviews"}, {fivePct}%
            five-star
          </span>
        </div>
      </div>

      <ul
        className={`tm-hist${active ? " has-active" : ""}`}
        aria-label="Filter reviews by rating"
      >
        {[5, 4, 3, 2, 1].map((n, i) => {
          const count = counts[i];
          const height = count ? Math.max((count / peak) * 100, 10) : 4;

          return (
            <li key={n}>
              <button
                type="button"
                className={active === n ? "active" : ""}
                aria-pressed={active === n}
                aria-label={`${n}-star reviews, ${count}`}
                onClick={() => onPick(active === n ? 0 : n)}
              >
                <span className="tm-hist-count">{count}</span>
                <span className="tm-hist-track">
                  <span
                    className="tm-hist-bar"
                    style={{ "--h": `${height}%` }}
                  />
                </span>
                <span className="tm-hist-label">
                  {n}
                  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={STAR_PATH} />
                  </svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
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
// WRITE A REVIEW (form + live preview bubble)
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
    message: typed || "Your review will appear here as you type.",
    createdAt: null, // a draft has no date, and Date.now() breaks hydration
  };

  return (
    <section
      className="tm-write"
      id="write-review"
      aria-labelledby="tm-write-title"
    >
      <div className="tm-write-intro">
        <h2 id="tm-write-title">Add your review</h2>
        <p>
          One minute is enough. Our team reads every review before it appears
          on this page.
        </p>

        <div className="tm-preview" aria-hidden="true">
          <span className="tm-preview-label">Preview</span>
          <Review review={preview} ghost={!typed} />
        </div>
      </div>

      <div className="tm-window">
        <div className="tm-window-bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <div className="tm-window-body">
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
              <fieldset className="tm-seg">
                <legend>I am a</legend>
                <div className="tm-seg-options">
                  {SPEAKERS.map((who) => (
                    <label
                      key={who}
                      className={`tm-seg-opt tm-seg-opt--${who.toLowerCase()}`}
                    >
                      <input
                        type="radio"
                        name="relationship"
                        value={who}
                        checked={form.relationship === who}
                        onChange={set("relationship")}
                      />
                      <span>{who}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

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

              <RatingPicker
                value={form.rating}
                onChange={(n) => update("rating", n)}
                error={errors.rating}
              />

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
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function Testimonials({ initial = null }) {
  const t = useTestimonials(initial);

  // The hero quote comes from the first page the server sent, so it stays put
  // while visitors filter and sort the list below.
  const spotlight = useMemo(() => {
    const first = initial?.data ?? [];
    return (
      first.find((r) => r.featured) ??
      first.find((r) => r.rating === 5) ??
      first[0] ??
      null
    );
  }, [initial]);

  const shownPct = t.total
    ? Math.min(100, (t.items.length / t.total) * 100)
    : 0;

  return (
    <div className="tm">
      {/* ---------- hero ---------- */}
      <section className={`tm-hero${spotlight ? "" : " no-spot"}`}>
        <div className="tm-hero-copy">
          <h1>What families say about Futuristic Coders</h1>
          <p className="tm-lead">
            Reviews from the parents, students and alumni of our coding classes
            in Nairobi.
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

        {spotlight && <Review review={spotlight} size="spot" />}
      </section>

      {/* ---------- rating strip ---------- */}
      <RatingStrip stats={t.stats} active={t.rating} onPick={t.setRating} />

      {/* ---------- reviews ---------- */}
      <section className="tm-list" id="reviews" aria-labelledby="tm-list-title">
        <div className="tm-toolbar">
          <h2 id="tm-list-title">
            {t.rating ? `${t.rating}-star reviews` : "All reviews"}
            <span className="tm-total">{t.total}</span>
          </h2>

          <div className="tm-controls">
            {t.rating > 0 && (
              <button
                type="button"
                className="tm-clear"
                onClick={() => t.setRating(0)}
              >
                Show all ratings
              </button>
            )}
            <label className="tm-sort">
              Sort by
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
                <div className="tm-skeleton" />
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
                <Review review={item} />
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