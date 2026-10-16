// Shared mock data + tiny store for the Students and Certificates pages.
// Both pages read the same list, so completing a student on one page shows up
// on the other. Replace the actions below with API calls when your backend is ready.

import { useSyncExternalStore } from "react";

export const PUBLIC_SITE_URL = "https://futuristiccoders.co.ke"; // TODO: your public website

/* ============================== options ============================== */

export const PROGRAM_OPTIONS = [
  { title: "Scratch Juniors", weeks: 6, fee: 6000 },
  { title: "Game Design with Scratch", weeks: 8, fee: 7500 },
  { title: "Web Development Foundations", weeks: 8, fee: 9500 },
  { title: "JavaScript Essentials", weeks: 10, fee: 11000 },
  { title: "React for Builders", weeks: 10, fee: 15000 },
  { title: "Python Basics", weeks: 8, fee: 9500 },
  { title: "Python for Data & Automation", weeks: 10, fee: 14000 },
  { title: "SQL & PostgreSQL Fundamentals", weeks: 5, fee: 8000 },
  { title: "Full-Stack Bootcamp", weeks: 16, fee: 45000 },
  { title: "Holiday Code Camp", weeks: 2, fee: 4500 },
];

export const AGE_GROUPS = ["Kids (7–12)", "Teens (13–17)", "Adults (18+)"];

export const STATUS_META = {
  active: { label: "Active", tone: "success" },
  on_hold: { label: "On hold", tone: "warning" },
  dropped: { label: "Dropped", tone: "danger" },
  completed: { label: "Completed", tone: "violet" },
};

export const CURRENT_STATUSES = ["active", "on_hold", "dropped"];

/* ============================== helpers ============================== */

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatKSh = (amount) => `KSh ${Number(amount || 0).toLocaleString("en-US")}`;

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : "—";

