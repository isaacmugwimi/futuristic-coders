import Image from "next/image";
import styles from "./Programs.module.css";
import Link from "next/link";

const PROGRAMS = [
  {
    id: "beginner",
    badge: "Beginner",
    badgeVariant: "",
    age: "Ages 7 – 11",
    title: "Foundations of Coding",
    desc: "Students discover the joy of programming through Scratch, block-based logic, and simple games. We build computational thinking before syntax.",
    skills: ["Scratch", "Logic & Loops", "Animations", "Game Design"],
    image: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=600&q=75",
    imageAlt: "Young students learning coding basics",
  },
  {
    id: "intermediate",
    badge: "Intermediate",
    badgeVariant: "intermediate",
    age: "Ages 12 – 15",
    title: "Web Development",
    desc: "Students move into real code — building websites and interactive apps with HTML, CSS, and JavaScript. Projects go live on the web.",
    skills: ["HTML & CSS", "JavaScript", "Responsive Design", "Git Basics"],
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=75",
    imageAlt: "Teen learning web development",
  },
  {
    id: "advanced",
    badge: "Advanced",
    badgeVariant: "advanced",
    age: "Ages 15 – 18",
    title: "React & AI Basics",
    desc: "Our most rigorous track covers modern React development and an introduction to AI concepts. Students graduate with portfolio-ready projects.",
    skills: ["React", "APIs", "AI & ML Basics", "Portfolio Projects"],
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=75",
    imageAlt: "Advanced student working on code",
  },
];

export default function Programs() {
  return (
    <section className={styles.programs} id="programs">
      <div className="container">
        <div className={styles.programs__header}>
          <span className="section-label">Our Programs</span>
          <h2 className="section-title">Choose Your Learning Path</h2>
          <p className="section-subtitle">
            Three carefully designed tracks take students from zero to confident
            developer — each building on the last.
          </p>
        </div>

        <div className={styles.programs__grid}>
          {PROGRAMS.map((prog) => (
            <article key={prog.id} className={styles.card}>
              <div className={styles.card__image}>
                <Image
                  src={prog.image}
                  alt={prog.imageAlt}
                  width={600}
                  height={400}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
                <span className={`${styles.card__badge} ${styles[`card__badge--${prog.badgeVariant}`] || ""}`}>
                  {prog.badge}
                </span>
              </div>
              <div className={styles.card__body}>
                <span className={styles.card__age}>{prog.age}</span>
                <h3 className={styles.card__title}>{prog.title}</h3>
                <p className={styles.card__desc}>{prog.desc}</p>
                <div className={styles.card__skills}>
                  {prog.skills.map((s) => (
                    <span key={s} className={styles.card__skill}>{s}</span>
                  ))}
                </div>
                <Link href="/register" className="btn-blue">Learn More</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
