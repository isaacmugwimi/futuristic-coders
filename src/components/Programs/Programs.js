import Image from "next/image";
import Link from "next/link";
import "./Programs.css";

const PROGRAMS = [
  {
    id: "beginner",
    badge: "Beginner",
    badgeClass: "badge-beginner",
    age: "Ages 7 – 11",
    title: "Foundations of Coding",
    desc: "Students discover the joy of programming through Scratch, block-based logic, and simple games.",
    skills: ["Scratch", "Logic & Loops", "Animations", "Game Design"],
    image:
      "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=600&q=75",
    accent: "#38bdf8",
    number: "01",
  },
  {
    id: "intermediate",
    badge: "Intermediate",
    badgeClass: "badge-intermediate",
    age: "Ages 12 – 15",
    title: "Web Development",
    desc: "Students move into real code — building websites and interactive apps with HTML, CSS, and JavaScript.",
    skills: ["HTML & CSS", "JavaScript", "Responsive Design", "Git Basics"],
    image:
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=75",
    accent: "#f59e0b",
    number: "02",
  },
  {
    id: "advanced",
    badge: "Advanced",
    badgeClass: "badge-advanced",
    age: "Ages 15 – 18",
    title: "React & AI Basics",
    desc: "Students learn React development and AI fundamentals through portfolio-ready projects.",
    skills: ["React", "APIs", "AI & ML Basics", "Portfolio Projects"],
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=75",
    accent: "#34d399",
    number: "03",
  },
];

export default function Programs() {
  return (
    <section className="programs" id="programs">
      {/* BACKGROUND EFFECTS */}
      <div className="programs-bg-grid"></div>
      <div className="programs-bg-glow"></div>

      <div className="programs-container">
        {/* HEADER */}
        <div className="programs-header">
          <div className="programs-label">
            <span className="programs-label-dot"></span>
            Our Programs
          </div>
          <h2 className="programs-title">
            Choose Your{" "}
            <span className="programs-title-accent">Learning Path</span>
          </h2>
          <p className="programs-subtitle">
            Carefully designed tracks that take students from complete beginner
            to confident, job-ready developer.
          </p>
        </div>

        {/* GRID */}
        <div className="programs-grid">
          {PROGRAMS.map((program) => (
            <article
              key={program.id}
              className="program-card"
              style={{ "--accent": program.accent }}
            >
              {/* NUMBER */}
              <div className="program-number">{program.number}</div>

              {/* IMAGE */}
              <div className="program-card-image">
                <Image
                  src={program.image}
                  alt={program.title}
                  width={600}
                  height={400}
                />
                <div className="program-card-image-overlay"></div>
                <span className={`program-badge ${program.badgeClass}`}>
                  {program.badge}
                </span>
              </div>

              {/* BODY */}
              <div className="program-card-body">
                <span className="program-age">{program.age}</span>

                <h3 className="program-title">{program.title}</h3>

                <p className="program-description">{program.desc}</p>

                <div className="program-skills">
                  {program.skills.map((skill) => (
                    <span key={skill} className="program-skill">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link
                  href={{
                    pathname: "/register",
                    query: { course: program.title, age: program.age },
                  }}
                  className="program-btn"
                >
                  <span>Enroll Now</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* BOTTOM ACCENT LINE */}
              <div className="program-card-line"></div>
            </article>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="programs-cta">
          <p>Not sure which program is right for your child?</p>
          <Link href="/contact" className="programs-cta-link">
            Talk to an advisor →
          </Link>
        </div>
      </div>
    </section>
  );
}