export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** 0-5, a stable colour per person for avatars */
export const avatarTone = (name) => [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 6;

/** 0712 345 678 / +254712345678 / 254112345678 -> "+254712345678", else null */
export function normalizeKenyanPhone(input) {
  const compact = String(input ?? "").replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+?254|0)([17]\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

export function formatPhone(value) {
  const n = normalizeKenyanPhone(value);
  return n ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7, 10)} ${n.slice(10)}` : value || "—";
}

/** { balance, status: "paid" | "partial" | "pending" } */
export function paymentInfo(student) {
  const balance = Math.max(0, student.fee - student.amountPaid);
  const status = balance === 0 ? "paid" : student.amountPaid > 0 ? "partial" : "pending";
  return { balance, status };
}

export function honorsFor(score) {
  if (score == null) return null;
  if (score >= 85) return "Distinction";
  if (score >= 70) return "Merit";
  if (score >= 50) return "Pass";
  return null;
}

export const programWeeks = (title) => PROGRAM_OPTIONS.find((p) => p.title === title)?.weeks ?? null;

/** Looks a certificate number up. Only completed students can hold a valid certificate. */
export function findCertificate(students, number) {
  const wanted = String(number ?? "").trim().toUpperCase();
  if (!wanted) return null;
  return students.find((s) => s.status === "completed" && s.certificate?.number === wanted) ?? null;
}

function nextCertificateNumber(students, year) {
  const prefix = `FC-CERT-${year}-`;
  const highest = students
    .map((s) => s.certificate?.number)
    .filter((n) => n && n.startsWith(prefix))
    .reduce((max, n) => Math.max(max, Number(n.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

/* ============================== mock data ============================== */

let counter = 0;
const make = (o) => {
  counter += 1;
  return {
    id: `stu_${String(counter).padStart(3, "0")}`,
    studentNo: `FCS-${String(counter).padStart(4, "0")}`,
    email: "",
    guardianName: "",
    guardianPhone: "",
    notes: "",
    attendance: 100,
    finalScore: null,
    completedOn: null,
    certificate: null,
    ...o,
    createdAt: `${o.enrolledOn}T08:00:00Z`,
    updatedAt: `${o.completedOn ?? o.enrolledOn}T10:00:00Z`,
  };
};

export const INITIAL_STUDENTS = [
  make({ fullName: "Amina Wanjiru", email: "amina.w@example.com", phone: "+254712345001", ageGroup: "Teens (13–17)", guardianName: "Grace Wanjiru", guardianPhone: "+254722111001", county: "Nairobi", program: "Web Development Foundations", enrolledOn: "2026-09-01", status: "active", progress: 72, attendance: 94, fee: 9500, amountPaid: 9500, notes: "Great with layout and CSS." }),
  make({ fullName: "Brian Otieno", email: "brian.o@example.com", phone: "+254712345002", ageGroup: "Teens (13–17)", guardianName: "Rose Otieno", guardianPhone: "+254722111002", county: "Kisumu", program: "Python Basics", enrolledOn: "2026-09-05", status: "active", progress: 55, attendance: 88, fee: 9500, amountPaid: 5000 }),
  make({ fullName: "Cynthia Mwende", email: "cynthia.m@example.com", phone: "+254712345003", ageGroup: "Adults (18+)", county: "Machakos", program: "React for Builders", enrolledOn: "2026-08-24", status: "active", progress: 40, attendance: 91, fee: 15000, amountPaid: 15000 }),
  make({ fullName: "David Kiprop", email: "david.k@example.com", phone: "+254712345004", ageGroup: "Teens (13–17)", guardianName: "Alice Kiprop", guardianPhone: "+254722111004", county: "Eldoret", program: "JavaScript Essentials", enrolledOn: "2026-08-17", status: "on_hold", progress: 35, attendance: 70, fee: 11000, amountPaid: 5500, notes: "Paused for exams. Resumes in November." }),
  make({ fullName: "Esther Njeri", phone: "+254712345005", ageGroup: "Kids (7–12)", guardianName: "Joseph Njeri", guardianPhone: "+254722111005", county: "Kirinyaga", program: "Scratch Juniors", enrolledOn: "2026-09-12", status: "active", progress: 83, attendance: 97, fee: 6000, amountPaid: 6000 }),
  make({ fullName: "Felix Mutua", email: "felix.m@example.com", phone: "+254712345006", ageGroup: "Adults (18+)", county: "Nairobi", program: "Full-Stack Bootcamp", enrolledOn: "2026-07-20", status: "active", progress: 22, attendance: 85, fee: 45000, amountPaid: 15000 }),
  make({ fullName: "Gladys Achieng", phone: "+254712345007", ageGroup: "Kids (7–12)", guardianName: "Peter Achieng", guardianPhone: "+254722111007", county: "Kiambu", program: "Game Design with Scratch", enrolledOn: "2026-09-19", status: "active", progress: 60, attendance: 92, fee: 7500, amountPaid: 7500 }),
  make({ fullName: "Hassan Abdi", email: "hassan.a@example.com", phone: "+254712345008", ageGroup: "Adults (18+)", county: "Mombasa", program: "SQL & PostgreSQL Fundamentals", enrolledOn: "2026-08-03", status: "dropped", progress: 18, attendance: 40, fee: 8000, amountPaid: 4000, notes: "Relocated for work." }),
  make({ fullName: "Irene Chebet", email: "irene.c@example.com", phone: "+254712345009", ageGroup: "Adults (18+)", county: "Nakuru", program: "Python for Data & Automation", enrolledOn: "2026-08-31", status: "active", progress: 48, attendance: 89, fee: 14000, amountPaid: 7000 }),
  make({ fullName: "Joel Kamau", email: "joel.k@example.com", phone: "+254712345010", ageGroup: "Teens (13–17)", guardianName: "Susan Kamau", guardianPhone: "+254722111010", county: "Nyeri", program: "Web Development Foundations", enrolledOn: "2026-08-10", status: "active", progress: 94, attendance: 96, fee: 9500, amountPaid: 9500, notes: "Almost done. Ready to complete." }),
  make({ fullName: "Kevin Ouma", email: "kevin.o@example.com", phone: "+254712345011", ageGroup: "Adults (18+)", county: "Nairobi", program: "JavaScript Essentials", enrolledOn: "2026-10-05", status: "active", progress: 12, attendance: 100, fee: 11000, amountPaid: 0 }),

  make({ fullName: "Lucy Nyambura", email: "lucy.n@example.com", phone: "+254712345012", ageGroup: "Teens (13–17)", guardianName: "Mary Nyambura", guardianPhone: "+254722111012", county: "Kirinyaga", program: "Python Basics", enrolledOn: "2026-07-11", status: "completed", progress: 100, attendance: 98, finalScore: 91, fee: 9500, amountPaid: 9500, completedOn: "2026-09-12", certificate: { number: "FC-CERT-2026-0001", issuedOn: "2026-09-14" } }),
  make({ fullName: "Martin Karanja", email: "martin.k@example.com", phone: "+254712345013", ageGroup: "Teens (13–17)", guardianName: "John Karanja", guardianPhone: "+254722111013", county: "Nairobi", program: "Web Development Foundations", enrolledOn: "2026-07-01", status: "completed", progress: 100, attendance: 90, finalScore: 78, fee: 9500, amountPaid: 9500, completedOn: "2026-08-29", certificate: { number: "FC-CERT-2026-0002", issuedOn: "2026-09-01" } }),
  make({ fullName: "Naomi Wairimu", phone: "+254712345014", ageGroup: "Kids (7–12)", guardianName: "Esther Wairimu", guardianPhone: "+254722111014", county: "Kiambu", program: "Scratch Juniors", enrolledOn: "2026-08-08", status: "completed", progress: 100, attendance: 100, finalScore: 96, fee: 6000, amountPaid: 6000, completedOn: "2026-09-20", certificate: { number: "FC-CERT-2026-0003", issuedOn: "2026-09-22" } }),
  make({ fullName: "Oscar Mugambi", email: "oscar.m@example.com", phone: "+254712345015", ageGroup: "Teens (13–17)", guardianName: "Beth Mugambi", guardianPhone: "+254722111015", county: "Meru", program: "JavaScript Essentials", enrolledOn: "2026-07-27", status: "completed", progress: 100, attendance: 86, finalScore: 66, fee: 11000, amountPaid: 11000, completedOn: "2026-10-03" }),
  make({ fullName: "Purity Wangui", email: "purity.w@example.com", phone: "+254712345016", ageGroup: "Adults (18+)", county: "Nyeri", program: "SQL & PostgreSQL Fundamentals", enrolledOn: "2026-08-31", status: "completed", progress: 100, attendance: 95, finalScore: 82, fee: 8000, amountPaid: 8000, completedOn: "2026-10-08" }),
  make({ fullName: "Quincy Mwangi", email: "quincy.m@example.com", phone: "+254712345017", ageGroup: "Adults (18+)", county: "Nairobi", program: "React for Builders", enrolledOn: "2026-05-18", status: "completed", progress: 100, attendance: 93, finalScore: 88, fee: 15000, amountPaid: 15000, completedOn: "2026-07-30", certificate: { number: "FC-CERT-2026-0004", issuedOn: "2026-08-02" } }),
];

/* ============================== store ============================== */

const STORAGE_KEY = "fc_admin_students_v1";
const listeners = new Set();
let state = INITIAL_STUDENTS;
let loaded = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: keep working in memory */
  }
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  // Load saved demo data once, after the first render (avoids a hydration mismatch)
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        queueMicrotask(emit);
      }
    } catch {
      /* ignore broken saved data */
    }
  }
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STUDENTS;

/** const students = useStudents(); re-renders whenever any page changes the list */
export function useStudents() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function resetStudents() {
  commit(INITIAL_STUDENTS);
}

/* ---------------- actions (swap for API calls later) ---------------- */

const stamp = () => new Date().toISOString();

export function addStudent(data) {
  const ts = stamp();
  const next = Math.max(0, ...state.map((s) => Number(s.studentNo.slice(4)) || 0)) + 1;
  const student = {
    email: "", guardianName: "", guardianPhone: "", notes: "", finalScore: null, completedOn: null, certificate: null,
    ...data,
    id: `stu_${Date.now()}`,
    studentNo: `FCS-${String(next).padStart(4, "0")}`,
    createdAt: ts,
    updatedAt: ts,
  };
  if (student.status === "completed") {
    student.progress = 100;
    student.completedOn = student.completedOn ?? todayISO();
  }
  commit([student, ...state]);
  return student;
}

export function updateStudent(id, patch) {
  const ts = stamp();
  commit(
    state.map((s) => {
      if (s.id !== id) return s;
      const merged = { ...s, ...patch, updatedAt: ts };
      if (merged.status === "completed") {
        merged.progress = 100;
        merged.completedOn = merged.completedOn ?? todayISO();
      } else {
        merged.completedOn = null;
        if (s.status === "completed") merged.certificate = null; // a certificate only exists for completed students
      }
      return merged;
    }),
  );
}

export function deleteStudents(ids) {
  commit(state.filter((s) => !ids.includes(s.id)));
}

/** Moves students to Completed. finalScore (0-100) is only applied when given. */
export function completeStudents(ids, { finalScore } = {}) {
  const ts = stamp();
  commit(
    state.map((s) =>
      ids.includes(s.id)
        ? {
            ...s,
            status: "completed",
            progress: 100,
            completedOn: s.completedOn ?? todayISO(),
            finalScore: finalScore ?? s.finalScore,
            updatedAt: ts,
          }
        : s,
    ),
  );
}

/** Back to Active. Their certificate is withdrawn. */
export function reopenStudent(id) {
  const ts = stamp();
  commit(
    state.map((s) =>
      s.id === id ? { ...s, status: "active", completedOn: null, certificate: null, updatedAt: ts } : s,
    ),
  );
}

/** Gives every listed COMPLETED student without a certificate a new number. Returns how many. */
export function issueCertificates(ids) {
  const issuedOn = todayISO();
  const year = issuedOn.slice(0, 4);
  let working = state;
  let count = 0;
  for (const id of ids) {
    const target = working.find((s) => s.id === id);
    if (!target || target.status !== "completed" || target.certificate) continue;
    const number = nextCertificateNumber(working, year);
    working = working.map((s) => (s.id === id ? { ...s, certificate: { number, issuedOn }, updatedAt: stamp() } : s));
    count += 1;
  }
  if (count) commit(working);
  return count;
}
