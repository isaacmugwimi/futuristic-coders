import AboutStory from "../../components/AboutPage/AboutStory";
import AboutLearning from "../../components/AboutPage/AboutLearning";
import AboutTrust, {
  FOUNDER,
  TEAM,
  FAQS,
} from "../../components/AboutPage/AboutTrust";

const SITE = "https://www.futuristiccoders.co.ke";
const PAGE_URL = `${SITE}/about`;

const TITLE = "About Futuristic Coders | Coding Academy in Kenya";
const DESCRIPTION =
  "A Kenyan coding academy for kids, teens and adults. Scratch, web development, Python, JavaScript and React taught through hands-on projects.";

/* ---------- Search and social metadata ---------- */
export const metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "coding academy Kenya",
    "coding classes for kids Kenya",
    "learn to code Kenya",
    "Scratch classes for kids",
    "web development classes Kenya",
    "Python for beginners",
    "JavaScript and React training",
    "Futuristic Coders",
  ],
  authors: [{ name: "Futuristic Coders", url: SITE }],
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Futuristic Coders",
    locale: "en_KE",
    title:
      "About Futuristic Coders | Coding Academy for Kids, Teens & Adults in Kenya",
    description: DESCRIPTION,
    images: [
      {
        url: "/images/about-og.png",
        width: 1734,
        height: 907,
        alt: "About Futuristic Coders Academy - Coding Education in Kenya",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/about-og.png"],
  },
};

/* ---------- Structured data (JSON-LD) ---------- */
const absolute = (src) =>
  !src ? undefined : src.startsWith("http") ? src : `${SITE}${src}`;

const plain = (text) => text.replace(/\s+/g, " ").trim();

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE}/#organization`,
      name: "Futuristic Coders",
      url: SITE,
      slogan: "Innovate | Build | Lead",
      description: DESCRIPTION,
      foundingDate: "2026",
      areaServed: { "@type": "Country", name: "Kenya" },
      knowsAbout: [
        "Scratch",
        "Web development",
        "Python",
        "JavaScript",
        "React",
        "Digital skills",
      ],
      founder: { "@id": `${SITE}/about#founder` },
      // TODO: add "logo" (full URL) and "sameAs" (your social profile links).
    },
    {
      "@type": "AboutPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-KE",
      isPartOf: { "@type": "WebSite", name: "Futuristic Coders", url: SITE },
      about: { "@id": `${SITE}/#organization` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "About", item: PAGE_URL },
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE}/about#founder`,
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      image: absolute(FOUNDER.photo),
      worksFor: { "@id": `${SITE}/#organization` },
    },
    ...TEAM.map((person) => ({
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      image: absolute(person.photo),
      worksFor: { "@id": `${SITE}/#organization` },
    })),
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: plain(item.a) },
      })),
    },
  ],
};

// "<" is escaped so the JSON can never close the script tag early.
const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <AboutStory />
      <AboutLearning />
      <AboutTrust />
    </main>
  );
}
