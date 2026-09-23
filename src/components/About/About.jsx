import Image from "next/image";
import { FaBookOpen, FaUsers, FaStar } from "react-icons/fa";
import "./About.css";

const VALUES = [
  {
    icon: <FaBookOpen />,
    title: "Academic Rigour",
    desc: "Our curriculum is designed with clear learning outcomes — not just fun activities.",
    accent: "#38bdf8",
  },
  {
    icon: <FaUsers />,
    title: "Small Class Sizes",
    desc: "Maximum 12 students per class ensures every child gets individual attention.",
    accent: "#818cf8",
  },
  {
    icon: <FaStar />,
    title: "Project-Based Learning",
    desc: "Every student graduates with real projects in their portfolio.",
    accent: "#34d399",
  },
];

const STATS = [
  { number: "500+", label: "Students Trained" },
  { number: "3", label: "Learning Tracks" },
  { number: "98%", label: "Parent Satisfaction" },
  { number: "5★", label: "Average Rating" },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-bg-grid"></div>
      <div className="about-bg-glow"></div>

      <div className="about-container">
        <div className="about-inner">
          {/* IMAGE SIDE */}
          <div className="about-image-wrap">
            <div className="about-image-main">
              <Image
                src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80"
                alt="Students learning to code"
                width={800}
                height={600}
                priority
              />
              <div className="about-image-overlay"></div>
            </div>

            {/* FLOATING STATS CARD */}
            <div className="about-stats-card">
              {STATS.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <span className="about-stat-number">{stat.number}</span>
                  <span className="about-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* FLOATING BADGE */}
            <div className="about-badge">
              <span className="about-badge-dot"></span>
              Est. 2026 · Nairobi, Kenya
            </div>
          </div>

          {/* TEXT SIDE */}
          <div className="about-content">
            <div className="about-label">
              <span className="about-label-dot"></span>
              About Us
            </div>

            <h2 className="about-title">
              We Believe Every Child{" "}
              <span className="about-title-accent">Can Code</span>
            </h2>

            <p className="about-desc">
              Futuristic Coders was founded on the belief that coding is the new
              literacy. Our mission is to give every child a structured,
              confidence-building path into technology.
            </p>

            <p className="about-desc">
              We don't just teach syntax. We teach{" "}
              <strong>problem-solving</strong>,{" "}
              <strong>creative thinking</strong>, and{" "}
              <strong>perseverance</strong>.
            </p>

            {/* VALUES */}
            <div className="about-values">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="about-value"
                  style={{ "--accent": value.accent }}
                >
                  <div className="about-value-icon">{value.icon}</div>
                  <div className="about-value-text">
                    <h4>{value.title}</h4>
                    <p>{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-cta">
              <a href="#programs" className="btn-primary">
                Explore Programs
              </a>
              <a href="#contact" className="about-cta-secondary">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
