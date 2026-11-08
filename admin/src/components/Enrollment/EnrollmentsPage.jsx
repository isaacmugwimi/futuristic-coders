"use client";

import "./EnrollmentsPage.css";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Plus,
  Search,
  SearchX,
  Trash2,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";

import {
  STATUS_META,
  formatDate,
  formatKSh,
  listOf,
  paymentInfo,
  toUiEnrollment,
} from "@/src/data/students";

import {
  useAllStudents,
  useStudentStats,
} from "@/src/hooks/students/useStudentQueries";
import { usePrograms } from "@/src/hooks/programs/useProgramQueries";
import {
  useDeleteEnrollment,
  useEnrollStudent,
  useUpdateEnrollmentStatus,
} from "@/src/hooks/students/useStudentMutation";

import QueryState, { isBlocked } from "../QueryState/QueryState";
import { ConfirmDialog, Toast } from "../StudentModals/StudentModals";
import EnrollModal from "./EnrollModal/EnrollModal";

/**
 * EnrollmentsPage.jsx
 * One row per enrollment (a student in a program). Enroll an existing student
 * in another program, change an enrollment's status, or delete it.
 * Payments and details stay on the Students page.
 */

const PAGE_SIZES = [8, 15, 25];

const SORTS = [
  {
    value: "recent",
    label: "Recently enrolled",
    fn: (a, b) => String(b.enrolledOn ?? "").localeCompare(a.enrolledOn ?? ""),
  },
  {
    value: "name",
    label: "Student (A–Z)",
    fn: (a, b) => a.fullName.localeCompare(b.fullName),
  },
  {
    value: "progress",
    label: "Highest progress",
    fn: (a, b) => b.progress - a.progress,
  },
  {
    value: "balance",
    label: "Highest balance",
    fn: (a, b) => paymentInfo(b).balance - paymentInfo(a).balance,
  },
];

const PAYMENT_LABELS = { paid: "Paid", partial: "Part paid", pending: "Unpaid" };

// Drops undefined / null / "" so we never send empty strings to the API.
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

const errorStatus = (err) =>
  err?.response?.status ?? err?.status ?? err?.statusCode;
const errorMessage = (err, fallback) =>
  err?.response?.data?.message ?? err?.message ?? fallback;

// The backend's payment-history safeguard answers 409 with this wording.
const isPaymentHistoryError = (err) =>
  errorStatus(err) === 409 && /payment history/i.test(errorMessage(err, ""));

