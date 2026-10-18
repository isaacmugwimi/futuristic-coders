import Link from "next/link";
import "./PrivacyPolicy.css";

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
    id: "who-we-are",
    title: "Who we are",
    body: [
      "Futuristic Coders is a coding academy based in Nairobi, Kenya. We teach web development, Python, JavaScript, React and Scratch to learners of all ages, from young children to adults.",
      "We are the data controller for the personal information described in this policy. That means we decide how and why it is used.",
    ],
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: [
      "We only collect what we need to run our classes and look after our learners. Depending on how you use our website and services, this can include:",
      [
        "Enrolment details: the learner’s name, age or date of birth, the parent or guardian’s name, email address and phone number, and the course chosen.",
        "Payment details: confirmation of payment, such as the amount, reference and phone number used. We never see or store your mobile money PIN or card details.",
        "Certificate records: the learner’s name, course, issue date, certificate ID and whether the certificate is valid or revoked.",
        "Messages: anything you send us through the contact form, email, phone or WhatsApp.",
        "Technical data: your browser, device type, pages visited and approximate location, collected through cookies and server logs. See our Cookie Policy for details.",
      ],
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    body: [
      [
        "To enrol learners, place them in the right class and run lessons.",
        "To contact you about schedules, payments, progress and changes to classes.",
        "To issue certificates and let others verify them.",
        "To reply to your questions and requests.",
        "To keep our website secure and improve how it works.",
        "To meet our legal and accounting obligations.",
      ],
      "We do not sell your personal information, and we do not use it for third-party advertising.",
    ],
  },
  {
    id: "certificate-verification",
    title: "Certificate verification",
    body: [
      "Our certificate verification page is public. Anyone who has a certificate ID can look it up and will see the learner’s name, the course, the issue date and whether the certificate is still valid.",
      "No contact details, payment details or other personal information are shown. We do this so employers, schools and parents can trust that a certificate is genuine.",
    ],
  },
  {
    id: "children",
    title: "Children’s privacy",
    body: [
      "Many of our learners are under 18. We collect their information from a parent or guardian, or with a parent or guardian’s consent, and we use it only to teach and support them.",
      "Parents and guardians can ask to see, correct or delete their child’s information at any time by contacting us.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: [
      "We share information only when it is needed to run our services:",
      [
        "Service providers that host our website, send email or process payments on our behalf. They may only use the information to provide those services.",
        "Authorities or other parties when the law requires us to, or to protect the safety of our learners.",
      ],
      "We do not share learner information with other companies for their own marketing.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: [
      "We keep personal information only for as long as we need it for the purposes above, or as the law requires. Certificate records are kept so that a certificate can still be verified years after it was issued.",
      "When information is no longer needed, we delete it or make it anonymous.",
    ],
  },
  {
    id: "security",
    title: "How we protect it",
    body: [
      "We use reasonable technical and organisational measures to protect your information, such as encrypted connections, access controls and limiting who on our team can see learner records. No system is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: [
      "Under the Kenya Data Protection Act, 2019, you have the right to:",
      [
        "Know what personal information we hold about you and how we use it.",
        "Ask for a copy of your information.",
        "Ask us to correct information that is wrong or incomplete.",
        "Ask us to delete your information.",
        "Object to us using your information in certain ways, or withdraw your consent.",
      ],
      "To use any of these rights, contact us using the details below. If you are not happy with how we handle your request, you can complain to the Office of the Data Protection Commissioner of Kenya.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy from time to time. When we do, we will change the “Last updated” date at the top of this page. If the changes are significant, we will let you know by email or on our website.",
    ],
  },
];

function Block({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul className="pp-list">
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="pp-p">{block}</p>;
}

export default function PrivacyPolicy() {
  return (
    <main className="pp">
      <div className="pp-wrap">
        <header className="pp-head">
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-intro">
            This policy explains what personal information Futuristic Coders
            collects, why we collect it, and the choices you have.
          </p>
          <p className="pp-meta">Last updated {UPDATED}</p>

          <nav className="pp-tabs" aria-label="Legal pages">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`pp-tab${link.href === "/privacy" ? " pp-tab--active" : ""}`}
                aria-current={link.href === "/privacy" ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="pp-layout">
          <nav className="pp-toc" aria-label="On this page">
            <h2 className="pp-toc-title">On this page</h2>
            <ul className="pp-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a className="pp-toc-link" href={`#${s.id}`}>
                    {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="pp-toc-link" href="#contact-us">
                  Contact us
                </a>
              </li>
            </ul>
          </nav>

          <div className="pp-body">
            {SECTIONS.map((s) => (
              <section className="pp-section" id={s.id} key={s.id}>
                <h2 className="pp-h2">{s.title}</h2>
                {s.body.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
              </section>
            ))}

            <aside className="pp-contact" id="contact-us">
              <h2 className="pp-contact-title">Questions about your privacy?</h2>
              <p className="pp-contact-text">
                Get in touch and we will respond as soon as we can.
              </p>
              <ul className="pp-contact-list">
                <li>
                  Email:{" "}
                  <a className="pp-link" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a className="pp-link" href={`tel:${PHONE.replace(/\s/g, "")}`}>
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
