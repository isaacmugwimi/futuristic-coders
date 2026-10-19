// src/app/register/page.js
import RegisterPage from "./RegisterClient.jsx";

const SITE_URL = "https://www.futuristiccoders.co.ke";
// Canonical has no query string, so /register?program=react and
// /register are treated as one page by search engines.
const PAGE_URL = `${SITE_URL}/register`;
const LOGO_URL = `${SITE_URL}/flogo.png`;

const TITLE = "Enroll Now | Futuristic Coders Coding Academy in Nairobi";
const DESCRIPTION =
  "Register your child or yourself for coding classes at Futuristic Coders in Nairobi. Scratch, web development, Python and React for ages 7 and up, in person and online.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "enroll coding classes Nairobi",
    "coding classes for kids Kenya",
    "learn web development Nairobi",
    "Python classes Kenya",
    "Scratch for kids",
    "Futuristic Coders registration",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "Enroll at Futuristic Coders",
      description: DESCRIPTION,
      inLanguage: "en-KE",
      isPartOf: { "@type": "WebSite", name: "Futuristic Coders", url: SITE_URL },
      about: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "RegisterAction",
        name: "Enroll in a Futuristic Coders program",
        target: PAGE_URL,
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "Futuristic Coders",
      url: SITE_URL,
      logo: LOGO_URL,
      description:
        "A coding academy in Nairobi, Kenya teaching Scratch, web development, Python and React to learners from young children to adults.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      areaServed: "Kenya",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "admissions",
        telephone: "+254757810818",
        email: "mugwimiisaac230@gmail.com",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Enroll", item: PAGE_URL },
      ],
    },
  ],
};

export default function Register() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <RegisterPage />
    </>
  );
}