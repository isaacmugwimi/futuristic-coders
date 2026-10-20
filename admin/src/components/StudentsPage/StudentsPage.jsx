"use client";

import "./StudentsPage.css";
import { useCallback, useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Wallet,
  X,
  Banknote,
  UserCheck,
} from "lucide-react";

import {
  certificateEligibility,
  formatKSh,
  listOf,
  paymentInfo,
  toUiStudent,
} from "@/src/data/students";

import {
  CompletedStudentsGrid,
  CurrentStudentsTable,
  BulkBar,
} from "../StudentsList/StudentsList";
import {
  CompleteDialog,
  ConfirmDialog,
  StudentDetailsModal,
  StudentFormModal,
  Toast,
} from "../StudentModals/StudentModals";

import {
  useAllStudents,
  useStudentStats,
} from "@/src/hooks/students/useStudentQueries";

import { usePrograms } from "@/src/hooks/programs/useProgramQueries";

// Used once, imperatively, to find which certificates to revoke.
import { getEnrollmentCertificates } from "@/src/services/students/student.service";

import {
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useUpdateEnrollment,
  useUpdateEnrollmentStatus,
  useRecordPayment,
  useRevokeCertificate,
} from "@/src/hooks/students/useStudentMutation";

/**
 * StudentsPage.jsx
 * Stats, the Current / Completed tabs, search + filters, and all the actions.
 * Everything comes from the backend through the React Query hooks.
 */

