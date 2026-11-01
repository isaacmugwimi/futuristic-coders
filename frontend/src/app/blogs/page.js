// src/app/blog/page.js
import Blog from "../../components/Blogs/Blog/Blog";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";

const SITE_URL = "https://www.futuristiccoders.co.ke";
const PAGE_URL = `${SITE_URL}/blog`;
const LOGO_URL = `${SITE_URL}/flogo.png`;
const ORG_ID = `${SITE_URL}/#organization`;

const TITLE = "Blog: Coding Tips, Guides & Stories | Futuristic Coders";
const DESCRIPTION =
  "Practical articles on coding for kids, teens and adults in Kenya: learning tips, project ideas, career advice and news from the Futuristic Coders team.";

export const revalidate = 300;

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "coding blog Kenya",
    "learn to code Nairobi",
    "coding tips for kids",
    "web development guides",
    "Futuristic Coders blog",
  ],
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Futuristic Coders",
    locale: "en_KE",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: LOGO_URL, alt: "Futuristic Coders logo" }],
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION, images: [LOGO_URL] },
};

async function getJson(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // never break the page if the API is down
  }
}

function buildJsonLd(posts) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${PAGE_URL}#blog`,
        url: PAGE_URL,
        name: "Futuristic Coders Blog",
        description: DESCRIPTION,
        inLanguage: "en-KE",
        publisher: { "@id": ORG_ID },
        blogPost: posts.slice(0, 20).map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${PAGE_URL}/${encodeURIComponent(p.slug)}`,
          datePublished: p.publishedAt,
        })),
      },
      {
        "@type": "EducationalOrganization",
        "@id": ORG_ID,
        name: "Futuristic Coders",
        url: SITE_URL,
        logo: LOGO_URL,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: PAGE_URL },
        ],
      },
    ],
  };
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getJson(API_PATHS.BLOG.GET_PUBLISHED),
    getJson(API_PATHS.BLOG.CATEGORIES.GET_ALL),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(posts?.data ?? [])).replace(/</g, "\\u003c"),
        }}
      />
      <Blog
        initialPosts={posts ?? undefined}
        initialCategories={categories ?? undefined}
      />
    </>
  );
}