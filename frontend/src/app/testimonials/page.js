// app/testimonials/page.js  (server component, no "use client")
// import { fetchTestimonials } from "@/services/testimonials";

// import Testimonials from "../../components/Testimonial/Testimonial";
import Testimonials from "../../components/Testimonial/Testimonial";
import { fetchTestimonials } from "../../services/testimonial/testimonial.service";

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
      "See why families in Nairobi trust Futuristic Coders to teach kids real programming skills.",
    url: `${SITE}/testimonials`,
    siteName: "Futuristic Coders",
    type: "website",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testimonials | Futuristic Coders",
  },
};

export default async function TestimonialsPage() {
  let initial = null;
  try {
    initial = await fetchTestimonials({ page: 1, limit: 6 });
  } catch {
    initial = null; // the client hook will retry and show an error state if needed
  }

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
    ...(initial?.stats?.count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: initial.stats.average,
            reviewCount: initial.stats.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: initial.data.slice(0, 5).map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            datePublished: t.createdAt,
            reviewBody: t.message,
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.rating,
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
