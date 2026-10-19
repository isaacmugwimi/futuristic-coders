"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  Check,
  Globe,
  Inbox,
  Mail,
  Pencil,
  Pin,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import QueryState, { isBlocked } from "../../QueryState/QueryState";

import {
  useTestimonials,
  useTestimonialCounts,
} from "@/src/hooks/testimonials/useTestimonialQueries";

import {
  useUpdateTestimonial,
  useApproveTestimonial,
  usePublishTestimonial,
  useRejectTestimonial,
  useArchiveTestimonial,
  useSetTestimonialFeatured,
  useDeleteTestimonial,
} from "@/src/hooks/testimonials/useTestimonialMutations";

import "./Testimonial.css";

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const EMPTY_TEXT = {
  pending: "No reviews are waiting for you. New submissions will show up here.",
  approved: "Nothing is approved and waiting to be published.",
  published: "No reviews are live on the website yet.",
  rejected: "No rejected reviews.",
  archived: "No archived reviews.",
  all: "No reviews have been submitted yet.",
};

// Which moderation buttons each status gets. Edit and delete are always shown.
const STATUS_ACTIONS = {
  pending: ["approve", "publish", "reject"],
  approved: ["publish", "reject"],
  published: ["feature", "archive"],
  rejected: ["approve"],
  archived: ["publish"],
};

// ============================================================================
// HELPERS
// ============================================================================

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

// ============================================================================
// SMALL PIECES
// ============================================================================

function Stars({ value }) {
  return (
    <span
      className="fc-tm__stars"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          aria-hidden="true"
          className={n <= value ? "is-on" : undefined}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`fc-tm__badge fc-tm__badge--${status}`}>{status}</span>
  );
}

