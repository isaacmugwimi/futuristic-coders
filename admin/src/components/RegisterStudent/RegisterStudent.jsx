"use client";

import { useEffect, useMemo, useState } from "react";

import "./RegisterStudent.css";

// Adjust these two paths to wherever your hook files live.
import { useRegistrations } from "@/src/hooks/registrations/useRegistrationQueries";
import {
  useApproveRegistration,
  useRejectRegistration,
} from "@/src/hooks/registrations/useRegistrationMutation";

// ============================================================================
// CONSTANTS + HELPERS
// ============================================================================

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatMoney = (value) =>
  value == null || value === ""
    ? "—"
    : `KES ${Number(value).toLocaleString("en-KE")}`;

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Try again.";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ============================================================================
// SMALL PIECES
// ============================================================================

function StatusBadge({ status }) {
  return <span className={`reg-badge reg-badge--${status}`}>{status}</span>;
}

function Detail({ label, children }) {
  return (
    <div className="reg-detail">
      <dt className="reg-detail__label">{label}</dt>
      <dd className="reg-detail__value">{children || "—"}</dd>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="reg-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="reg-modal">
        <h2 className="reg-modal__title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// APPROVE DIALOG
// ============================================================================

function ApproveDialog({ request, onClose }) {
  const approve = useApproveRegistration();
  const [agreedFee, setAgreedFee] = useState(request.program_price ?? "");
  const [enrolledOn, setEnrolledOn] = useState(today());

  const submit = (e) => {
    e.preventDefault();
    const data = {};
    if (agreedFee !== "") data.agreedFee = Number(agreedFee);
    if (enrolledOn) data.enrolledOn = enrolledOn;

    approve.mutate({ id: request.id, data }, { onSuccess: onClose });
  };

  return (
    <Modal title={`Approve ${request.full_name}`} onClose={onClose}>
      <p className="reg-modal__text">
        This creates a student record (or reuses a matching one) and enrolls
        them in {request.program_title}.
      </p>

      <form onSubmit={submit} className="reg-form">
        <label className="reg-field">
          <span className="reg-field__label">Agreed fee (KES)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={agreedFee}
            onChange={(e) => setAgreedFee(e.target.value)}
            className="reg-input"
          />
          <span className="reg-field__hint">
            Program price is {formatMoney(request.program_price)}. Change it if
            you agreed a different fee.
          </span>
        </label>

        <label className="reg-field">
          <span className="reg-field__label">Start date</span>
          <input
            type="date"
            value={enrolledOn}
            onChange={(e) => setEnrolledOn(e.target.value)}
            className="reg-input"
          />
        </label>

        {approve.isError && (
          <p role="alert" className="reg-form__error">
            {errorMessage(approve.error)}
          </p>
        )}

        <div className="reg-form__actions">
          <button
            type="button"
            onClick={onClose}
            className="reg-btn reg-btn--ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={approve.isPending}
            className="reg-btn reg-btn--approve"
          >
            {approve.isPending ? "Approving…" : "Approve and enroll"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// REJECT DIALOG
// ============================================================================

function RejectDialog({ request, onClose }) {
  const reject = useRejectRegistration();
  const [reason, setReason] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const data = reason.trim() ? { reason: reason.trim() } : {};
    reject.mutate({ id: request.id, data }, { onSuccess: onClose });
  };

  return (
    <Modal title={`Reject ${request.full_name}`} onClose={onClose}>
      <p className="reg-modal__text">
        The request moves to Rejected. No student record is created.
      </p>

      <form onSubmit={submit} className="reg-form">
        <label className="reg-field">
          <span className="reg-field__label">Reason (optional)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="For example: the program is full"
            className="reg-input"
          />
        </label>

        {reject.isError && (
          <p role="alert" className="reg-form__error">
            {errorMessage(reject.error)}
          </p>
        )}

        <div className="reg-form__actions">
          <button
            type="button"
            onClick={onClose}
            className="reg-btn reg-btn--ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={reject.isPending}
            className="reg-btn reg-btn--reject"
          >
            {reject.isPending ? "Rejecting…" : "Reject request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// REQUEST ROW (expandable)
// ============================================================================

function RequestRow({ request, expanded, onToggle, onApprove, onReject }) {
  const isPending = request.status === "pending";

  return (
    <li className="reg-item">
      <div className="reg-row">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="reg-row__main"
        >
          <span aria-hidden="true" className="reg-avatar">
            {initials(request.full_name)}
          </span>
          <span className="reg-row__text">
            <span className="reg-row__name">{request.full_name}</span>
            <span className="reg-row__meta">
              {request.program_title} · {formatDate(request.created_at)}
            </span>
          </span>
        </button>

        <div className="reg-row__contact">
          {request.phone || request.guardian_phone || request.email || "—"}
        </div>

        {!isPending && <StatusBadge status={request.status} />}

        {isPending && (
          <div className="reg-row__actions">
            <button
              type="button"
              onClick={onReject}
              className="reg-btn reg-btn--outline"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="reg-btn reg-btn--approve"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <dl className="reg-details">
          <Detail label="Phone">{request.phone}</Detail>
          <Detail label="Email">{request.email}</Detail>
          <Detail label="Guardian">{request.guardian_name}</Detail>
          <Detail label="Guardian phone">{request.guardian_phone}</Detail>
          <Detail label="Age group">{request.age_group}</Detail>
          <Detail label="County">{request.county}</Detail>
          <Detail label="Program price">
            {formatMoney(request.program_price)}
          </Detail>
          <Detail label="Submitted">{formatDate(request.created_at)}</Detail>
          {!isPending && (
            <Detail label="Reviewed">{formatDate(request.reviewed_at)}</Detail>
          )}
          {request.status === "rejected" && (
            <Detail label="Rejection reason">{request.rejection_reason}</Detail>
          )}
          {request.notes && (
            <div className="reg-details__wide">
              <Detail label="Notes from applicant">{request.notes}</Detail>
            </div>
          )}
        </dl>
      )}
    </li>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function RegisterStudent() {
  const [status, setStatus] = useState("pending");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput.trim());

  const [expandedId, setExpandedId] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const params = useMemo(
    () => ({ status, ...(search ? { search } : {}) }),
    [status, search],
  );

  const { data, isLoading, isError, error, isFetching, refetch } =
    useRegistrations(params);

  // The API sends { count, counts, data }; accept { requests } too.
  const requests = data?.data ?? data?.requests ?? [];
  const counts = data?.counts ?? { pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="reg-page">
      <header>
        <h1 className="reg-title">Registration requests</h1>
        <p className="reg-subtitle">
          People who registered on the website. Approving a request enrolls them
          as a student.
        </p>
      </header>

      <div className="reg-toolbar">
        <div role="tablist" className="reg-tabs">
          {TABS.map((tab) => {
            const active = status === tab.key;
            const alert = tab.key === "pending" && counts.pending > 0;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  setStatus(tab.key);
                  setExpandedId(null);
                }}
                className={`reg-tab${active ? " reg-tab--active" : ""}`}
              >
                {tab.label}
                <span
                  className={`reg-tab__count${alert ? " reg-tab__count--alert" : ""}`}
                >
                  {counts[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, phone, guardian or program"
          aria-label="Search registrations"
          className="reg-input reg-search"
        />
      </div>

      <section
        className={`reg-card${isFetching && !isLoading ? " reg-card--fetching" : ""}`}
      >
        {isLoading ? (
          <ul aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="reg-skeleton">
                <div className="reg-skeleton__avatar" />
                <div className="reg-skeleton__lines">
                  <div className="reg-skeleton__line reg-skeleton__line--long" />
                  <div className="reg-skeleton__line" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="reg-state">
            <p className="reg-state__error">{errorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="reg-btn reg-btn--outline"
            >
              Try again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="reg-state">
            {search
              ? `No ${status} requests match “${search}”.`
              : status === "pending"
                ? "No requests waiting for review."
                : `No ${status} requests yet.`}
          </div>
        ) : (
          <ul>
            {requests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                expanded={expandedId === request.id}
                onToggle={() =>
                  setExpandedId(expandedId === request.id ? null : request.id)
                }
                onApprove={() => setApproving(request)}
                onReject={() => setRejecting(request)}
              />
            ))}
          </ul>
        )}
      </section>

      {approving && (
        <ApproveDialog request={approving} onClose={() => setApproving(null)} />
      )}
      {rejecting && (
        <RejectDialog request={rejecting} onClose={() => setRejecting(null)} />
      )}
    </div>
  );
}
