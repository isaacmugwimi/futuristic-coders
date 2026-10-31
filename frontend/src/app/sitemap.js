// frontend/src/app/sitemap.js
import { BASE_URL as API_BASE_URL, API_PATHS } from "../utils/apiPaths";

const BASE_URL = "https://www.futuristiccoders.co.ke";
const PROGRAMS_ENDPOINT = `${API_BASE_URL}${API_PATHS.PROGRAMS.GET_PUBLISHED}`;

// Rebuild the sitemap at most once an hour so new programs appear automatically.
export const revalidate = 3600;

async function getProgramSlugs() {
  try {
    const res = await fetch(PROGRAMS_ENDPOINT, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    // Your hooks read `data.data`, so the list lives under `data`.
    const list = Array.isArray(json) ? json : (json?.data ?? []);
    return list.map((p) => p.slug).filter(Boolean);
  } catch {
    // If the backend is down, still return the static pages.
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/programs", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/testimonials", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/register", priority: 0.8, changeFrequency: "monthly" },
    { path: "/verify", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const slugs = await getProgramSlugs();
  const programPages = slugs.map((slug) => ({
    url: `${BASE_URL}/programs/${encodeURIComponent(slug)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...programPages];
}
