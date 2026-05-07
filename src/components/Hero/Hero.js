"use client";
import Link from "next/link";
import "./Hero.css";
// import "../../global.css"
import {
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaCode,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: <FaShieldAlt />,
    title: "Structured Curriculum",
    desc: "Progressive learning paths from basics to advanced concepts",
  },
  {
    icon: <FaClock />,
    title: "Flexible Scheduling",
    desc: "Weekend & evening classes designed around school hours",
  },
  {
    icon: <FaUsers />,
    title: "Expert Instructors",
    desc: "Professional developers passionate about teaching kids",
  },
  {
    icon: <FaCode />,
    title: "Real Projects",
    desc: "Students build and ship actual projects they're proud of",
  },
];

export default function Hero() {
  return (
    <section className="hero" id="home">

      {/* ANIMATED GRID BACKGROUND */}
      <div className="hero-grid"></div>
      <div className="hero-glow hero-glow--left"></div>
      <div className="hero-glow hero-glow--right"></div>

      {/* FLOATING ORBS */}     
      <div className="hero-orb hero-orb--1"></div>
      <div className="hero-orb hero-orb--2"></div>
      <div className="hero-orb hero-orb--3"></div>

      <div className="hero-content">

        {/* LEFT */}
        <div className="hero-text">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span className="hero-badge-label">Enrolling Now — 2026 Cohort</span>
          </div>
                          
          <h1 className="hero-title">
            Build Future<br />
            <span className="hero-title-accent">Coders</span>
            <span className="hero-title-cursor"></span>
           <br /> Today
          </h1>

          <p className="hero-subtitle">
            Structured coding education for kids and teens aged{" "}
            <strong>7–18</strong>. We teach real programming skills through
            hands-on projects.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Students</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-number">12</span>
              <span className="hero-stat-label">Courses</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-number">98%</span>
              <span className="hero-stat-label">Satisfaction</span>
            </div>
          </div>

          <div className="hero-actions">
            <a href="#programs" className="btn-primary">
              <span>Apply Now</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#about" className="btn-outline">
              Learn More
            </a>
          </div>

        </div>

        {/* RIGHT CARD */}
        <div className="hero-card">

          <div className="hero-card-header">
            <div className="hero-card-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="hero-card-title">Why Futuristic Coders?</span>
          </div>

          <div className="hero-card-body">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="hero-feature"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="hero-feature-icon">
                  {feature.icon}
                </div>
                <div className="hero-feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-card-footer">
            <span className="hero-card-tag">🎓 Next intake: Jan 2026</span>
            <span className="hero-card-tag">📍 Nairobi, Kenya</span>
          </div>

        </div>

      </div>

      {/* SCROLL INDICATOR */}
      <div className="hero-scroll">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-wheel"></div>
        </div>
        <span>Scroll</span>
      </div>

    </section>
  );
}