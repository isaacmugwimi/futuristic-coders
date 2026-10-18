// src/app/privacy/page.js
import PrivacyPolicy from "../../components/PrivacyPolicy/PrivacyPolicy";

const SITE_URL = "https://www.futuristiccoders.co.ke";
const PAGE_URL = `${SITE_URL}/privacy`;
const TITLE = "Privacy Policy | Futuristic Coders";
const DESCRIPTION =
  "Read how Futuristic Coders collects, uses and protects personal information, including learner and parent details, in line with the Kenya Data Protection Act, 2019.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
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
    images: [
      {
        url: `${SITE_URL}/flogo.png`,
        alt: "Futuristic Coders logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/flogo.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "Privacy Policy",
      description: DESCRIPTION,
      inLanguage: "en-KE",
      dateModified: "2026-10-18",
      isPartOf: { "@type": "WebSite", name: "Futuristic Coders", url: SITE_URL },
      publisher: { "@type": "Organization", name: "Futuristic Coders", url: SITE_URL },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Privacy Policy", item: PAGE_URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PrivacyPolicy />
    </>
  );
}
