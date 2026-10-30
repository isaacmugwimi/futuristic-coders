import Link from "next/link";
import {
  FaBookOpen,
  FaUsers,
  FaStar,
  FaGamepad,
  FaLaptopCode,
  FaRocket,
} from "react-icons/fa";
import "./AboutLearning.css";

const VALUES = [
  {
    icon: <FaBookOpen />,
    title: "Clear learning outcomes",
    desc: "Every course is built around what a learner will be able to do by the end, not just fun activities.",
    accent: "#38bdf8",
  },
  {
    icon: <FaUsers />,
    title: "Small groups",
    desc: "Classes stay small so each learner gets individual attention.",
    accent: "#818cf8",
  },
  {
    icon: <FaStar />,
    title: "Project-based learning",
    desc: "Every learner finishes with real projects in their portfolio.",
    accent: "#34d399",
  },
];

const JOURNEY = [
  {
    icon: <FaGamepad />,
    stage: "Young creators",
    who: "Ages 7 to 10",
    desc: "Learners play their way into coding, making games, animations and stories.",
    tags: ["Scratch", "Games and animations"],
    accent: "#38bdf8",
  },
  {
    icon: <FaLaptopCode />,
    stage: "Teen builders",
    who: "Teens",
    desc: "Learners move from blocks to real code and build websites and programs.",
    tags: ["Web development", "JavaScript", "Python"],
    accent: "#818cf8",
  },
  {
    icon: <FaRocket />,
    stage: "Advanced and adult learners",
    who: "Older learners and adults",
    desc: "Learners go deeper into professional tools and build full applications.",
    tags: ["React", "Full-stack development", "Digital skills"],
    accent: "#34d399",
  },
];

const STEPS = [
  {
    title: "Choose a program",
    desc: "Browse programs by level, age group and format.",
  },
  {
    title: "Register online",
    desc: "Fill in the short registration form for the learner.",
  },
  {
    title: "Learn by building",
    desc: "Join hands-on sessions and work on projects each week.",
  },
  {
    title: "Graduate with a certificate",
    desc: "Receive a verifiable certificate when you complete the program.",
  },
];

export default function AboutLearning() {
  return (
    <section className="ab-learn" aria-labelledby="learn-heading">
      <div className="ab-learn__container">
        {/* ---------- Values ---------- */}
        <div className="ab-learn__block">
          <h2 id="learn-heading" className="ab-learn__title">
            How we teach
          </h2>
          <ul className="ab-learn__values">
            {VALUES.map((v) => (
              <li
                key={v.title}
                className="ab-learn__value"
                style={{ "--accent": v.accent }}
              >
                <span className="ab-learn__icon" aria-hidden="true">
                  {v.icon}
                </span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Journey ---------- */}
        <div className="ab-learn__block">
          <h2 className="ab-learn__title">A path for every age</h2>
          <p className="ab-learn__intro">
            Learners start where they are and move up as their skills grow.
          </p>
          <ol className="ab-learn__journey">
            {JOURNEY.map((j) => (
              <li
                key={j.stage}
                className="ab-learn__stage"
                style={{ "--accent": j.accent }}
              >
                <span className="ab-learn__icon" aria-hidden="true">
                  {j.icon}
                </span>
                <h3>{j.stage}</h3>
                <p className="ab-learn__who">{j.who}</p>
                <p>{j.desc}</p>
                <ul className="ab-learn__tags">
                  {j.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- Steps ---------- */}
        <div className="ab-learn__block">
          <h2 className="ab-learn__title">How it works</h2>
          <ol className="ab-learn__steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="ab-learn__step">
                <span className="ab-learn__num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
          <Link href="/programs" className="ab-learn__btn">
            Browse programs
          </Link>
        </div>
      </div>
    </section>
  );
}
