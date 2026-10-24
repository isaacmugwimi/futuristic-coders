import { cache } from "react";
import { notFound } from "next/navigation";
import { API_PATHS, BASE_URL } from "../../../utils/apiPaths";
import ProgramDetail from "../../../components/ProgramsPage/ProgramDetail";

export const revalidate = 300;

const SITE_URL = "https://www.futuristiccoders.co.ke";
const SITE_NAME = "Futuristic Coders";

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

// Works whether the key is API_PATHS.PROGRAMS.GET_PUBLISHED_BY_SLUG
// or a flat API_PATHS.GET_PUBLISHED_BY_SLUG.
const getSlugPath =
  API_PATHS?.PROGRAMS?.GET_PUBLISHED_BY_SLUG ??
  API_PATHS?.GET_PUBLISHED_BY_SLUG;

async function resolveSlug(params) {
  // `params` is a Promise in Next.js 15+, a plain object in 14.
  const { slug } = await params;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * Wrapped in React cache() so generateMetadata() and the page share one
 * result per request.
 *  - returns the program when it exists and is published
 *  - returns null for 404 / unpublished
 *  - throws on network errors and 5xx so they reach the error boundary
 */
const getProgram = cache(async (slug) => {
  if (typeof getSlugPath !== "function") {
    throw new Error(
      "GET_PUBLISHED_BY_SLUG is missing from src/utils/apiPaths.js",
    );
  }

  const base = String(BASE_URL).replace(/\/+$/, "");
  const url = `${base}${getSlugPath(slug)}`; // helper already encodes the slug

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load program "${slug}" (HTTP ${res.status})`);
  }

  const json = await res.json();
  const program = json?.data ?? null;

  if (!program || typeof program !== "object") return null;
  if (program.status !== "published") return null;

  return program;
});

/* ------------------------------------------------------------------ */
/* SEO helpers                                                         */
/* ------------------------------------------------------------------ */

function stripText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>~-]{1,}/g, " ") // light Markdown cleanup for descriptions
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 160) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function getDescription(program) {
  const text = stripText(program.summary) || stripText(program.description);
  return truncate(
    text ||
      `Learn ${program.title} at ${SITE_NAME}. Practical, project-based coding education in Kenya.`,
  );
}

function getCanonicalUrl(slug) {
  return `${SITE_URL}/programs/${encodeURIComponent(slug)}`;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildJsonLd(program, canonicalUrl) {
  const price = toNumber(program.price);
  const weeks = toNumber(program.duration_weeks);
  const perWeek = toNumber(program.sessions_per_week);
  const minutes = toNumber(program.session_minutes);

  const instructorName =
    typeof program.instructor === "string"
      ? program.instructor
      : program.instructor?.name || program.instructor_name || null;

  const instance = {
    "@type": "CourseInstance",
    ...(program.mode ? { courseMode: program.mode } : {}),
    ...(program.start_date ? { startDate: program.start_date } : {}),
    ...(weeks && perWeek && minutes
      ? { courseWorkload: `PT${weeks * perWeek * minutes}M` }
      : {}),
    ...(instructorName
      ? { instructor: { "@type": "Person", name: instructorName } }
      : {}),
  };

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: getDescription(program),
    url: canonicalUrl,
    inLanguage: "en",
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(program.thumbnail ? { image: program.thumbnail } : {}),
    ...(program.level ? { educationalLevel: program.level } : {}),
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: "KES",
            url: canonicalUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(Object.keys(instance).length > 1
      ? { hasCourseInstance: instance }
      : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Programs",
        item: `${SITE_URL}/programs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: program.title,
        item: canonicalUrl,
      },
    ],
  };

  return [course, breadcrumb];
}

// Escape "<" so the JSON can never break out of the <script> tag.
function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const slug = await resolveSlug(params);
  const program = await getProgram(slug);

  if (!program) {
    return {
      title: `Program not found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const canonical = getCanonicalUrl(program.slug || slug);
  const title = `${program.title} | ${SITE_NAME}`;
  const description = getDescription(program);
  const images = program.thumbnail
    ? [{ url: program.thumbnail, alt: `${program.title} program thumbnail` }]
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      locale: "en_KE",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function ProgramPage({ params }) {
  const slug = await resolveSlug(params);
  const program = await getProgram(slug);

  if (!program) {
    notFound();
  }

  const canonical = getCanonicalUrl(program.slug || slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildJsonLd(program, canonical)),
        }}
      />
      <ProgramDetail program={program} />
    </>
  );
}
