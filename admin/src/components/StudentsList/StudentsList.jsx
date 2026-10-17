"use client";

import "./StudentsList.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Pencil,
  RotateCcw,
  SearchX,
  Trash2,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import {
  STATUS_META,
  avatarTone,
  certificateEligibility,
  formatDate,
  formatKSh,
  honorsFor,
  initials,
  paymentInfo,
} from"@/src/data/students";

/**
 * StudentsList.jsx
 * The two areas of the Students page:
 *   - CurrentStudentsTable: everyone still learning (table with all actions)
 *   - CompletedStudentsGrid: graduates (cards, certificate status)
 * plus the bulk bar, pagination and empty states they share.
 */

/* ============================== small pieces ============================== */

function Badge({ tone = "neutral", icon: Icon, children }) {
  return (
    <span className={`sl-badge sl-badge--${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

function Avatar({ name, size = "md" }) {
  return <span className={`sl-avatar sl-avatar--${size} sl-avatar--tone${avatarTone(name)}`}>{initials(name)}</span>;
}

function Meter({ value, tone }) {
  return (
    <span className={`sl-meter${tone ? ` sl-meter--${tone}` : ""}`} aria-hidden="true">
      <span style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );
}

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  wanted.forEach((n, i) => {
    if (i > 0 && n - wanted[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

function Pagination({ total, page, pageSize, sizes, onPage, onPageSize, noun }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return (
    <div className="sl-pager">
      <p className="sl-pager__count">
        {total === 0 ? `No ${noun}` : `Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total} ${noun}`}
      </p>
      <label className="sl-pager__size">
        Per page
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} aria-label="Items per page">
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <nav className="sl-pager__nav" aria-label="Pagination">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        {pageWindow(page, totalPages).map((n) =>
          typeof n === "string" ? (
            <span key={n} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={n === page ? "is-current" : ""}
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

function EmptyState({ title, text, hasFilters, onClear, onAdd }) {
  return (
    <div className="sl-empty">
      <span>
        <SearchX size={26} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {hasFilters ? (
        <button type="button" className="sl-btn" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        onAdd && (
          <button type="button" className="sl-btn sl-btn--primary" onClick={onAdd}>
            <UserPlus size={16} aria-hidden="true" />
            Add student
          </button>
        )
      )}
    </div>
  );
}

/* ============================== bulk bar ============================== */

export function BulkBar({ count, totalMatching, onSelectAll, onComplete, onDelete, onClear }) {
  return (
    <div className="sl-bulk" role="region" aria-label="Bulk actions">
      <strong>{count} selected</strong>
      {count < totalMatching && (
        <button type="button" className="sl-link" onClick={onSelectAll}>
          Select all {totalMatching}
        </button>
      )}
      <span className="sl-bulk__spacer" />
      <button type="button" className="sl-btn" onClick={onComplete}>
        <GraduationCap size={16} aria-hidden="true" />
        Mark as completed
      </button>
      <button type="button" className="sl-btn sl-btn--danger" onClick={onDelete}>
        <Trash2 size={16} aria-hidden="true" />
        Delete
      </button>
      <button type="button" className="sl-btn sl-btn--ghost" onClick={onClear}>
        <X size={16} aria-hidden="true" />
        Clear
      </button>
    </div>
  );
}

/* ============================== current students (table) ============================== */

/** actions: { onView, onEdit, onComplete, onDelete } each receive the student */
export function CurrentStudentsTable({
  rows,
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
  selected,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
  actions,
  hasFilters,
  onClearFilters,
  onAdd,
}) {
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  function onRowClick(event, student) {
    if (event.target.closest("button, a, input, label, select")) return;
    actions.onView(student);
  }

  return (
    <>
      <div className="sl-table-wrap">
        <table className="sl-table">
          <caption className="sl-sr">Current students</caption>
          <thead>
            <tr>
              <th scope="col" className="sl-col-check">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Select all students on this page"
                />
              </th>
              <th scope="col">Student</th>
              <th scope="col">Program</th>
              <th scope="col">Progress</th>
              <th scope="col">Attendance</th>
              <th scope="col">Fees</th>
              <th scope="col">Status</th>
              <th scope="col" className="sl-col-actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const meta = STATUS_META[s.status];
              const pay = paymentInfo(s);
              const elig = certificateEligibility(s);
              const isSelected = selected.has(s.id);

              return (
                <tr key={s.id} className={`sl-row${isSelected ? " is-selected" : ""}`} onClick={(e) => onRowClick(e, s)}>
                  <td className="sl-col-check">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleOne(s.id)}
                      aria-label={`Select ${s.fullName}`}
                    />
                  </td>
                  <td>
                    <div className="sl-person">
                      <Avatar name={s.fullName} />
                      <div>
                        <button type="button" className="sl-person__name" onClick={() => actions.onView(s)}>
                          {s.fullName}
                        </button>
                        <span className="sl-sub">
                          {s.studentNo} · {s.ageGroup}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.program}
                    <span className="sl-sub sl-sub--block">
                      <CalendarDays size={12} aria-hidden="true" /> Since {formatDate(s.enrolledOn)}
                    </span>
                  </td>
                  <td>
                    <div className="sl-progress">
                      <strong>{s.progress}%</strong>
                      <Meter value={s.progress} />
                    </div>
                  </td>
                  <td>
                    <span className={s.attendance < 75 ? "sl-low" : ""}>{s.attendance}%</span>
                  </td>
                  <td>
                    <div className="sl-fees">
                      <span>
                        {formatKSh(s.amountPaid)} <small>/ {formatKSh(s.fee)}</small>
                      </span>
                      <Badge tone={pay.status === "paid" ? "success" : pay.status === "partial" ? "warning" : "danger"} icon={Wallet}>
                        {pay.status === "paid" ? "Paid" : pay.status === "partial" ? `Owes ${formatKSh(pay.balance)}` : "Unpaid"}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {elig.type === "participation" && (
                      <span className="sl-cert-flag" title={elig.reason}>
                        <Award size={12} aria-hidden="true" />
                        {s.certificate ? "Participation certificate issued" : "Eligible for participation certificate"}
                      </span>
                    )}
                  </td>
                  <td className="sl-col-actions">
                    <div className="sl-actions">
                      <button type="button" onClick={() => actions.onView(s)} aria-label={`View ${s.fullName}`} title="View profile">
                        <Eye size={17} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => actions.onEdit(s)} aria-label={`Edit ${s.fullName}`} title="Edit">
                        <Pencil size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sl-actions__complete"
                        onClick={() => actions.onComplete(s)}
                        aria-label={`Mark ${s.fullName} as completed`}
                        title="Mark as completed"
                      >
                        <GraduationCap size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sl-actions__delete"
                        onClick={() => actions.onDelete(s)}
                        aria-label={`Delete ${s.fullName}`}
                        title="Delete"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No students found"
                    text={hasFilters ? "Try a different search or clear your filters." : "Add your first student to get started."}
                    hasFilters={hasFilters}
                    onClear={onClearFilters}
                    onAdd={onAdd}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} page={page} pageSize={pageSize} sizes={[5, 8, 15, 25]} onPage={onPage} onPageSize={onPageSize} noun="students" />
    </>
  );
}

/* ============================== completed students (cards) ============================== */

/** actions: { onView, onReopen, onDelete } each receive the student */
export function CompletedStudentsGrid({ rows, total, page, pageSize, onPage, onPageSize, actions, hasFilters, onClearFilters }) {
  return (
    <>
      {rows.length === 0 ? (
        <EmptyState
          title="No completed students"
          text={hasFilters ? "Try a different search or clear your filters." : "Students appear here once you mark them as completed."}
          hasFilters={hasFilters}
          onClear={onClearFilters}
        />
      ) : (
        <ul className="sl-grads">
          {rows.map((s) => {
            const honors = honorsFor(s.finalScore);
            return (
              <li key={s.id} className="sl-grad">
                <div className="sl-grad__top">
                  <Avatar name={s.fullName} size="lg" />
                  <div>
                    <button type="button" className="sl-person__name" onClick={() => actions.onView(s)}>
                      {s.fullName}
                    </button>
                    <span className="sl-sub">{s.program}</span>
                  </div>
                  {honors && (
                    <Badge tone="gold" icon={Award}>
                      {honors}
                    </Badge>
                  )}
                </div>

                <dl className="sl-grad__stats">
                  <div>
                    <dt>Completed</dt>
                    <dd>{formatDate(s.completedOn)}</dd>
                  </div>
                  <div>
                    <dt>Final score</dt>
                    <dd>{s.finalScore != null ? `${s.finalScore}%` : "—"}</dd>
                  </div>
                  <div>
                    <dt>Attendance</dt>
                    <dd>{s.attendance}%</dd>
                  </div>
                </dl>

                <div className={`sl-grad__cert${s.certificate ? " is-issued" : ""}`}>
                  <Award size={18} aria-hidden="true" />
                  <span>{s.certificate ? `${s.certificate.number}` : "Certificate not issued yet"}</span>
                </div>

                <div className="sl-grad__actions">
                  <Link href={`/dashboard/certificates?student=${s.id}`} className="sl-btn sl-btn--primary">
                    <Award size={16} aria-hidden="true" />
                    {s.certificate ? "View certificate" : "Issue certificate"}
                  </Link>
                  <button type="button" className="sl-icon" onClick={() => actions.onView(s)} aria-label={`View ${s.fullName}`} title="View profile">
                    <Eye size={17} aria-hidden="true" />
                  </button>
                  <button type="button" className="sl-icon" onClick={() => actions.onReopen(s)} aria-label={`Move ${s.fullName} back to active`} title="Move back to active">
                    <RotateCcw size={17} aria-hidden="true" />
                  </button>
                  <button type="button" className="sl-icon sl-icon--danger" onClick={() => actions.onDelete(s)} aria-label={`Delete ${s.fullName}`} title="Delete">
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination total={total} page={page} pageSize={pageSize} sizes={[6, 12, 24]} onPage={onPage} onPageSize={onPageSize} noun="graduates" />
    </>
  );
}
