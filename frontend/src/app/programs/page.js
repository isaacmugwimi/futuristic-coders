// src/app/programs/page.js
import Programs from "../../components/ProgramsPage/Programs";
import { API_PATHS, BASE_URL } from "@/src/utils/api/apiPaths";

const SITE_URL = "https://www.futuristiccoders.co.ke";
const PAGE_URL = `${SITE_URL}/programs`;
const LOGO_URL = `${SITE_URL}/flogo.png`;
const ORG_ID = `${SITE_URL}/#organization`;

const TITLE = "Coding Programs for Kids, Teens & Adults | Futuristic Coders";
const DESCRIPTION =
  "Explore coding programs in Nairobi, Kenya: Scratch for children, web development, Python, React and full-stack for teens and adults. Join in person or online.";

// Rebuild the page (and its structured data) at most every 5 minutes, so a
// program published in the admin appears here without a redeploy.
export const revalidate = 300;

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "coding classes for kids Nairobi",
    "learn web development Kenya",
    "Python classes Nairobi",
    "Scratch classes for children",
    "React course Kenya",
    "coding bootcamp Nairobi",
    "Futuristic Coders programs",
  ],
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Futuristic Coders",
    locale: "en_KE",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: LOGO_URL, alt: "Futuristic Coders logo" }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: [LOGO_URL],
  },
};

/** Published programs for the structured data. Never breaks the page if the API is down. */
async function getProgramsForSeo() {
  try {
    const res = await fetch(`${BASE_URL}${API_PATHS.PROGRAMS.GET_PUBLISHED}`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}

function buildJsonLd(programs) {
  const courses = programs.slice(0, 30).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      name: p.title,
      description: p.summary,
      provider: { "@id": ORG_ID },
      ...(p.level && { educationalLevel: p.level }),
      // ISO 8601 duration, e.g. 8 weeks -> "P8W"
      ...(p.durationWeeks && { timeRequired: `P${p.durationWeeks}W` }),
      inLanguage: "en",
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Programs at Futuristic Coders",
        description: DESCRIPTION,
        inLanguage: "en-KE",
        isPartOf: {
          "@type": "WebSite",
          name: "Futuristic Coders",
          url: SITE_URL,
        },
        about: { "@id": ORG_ID },
        ...(courses.length && { mainEntity: { "@id": `${PAGE_URL}#courses` } }),
      },
      {
        "@type": "EducationalOrganization",
        "@id": ORG_ID,
        name: "Futuristic Coders",
        url: SITE_URL,
        logo: LOGO_URL,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        areaServed: "Kenya",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Programs", item: PAGE_URL },
        ],
      },
      ...(courses.length
        ? [
            {
              "@type": "ItemList",
              "@id": `${PAGE_URL}#courses`,
              name: "Futuristic Coders programs",
              numberOfItems: courses.length,
              itemListElement: courses,
            },
          ]
        : []),
    ],
  };
}

export default async function ProgramsPage() {
  const programs = await getProgramsForSeo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(programs)).replace(/</g, "\\u003c"),
        }}
      />
      <Programs />
    </>
  );
}