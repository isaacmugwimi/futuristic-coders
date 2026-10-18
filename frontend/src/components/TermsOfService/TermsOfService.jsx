import Link from "next/link";
import "./TermsOfService.css";

const UPDATED = "18 October 2026";
const EMAIL = "mugwimiisaac230@gmail.com";
const PHONE = "+254 757 810 818";

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

// A string renders as a paragraph, an array renders as a bullet list.
const SECTIONS = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    body: [
      "These terms apply when you use the Futuristic Coders website or enrol in any of our classes, bootcamps or training programmes. By using our website or enrolling, you agree to them.",
      "If you are enrolling a child, you are agreeing on their behalf as their parent or guardian.",
    ],
  },
  {
    id: "our-services",
    title: "What we offer",
    body: [
      "Futuristic Coders is a coding academy in Nairobi, Kenya. We run beginner and advanced programmes in web development, Python, JavaScript, React and Scratch, as well as holiday bootcamps and corporate training.",
      "Class schedules, content and teaching methods may change from time to time. We will tell you in good time if a change affects you.",
    ],
  },
  {
    id: "enrolment",
    title: "Enrolment",
    body: [
      [
        "Learners under 18 need the consent of a parent or guardian to enrol.",
        "You must give us accurate and complete information when you apply.",
        "A place is confirmed only when we confirm it to you in writing, for example by email or message.",
        "We may decline or end an enrolment if the information given is false or if these terms are broken.",
      ],
    ],
  },
  {
    id: "fees",
    title: "Fees and payments",
    body: [
      "Course fees are shared with you before you enrol. Fees are due by the dates agreed at enrolment, and a payment is counted only once we have received it.",
      "Refund, transfer and rescheduling terms for each programme are explained at enrolment. Please read them before you pay.",
    ],
  },
  {
    id: "conduct",
    title: "Learner conduct",
    body: [
      "We want every class to be a safe and encouraging place to learn. We expect learners to:",
      [
        "Treat instructors and other learners with respect.",
        "Do their own work and not pass off someone else’s work as theirs.",
        "Use our equipment, software and online accounts only for learning.",
        "Not write or run code intended to harm, spy on or gain access to other people’s systems or data.",
      ],
      "If a learner repeatedly breaks these rules, we may remove them from a class. We will talk to the parent or guardian first where we can.",
    ],
  },
  {
    id: "certificates",
    title: "Certificates",
    body: [
      "A certificate is issued when a learner meets the completion requirements of their course. Each certificate has a unique ID and can be checked on our certificate verification page.",
      "We may revoke a certificate if it was issued in error or obtained through dishonesty. A revoked certificate will show as revoked on the verification page and should no longer be treated as proof of completion.",
    ],
  },
  {
    id: "ownership",
    title: "Ownership of work and materials",
    body: [
      "Our lesson plans, slides, exercises, videos and website content belong to Futuristic Coders. You may use them for your own learning, but you may not copy, sell or share them without our written permission.",
      "The projects a learner builds belong to the learner. We may ask for permission before showing a learner’s project on our website or social media.",
    ],
  },
  {
    id: "website-use",
    title: "Using our website",
    body: [
      [
        "Do not try to break, overload or gain unauthorised access to our website or systems.",
        "Do not use the certificate verification page to guess or collect certificate IDs in bulk.",
        "Do not use our website for anything unlawful.",
      ],
    ],
  },
  {
    id: "liability",
    title: "What we can and cannot promise",
    body: [
      "We teach with care and aim to give every learner the best possible start. However, we cannot promise any particular result, such as a job, a client or a level of income after a course.",
      "To the extent the law allows, Futuristic Coders is not liable for indirect or consequential losses arising from the use of our website or services. Nothing in these terms limits any rights you have under Kenyan consumer law.",
    ],
  },
  {
    id: "privacy",
    title: "Your personal information",
    body: [
      "How we collect and use personal information is explained in our Privacy Policy, which forms part of these terms.",
    ],
    link: { label: "Read the Privacy Policy", href: "/privacy" },
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. When we do, we will change the “Last updated” date at the top of this page. Continuing to use our website or services after a change means you accept the updated terms.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    body: [
      "These terms are governed by the laws of Kenya. Any dispute that we cannot settle by talking to each other will be handled by the courts of Kenya.",
    ],
  },
];

function Block({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul className="tm-list">
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="tm-p">{block}</p>;
}

export default function TermsOfService() {
  return (
    <main className="tm">
      <div className="tm-wrap">
        <header className="tm-head">
          <h1 className="tm-title">Terms of Service</h1>
          <p className="tm-intro">
            The rules for using the Futuristic Coders website and joining our
            classes, written in plain language.
          </p>
          <p className="tm-meta">Last updated {UPDATED}</p>

          <nav className="tm-tabs" aria-label="Legal pages">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`tm-tab${link.href === "/terms" ? " tm-tab--active" : ""}`}
                aria-current={link.href === "/terms" ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="tm-layout">
          <nav className="tm-toc" aria-label="On this page">
            <h2 className="tm-toc-title">On this page</h2>
            <ul className="tm-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a className="tm-toc-link" href={`#${s.id}`}>
                    {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="tm-toc-link" href="#contact-us">
                  Contact us
                </a>
              </li>
            </ul>
          </nav>

          <div className="tm-body">
            {SECTIONS.map((s) => (
              <section className="tm-section" id={s.id} key={s.id}>
                <h2 className="tm-h2">{s.title}</h2>
                {s.body.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
                {s.link && (
                  <p className="tm-p">
                    <Link className="tm-link" href={s.link.href}>
                      {s.link.label}
                    </Link>
                  </p>
                )}
              </section>
            ))}

            <aside className="tm-contact" id="contact-us">
              <h2 className="tm-contact-title">Questions about these terms?</h2>
              <p className="tm-contact-text">
                Get in touch and we will respond as soon as we can.
              </p>
              <ul className="tm-contact-list">
                <li>
                  Email:{" "}
                  <a className="tm-link" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a className="tm-link" href={`tel:${PHONE.replace(/\s/g, "")}`}>
                    {PHONE}
                  </a>
                </li>
                <li>Location: Nairobi, Kenya</li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
