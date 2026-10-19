// Turns the backend's program and category records into the shape the public
// Programs page and popup already use. This file replaces programsData.js.

const TIERS = ["beginner", "intermediate", "advanced"];
const LAST = 9999;

const plural = (n, word) => `${n} ${n === 1 ? word : `${word}s`}`;

// "2 sessions per week, 60 minutes each"
function sessionText(p) {
  if (!p.sessionsPerWeek) return "";
  const base = `${plural(p.sessionsPerWeek, "session")} per week`;
  return p.sessionMinutes ? `${base}, ${p.sessionMinutes} minutes each` : base;
}

function startsOn(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "12 – 15" becomes "Ages 12 – 15". A label such as "Teens" is left alone.
function agesLabel(ageGroup) {
  const text = (ageGroup ?? "").trim();
  if (!text) return "";
  return /^\d/.test(text) ? `Ages ${text}` : text;
}

function toPublicProgram(p, categoryRows) {
  const match =
    categoryRows.find((c) => String(c.id) === String(p.categoryId)) ??
    categoryRows.find((c) => c.name === p.category);
  const level = String(p.level ?? "").toLowerCase();

  return {
    slug: p.slug,
    category: match ? String(match.id) : `name:${p.category ?? "other"}`,
    categoryName: match?.name ?? p.category ?? "Other",
    tier: TIERS.includes(level) ? level : "beginner",
    ages: p.ageGroup ?? "",
    agesLabel: agesLabel(p.ageGroup),
    duration: p.durationWeeks ? plural(p.durationWeeks, "week") : "",
    title: p.title,
    summary: p.summary ?? "",
    tags: p.tools ?? [],
    image: p.thumbnail || null,
    displayOrder: p.displayOrder ?? null,
    details: {
      overview: p.description || "", // Markdown
      outcomes: p.outcomes ?? [],
      prerequisites: p.prerequisites ?? [],
      requirements: p.requirements ?? [],
      schedule: sessionText(p),
      format: p.mode ?? "",
      classDays: p.schedule ?? "",
      startsOn: startsOn(p.startDate),
    },
  };
}

/**
 * categoryRows: the backend's categories, already in display order
 * programRows:  the published programs
 * Returns only categories that have at least one published program.
 */
export function buildCatalog(categoryRows = [], programRows = []) {
  const programs = programRows
    .map((p) => toPublicProgram(p, categoryRows))
    .sort(
      (a, b) =>
        (a.displayOrder ?? LAST) - (b.displayOrder ?? LAST) ||
        a.title.localeCompare(b.title),
    );

  const categories = categoryRows.map((c) => ({
    id: String(c.id),
    name: c.name,
    blurb: c.description ?? "",
  }));

  // A program whose category isn't in the list still shows under its own heading.
  programs.forEach((p) => {
    if (!categories.some((c) => c.id === p.category))
      categories.push({ id: p.category, name: p.categoryName, blurb: "" });
  });

  return {
    categories: categories.filter((c) =>
      programs.some((p) => p.category === c.id),
    ),
    programs,
  };
}