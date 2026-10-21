// app/testimonials/page.js  (server component, no "use client")

import Testimonials from "../../components/Testimonial/Testimonial";
import { getPublishedTestimonials } from "../../services/testimonial/testimonial.service";

const SITE = "https://futuristiccoders.co.ke";

export const revalidate = 300;

export const metadata = {
  title: "Testimonials | Futuristic Coders, Coding Classes for Kids in Nairobi",
  description:
    "Read what parents and students say about Futuristic Coders. Real reviews of our coding classes for kids and teens aged 7 to 18 in Nairobi, Kenya.",
  alternates: { canonical: `${SITE}/testimonials` },
  openGraph: {
    title: "Parent and student reviews | Futuristic Coders",
    description:
      "See why families all over Kenya trust Futuristic Coders to teach kids real programming skills.",
    url: `${SITE}/testimonials`,
    siteName: "Futuristic Coders",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: `${SITE}/images/testimonials-og.jpg`,
        width: 1712,
        height: 896,
        alt: "Futuristic Coders Academy — parent and student testimonials about online coding classes",
        type: "image/jpeg",
      },
    ],
  },
twitter: {
  card: "summary_large_image",
  title: "Testimonials | Futuristic Coders",
  description:
    "Read parent and student reviews of Futuristic Coders Academy.",
  images: [`${SITE}/images/testimonials-og.jpg
    `],
},
};

// The service returns the raw API body (snake_case rows). These read just
// what the JSON-LD needs. The client hook does its own full mapping.
const readRows = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  return payload?.testimonials ?? res?.testimonials ?? [];
};

const readStats = (res) => {
  const s = res?.stats ?? res?.data?.stats ?? {};
  return {
    count: Number(s.count ?? s.total ?? 0),
    average: Number(s.average ?? s.average_rating ?? 0),
  };
};

const toIsoDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export default async function TestimonialsPage() {
  let initial = null;
  try {
    // Page 1 with the default filters. The hook uses this as its first data.
    initial = await getPublishedTestimonials({
      page: 1,
      limit: 6,
      rating: 0,
      sort: "newest",
    });
  } catch {
    initial = null; // the client hook fetches again and shows an error state if needed
  }

  const rows = readRows(initial);
  const { count, average } = readStats(initial);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Futuristic Coders",
    url: SITE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    ...(count > 0 && average > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(average.toFixed(1)),
            reviewCount: count,
            bestRating: 5,
            worstRating: 1,
          },
          review: rows.slice(0, 5).map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            datePublished: toIsoDate(t.createdAt ?? t.created_at),
            reviewBody: t.message,
            reviewRating: {
              "@type": "Rating",
              ratingValue: Number(t.rating),
              bestRating: 5,
            },
          })),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main>
        <Testimonials initial={initial} />
      </main>
    </>
  );
}
