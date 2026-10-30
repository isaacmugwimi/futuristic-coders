import Image from "next/image";
import Link from "next/link";
import { FaCertificate, FaQrcode } from "react-icons/fa";
import "./AboutTrust.css";

/*
  EDIT ME
  - photo: a portrait works best (about 800 x 1000). Either:
      • a file in /public/team, e.g. "/team/isaac.jpg", or
      • a full image link, e.g. a Cloudinary URL. For links, allow the host in
        next.config.js (images.remotePatterns, hostname "res.cloudinary.com").
    Leave it null to show initials instead.
  - quote and story: a draft built from what the site already says about you.
    Add your own details (where you grew up, your first computer, the moment
    you decided to start) to make it unmistakably yours.
  - Add more people to TEAM as the academy grows.
*/
export const FOUNDER = {
  name: "Isaac Ireri",
  role: "Founder and lead instructor",
  photo: "/team/isaac.png",
  tags: ["Full-stack developer", "Teaches ages 7 to adult", "Founded 2026"],
  quote:
    "Every learner can build technology. They just need someone to show them how.",
  story: [
    {
      title: "Everyone uses it. Few learn to build it.",
      text: "I’m a developer. I build software for a living, and I kept noticing the same thing: young people spend hours on phones, games and apps every day, yet almost nobody shows them how those things are made. Technology stays something that happens to them, not something they can make.",
      accent: "#ffbf00",
    },
    {
      title: "So I built the path I wish existed",
      text: "Futuristic Coders began in 2026 with one idea: coding is the new literacy, and it should be taught like one, step by step. The youngest learners start with Scratch, making games and animations through play. Older learners move on to web development, Python, JavaScript and React. Every step ends with something real that the learner built themselves.",
      accent: "#4c97ff",
    },
    {
      title: "What I promise every learner and parent",
      text: "Small groups, so nobody gets lost. Real projects, not worksheets. Patient teaching that treats a good question as highly as a right answer. And a certificate that anyone can verify, because finished work deserves to be recognised.",
      accent: "#34d399",
    },
  ],
  closing: "Innovate. Build. Lead.",
};

/*
  PROGRAM DIRECTOR: a draft based on the role. Edit the bio and tags so they are
  accurate, and add a photo the same way as the founder's.
*/
export const TEAM = [
  {
    name: "Faith Lilian",
    role: "Program Director",
    photo: null,
    tags: ["Curriculum", "Learner progress"],
    bio: [
      "Faith leads the academy’s programs. She makes sure every course has clear learning outcomes, stays hands-on, and builds toward a real project.",
      "She also keeps an eye on each learner’s progress, so no one is left behind between the first lesson and the certificate.",
    ],
  },
];

export const FAQS = [
  {
    q: "Who can join?",
    a: "Children, teens and adults can join. Each program page lists its age group and level so you can choose the right fit.",
  },
  {
    q: "Does my child need coding experience?",
    a: "Not for beginner programs. Each program page lists any prerequisites.",
  },
  {
    q: "Are classes online or in person?",
    a: "It depends on the program. Each program page shows its format, schedule and price.",
  },
  {
    q: "How do I register?",
    a: "Use the registration form. Choose a program, add the parent or guardian and learner details, and send it in.",
  },
  {
    q: "Will learners get a certificate?",
    a: "Yes. Learners who complete a program receive a Certificate of Completion that anyone can verify with its QR code.",
  },
];

function initials(name) {
  return name
    .split(" ")
    .filter((word) => !/^dr\.?$/i.test(word))
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AboutTrust() {
  return (
    <section className="ab-trust" aria-labelledby="people-heading">
      <div className="ab-trust__container">
        <h2 id="people-heading" className="ab-trust__title">
          The people behind it
        </h2>

        {/* ---------- Founder ---------- */}
        <article className="ab-trust__founder">
          <div className="ab-trust__portrait">
            <div className="ab-trust__frame-wrap">
              <div className="ab-trust__frame">
                {FOUNDER.photo ? (
                  <Image
                    src={FOUNDER.photo}
                    alt={`Portrait of ${FOUNDER.name}`}
                    fill
                    sizes="(max-width: 860px) 80vw, 380px"
                    priority
                  />
                ) : (
                  <span className="ab-trust__frame-initials" aria-hidden="true">
                    {initials(FOUNDER.name)}
                  </span>
                )}
              </div>
              <p className="ab-trust__badge">
                <strong>{FOUNDER.name}</strong>
                <span>{FOUNDER.role}</span>
              </p>
            </div>

            <ul className="ab-trust__tags">
              {FOUNDER.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>

          <div className="ab-trust__story">
            <blockquote className="ab-trust__pull">{FOUNDER.quote}</blockquote>

            {FOUNDER.story.map((chapter) => (
              <div
                key={chapter.title}
                className="ab-trust__chapter"
                style={{ "--accent": chapter.accent }}
              >
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
              </div>
            ))}

            <p className="ab-trust__sign">
              <span>{FOUNDER.closing}</span>
              Isaac Ireri
            </p>
          </div>
        </article>

        {/* ---------- Team ---------- */}
        <ul className="ab-trust__team">
          {TEAM.map((person) => (
            <li key={person.name} className="ab-trust__member">
              <div className="ab-trust__mframe-wrap">
                <div className="ab-trust__mframe">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={`Portrait of ${person.name}`}
                      fill
                      sizes="170px"
                    />
                  ) : (
                    <span
                      className="ab-trust__mframe-initials"
                      aria-hidden="true"
                    >
                      {initials(person.name)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3>{person.name}</h3>
                <p className="ab-trust__role">{person.role}</p>
                {person.bio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <ul className="ab-trust__mtags">
                  {person.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        {/* ---------- Certificates ---------- */}
        <div className="ab-trust__cert">
          <div>
            <h2 className="ab-trust__title">Certificates anyone can verify</h2>
            <p className="ab-trust__text">
              Learners who complete a program receive a Certificate of
              Completion. Each one carries a unique number and a QR code, so a
              parent, school or employer can confirm it is genuine.
            </p>
          </div>
          <div className="ab-trust__cert-card" aria-hidden="true">
            <FaCertificate />
            <p className="ab-trust__cert-name">Certificate of Completion</p>
            <p className="ab-trust__cert-number">FC-CERT-2026-####</p>
            <span className="ab-trust__cert-qr">
              <FaQrcode /> Scan to verify
            </span>
          </div>
        </div>

        {/* ---------- FAQ ---------- */}
        <div className="ab-trust__faq">
          <h2 className="ab-trust__title">Common questions</h2>
          {FAQS.map((item) => (
            <details key={item.q} className="ab-trust__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        {/* ---------- Final call to action ---------- */}
        <div className="ab-trust__cta">
          <h2>Ready to start building?</h2>
          <p>
            Pick a program and register a learner, or send us a question first.
          </p>
          <div className="ab-trust__cta-actions">
            <Link href="/register" className="ab-trust__btn">
              Register a learner
            </Link>
            <Link href="/#contact" className="ab-trust__cta-link">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