const DEFAULT_FILTERS = {
  query: "",
  status: "all",
  program: "all", // a program ID
  ageGroup: "all",
  payment: "all",
  certificate: "all",
  sort: "recent",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

const SORTS = {
  current: [
    {
      value: "recent",
      label: "Recently enrolled",
      fn: (a, b) => b.createdAt.localeCompare(a.createdAt),
    },
    {
      value: "name",
      label: "Name (A–Z)",
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
  ],
  completed: [
    {
      value: "recent",
      label: "Recently completed",
      fn: (a, b) =>
        String(b.completedOn ?? "").localeCompare(String(a.completedOn ?? "")),
    },
    {
      value: "name",
      label: "Name (A–Z)",
      fn: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      value: "score",
      label: "Highest score",
      fn: (a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1),
    },
  ],
};

function Select({ value, onChange, label, children }) {
  return (
    <select
      className="sp-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      {children}
    </select>
  );
}

function matches(student, f, tab) {
  const q = f.query.trim().toLowerCase();
  if (
    q &&
    ![
      student.fullName,
      student.studentNo,
      student.email,
      student.phone,
      student.program,
      student.county,
      student.guardianName,
    ].some((v) => (v ?? "").toLowerCase().includes(q))
  )
    return false;

  if (f.program !== "all" && student.programId !== f.program) return false;

  if (tab === "current") {
    if (f.status !== "all" && student.status !== f.status) return false;
    if (f.ageGroup !== "all" && student.ageGroup !== f.ageGroup) return false;
    if (f.payment !== "all" && paymentInfo(student).status !== f.payment)
      return false;

    if (f.certificate !== "all") {
      const readyForParticipation =
        certificateEligibility(student).type === "participation" &&
        !student.certificate;
      if (f.certificate === "pending" && !readyForParticipation) return false;
      if (f.certificate === "issued" && !student.certificate) return false;
    }
  } else {
    if (f.certificate === "issued" && !student.certificate) return false;
    if (f.certificate === "pending" && student.certificate) return false;
  }
  return true;
}

export default function StudentsPage() {
  // Loads every page of students once; search, filters, sorting and paging
  // then run on the client.
  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllStudents();
  const { data: statsResponse } = useStudentStats();
  const { data: programsResponse, isLoading: programsLoading } = usePrograms();

  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const updateEnrollmentMutation = useUpdateEnrollment();
  const updateEnrollmentStatusMutation = useUpdateEnrollmentStatus();
  const recordPaymentMutation = useRecordPayment();
  const revokeCertificateMutation = useRevokeCertificate();

  // Filters list every program; the form only offers published ones because
  // the backend rejects enrolment in any other.
  const programs = useMemo(() => listOf(programsResponse), [programsResponse]);
  const enrollablePrograms = useMemo(
    () => programs.filter((p) => p.status === "published"),
    [programs],
  );

  const students = useMemo(() => {
    const weeksByProgram = new Map(
      programs.map((p) => [p.id, p.duration_weeks]),
    );
    return listOf(studentsResponse).map((row) =>
      toUiStudent(row, weeksByProgram),
    );
  }, [studentsResponse, programs]);

  // Age groups come from the programs and students that exist.
  const ageGroups = useMemo(
    () =>
      [
        ...new Set(
          [
            ...programs.map((p) => p.age_group),
            ...students.map((s) => s.ageGroup),
          ].filter(Boolean),
        ),
      ].sort(),
    [programs, students],
  );

  const [tab, setTab] = useState("current");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pages, setPages] = useState({ current: 1, completed: 1 });
  const [sizes, setSizes] = useState({ current: 8, completed: 6 });
  const [selected, setSelected] = useState(() => new Set());
  const [modal, setModal] = useState(null); // { type: details | form | confirm | complete, id?, ids?, action? }
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, tone = "success") => setToast({ id: Date.now(), message, tone }),
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* ---------------- derived ---------------- */
  const currentAll = useMemo(
    () => students.filter((s) => s.status !== "completed"),
    [students],
  );
  const completedAll = useMemo(
    () => students.filter((s) => s.status === "completed"),
    [students],
  );

  // Prefer the backend's numbers; fall back to the loaded list for any value
  // the stats endpoint hasn't returned yet.
  const stats = useMemo(() => {
    const api = statsResponse?.data ?? {};
    return {
      total: api.total_students ?? students.length,
      active:
        api.active ?? students.filter((s) => s.status === "active").length,
      completed: api.completed ?? completedAll.length,
      collected:
        api.total_collected ??
        students.reduce((sum, s) => sum + s.amountPaid, 0),
      outstanding:
        api.total_outstanding ??
        currentAll
          .filter((s) => s.status !== "dropped")
          .reduce((sum, s) => sum + paymentInfo(s).balance, 0),
    };
  }, [statsResponse, students, currentAll, completedAll]);

  const sortFn =
    SORTS[tab].find((s) => s.value === filters.sort)?.fn ?? SORTS[tab][0].fn;
  const source = tab === "current" ? currentAll : completedAll;
  const filtered = useMemo(
    () => source.filter((s) => matches(s, filters, tab)).sort(sortFn),
    [source, filters, tab, sortFn],
  );

  const pageSize = sizes[tab];
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(pages[tab], totalPages);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const selectedStudents = useMemo(
    () => currentAll.filter((s) => selected.has(s.id)),
    [currentAll, selected],
  );
  const allOnPage = rows.length > 0 && rows.every((s) => selected.has(s.id));
  const someOnPage = rows.some((s) => selected.has(s.id));

  const hasFilters =
    filters.query !== "" ||
    (tab === "current"
      ? filters.status !== "all" ||
        filters.program !== "all" ||
        filters.ageGroup !== "all" ||
        filters.payment !== "all" ||
        filters.certificate !== "all"
      : filters.program !== "all" || filters.certificate !== "all");

  const avgScore = useMemo(() => {
    const scored = completedAll.filter((s) => s.finalScore != null);
    return scored.length
      ? Math.round(
          scored.reduce((sum, s) => sum + s.finalScore, 0) / scored.length,
        )
      : null;
  }, [completedAll]);
  const issued = completedAll.filter((s) => s.certificate).length;

  /* ---------------- filters / tabs / selection ---------------- */
  function changeFilter(name, value) {
    setFilters((f) => ({ ...f, [name]: value }));
    if (name !== "sort") {
      setPages((p) => ({ ...p, [tab]: 1 }));
      setSelected(new Set());
    }
  }

  function clearFilters() {
    setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));
    setPages((p) => ({ ...p, [tab]: 1 }));
    setSelected(new Set());
  }

  function changeTab(next) {
    if (next === tab) return;
    setTab(next);
    setFilters(DEFAULT_FILTERS);
    setSelected(new Set());
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) rows.forEach((s) => next.delete(s.id));
      else rows.forEach((s) => next.add(s.id));
      return next;
    });
  }

  /* ---------------- backend actions ---------------- */

  // Runs an async task and shows a toast with the server's message on failure.
  // Returns true when it succeeded so callers know whether to close the modal.
  async function run(task, fallbackMessage = "Something went wrong") {
    try {
      await task();
      return true;
    } catch (err) {
      showToast(errorMessage(err, fallbackMessage), "danger");
      return false;
    }
  }

  /* ----- create ----- */

  // Form -> POST /register-student payload. The form sends a programId and
  // the first deposit as `payment`, which the backend takes as
  // `initialPayment`. M-Pesa needs a transaction code and the deposit can't
  // exceed the agreed fee; the backend validates all of that and its message
  // is shown as a toast.
  function buildCreatePayload(data) {
    const fee = data.fee;

    return compact({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      ageGroup: data.ageGroup,
      county: data.county,
      notes: data.notes,
      programId: data.programId,
      // Omitted => backend uses the program's current price.
      agreedFee: fee === undefined || fee === "" ? undefined : Number(fee),
      enrolledOn: data.enrolledOn,
      initialPayment: data.payment ? compact(data.payment) : undefined,
    });
  }

  async function createFromForm(data) {
    const response = await createStudentMutation.mutateAsync(
      buildCreatePayload(data),
    );

    // The response is the new student with their enrollments (newest first).
    // New enrollments start as "active". Anything else is a follow-up call.
    const enrollment = response?.data?.enrollments?.[0];
    const wantsStatus = data.status && data.status !== "active";
    if (!enrollment?.id || !wantsStatus) return;

    try {
      await updateEnrollmentStatusMutation.mutateAsync({
        id: enrollment.id,
        status: data.status,
      });
      if (
        data.status === "completed" &&
        data.finalScore !== "" &&
        data.finalScore != null
      ) {
        await updateEnrollmentMutation.mutateAsync({
          id: enrollment.id,
          data: { finalScore: Number(data.finalScore) },
        });
      }
    } catch (err) {
      // The student exists already, so don't report the whole save as failed.
      showToast(
        `Student added, but the status could not be set: ${errorMessage(err, "unknown error")}`,
        "info",
      );
    }
  }

  /* ----- edit ----- */

  async function updateFromForm(data, existing) {
    // Student-level fields. The student number is generated, never editable.
    await updateStudentMutation.mutateAsync({
      id: existing.id,
      data: compact({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        ageGroup: data.ageGroup,
        county: data.county,
        notes: data.notes,
      }),
    });

    if (!existing.enrollmentId) return;

    // Status first: completing sets progress to 100 on the backend, and
    // reopening a completed enrollment is what allows progress to drop again.
    const statusChanged = data.status && data.status !== existing.status;
    if (statusChanged) {
      await updateEnrollmentStatusMutation.mutateAsync({
        id: existing.enrollmentId,
        status: data.status,
      });
    }

    // Enrollment-level fields: send only what actually changed.
    const changes = {};
    const fee = data.fee ?? data.agreedFee;
    if (fee !== undefined && fee !== "" && Number(fee) !== existing.fee) {
      changes.agreedFee = Number(fee); // backend: cannot be below amount paid
    }
    if (
      data.progress !== undefined &&
      data.progress !== "" &&
      Number(data.progress) !== existing.progress &&
      !(statusChanged && data.status === "completed") // backend forces 100
    ) {
      changes.progress = Number(data.progress); // whole number, 0-100
    }
    if (
      data.finalScore !== undefined &&
      data.finalScore !== null &&
      data.finalScore !== "" &&
      Number(data.finalScore) !== existing.finalScore
    ) {
      changes.finalScore = Number(data.finalScore); // 0-100, null not accepted
    }
    if (data.enrolledOn && data.enrolledOn !== existing.enrolledOn) {
      changes.enrolledOn = data.enrolledOn;
    }

    // `data.attendance` is deliberately not sent. The backend has no
    // attendance field: the percentage is calculated from per-session records.
    // Record sessions with useRecordAttendance / useRecordClassAttendance.

    if (Object.keys(changes).length) {
      await updateEnrollmentMutation.mutateAsync({
        id: existing.enrollmentId,
        data: changes,
      });
    }

    // A payment is its own record. It goes last so the overpayment check
    // uses the new fee if the fee was changed above.
    if (data.payment) {
      await recordPaymentMutation.mutateAsync({
        enrollmentId: existing.enrollmentId,
        data: compact(data.payment),
      });
    }
  }

  async function saveStudent(data, existing) {
    const ok = await run(
      () => (existing ? updateFromForm(data, existing) : createFromForm(data)),
      "Could not save the student",
    );
    if (!ok) return;

    if (existing) {
      showToast(
        data.status === "completed" && existing.status !== "completed"
          ? "Saved. They now appear under Completed students."
          : "Changes saved",
      );
    } else {
      showToast(
        data.status === "completed"
          ? "Student added to Completed students"
          : "Student added",
      );
    }
    closeModal();
  }

  /* ----- complete ----- */

  async function confirmComplete(options) {
    const ids = modal.ids;
    const toComplete = students.filter((s) => ids.includes(s.id));

    const ok = await run(async () => {
      await Promise.all(
        toComplete
          .filter((s) => s.enrollmentId)
          .map(async (s) => {
            // Backend sets progress to 100 itself when status -> completed.
            await updateEnrollmentStatusMutation.mutateAsync({
              id: s.enrollmentId,
              status: "completed",
            });
            if (options?.finalScore != null && options.finalScore !== "") {
              await updateEnrollmentMutation.mutateAsync({
                id: s.enrollmentId,
                data: { finalScore: Number(options.finalScore) },
              });
            }
          }),
      );
    }, "Could not mark as completed");

    if (!ok) return;

    setSelected(new Set());
    showToast(
      ids.length > 1
        ? `${ids.length} students marked as completed`
        : "Marked as completed. They are now eligible for a certificate.",
    );
    closeModal();
  }

  /* ----- delete / reopen ----- */

  const dropFromSelection = (ids) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

  // Step 1 sends force: false, so the backend's payment-history safeguard stays
  // on. Students it blocks (409) go to a second, explicit confirmation.
  async function deleteWithoutForce(ids) {
    const results = await Promise.allSettled(
      ids.map((id) => deleteStudentMutation.mutateAsync({ id, force: false })),
    );

    const deleted = [];
    const needsForce = [];
    const failures = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") deleted.push(ids[i]);
      else if (isPaymentHistoryError(r.reason)) needsForce.push(ids[i]);
      else failures.push(r.reason);
    });

    dropFromSelection(deleted);

    if (deleted.length) {
      showToast(
        deleted.length > 1
          ? `${deleted.length} students deleted`
          : "Student deleted",
        "danger",
      );
    } else if (failures.length) {
      showToast(errorMessage(failures[0], "Could not delete"), "danger");
    }

    if (needsForce.length) {
      setModal({ type: "confirm", action: "delete-force", ids: needsForce });
      return;
    }
    if (deleted.length || !failures.length) closeModal();
  }

  // Step 2: only reached after the person has read what will be erased.
  async function deleteWithForce(ids) {
    const ok = await run(
      () =>
        Promise.all(
          ids.map((id) =>
            deleteStudentMutation.mutateAsync({ id, force: true }),
          ),
        ),
      "Could not delete",
    );
    if (!ok) return;

    dropFromSelection(ids);
    showToast(
      ids.length > 1 ? `${ids.length} students deleted` : "Student deleted",
      "danger",
    );
    closeModal();
  }

  async function reopen(student) {
    const ok = await run(async () => {
      // The backend refuses to change a completed enrollment while a
      // certificate is issued, so revoke first.
      if (student.certificate) {
        const certs = listOf(
          await getEnrollmentCertificates(student.enrollmentId),
        );
        for (const c of certs.filter((c) => c.status === "issued")) {
          await revokeCertificateMutation.mutateAsync(c.id);
        }
      }
      // Reopening takes a seat again; the backend checks capacity and that
      // there is no other open enrollment in the same program.
      await updateEnrollmentStatusMutation.mutateAsync({
        id: student.enrollmentId,
        status: "active",
      });
    }, "Could not move back to active");
    if (!ok) return;

    showToast(
      student.certificate
        ? "Moved back to active. Their certificate was withdrawn."
        : "Moved back to active",
      "info",
    );
    closeModal();
  }

  async function confirmDeleteOrReopen() {
    const { action, ids } = modal;
    if (action === "delete") return deleteWithoutForce(ids);
    if (action === "delete-force") return deleteWithForce(ids);
    const student = students.find((s) => s.id === ids[0]);
    if (student) return reopen(student);
  }

  const askDelete = (s) =>
    setModal({ type: "confirm", action: "delete", ids: [s.id] });
  const view = (s) => setModal({ type: "details", id: s.id });
  const edit = (s) => setModal({ type: "form", id: s.id });
  const askComplete = (s) => setModal({ type: "complete", ids: [s.id] });
  const askReopen = (s) =>
    setModal({ type: "confirm", action: "reopen", ids: [s.id] });

  const modalStudent = modal?.id
    ? students.find((s) => s.id === modal.id)
    : null;
  const targets = modal?.ids
    ? students.filter((s) => modal.ids.includes(s.id))
    : [];

  function confirmCopy() {
    const many = targets.length > 1;
    const name = many
      ? `${targets.length} students`
      : `“${targets[0].fullName}”`;
    if (modal.action === "delete-force") {
      const paid = targets.reduce((sum, s) => sum + s.amountPaid, 0);
      return {
        title: many
          ? `Delete ${targets.length} students with payment history?`
          : "Delete a student with payment history?",
        message: `${name} ${many ? "have" : "has"} ${formatKSh(paid)} in recorded payments. Deleting permanently erases their enrollments, payments, attendance and certificates, which can't be recovered. Marking the enrollment as Dropped keeps the records instead.`,
        confirmLabel: "Erase records and delete",
        tone: "danger",
      };
    }
    if (modal.action === "delete") {
      const withCert = targets.some((s) => s.certificate);
      return {
        title: many
          ? `Delete ${targets.length} students?`
          : "Delete this student?",
        message: `${name} will be permanently deleted${withCert ? ", and their certificate will no longer verify" : ""}. This can't be undone.`,
        confirmLabel: many
          ? `Delete ${targets.length} students`
          : "Delete student",
        tone: "danger",
      };
    }
    return {
      title: "Move back to active?",
      message: `${name} will return to Current students${targets[0].certificate ? " and their certificate will be withdrawn" : ""}.`,
      confirmLabel: "Move back to active",
      tone: "primary",
    };
  }

  const confirm =
    modal?.type === "confirm" && targets.length ? confirmCopy() : null;

  const rowActions = {
    onView: view,
    onEdit: edit,
    onComplete: askComplete,
    onDelete: askDelete,
  };
  const gradActions = {
    onView: view,
    onReopen: askReopen,
    onDelete: askDelete,
  };

  /* ---------------- loading / error ---------------- */
  if (isLoading) {
    return (
      <div className="sp">
        <p role="status" className="sp-state">
          Loading students…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="sp">
        <div role="alert" className="sp-state">
          <p>{errorMessage(error, "Could not load students.")}</p>
          <button type="button" className="sp-add" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Used by both tabs.
  const programFilter = (
    <Select
      value={filters.program}
      onChange={(v) => changeFilter("program", v)}
      label="Filter by program"
    >
      <option value="all">All programs</option>
      {programs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}
        </option>
      ))}
    </Select>
  );

  /* ---------------- render ---------------- */
  return (
    <div className="sp">
      <section className="sp-stats" aria-label="Students summary">
        {[
          {
            label: "Total students",
            value: stats.total,
            icon: Users,
            tone: "blue",
          },
          {
            label: "Active now",
            value: stats.active,
            icon: UserCheck,
            tone: "green",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: GraduationCap,
            tone: "violet",
          },
          {
            label: "Fees collected",
            value: formatKSh(stats.collected),
            icon: Banknote,
            tone: "amber",
          },
          {
            label: "Outstanding fees",
            value: formatKSh(stats.outstanding),
            icon: Wallet,
            tone: "rose",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="sp-stat">
            <span className={`sp-stat__icon sp-stat__icon--${tone}`}>
              <Icon size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="sp-stat__value">{value}</p>
              <p className="sp-stat__label">{label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="sp-card">
        <div className="sp-tabs" role="tablist" aria-label="Student areas">
          <button
            type="button"
            role="tab"
            id="tab-current"
            aria-selected={tab === "current"}
            aria-controls="panel-students"
            className={`sp-tab${tab === "current" ? " is-active" : ""}`}
            onClick={() => changeTab("current")}
          >
            <Users size={17} aria-hidden="true" />
            Current students
            <span>{currentAll.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-completed"
            aria-selected={tab === "completed"}
            aria-controls="panel-students"
            className={`sp-tab sp-tab--completed${tab === "completed" ? " is-active" : ""}`}
            onClick={() => changeTab("completed")}
          >
            <GraduationCap size={17} aria-hidden="true" />
            Completed students
            <span>{completedAll.length}</span>
          </button>
        </div>

        {tab === "completed" && (
          <div className="sp-grad-banner">
            <span>
              <GraduationCap size={26} aria-hidden="true" />
            </span>
            <div>
              <h2>Graduates</h2>
              <p>
                Students who finished their program. Only these students can
                receive a certificate.
              </p>
            </div>
            <ul>
              <li>
                <strong>{completedAll.length}</strong> graduates
              </li>
              <li>
                <strong>{avgScore != null ? `${avgScore}%` : "—"}</strong>{" "}
                average score
              </li>
              <li>
                <strong>
                  {issued}/{completedAll.length}
                </strong>{" "}
                certificates issued
              </li>
            </ul>
          </div>
        )}

        <div className="sp-toolbar">
          <label className="sp-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => changeFilter("query", e.target.value)}
              placeholder={
                tab === "current"
                  ? "Search name, number, phone, program…"
                  : "Search graduates…"
              }
              aria-label="Search students"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => changeFilter("query", "")}
                aria-label="Clear search"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>

          {tab === "current" ? (
            <>
              <Select
                value={filters.status}
                onChange={(v) => changeFilter("status", v)}
                label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On hold</option>
                <option value="dropped">Dropped</option>
              </Select>
              {programFilter}
              <Select
                value={filters.ageGroup}
                onChange={(v) => changeFilter("ageGroup", v)}
                label="Filter by age group"
              >
                <option value="all">All ages</option>
                {ageGroups.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
              <Select
                value={filters.payment}
                onChange={(v) => changeFilter("payment", v)}
                label="Filter by fee status"
              >
                <option value="all">All fee statuses</option>
                <option value="paid">Fully paid</option>
                <option value="partial">Part paid</option>
                <option value="pending">Unpaid</option>
              </Select>
              <Select
                value={filters.certificate}
                onChange={(v) => changeFilter("certificate", v)}
                label="Filter by participation certificate"
              >
                <option value="all">All certificates</option>
                <option value="pending">Participation: ready to issue</option>
                <option value="issued">Participation: issued</option>
              </Select>
            </>
          ) : (
            <>
              {programFilter}
              <Select
                value={filters.certificate}
                onChange={(v) => changeFilter("certificate", v)}
                label="Filter by certificate"
              >
                <option value="all">All certificates</option>
                <option value="issued">Issued</option>
                <option value="pending">Not issued yet</option>
              </Select>
            </>
          )}

          <Select
            value={filters.sort}
            onChange={(v) => changeFilter("sort", v)}
            label="Sort"
          >
            {SORTS[tab].map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          {hasFilters && (
            <button type="button" className="sp-clear" onClick={clearFilters}>
              <X size={15} aria-hidden="true" />
              Clear
            </button>
          )}

          <button
            type="button"
            className="sp-add"
            onClick={() => setModal({ type: "form", id: null })}
          >
            <Plus size={18} aria-hidden="true" />
            Add student
          </button>
        </div>

        {tab === "current" && selected.size > 0 && (
          <BulkBar
            count={selected.size}
            totalMatching={filtered.length}
            onSelectAll={() => setSelected(new Set(filtered.map((s) => s.id)))}
            onComplete={() =>
              setModal({
                type: "complete",
                ids: selectedStudents.map((s) => s.id),
              })
            }
            onDelete={() =>
              setModal({
                type: "confirm",
                action: "delete",
                ids: selectedStudents.map((s) => s.id),
              })
            }
            onClear={() => setSelected(new Set())}
          />
        )}

        <div
          role="tabpanel"
          id="panel-students"
          aria-labelledby={tab === "current" ? "tab-current" : "tab-completed"}
        >
          {tab === "current" ? (
            <CurrentStudentsTable
              rows={rows}
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPage={(n) => setPages((p) => ({ ...p, current: n }))}
              onPageSize={(n) => {
                setSizes((s) => ({ ...s, current: n }));
                setPages((p) => ({ ...p, current: 1 }));
              }}
              selected={selected}
              allSelected={allOnPage}
              someSelected={someOnPage}
              onToggleAll={toggleAllOnPage}
              onToggleOne={toggleOne}
              actions={rowActions}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
              onAdd={() => setModal({ type: "form", id: null })}
            />
          ) : (
            <CompletedStudentsGrid
              rows={rows}
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPage={(n) => setPages((p) => ({ ...p, completed: n }))}
              onPageSize={(n) => {
                setSizes((s) => ({ ...s, completed: n }));
                setPages((p) => ({ ...p, completed: 1 }));
              }}
              actions={gradActions}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </section>

      {/* ---------- popups ---------- */}
      {modal?.type === "details" && modalStudent && (
        <StudentDetailsModal
          student={modalStudent}
          onClose={closeModal}
          onEdit={() => edit(modalStudent)}
          onDelete={() => askDelete(modalStudent)}
          onComplete={() => askComplete(modalStudent)}
          onReopen={() => askReopen(modalStudent)}
        />
      )}
      {modal?.type === "form" && (
        <StudentFormModal
          key={modal.id ?? "new"}
          student={modalStudent}
          programs={enrollablePrograms}
          programsLoading={programsLoading}
          ageGroups={ageGroups}
          onSave={(data) => saveStudent(data, modalStudent)}
          onClose={closeModal}
        />
      )}
      {modal?.type === "complete" && targets.length > 0 && (
        <CompleteDialog
          key={modal.ids.join()}
          students={targets}
          onConfirm={confirmComplete}
          onCancel={closeModal}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          items={targets.map((s) => s.fullName)}
          confirmLabel={confirm.confirmLabel}
          tone={confirm.tone}
          onConfirm={confirmDeleteOrReopen}
          onCancel={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