function Dialog({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fc-tm__overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fc-tm__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-tm-dialog-title"
      >
        <div className="fc-tm__dialog-head">
          <h3 id="fc-tm-dialog-title">{title}</h3>
          <button
            type="button"
            className="fc-tm__icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DIALOG FORMS
// ============================================================================

function EditForm({ item, busy, error, onSubmit, onCancel }) {
  const [message, setMessage] = useState(item.message ?? "");
  const [notes, setNotes] = useState(item.admin_notes ?? "");
  const [localError, setLocalError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const length = message.trim().length;

    if (length < 20 || length > 600) {
      setLocalError("The review must be between 20 and 600 characters.");
      return;
    }

    setLocalError("");
    onSubmit({ message: message.trim(), adminNotes: notes.trim() });
  };

  return (
    <form className="fc-tm__form" onSubmit={submit}>
      <label>
        Review from {item.name}
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={600}
        />
        <small>{message.length}/600. Fix typos only. Keep their meaning.</small>
      </label>

      <label>
        Private note (never shown on the website)
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </label>

      {(localError || error) && (
        <p className="fc-tm__form-error" role="alert">
          {localError || error}
        </p>
      )}

      <div className="fc-tm__dialog-actions">
        <button type="button" className="fc-tm__btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="fc-tm__btn fc-tm__btn--primary"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function RejectForm({ item, busy, error, onSubmit, onCancel }) {
  const [notes, setNotes] = useState("");

  return (
    <form
      className="fc-tm__form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(notes.trim());
      }}
    >
      <p className="fc-tm__dialog-text">
        {item.name}’s review will be hidden from the website. They are not
        notified.
      </p>

      <label>
        Reason (optional, private)
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          placeholder="For example: looks like spam, or not a real customer."
        />
      </label>

      {error && (
        <p className="fc-tm__form-error" role="alert">
          {error}
        </p>
      )}

      <div className="fc-tm__dialog-actions">
        <button type="button" className="fc-tm__btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="fc-tm__btn fc-tm__btn--danger"
          disabled={busy}
        >
          {busy ? "Rejecting…" : "Reject review"}
        </button>
      </div>
    </form>
  );
}

function DeleteConfirm({ item, busy, error, onConfirm, onCancel }) {
  return (
    <div className="fc-tm__form">
      <p className="fc-tm__dialog-text">
        Delete {item.name}’s review permanently? This can’t be undone. To just
        hide a published review, archive it instead.
      </p>

      {error && (
        <p className="fc-tm__form-error" role="alert">
          {error}
        </p>
      )}

      <div className="fc-tm__dialog-actions">
        <button type="button" className="fc-tm__btn" onClick={onCancel}>
          Keep review
        </button>
        <button
          type="button"
          className="fc-tm__btn fc-tm__btn--danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Deleting…" : "Delete review"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

function ReviewCard({ item, busy, onAction, onEdit, onReject, onDelete }) {
  const actions = STATUS_ACTIONS[item.status] ?? [];

  return (
    <li className="fc-tm__card" aria-busy={busy}>
      <header className="fc-tm__card-head">
        <span className="fc-tm__avatar" aria-hidden="true">
          {initials(item.name)}
        </span>

        <div className="fc-tm__who">
          <strong>{item.name}</strong>
          <span>
            {item.relationship} · {formatDate(item.created_at)}
          </span>
        </div>

        <div className="fc-tm__badges">
          {item.featured && (
            <span className="fc-tm__badge fc-tm__badge--featured">
              featured
            </span>
          )}
          <StatusBadge status={item.status} />
        </div>
      </header>

      <div className="fc-tm__rating-row">
        <Stars value={item.rating} />
        <a className="fc-tm__email" href={`mailto:${item.email}`}>
          <Mail size={14} aria-hidden="true" />
          {item.email}
        </a>
      </div>

      <blockquote className="fc-tm__message">{item.message}</blockquote>

      {item.admin_notes && (
        <p className="fc-tm__note">
          <strong>Private note:</strong> {item.admin_notes}
        </p>
      )}

      {item.reviewed_at && (
        <p className="fc-tm__meta">
          Reviewed {formatDate(item.reviewed_at)}
          {item.reviewed_by_email ? ` by ${item.reviewed_by_email}` : ""}
        </p>
      )}

      <footer className="fc-tm__actions">
        {actions.includes("approve") && (
          <button
            type="button"
            className="fc-tm__btn"
            disabled={busy}
            onClick={() => onAction("approve", item)}
          >
            <Check size={16} aria-hidden="true" />
            Approve
          </button>
        )}

        {actions.includes("publish") && (
          <button
            type="button"
            className="fc-tm__btn fc-tm__btn--primary"
            disabled={busy}
            onClick={() => onAction("publish", item)}
          >
            <Globe size={16} aria-hidden="true" />
            Publish
          </button>
        )}

        {actions.includes("feature") && (
          <button
            type="button"
            className="fc-tm__btn"
            disabled={busy}
            aria-pressed={item.featured}
            onClick={() => onAction("feature", item)}
          >
            <Pin size={16} aria-hidden="true" />
            {item.featured ? "Unfeature" : "Feature"}
          </button>
        )}

        {actions.includes("archive") && (
          <button
            type="button"
            className="fc-tm__btn"
            disabled={busy}
            onClick={() => onAction("archive", item)}
          >
            <Archive size={16} aria-hidden="true" />
            Archive
          </button>
        )}

        {actions.includes("reject") && (
          <button
            type="button"
            className="fc-tm__btn fc-tm__btn--danger-ghost"
            disabled={busy}
            onClick={() => onReject(item)}
          >
            <X size={16} aria-hidden="true" />
            Reject
          </button>
        )}

        <span className="fc-tm__spacer" />

        <button
          type="button"
          className="fc-tm__icon-btn"
          disabled={busy}
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}’s review`}
          title="Edit"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="fc-tm__icon-btn fc-tm__icon-btn--danger"
          disabled={busy}
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}’s review`}
          title="Delete"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </footer>
    </li>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function Testimonial() {
  const [tab, setTab] = useState("pending");
  const [rating, setRating] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }
  const [dialog, setDialog] = useState(null); // { type: "edit" | "reject" | "delete", item }
  const [dialogError, setDialogError] = useState("");

  // Wait for the admin to stop typing before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Success messages clear themselves. Errors stay until dismissed.
  useEffect(() => {
    if (notice?.type !== "success") return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const params = {
    ...(tab !== "all" && { status: tab }),
    ...(rating && { rating }),
    ...(search && { search }),
  };

  const list = useTestimonials(params);
  const countsQuery = useTestimonialCounts();

  const update = useUpdateTestimonial();
  const approve = useApproveTestimonial();
  const publish = usePublishTestimonial();
  const reject = useRejectTestimonial();
  const archive = useArchiveTestimonial();
  const setFeatured = useSetTestimonialFeatured();
  const remove = useDeleteTestimonial();

  const counts = countsQuery.data?.data;
  const totalCount = counts
    ? Object.values(counts).reduce((sum, n) => sum + n, 0)
    : null;

  const items = list.data?.data ?? [];
  const isFiltered = Boolean(rating || search);

  // ---- actions that need no dialog --------------------------------------

  const runQuickAction = (type, item) => {
    const actions = {
      approve: {
        run: (options) => approve.mutate(item.id, options),
        done: "Review approved. Publish it when you’re ready.",
      },
      publish: {
        run: (options) => publish.mutate(item.id, options),
        done: "Review published. It’s now live on the website.",
      },
      archive: {
        run: (options) => archive.mutate(item.id, options),
        done: "Review archived and removed from the website.",
      },
      feature: {
        run: (options) =>
          setFeatured.mutate({ id: item.id, featured: !item.featured }, options),
        done: item.featured ? "Removed from featured." : "Review featured.",
      },
    };

    const action = actions[type];

    setBusyId(item.id);
    setNotice(null);

    action.run({
      onSuccess: () => setNotice({ type: "success", text: action.done }),
      onError: (error) =>
        setNotice({ type: "error", text: getErrorMessage(error) }),
      onSettled: () => setBusyId(null),
    });
  };

  // ---- actions that use a dialog ----------------------------------------

  const openDialog = (type, item) => {
    setDialogError("");
    setDialog({ type, item });
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError("");
  };

  const dialogOptions = (text) => ({
    onSuccess: () => {
      closeDialog();
      setNotice({ type: "success", text });
    },
    onError: (error) => setDialogError(getErrorMessage(error)),
  });

  const submitEdit = (values) =>
    update.mutate(
      { id: dialog.item.id, data: values },
      dialogOptions("Review updated."),
    );

  const submitReject = (adminNotes) =>
    reject.mutate(
      { id: dialog.item.id, data: adminNotes ? { adminNotes } : {} },
      dialogOptions("Review rejected."),
    );

  const confirmDelete = () =>
    remove.mutate(dialog.item.id, dialogOptions("Review deleted."));

  // ---- render -----------------------------------------------------------

  return (
    <section className="fc-tm">
      <header className="fc-tm__header">
        <div>
          <h1>Testimonials</h1>
          <p>
            Check new reviews, then publish the good ones to the website.
          </p>
        </div>
      </header>

      <div className="fc-tm__tabs" role="tablist" aria-label="Review status">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? totalCount : counts?.[key];

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`fc-tm__tab${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
              {count !== undefined && count !== null && (
                <span
                  className={`fc-tm__count${
                    key === "pending" && count > 0 ? " is-alert" : ""
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="fc-tm__toolbar">
        <label className="fc-tm__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or message"
            aria-label="Search testimonials"
          />
        </label>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          aria-label="Filter by rating"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      {notice && (
        <div
          className={`fc-tm__notice fc-tm__notice--${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            className="fc-tm__icon-btn"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {isBlocked(list) ? (
        <QueryState
          query={list}
          resource="testimonials"
          variant="cards"
          rows={4}
        />
      ) : items.length === 0 ? (
        <div className="fc-tm__empty">
          <Inbox size={28} aria-hidden="true" />
          <h3>{isFiltered ? "No matching reviews" : "Nothing here yet"}</h3>
          <p>
            {isFiltered
              ? "Try a different search or rating."
              : EMPTY_TEXT[tab]}
          </p>
        </div>
      ) : (
        <ul className="fc-tm__list">
          {items.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onAction={runQuickAction}
              onEdit={(row) => openDialog("edit", row)}
              onReject={(row) => openDialog("reject", row)}
              onDelete={(row) => openDialog("delete", row)}
            />
          ))}
        </ul>
      )}

      {dialog?.type === "edit" && (
        <Dialog title="Edit review" onClose={closeDialog}>
          <EditForm
            item={dialog.item}
            busy={update.isPending}
            error={dialogError}
            onSubmit={submitEdit}
            onCancel={closeDialog}
          />
        </Dialog>
      )}

      {dialog?.type === "reject" && (
        <Dialog title="Reject review" onClose={closeDialog}>
          <RejectForm
            item={dialog.item}
            busy={reject.isPending}
            error={dialogError}
            onSubmit={submitReject}
            onCancel={closeDialog}
          />
        </Dialog>
      )}

      {dialog?.type === "delete" && (
        <Dialog title="Delete review" onClose={closeDialog}>
          <DeleteConfirm
            item={dialog.item}
            busy={remove.isPending}
            error={dialogError}
            onConfirm={confirmDelete}
            onCancel={closeDialog}
          />
        </Dialog>
      )}
    </section>
  );
}