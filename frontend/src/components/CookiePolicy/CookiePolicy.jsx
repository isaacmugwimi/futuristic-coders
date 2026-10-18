import Link from "next/link";
import "./CookiePolicy.css";

const UPDATED = "18 October 2026";
const EMAIL = "mugwimiisaac230@gmail.com";
const PHONE = "+254 757 810 818";

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

const COOKIE_TYPES = [
  {
    name: "Essential",
    purpose:
      "Keep the website working: remembering form progress, keeping pages secure and loading correctly.",
    control: "Always on. The site cannot work properly without them.",
  },
  {
    name: "Preferences",
    purpose:
      "Remember choices you make, such as settings that make the site easier for you to use.",
    control: "You can block them in your browser. Some features may not remember your choices.",
  },
  {
    name: "Analytics",
    purpose:
      "Help us understand which pages are visited and how people move around, so we can improve the site. The data is combined and not used to identify you.",
    control: "You can block them in your browser or opt out where the tool offers it.",
  },
  {
    name: "Third-party content",
    purpose:
      "Set by services we embed, such as videos or maps, when you view that content.",
    control: "You can block them in your browser. Embedded content may not load.",
  },
];

// A string renders as a paragraph, an array renders as a bullet list,
// and { table: true } renders the cookie types table.
const SECTIONS = [
  {
    id: "what-are-cookies",
    title: "What cookies are",
    body: [
      "Cookies are small text files that a website saves on your phone or computer when you visit. They let the site remember you between pages and visits.",
      "We also use similar technologies, such as your browser’s local storage, for the same purposes. In this policy we call all of them cookies.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use cookies",
    body: [
      "We use cookies to keep our website working, to remember your choices and to understand how the site is used so we can improve it. We do not sell the information collected by cookies, and we do not use it for third-party advertising.",
    ],
  },
  {
    id: "types",
    title: "Types of cookies we use",
    body: [{ table: true }],
  },
  {
    id: "managing",
    title: "Managing cookies",
    body: [
      "You can choose how your browser treats cookies. Most browsers let you:",
      [
        "See which cookies are stored and delete them one by one.",
        "Block cookies from all websites, or only from third parties.",
        "Clear all cookies when you close the browser.",
      ],
      "The settings are usually found under Privacy or Security in your browser’s menu. If you block essential cookies, some parts of our website, such as forms, may stop working.",
    ],
  },
  {
    id: "personal-data",
    title: "Cookies and personal information",
    body: [
      "Some cookies can be linked to information about your device. How we handle any personal information is explained in our Privacy Policy.",
    ],
    link: { label: "Read the Privacy Policy", href: "/privacy" },
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy when we change how we use cookies. When we do, we will change the “Last updated” date at the top of this page.",
    ],
  },
];

function Block({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul className="ck-list">
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (typeof block === "object" && block.table) {
    return (
      <div className="ck-table-wrap">
        <table className="ck-table">
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">What it does</th>
              <th scope="col">Your control</th>
            </tr>
          </thead>
          <tbody>
            {COOKIE_TYPES.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.purpose}</td>
                <td>{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className="ck-p">{block}</p>;
}

export default function CookiePolicy() {
  return (
    <main className="ck">
      <div className="ck-wrap">
        <header className="ck-head">
          <h1 className="ck-title">Cookie Policy</h1>
          <p className="ck-intro">
            How and why the Futuristic Coders website uses cookies, and how you
            can control them.
          </p>
          <p className="ck-meta">Last updated {UPDATED}</p>

          <nav className="ck-tabs" aria-label="Legal pages">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ck-tab${link.href === "/cookies" ? " ck-tab--active" : ""}`}
                aria-current={link.href === "/cookies" ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="ck-layout">
          <nav className="ck-toc" aria-label="On this page">
            <h2 className="ck-toc-title">On this page</h2>
            <ul className="ck-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a className="ck-toc-link" href={`#${s.id}`}>
                    {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="ck-toc-link" href="#contact-us">
                  Contact us
                </a>
              </li>
            </ul>
          </nav>

          <div className="ck-body">
            {SECTIONS.map((s) => (
              <section className="ck-section" id={s.id} key={s.id}>
                <h2 className="ck-h2">{s.title}</h2>
                {s.body.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
                {s.link && (
                  <p className="ck-p">
                    <Link className="ck-link" href={s.link.href}>
                      {s.link.label}
                    </Link>
                  </p>
                )}
              </section>
            ))}

            <aside className="ck-contact" id="contact-us">
              <h2 className="ck-contact-title">Questions about cookies?</h2>
              <p className="ck-contact-text">
                Get in touch and we will respond as soon as we can.
              </p>
              <ul className="ck-contact-list">
                <li>
                  Email:{" "}
                  <a className="ck-link" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a className="ck-link" href={`tel:${PHONE.replace(/\s/g, "")}`}>
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
