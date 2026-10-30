import RegisterPage from "./RegisterClient.jsx";

const SITE_URL = "https://www.futuristiccoders.co.ke";
const PAGE_URL = `${SITE_URL}/register`;
const LOGO_URL = `${SITE_URL}/flogo.png`;

// Temporary social preview. Replace with register-og.png when available.
const OG_IMAGE = `${SITE_URL}/images/register-og.png`;

const TITLE =
  "Enroll Now | Coding Classes for Kids & Adults in Kenya | Futuristic Coders";

const DESCRIPTION =
  "Join Futuristic Coders Academy and start learning to code. Register for Scratch, Python, Web Development, JavaScript and React classes for kids, teens and adults in Kenya. Online and in-person learning opportunities.";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    absolute: TITLE,
  },

  description: DESCRIPTION,

  keywords: [
    "register for coding classes Kenya",
    "enroll coding classes Nairobi",
    "coding classes for kids Kenya",
    "coding academy registration Kenya",
    "Scratch coding classes",
    "Python programming classes Kenya",
    "web development courses Kenya",
    "JavaScript training Kenya",
    "Futuristic Coders enrollment",
  ],

  authors: [
    {
      name: "Futuristic Coders",
      url: SITE_URL,
    },
  ],

  alternates: {
    canonical: PAGE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
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
        url: OG_IMAGE,
        width: 1734,
        height: 907,
        alt: "Enroll at Futuristic Coders Academy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/* ---------- Structured Data (JSON-LD) ---------- */

const schema = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-KE",

      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Futuristic Coders",
        url: SITE_URL,
      },

      about: {
        "@id": `${SITE_URL}/#organization`,
      },

      primaryImageOfPage: {
        "@type": "ImageObject",
        url: OG_IMAGE,
      },

      breadcrumb: {
        "@id": `${PAGE_URL}#breadcrumb`,
      },

      potentialAction: {
        "@type": "RegisterAction",
        name: "Register for a coding programme",
        target: {
          "@type": "EntryPoint",
          urlTemplate: PAGE_URL,
          actionPlatform: [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
          ],
        },
      },
    },

    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "Futuristic Coders",
      url: SITE_URL,
      logo: LOGO_URL,

      description:
        "A Kenyan coding academy teaching Scratch, Python, Web Development, JavaScript, React and digital skills through practical projects.",

      slogan: "Innovate | Build | Lead",

      foundingDate: "2026",

      areaServed: {
        "@type": "Country",
        name: "Kenya",
      },

      knowsAbout: [
        "Scratch Programming",
        "Python Programming",
        "Frontend Web Development",
        "JavaScript",
        "React",
        "Digital Skills",
      ],

      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Admissions",
        telephone: "+254757810818",
        email: "mugwimiisaac230@gmail.com",
        availableLanguage: ["English", "Swahili"],
      },

      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
    },

    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Register",
          item: PAGE_URL,
        },
      ],
    },
  ],
};

// Escape HTML-sensitive characters before injecting JSON-LD.
const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");

export default function Register() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />

      <RegisterPage />
    </main>
  );
}
