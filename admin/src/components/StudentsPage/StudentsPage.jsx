"use client";

import "./StudentsPage.css";
import { useCallback, useMemo, useState } from "react";
import {
  Award,
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
  AGE_GROUPS,
  PROGRAM_OPTIONS,
  addStudent,
  completeStudents,
  deleteStudents,
  paymentInfo,
  reopenStudent,
  updateStudent,
  useStudents,
  formatKSh,
} from "../../data/students";
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

/**
 * StudentsPage.jsx
 * Stats, the Current / Completed tabs, search + filters, and all the actions.
 * Completed students live in their own area (tab) with their own layout.
 */

const DEFAULT_FILTERS = {
  query: "",
  status: "all",
  program: "all",
  ageGroup: "all",
  payment: "all",
  certificate: "all",
  sort: "recent",
};

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
      fn: (a, b) => (b.completedOn ?? "").localeCompare(a.completedOn ?? ""),
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
  if (f.program !== "all" && student.program !== f.program) return false;
  if (tab === "current") {
    if (f.status !== "all" && student.status !== f.status) return false;
    if (f.ageGroup !== "all" && student.ageGroup !== f.ageGroup) return false;
    if (f.payment !== "all" && paymentInfo(student).status !== f.payment)
      return false;
  } else {
    if (f.certificate === "issued" && !student.certificate) return false;
    if (f.certificate === "pending" && student.certificate) return false;
  }
  return true;
}

export default function StudentsPage() {
  const students = useStudents();

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

  const stats = useMemo(
    () => ({
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      completed: completedAll.length,
      collected: students.reduce((sum, s) => sum + s.amountPaid, 0),
      outstanding: currentAll
        .filter((s) => s.status !== "dropped")
        .reduce((sum, s) => sum + paymentInfo(s).balance, 0),
    }),
    [students, currentAll, completedAll],
  );

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
        filters.payment !== "all"
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

  /* ---------------- actions ---------------- */
  function saveStudent(data, existing) {
    if (existing) {
      updateStudent(existing.id, data);
      showToast(
        data.status === "completed" && existing.status !== "completed"
          ? "Saved. They now appear under Completed students."
          : "Changes saved",
      );
    } else {
      addStudent(data);
      showToast(
        data.status === "completed"
          ? "Student added to Completed students"
          : "Student added",
      );
    }
    closeModal();
  }

  function confirmComplete(options) {
    const ids = modal.ids;
    completeStudents(ids, options);
    setSelected(new Set());
    showToast(
      ids.length > 1
        ? `${ids.length} students marked as completed`
        : "Marked as completed. They are now eligible for a certificate.",
    );
    closeModal();
  }

  function confirmDeleteOrReopen() {
    const { action, ids } = modal;
    if (action === "delete") {
      deleteStudents(ids);
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      showToast(
        ids.length > 1 ? `${ids.length} students deleted` : "Student deleted",
        "danger",
      );
    } else {
      const had = students.find((s) => s.id === ids[0])?.certificate;
      reopenStudent(ids[0]);
      showToast(
        had
          ? "Moved back to active. Their certificate was withdrawn."
          : "Moved back to active",
        "info",
      );
    }
    closeModal();
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
              <Select
                value={filters.program}
                onChange={(v) => changeFilter("program", v)}
                label="Filter by program"
              >
                <option value="all">All programs</option>
                {PROGRAM_OPTIONS.map((p) => (
                  <option key={p.title}>{p.title}</option>
                ))}
              </Select>
              <Select
                value={filters.ageGroup}
                onChange={(v) => changeFilter("ageGroup", v)}
                label="Filter by age group"
              >
                <option value="all">All ages</option>
                {AGE_GROUPS.map((a) => (
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
            </>
          ) : (
            <>
              <Select
                value={filters.program}
                onChange={(v) => changeFilter("program", v)}
                label="Filter by program"
              >
                <option value="all">All programs</option>
                {PROGRAM_OPTIONS.map((p) => (
                  <option key={p.title}>{p.title}</option>
                ))}
              </Select>
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