export default function EnrollmentsPage() {
  // view: "enrollments" => one row per enrollment (students with none appear once).
  const studentsQuery = useAllStudents({ view: "enrollments" });
  const { data: statsResponse } = useStudentStats();
  const { data: programsResponse } = usePrograms();

  const enrollMutation = useEnrollStudent();
  const statusMutation = useUpdateEnrollmentStatus();
  const deleteMutation = useDeleteEnrollment();

  const programs = useMemo(() => listOf(programsResponse), [programsResponse]);
  const enrollablePrograms = useMemo(
    () => programs.filter((p) => p.status === "published"),
    [programs],
  );

  const allRows = useMemo(
    () => listOf(studentsQuery.data).map((row) => toUiEnrollment(row)),
    [studentsQuery.data],
  );

  // Enrollments only. A student with no enrollment yet has no enrollmentId.
  const rows = useMemo(() => allRows.filter((r) => r.enrollmentId), [allRows]);

  // Everyone registered, once each, for the "New enrollment" picker.
  const people = useMemo(() => {
    const seen = new Map();
    allRows.forEach((r) => {
      if (!seen.has(r.studentId)) {
        seen.set(r.studentId, {
          studentId: r.studentId,
          fullName: r.fullName,
          studentNo: r.studentNo,
        });
      }
    });
    return [...seen.values()].sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );
  }, [allRows]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [program, setProgram] = useState("all"); // a program ID
  const [payment, setPayment] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [modal, setModal] = useState(null); // { type: "enroll" } | { type: "delete", id, force }
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, tone = "success") => setToast({ id: Date.now(), message, tone }),
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* ---------------- derived ---------------- */
  const stats = useMemo(() => {
    const api = statsResponse?.data ?? {};
    return {
      total: api.total_enrollments ?? rows.length,
      active: api.active ?? rows.filter((r) => r.status === "active").length,
      completed:
        api.completed ?? rows.filter((r) => r.status === "completed").length,
      outstanding:
        api.total_outstanding ??
        rows
          .filter((r) => r.status !== "dropped")
          .reduce((sum, r) => sum + paymentInfo(r).balance, 0),
    };
  }, [statsResponse, rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sortFn = SORTS.find((s) => s.value === sort)?.fn ?? SORTS[0].fn;

    return rows
      .filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (program !== "all" && r.programId !== program) return false;
        if (payment !== "all" && paymentInfo(r).status !== payment)
          return false;
        if (!q) return true;
        return [r.fullName, r.studentNo, r.program, r.phone, r.guardianName]
          .some((v) => (v ?? "").toLowerCase().includes(q));
      })
      .sort(sortFn);
  }, [rows, query, status, program, payment, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const hasFilters =
    query !== "" || status !== "all" || program !== "all" || payment !== "all";

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setProgram("all");
    setPayment("all");
    setPage(1);
  }

  /* ---------------- actions ---------------- */
  async function enrollNew(data) {
    try {
      await enrollMutation.mutateAsync({
        studentId: data.studentId,
        data: compact({
          programId: data.programId,
          agreedFee: data.fee,
          enrolledOn: data.enrolledOn,
          initialPayment: data.payment ? compact(data.payment) : undefined,
        }),
      });
    } catch (err) {
      showToast(errorMessage(err, "Could not enroll the student"), "danger");
      return;
    }
    showToast("Student enrolled");
    closeModal();
  }

  async function changeStatus(row, next) {
    if (next === row.status) return;
    try {
      await statusMutation.mutateAsync({ id: row.enrollmentId, status: next });
      showToast(`Marked as ${STATUS_META[next].label.toLowerCase()}`, "info");
    } catch (err) {
      showToast(errorMessage(err, "Could not change the status"), "danger");
    }
  }

  // Step 1 keeps the backend's payment-history safeguard on. If it answers
  // 409, a second, explicit confirmation is shown before erasing anything.
  async function runDelete() {
    const row = rows.find((r) => r.id === modal.id);
    if (!row) return closeModal();

    try {
      await deleteMutation.mutateAsync({
        id: row.enrollmentId,
        force: modal.force,
      });
    } catch (err) {
      if (!modal.force && isPaymentHistoryError(err)) {
        setModal({ type: "delete", id: row.id, force: true });
        return;
      }
      showToast(errorMessage(err, "Could not delete the enrollment"), "danger");
      return;
    }
    showToast("Enrollment deleted", "danger");
    closeModal();
  }

  const deleteRow =
    modal?.type === "delete" ? rows.find((r) => r.id === modal.id) : null;

  function deleteCopy(row, force) {
    if (force) {
      return {
        title: "Delete an enrollment with payment history?",
        message: `${row.fullName}'s enrollment in “${row.program}” has ${formatKSh(row.amountPaid)} in recorded payments. Deleting permanently erases this enrollment's payments, attendance and certificate. Marking it as Dropped keeps the records instead.`,
        confirmLabel: "Erase records and delete",
      };
    }
    return {
      title: "Delete this enrollment?",
      message: `${row.fullName}'s enrollment in “${row.program}” will be permanently deleted${row.certificate ? ", and its certificate will no longer verify" : ""}. The student record is kept.`,
      confirmLabel: "Delete enrollment",
    };
  }

  const copy = deleteRow ? deleteCopy(deleteRow, modal.force) : null;

  // Every hook above runs before this early return.
  if (isBlocked(studentsQuery)) {
    return (
      <QueryState
        query={studentsQuery}
        resource="enrollments"
        variant="table"
        stats={4}
      />
    );
  }

  /* ---------------- render ---------------- */
  return (
    <div className="ep">
      <section className="ep-stats" aria-label="Enrollments summary">
        {[
          { label: "Total enrollments", value: stats.total, icon: ClipboardList, tone: "blue" },
          { label: "Active now", value: stats.active, icon: UserCheck, tone: "green" },
          { label: "Completed", value: stats.completed, icon: GraduationCap, tone: "violet" },
          { label: "Outstanding fees", value: formatKSh(stats.outstanding), icon: Wallet, tone: "rose" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="ep-stat">
            <span className={`ep-stat__icon ep-stat__icon--${tone}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="ep-stat__value">{value}</p>
              <p className="ep-stat__label">{label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="ep-card">
        <div className="ep-toolbar">
          <label className="ep-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => changeFilter(setQuery)(e.target.value)}
              placeholder="Search student, number, program…"
              aria-label="Search enrollments"
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
            className="ep-select"
            value={status}
            onChange={(e) => changeFilter(setStatus)(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>

          <select
            className="ep-select"
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

          <select
            className="ep-select"
            value={payment}
            onChange={(e) => changeFilter(setPayment)(e.target.value)}
            aria-label="Filter by fee status"
          >
            <option value="all">All fee statuses</option>
            <option value="paid">Fully paid</option>
            <option value="partial">Part paid</option>
            <option value="pending">Unpaid</option>
          </select>

          <select
            className="ep-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort enrollments"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button type="button" className="ep-clear" onClick={clearFilters}>
              <X size={15} aria-hidden="true" />
              Clear
            </button>
          )}

          <button
            type="button"
            className="ep-add"
            onClick={() => setModal({ type: "enroll" })}
          >
            <Plus size={18} aria-hidden="true" />
            New enrollment
          </button>
        </div>

        <div className="ep-table-wrap">
          <table className="ep-table">
            <caption className="ep-sr">
              Enrollments at Futuristic Coders
            </caption>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Program</th>
                <th scope="col">Enrolled</th>
                <th scope="col">Progress</th>
                <th scope="col">Fees</th>
                <th scope="col">Status</th>
                <th scope="col">Certificate</th>
                <th scope="col" className="ep-col-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => {
                const pay = paymentInfo(r);
                const locked = r.status === "completed" && r.certificate;
                return (
                  <tr key={r.id}>
                    <td>
                      <strong className="ep-name">{r.fullName}</strong>
                      <span className="ep-sub">
                        {r.studentNo}
                        {r.enrollmentCount > 1
                          ? ` · ${r.enrollmentCount} programs`
                          : ""}
                      </span>
                    </td>
                    <td>{r.program}</td>
                    <td>{formatDate(r.enrolledOn)}</td>
                    <td>
                      <div className="ep-progress">
                        <span>{r.progress}%</span>
                        <span className="ep-meter" aria-hidden="true">
                          <span style={{ width: `${r.progress}%` }} />
                        </span>
                      </div>
                    </td>
                    <td>
                      {formatKSh(pay.paid)} / {formatKSh(pay.fee)}
                      <span className={`ep-pill ep-pill--${pay.status}`}>
                        {PAYMENT_LABELS[pay.status]}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`ep-status ep-status--${r.status}`}
                        value={r.status}
                        onChange={(e) => changeStatus(r, e.target.value)}
                        disabled={locked || statusMutation.isPending}
                        title={
                          locked
                            ? "Revoke the certificate before changing the status"
                            : "Change status"
                        }
                        aria-label={`Status for ${r.fullName}, ${r.program}`}
                      >
                        {Object.entries(STATUS_META).map(([value, meta]) => (
                          <option key={value} value={value}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="ep-cert">
                      {r.certificate ? r.certificate.number : "—"}
                    </td>
                    <td className="ep-col-actions">
                      <div className="ep-actions">
                        <Link
                          href={`/dashboard/certificates?student=${r.id}`}
                          className="ep-iconbtn"
                          title="Certificate"
                          aria-label={`Certificate for ${r.fullName}, ${r.program}`}
                        >
                          <Award size={17} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="ep-iconbtn ep-iconbtn--danger"
                          onClick={() =>
                            setModal({ type: "delete", id: r.id, force: false })
                          }
                          title="Delete enrollment"
                          aria-label={`Delete ${r.fullName}'s enrollment in ${r.program}`}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="ep-empty">
                      <span>
                        <SearchX size={26} aria-hidden="true" />
                      </span>
                      <h3>
                        {rows.length === 0
                          ? "No enrollments yet"
                          : "No enrollments found"}
                      </h3>
                      <p>
                        {rows.length === 0
                          ? "Enroll a student in a program to get started."
                          : "Try a different search or clear your filters."}
                      </p>
                      {hasFilters ? (
                        <button
                          type="button"
                          className="ep-clear"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ep-add"
                          onClick={() => setModal({ type: "enroll" })}
                        >
                          <Plus size={18} aria-hidden="true" />
                          New enrollment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ep-footer">
          <p>
            {filtered.length === 0
              ? "No enrollments"
              : `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length} enrollments`}
          </p>

          <label className="ep-per-page">
            Rows
            <select
              className="ep-select"
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

          <nav className="ep-pager" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>

      {/* ---------- popups ---------- */}
      {modal?.type === "enroll" && (
        <EnrollModal
          students={people}
          programs={enrollablePrograms}
          enrollments={rows}
          onSave={enrollNew}
          onClose={closeModal}
        />
      )}

      {copy && (
        <ConfirmDialog
          title={copy.title}
          message={copy.message}
          items={[`${deleteRow.fullName} · ${deleteRow.program}`]}
          confirmLabel={copy.confirmLabel}
          tone="danger"
          onConfirm={runDelete}
          onCancel={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}