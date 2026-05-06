import styles from "./Hero.module.css";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Structured Curriculum",
    desc: "Progressive learning paths from basics to advanced concepts",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Flexible Scheduling",
    desc: "Weekend & evening classes designed around school hours",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Expert Instructors",
    desc: "Professional developers passionate about teaching kids",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real Projects",
    desc: "Students build and ship actual projects they're proud of",
  },
];

export default function Hero() {
  return (
    <section className={styles.hero} id="home">
      {/* Background */}
      <div className={styles.hero__bg} />
      <div className={styles.hero__overlay} />

      <div className={styles.hero__content}>
        {/* Left Text */}
        <div className={styles.hero__text}>
          <div className={styles.hero__badge}>
            <span className={styles.hero__badge_dot} />
            Enrolling Now — 2024 Cohort
          </div>
          <h1 className={styles.hero__title}>
            Build Future <span>Coders</span> Today
          </h1>
          <p className={styles.hero__subtitle}>
            Structured coding education for kids and teens aged 7–18. We teach
            real programming skills through hands-on projects in a supportive,
            academic environment.
          </p>
          <div className={styles.hero__actions}>
            <a href="#programs" className="btn-primary">Apply Now</a>
            <a href="#about" className="btn-outline">Learn More</a>
          </div>
        </div>

        {/* Right Card */}
        <div className={styles.hero__card}>
          <h3 className={styles.hero__card_title}>Why Futuristic Coders?</h3>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.hero__feature}>
              <div className={styles.hero__feature_icon}>{f.icon}</div>
              <div className={styles.hero__feature_text}>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={styles.hero__scroll}>
        <div className={styles.hero__scroll_line} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
