import Image from "next/image";
import Link from "next/link";
import "./Programs.css";

const PROGRAMS = [
  {
    id: "beginner",
    badge: "Beginner",
    badgeClass: "",
    age: "Ages 7 – 11",
    title: "Foundations of Coding",
    desc: "Students discover the joy of programming through Scratch, block-based logic, and simple games.",
    skills: ["Scratch", "Logic & Loops", "Animations", "Game Design"],
    image:
      "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=600&q=75",
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
  },
];

export default function Programs() {
  return (
    <section className="programs" id="programs">
      <div className="container">
        {/* HEADER */}
        <div className="programs-header">
          <span className="section-label">Our Programs</span>

          <h2 className="section-title">Choose Your Learning Path</h2>

          <p className="section-subtitle">
            Carefully designed tracks that take students from beginner to
            confident developer.
          </p>
        </div>

        {/* GRID */}
        <div className="programs-grid">
          {PROGRAMS.map((program) => (
            <article key={program.id} className="program-card">
              {/* IMAGE */}
              <div className="program-card-image">
                <Image
                  src={program.image}
                  alt={program.title}
                  width={600}
                  height={400}
                />

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
                    query: {
                      course: program.title,
                      age: program.age,
                    },
                  }}
                  className="btn-blue"
                >
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
