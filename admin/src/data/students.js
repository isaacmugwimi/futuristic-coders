// Shared helpers for the Students module.
// These replace the helpers that used to live in the mock file
// "@/src/data/students". They only read values the backend already returns
// (agreed fee, amount paid, status, enrollment date, program length and
// certificate), so nothing here is hard-coded student data.

// ============================================================================
// LABELS AND OPTIONS
// ============================================================================

// status -> label and badge tone
export const STATUS_META = {
  active: { label: "Active", tone: "success" },
  on_hold: { label: "On hold", tone: "warning" },
  dropped: { label: "Dropped", tone: "danger" },
  completed: { label: "Completed", tone: "violet" },
};

// Two kinds of certificate:
//   completion    -> finished the program
//   participation -> did not finish, but paid in full
export const CERTIFICATE_TYPES = {
  completion: {
    label: "Certificate of Completion",
    short: "Completion",
    prefix: "FC-CERT",
  },
  participation: {
    label: "Certificate of Participation",
    short: "Participation",
    prefix: "FC-PART",
  },
};

// value is what the backend stores; the backend also accepts "M-Pesa" etc.
export const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
];

// Kids (7–12) need a parent or guardian.
export const isChildAgeGroup = (label) => /kid|child/i.test(label ?? "");

// ============================================================================
// MONEY
// ============================================================================

// 12000 -> "KSh 12,000"
export const formatKSh = (amount) =>
  `KSh ${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;

// Same rule as the backend: fully paid once amount paid reaches the agreed fee.
// status: "paid" | "partial" | "pending" (pending = nothing paid yet)
export const paymentInfo = (student) => {
  const fee = Number(student?.fee ?? 0);
  const paid = Number(student?.amountPaid ?? 0);
  const balance = Math.max(0, fee - paid);

  return {
    fee,
    paid,
    balance,
    status: balance === 0 ? "paid" : paid > 0 ? "partial" : "pending",
  };
};

export const isFullyPaid = (student) => paymentInfo(student).balance === 0;

// ============================================================================
// DATES
// ============================================================================

// Today's date (YYYY-MM-DD) in Kenya time.
export const todayISO = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(
    new Date(),
  );

// "2026-10-19" or an ISO timestamp -> "19 Oct 2026"
export const formatDate = (value) => {
  if (!value) return "—";

  const text = String(value);
  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return "—";

  // Plain dates are UTC midnight; timestamps are shown in Kenya time.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : "Africa/Nairobi",
  });
};

// ============================================================================
// CERTIFICATE ELIGIBILITY
// ============================================================================

// Minimum attendance (%) for a participation certificate.
// 0 = paying in full is enough; raise it (e.g. 50) to ask for some attendance.
export const PARTICIPATION_MIN_ATTENDANCE = 0;

// The day the program is expected to end (enrollment date + program length),
// or null if unknown. student.programWeeks is added by the Students page from
// the program's duration.
export function programEndDate(student) {
  const weeks = student?.programWeeks;

  if (!weeks || !student?.enrolledOn) return null;

  const end = new Date(`${student.enrolledOn}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + weeks * 7);

  return end.toISOString().slice(0, 10);
}

// Which certificate (if any) can this student receive?
//   completed                                  -> "completion"
//   not completed, fees paid in full, and they
//   are no longer learning (on hold, dropped,
//   or the program period has ended)           -> "participation"
//   anything else                              -> null, with the reason
// This only says which type applies. Whether one has already been issued
// is on student.certificate.
export function certificateEligibility(student, today = todayISO()) {
  if (student.status === "completed") {
    return { type: "completion", reason: "Completed the program" };
  }

  const owes = paymentInfo(student).balance;

  if (owes > 0) {
    return {
      type: null,
      reason: `Fees not fully paid (owes ${formatKSh(owes)})`,
    };
  }

  if ((student.attendance ?? 0) < PARTICIPATION_MIN_ATTENDANCE) {
    return {
      type: null,
      reason: `Attendance is below ${PARTICIPATION_MIN_ATTENDANCE}%`,
    };
  }

  const end = programEndDate(student);

  if (student.status === "active" && (!end || end >= today)) {
    return {
      type: null,
      reason: end
        ? `Still learning. Program ends ${formatDate(end)}`
        : "Still learning",
    };
  }

  const reason =
    student.status === "dropped"
      ? "Stopped attending, fees paid in full"
      : student.status === "on_hold"
        ? "Learning paused, fees paid in full"
        : "Program period ended without completion, fees paid in full";

  return { type: "participation", reason };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

// "Amina Wanjiru" -> "AW"
export const initials = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

// Number of .sm-avatar--toneN classes in StudentModals.css (tone0 to tone5).
export const AVATAR_TONE_COUNT = 6;

// 0-5, a stable colour per person for avatars.
export const avatarTone = (name) =>
  [...String(name ?? "")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
  AVATAR_TONE_COUNT;

// Final score -> label printed on the certificate.
export const honorsFor = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 85) return "Distinction";
  if (score >= 70) return "Merit";
  if (score >= 50) return "Pass";
  return null;
};

