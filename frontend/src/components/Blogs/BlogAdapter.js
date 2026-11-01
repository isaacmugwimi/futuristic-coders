// Turns raw API data into the shape the blog UI uses.
// Expected raw post: { id, slug, title, excerpt, content (markdown), coverImage,
//   coverAlt, category | categoryId, tags[], author{name,avatar}, publishedAt, updatedAt }

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function readingTime(markdown) {
  const words = (markdown || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Fixed locale + UTC so server and browser render the same text (no hydration warnings)
export function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function normalizePost(raw, categoryMap = new Map()) {
  const catId = raw.category?.id ?? raw.categoryId ?? raw.category ?? "general";
  const catName =
    raw.category?.name ?? categoryMap.get(catId)?.name ?? "General";
  const content = raw.content ?? "";
  return {
    id: raw.id ?? raw.slug,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? raw.summary ?? "",
    content,
    image: raw.coverImage ?? raw.image ?? "",
    imageAlt: raw.coverAlt ?? raw.title,
    category: String(catId),
    categoryName: catName,
    tags: raw.tags ?? [],
    author: {
      name: raw.author?.name ?? "Our team",
      avatar: raw.author?.avatar ?? "",
    },
    publishedAt: raw.publishedAt ?? raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.publishedAt ?? raw.createdAt,
    minutes: raw.readingTime ?? readingTime(content),
  };
}

export function buildBlogCatalog(rawCategories = [], rawPosts = []) {
  const catMap = new Map(rawCategories.map((c) => [c.id, c]));
  const posts = rawPosts
    .filter((p) => p.slug && p.title)
    .map((p) => normalizePost(p, catMap))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const seen = new Map();
  posts.forEach((p) => seen.set(p.category, p.categoryName));
  const categories = [...seen].map(([id, name]) => ({ id, name }));
  return { categories, posts };
}

/** h2/h3 list for the table of contents. Ignores code fences. */
export function extractHeadings(markdown = "") {
  const out = [];
  const used = {};
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*_`[\]]/g, "");
    const base = slugify(text) || "section";
    used[base] = (used[base] ?? -1) + 1;
    out.push({
      level: m[1].length,
      text,
      id: used[base] ? `${base}-${used[base]}` : base,
    });
  }
  return out;
}

export function relatedPosts(posts, post, limit = 3) {
  const score = (p) =>
    (p.category === post.category ? 2 : 0) +
    p.tags.filter((t) => post.tags.includes(t)).length;
  return posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
