"use client";

import "./PaymentsPage.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Plus,
  Search,
  SearchX,
  Trash2,
  Undo2,
  Wallet,
  X,
} from "lucide-react";

import {
  PAYMENT_METHODS,
  STATUS_META,
  formatDate,
  formatKSh,
  listOf,
  paymentInfo,
  toUiEnrollment,
} from "@/src/data/students";

import {
  useAllStudents,
  usePaymentStats,
  usePayments,
  useStudentStats,
} from "@/src/hooks/students/useStudentQueries";
import { usePrograms } from "@/src/hooks/programs/useProgramQueries";
import {
  useDeletePayment,
  useRecordPayment,
  useUpdatePaymentStatus,
} from "@/src/hooks/students/useStudentMutation";

import QueryState, { isBlocked } from "../QueryState/QueryState";
import { ConfirmDialog, Toast } from "../StudentModals/StudentModals";
import RecordPaymentModal from "./PaymentModal/RecordPaymentModal";

/**
 * PaymentsPage.jsx
 * Tab 1: every payment, with search, filters and paging done by the backend.
 * Tab 2: enrollments that still owe money, with a Record payment shortcut.
 * Payments belong to an enrollment, so a student in two modules has two balances.
 */

const PAGE_SIZES = [10, 25, 50];

