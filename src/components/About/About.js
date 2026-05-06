import Image from "next/image";
import styles from "./About.module.css";

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Academic Rigour",
    desc: "Our curriculum is designed with clear learning outcomes — not just fun activities.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Small Class Sizes",
    desc: "Maximum 12 students per class ensures every child gets individual attention.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Project-Based Learning",
    desc: "Every student graduates with real projects in their portfolio — not just certificates.",
  },
];

export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className="container">
        <div className={styles.about__inner}>
          {/* Image */}
          <div className={styles.about__image_wrap}>
            <div className={styles.about__image_main}>
              <Image
                src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80"
                alt="Students learning to code in a classroom"
                width={800}
                height={600}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          
          </div>

          {/* Text */}
          <div>
            <span className="section-label">About Us</span>
            <h2 className="section-title">We Believe Every Child Can Code</h2>
            <p className="section-subtitle">
              Futuristic Coders was founded on the belief that coding is the new
              literacy. Our mission is to give every child a structured,
              confidence-building path into technology — regardless of their
              background.
            </p>
            <p className="section-subtitle" style={{ marginTop: 12 }}>
              We don't just teach syntax. We teach problem-solving, creative
              thinking, and perseverance — skills that matter far beyond
              programming.
            </p>

            <div className={styles.about__values}>
              {VALUES.map((v) => (
                <div key={v.title} className={styles.about__value}>
                  <div className={styles.about__value_icon}>{v.icon}</div>
                  <div className={styles.about__value_text}>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.about__cta}>
              <a href="#programs" className="btn-primary">Explore Programs</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