// ============================================================================
// PHONE NUMBERS
// ============================================================================

// 0712 345 678 / +254712345678 / 254112345678 -> "+254712345678", else "".
export const normalizeKenyanPhone = (value) => {
  const compact = String(value ?? "").replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+?254|0)([17]\d{8})$/);

  return match ? `+254${match[1]}` : "";
};

// "+254712345678" -> "+254 712 345 678"
export const formatPhone = (value) => {
  const n = normalizeKenyanPhone(value);

  return n
    ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7, 10)} ${n.slice(10)}`
    : value || "—";
};

// ============================================================================
// DATES (LONG FORM AND KENYA TIME)
// ============================================================================

// "2026-10-16" -> "16 October 2026" (used on certificates)
export const formatLongDate = (value) => {
  if (!value) return "—";

  const text = String(value);
  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return "—";

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : "Africa/Nairobi",
  });
};

// A timestamp (e.g. when a certificate was issued) -> its Kenya date, "2026-10-16".
export const kenyaDate = (timestamp) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
  }).format(date);
};

// ============================================================================
// CERTIFICATE SETTINGS
// ============================================================================

// Set NEXT_PUBLIC_SITE_URL in .env to your public website.
export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://futuristiccoders.co.ke";

// Names printed under the signature lines. Edit these when the people change.
export const SIGNATORIES = [
  { name: "Faith Lilian", title: "Program Director" },
  { name: "Isaac Mugwimi", title: "Lead Instructor" },
];

// ============================================================================
// BACKEND -> UI STUDENT
// ============================================================================

// API responses look like { success, data: [...] }.
export const listOf = (response) => response?.data ?? [];

// "2026-10-19T00:00:00.000Z" -> "2026-10-19"
const dateOnly = (value) => (value ? String(value).slice(0, 10) : null);

const optionalNumber = (value) =>
  value === null || value === undefined ? null : Number(value);

// A row from GET /get-all-students is one student merged with their latest
// enrollment (snake_case). The UI works with camelCase, so this is the one
// place that renames the fields. The raw row is kept so nothing is lost.
// weeksByProgram: Map of program ID -> duration in weeks.
export function toUiStudent(row, weeksByProgram = new Map()) {
  return {
    ...row,
    id: row.id,
    studentNo: row.student_no,
    fullName: row.full_name ?? "",
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    ageGroup: row.age_group,
    createdAt: String(row.created_at ?? ""),

    enrollmentId: row.enrollment_id ?? null,
    programId: row.program_id ?? null,
    program: row.program_title ?? "",
    // Program length in weeks; used to work out when the program period ends.
    programWeeks: weeksByProgram.get(row.program_id) ?? null,
    status: row.status ?? "active",
    enrolledOn: dateOnly(row.enrolled_on),
    completedOn: dateOnly(row.completed_on),
    progress: Number(row.progress ?? 0),
    fee: Number(row.agreed_fee ?? 0),
    amountPaid: Number(row.amount_paid ?? 0),
    // Read-only: calculated by the backend from per-session attendance.
    attendance: optionalNumber(row.attendance_percentage),
    finalScore: optionalNumber(row.final_score),
    certificate:
      row.certificate_status === "issued"
        ? {
            type: row.certificate_type ?? "completion",
            number: row.certificate_no ?? null,
            no: row.certificate_no ?? null, // same value, for older code
            issuedOn: kenyaDate(row.certificate_issued_at),
          }
        : null,
  };
}
