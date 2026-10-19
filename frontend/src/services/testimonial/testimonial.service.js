// services/testimonials.js
// Set NEXT_PUBLIC_API_URL (e.g. http://localhost:5000/api) once your backend exists.
// Until then, a tiny in-memory mock is used so the page renders.
//
// Expected endpoints:
//   GET  {API}/testimonials?page=1&limit=6&rating=0&sort=newest
//        -> { data: Testimonial[], total: number, stats: { average, count, breakdown: {1..5} } }
//   POST {API}/testimonials  body: { name, email, relationship, rating, message }
//        -> { message: string }   (store as "pending" and approve from your admin panel)

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const MOCK = [
  {
    id: 1,
    name: "Grace W.",
    relationship: "Parent",
    rating: 5,
    createdAt: "2026-09-14",
    message:
      "My 11-year-old went from playing games to building one. The weekend classes fit around school and the instructors are patient.",
  },
  {
    id: 2,
    name: "Brian O.",
    relationship: "Student",
    rating: 5,
    createdAt: "2026-08-30",
    message:
      "I built my first website in week three. Seeing it live on my phone was the best part.",
  },
  {
    id: 3,
    name: "Amina K.",
    relationship: "Parent",
    rating: 4,
    createdAt: "2026-08-02",
    message:
      "Clear progress updates and real projects. I would like more evening slots.",
  },
  {
    id: 4,
    name: "Kevin M.",
    relationship: "Alumni",
    rating: 5,
    createdAt: "2026-07-19",
    message:
      "The structured curriculum made JavaScript click. I now help my school's ICT club.",
  },
  {
    id: 5,
    name: "Faith N.",
    relationship: "Parent",
    rating: 5,
    createdAt: "2026-06-11",
    message:
      "The verified certificate meant a lot to my daughter, and the teachers clearly care.",
  },
];

function buildStats(list) {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  list.forEach((t) => (breakdown[t.rating] += 1));
  const count = list.length;
  const average = count ? list.reduce((s, t) => s + t.rating, 0) / count : 0;
  return { average: Number(average.toFixed(1)), count, breakdown };
}

function mockQuery({ page, limit, rating, sort }) {
  let list = [...MOCK];
  const stats = buildStats(list);
  if (rating) list = list.filter((t) => t.rating === rating);
  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    highest: (a, b) => b.rating - a.rating,
    lowest: (a, b) => a.rating - b.rating,
  };
  list.sort(sorters[sort] || sorters.newest);
  const start = (page - 1) * limit;
  return { data: list.slice(start, start + limit), total: list.length, stats };
}

export async function fetchTestimonials({
  page = 1,
  limit = 6,
  rating = 0,
  sort = "newest",
} = {}) {
  if (!API) return mockQuery({ page, limit, rating, sort });
  const qs = new URLSearchParams({ page, limit, rating, sort });
  const res = await fetch(`${API}/testimonials?${qs}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Could not load testimonials.");
  return res.json();
}

export async function postTestimonial(payload) {
  if (!API) {
    await new Promise((r) => setTimeout(r, 700));
    return {
      message: "Thanks! Your review will appear once our team approves it.",
    };
  }
  const res = await fetch(`${API}/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Could not submit your review.");
  return body;
}