const STATUS_LABELS = {
  successful: "Successful",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const methodLabel = (value) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ??
  String(value ?? "").replace(/_/g, " ");

// Drops undefined / null / "" so we never send empty strings to the API.
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

const errorMessage = (err, fallback) =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// Waits until the value stops changing, so the backend isn't called per keystroke.
function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function PaymentsPage() {
  const [tab, setTab] = useState("payments");

  // Payments tab filters (sent to the backend)
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [program, setProgram] = useState("all"); // a program ID
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Outstanding tab search (done in the browser)
  const [owingQuery, setOwingQuery] = useState("");

  const [modal, setModal] = useState(null); // { type: "record", enrollmentId? } | { type: "confirm", action, id }
  const [toast, setToast] = useState(null);

  const search = useDebounced(query);

  const params = useMemo(
    () =>
      compact({
        search: search.trim(),
        status: status === "all" ? undefined : status,
        method: method === "all" ? undefined : method,
        programId: program === "all" ? undefined : program,
        dateFrom,
        dateTo,
        page,
        limit: pageSize,
      }),
    [search, status, method, program, dateFrom, dateTo, page, pageSize],
  );

  const paymentsQuery = usePayments(params);
  const { data: paymentStatsResponse } = usePaymentStats();
  const { data: studentStatsResponse } = useStudentStats();
  const enrollmentsQuery = useAllStudents({ view: "enrollments" });
  const { data: programsResponse } = usePrograms();

  const recordMutation = useRecordPayment();
  const statusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment();

  const showToast = useCallback(
    (message, tone = "success") => setToast({ id: Date.now(), message, tone }),
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* ---------------- data ---------------- */
  const programs = useMemo(() => listOf(programsResponse), [programsResponse]);

  const payments = listOf(paymentsQuery.data);
  const pagination = paymentsQuery.data?.pagination ?? {};

  const enrollmentRows = useMemo(
    () =>
      listOf(enrollmentsQuery.data)
        .map((row) => toUiEnrollment(row))
        .filter((r) => r.enrollmentId),
    [enrollmentsQuery.data],
  );

  // Every enrollment that still owes money (used by the modal and tab 2).
  const owing = useMemo(
    () =>
      enrollmentRows
        .filter((r) => paymentInfo(r).balance > 0)
        .sort((a, b) => paymentInfo(b).balance - paymentInfo(a).balance),
    [enrollmentRows],
  );

  // Dropped students still owe, but they are not chased in the list.
  const owingActive = useMemo(() => {
    const q = owingQuery.trim().toLowerCase();
    return owing.filter((r) => {
      if (r.status === "dropped") return false;
      if (!q) return true;
      return [r.fullName, r.studentNo, r.program].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      );
    });
  }, [owing, owingQuery]);

  const stats = useMemo(() => {
    const api = paymentStatsResponse?.data ?? {};
    const outstanding =
      studentStatsResponse?.data?.total_outstanding ??
      owing
        .filter((r) => r.status !== "dropped")
        .reduce((sum, r) => sum + paymentInfo(r).balance, 0);

    return {
      month: api.collected_this_month ?? 0,
      total: api.total_collected ?? 0,
      outstanding,
      attention: Number(api.pending_count ?? 0) + Number(api.failed_count ?? 0),
    };
  }, [paymentStatsResponse, studentStatsResponse, owing]);

  const total = pagination.total ?? 0;
  const totalPages = pagination.totalPages ?? 1;
  const currentPage = pagination.page ?? page;
  const start = (currentPage - 1) * (pagination.limit ?? pageSize);

  const hasFilters =
    query !== "" ||
    status !== "all" ||
    method !== "all" ||
    program !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setMethod("all");
    setProgram("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  /* ---------------- actions ---------------- */
  async function recordNew(data) {
    try {
      await recordMutation.mutateAsync({
        enrollmentId: data.enrollmentId,
        data: compact({
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          reference: data.reference,
          paidAt: data.paidAt,
        }),
      });
    } catch (err) {
      showToast(errorMessage(err, "Could not record the payment"), "danger");
      return;
    }
    showToast("Payment recorded");
    closeModal();
  }

  async function setPaymentStatus(payment, next) {
    try {
      await statusMutation.mutateAsync({ id: payment.id, status: next });
    } catch (err) {
      showToast(errorMessage(err, "Could not update the payment"), "danger");
      return false;
    }
    showToast(`Payment marked as ${STATUS_LABELS[next].toLowerCase()}`, "info");
    return true;
  }

  async function runConfirmed() {
    const payment = payments.find((p) => p.id === modal.id);
    if (!payment) return closeModal();

    if (modal.action === "refund") {
      if (await setPaymentStatus(payment, "refunded")) closeModal();
      return;
    }

    try {
      await deleteMutation.mutateAsync(payment.id);
    } catch (err) {
      showToast(errorMessage(err, "Could not delete the payment"), "danger");
      return;
    }
    showToast("Payment deleted", "danger");
    closeModal();
  }

  const confirmPayment =
    modal?.type === "confirm" ? payments.find((p) => p.id === modal.id) : null;

  function confirmCopy(payment, action) {
    if (action === "refund") {
      return {
        title: "Refund this payment?",
        message: `${formatKSh(payment.amount)} paid by ${payment.full_name} will be marked as refunded and will no longer count towards their fees. This can't be undone.`,
        confirmLabel: "Mark as refunded",
        tone: "primary",
      };
    }
    return {
      title: "Delete this payment record?",
      message: `${formatKSh(payment.amount)} paid by ${payment.full_name} will be permanently deleted. If the money was given back, mark it as refunded instead so the record is kept.`,
      confirmLabel: "Delete payment",
      tone: "danger",
    };
  }

  const copy = confirmPayment
    ? confirmCopy(confirmPayment, modal.action)
    : null;

  // Every hook above runs before this early return.
  if (isBlocked(paymentsQuery)) {
    return (
      <QueryState
        query={paymentsQuery}
        resource="payments"
        variant="table"
        stats={4}
      />
    );
  }

  /* ---------------- render ---------------- */
  return (
    <div className="pp">
      <section className="pp-stats" aria-label="Payments summary">
        {[
          {
            label: "Collected this month",
            value: formatKSh(stats.month),
            icon: CalendarDays,
            tone: "green",
          },
          {
            label: "Collected in total",
            value: formatKSh(stats.total),
            icon: Banknote,
            tone: "blue",
          },
          {
            label: "Outstanding fees",
            value: formatKSh(stats.outstanding),
            icon: Wallet,
            tone: "rose",
          },
          {
            label: "Pending or failed",
            value: stats.attention,
            icon: CircleAlert,
            tone: "amber",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="pp-stat">
            <span className={`pp-stat__icon pp-stat__icon--${tone}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="pp-stat__value">{value}</p>
              <p className="pp-stat__label">{label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="pp-card">
        <div className="pp-tabs" role="tablist" aria-label="Payment views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "payments"}
            className={`pp-tab${tab === "payments" ? " is-active" : ""}`}
            onClick={() => setTab("payments")}
          >
            <Banknote size={17} aria-hidden="true" />
            Payments
            <span>{total}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "owing"}
            className={`pp-tab${tab === "owing" ? " is-active" : ""}`}
            onClick={() => setTab("owing")}
          >
            <Wallet size={17} aria-hidden="true" />
            Outstanding balances
            <span>{owingActive.length}</span>
          </button>

          <button
            type="button"
            className="pp-add"
            onClick={() => setModal({ type: "record" })}
          >
            <Plus size={18} aria-hidden="true" />
            Record payment
          </button>
        </div>

        {tab === "payments" ? (
          <>
            <div className="pp-toolbar">
              <label className="pp-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => changeFilter(setQuery)(e.target.value)}
                  placeholder="Search student, number, M-Pesa code…"
                  aria-label="Search payments"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => changeFilter(setQuery)("")}
                    aria-label="Clear search"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </label>

              <select
                className="pp-select"
                value={status}
                onChange={(e) => changeFilter(setStatus)(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                className="pp-select"
                value={method}
                onChange={(e) => changeFilter(setMethod)(e.target.value)}
                aria-label="Filter by method"
              >
                <option value="all">All methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="pp-select"
                value={program}
                onChange={(e) => changeFilter(setProgram)(e.target.value)}
                aria-label="Filter by program"
              >
                <option value="all">All programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <label className="pp-date">
                From
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => changeFilter(setDateFrom)(e.target.value)}
                />
              </label>
              <label className="pp-date">
                To
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => changeFilter(setDateTo)(e.target.value)}
                />
              </label>

              {hasFilters && (
                <button
                  type="button"
                  className="pp-clear"
                  onClick={clearFilters}
                >
                  <X size={15} aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>

            <div className="pp-table-wrap">
              <table className="pp-table">
                <caption className="pp-sr">
                  Payments received by Futuristic Coders
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Student</th>
                    <th scope="col">Program</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method</th>
                    <th scope="col">Reference</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="pp-col-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="pp-nowrap">{formatDate(p.paid_at)}</td>
                      <td>
                        <strong className="pp-name">{p.full_name}</strong>
                        <span className="pp-sub">{p.student_no}</span>
                      </td>
                      <td>{p.program_title}</td>
                      <td className="pp-amount">{formatKSh(p.amount)}</td>
                      <td>{methodLabel(p.payment_method)}</td>
                      <td className="pp-ref">{p.reference || "—"}</td>
                      <td>
                        <span className={`pp-pill pp-pill--${p.status}`}>
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="pp-col-actions">
                        <div className="pp-actions">
                          {p.status === "pending" && (
                            <>
                              <button
                                type="button"
                                className="pp-iconbtn pp-iconbtn--ok"
                                onClick={() =>
                                  setPaymentStatus(p, "successful")
                                }
                                title="Mark as successful"
                                aria-label={`Mark ${p.full_name}'s payment as successful`}
                              >
                                <Check size={17} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="pp-iconbtn"
                                onClick={() => setPaymentStatus(p, "failed")}
                                title="Mark as failed"
                                aria-label={`Mark ${p.full_name}'s payment as failed`}
                              >
                                <X size={17} aria-hidden="true" />
                              </button>
                            </>
                          )}
                          {p.status === "successful" && (
                            <button
                              type="button"
                              className="pp-iconbtn"
                              onClick={() =>
                                setModal({
                                  type: "confirm",
                                  action: "refund",
                                  id: p.id,
                                })
                              }
                              title="Refund"
                              aria-label={`Refund ${p.full_name}'s payment`}
                            >
                              <Undo2 size={17} aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="pp-iconbtn pp-iconbtn--danger"
                            onClick={() =>
                              setModal({
                                type: "confirm",
                                action: "delete",
                                id: p.id,
                              })
                            }
                            title="Delete payment"
                            aria-label={`Delete ${p.full_name}'s payment`}
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div className="pp-empty">
                          <span>
                            <SearchX size={26} aria-hidden="true" />
                          </span>
                          <h3>
                            {hasFilters
                              ? "No payments found"
                              : "No payments yet"}
                          </h3>
                          <p>
                            {hasFilters
                              ? "Try a different search or clear your filters."
                              : "Record the first payment to get started."}
                          </p>
                          {hasFilters ? (
                            <button
                              type="button"
                              className="pp-clear"
                              onClick={clearFilters}
                            >
                              Clear filters
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="pp-add pp-add--inline"
                              onClick={() => setModal({ type: "record" })}
                            >
                              <Plus size={18} aria-hidden="true" />
                              Record payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pp-footer">
              <p>
                {total === 0
                  ? "No payments"
                  : `Showing ${start + 1}–${Math.min(start + payments.length, total)} of ${total} payments`}
              </p>

              <label className="pp-per-page">
                Rows
                <select
                  className="pp-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <nav className="pp-pager" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </nav>
            </div>
          </>
        ) : (
          <>
            <div className="pp-toolbar">
              <label className="pp-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={owingQuery}
                  onChange={(e) => setOwingQuery(e.target.value)}
                  placeholder="Search student, number, program…"
                  aria-label="Search outstanding balances"
                />
                {owingQuery && (
                  <button
                    type="button"
                    onClick={() => setOwingQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </label>
            </div>

            <div className="pp-table-wrap">
              <table className="pp-table">
                <caption className="pp-sr">
                  Enrollments with an outstanding balance
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Program</th>
                    <th scope="col">Status</th>
                    <th scope="col">Fee</th>
                    <th scope="col">Paid</th>
                    <th scope="col">Balance</th>
                    <th scope="col" className="pp-col-actions">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {owingActive.map((r) => {
                    const pay = paymentInfo(r);
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong className="pp-name">{r.fullName}</strong>
                          <span className="pp-sub">{r.studentNo}</span>
                        </td>
                        <td>{r.program}</td>
                        <td>
                          {(STATUS_META[r.status] ?? STATUS_META.active).label}
                        </td>
                        <td>{formatKSh(pay.fee)}</td>
                        <td>{formatKSh(pay.paid)}</td>
                        <td className="pp-amount pp-amount--owed">
                          {formatKSh(pay.balance)}
                        </td>
                        <td className="pp-col-actions">
                          <button
                            type="button"
                            className="pp-add pp-add--small"
                            onClick={() =>
                              setModal({
                                type: "record",
                                enrollmentId: r.enrollmentId,
                              })
                            }
                          >
                            <Plus size={16} aria-hidden="true" />
                            Record payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {owingActive.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="pp-empty">
                          <span>
                            <Check size={26} aria-hidden="true" />
                          </span>
                          <h3>
                            {owingQuery
                              ? "Nothing matches"
                              : "Nobody owes anything"}
                          </h3>
                          <p>
                            {owingQuery
                              ? "Try a different search."
                              : "Every active enrollment is fully paid."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ---------- popups ---------- */}
      {modal?.type === "record" && (
        <RecordPaymentModal
          key={modal.enrollmentId ?? "new"}
          enrollments={owing}
          initialEnrollmentId={modal.enrollmentId ?? ""}
          onSave={recordNew}
          onClose={closeModal}
        />
      )}

      {copy && (
        <ConfirmDialog
          title={copy.title}
          message={copy.message}
          items={[
            `${confirmPayment.full_name} · ${confirmPayment.program_title}`,
          ]}
          confirmLabel={copy.confirmLabel}
          tone={copy.tone}
          onConfirm={runConfirmed}
          onCancel={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
