import Link from "next/link";
import "./AboutStory.css";

// Scratch-style blocks: the three pillars snap together like a script.
const BLOCKS = [
  {
    tone: "event",
    cue: "when an idea starts",
    word: "Innovate",
    text: "Learners turn their own ideas into games, apps and websites.",
  },
  {
    tone: "build",
    cue: "make it real",
    word: "Build",
    text: "Every course ends with real projects, not just exercises.",
  },
  {
    tone: "lead",
    cue: "share it",
    word: "Lead",
    text: "Confidence, teamwork and problem-solving that carry beyond code.",
  },
];

const STATS = [
  { value: "30+", label: "Students trained" },
  { value: "2026", label: "Founded in Kenya" },
  { value: "100%", label: "Hands-on learning" },
  { value: "Ages 7+", label: "Kids, teens and adults" },
];

export default function AboutStory() {
  return (
    <section className="ab-story" aria-labelledby="about-heading">
      <div className="ab-story__grid" aria-hidden="true" />

      <div className="ab-story__container">
        {/* ---------- Hero ---------- */}
        <div className="ab-story__hero">
          <div className="ab-story__intro">
            <h1 id="about-heading" className="ab-story__title">
              Learners don’t just use technology here. They build it.
            </h1>

            <p className="ab-story__lead">
              Futuristic Coders is a coding academy in Kenya for kids, teens and
              adults. We teach Scratch, web development, Python, JavaScript and
              React through hands-on projects, giving every learner a structured
              path into building technology.
            </p>

            <div className="ab-story__actions">
              <Link href="/programs" className="ab-story__btn">
                See our programs
              </Link>
              <Link href="/register" className="ab-story__link">
                Register a learner
              </Link>
            </div>
          </div>

          <ol className="ab-story__blocks" aria-label="Innovate, Build, Lead">
            {BLOCKS.map((b, i) => (
              <li
                key={b.word}
                className={`ab-story__block ab-story__block--${b.tone}`}
                style={{ "--i": i }}
              >
                <p className="ab-story__cue">{b.cue}</p>
                <p className="ab-story__word">{b.word}</p>
                <p className="ab-story__block-text">{b.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- Stats ---------- */}
        <dl className="ab-story__stats">
          {STATS.map((s) => (
            <div key={s.label} className="ab-story__stat">
              <dd>{s.value}</dd>
              <dt>{s.label}</dt>
            </div>
          ))}
        </dl>

        {/* ---------- Story, mission and vision ---------- */}
        <div className="ab-story__body">
          <div className="ab-story__text">
            <h2>Why we started</h2>
            <p>
              Futuristic Coders started in Kenya in 2026 with one belief: coding
              is the new literacy, and every child should have a clear,
              confidence-building way into it.
            </p>
            <p>
              We don’t just teach syntax. We teach{" "}
              <strong>problem-solving</strong>,{" "}
              <strong>creative thinking</strong> and{" "}
              <strong>perseverance</strong>, so learners can work out what to
              build and keep going when it gets hard.
            </p>
            <p>
              Classes are hands-on and project-based. Learners leave with work
              they can show: games, apps and websites they made themselves.
            </p>
          </div>

          <div className="ab-story__aims">
            <div className="ab-story__aim ab-story__aim--mission">
              <h3>Our mission</h3>
              <p>
                Give every learner, from a first-time child coder to an adult
                changing careers, a structured path into technology.
              </p>
            </div>
            <div className="ab-story__aim ab-story__aim--vision">
              <h3>Our vision</h3>
              <p>
                A Kenya where young people build the technology they use, and
                lead with it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
