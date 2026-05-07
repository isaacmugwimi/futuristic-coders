import Image from "next/image";
import "./About.css"
const VALUES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Academic Rigour",
    desc: "Our curriculum is designed with clear learning outcomes — not just fun activities.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Project-Based Learning",
    desc: "Every student graduates with real projects in their portfolio.",
  },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">

        <div className="about-inner">

          {/* IMAGE */}
          <div className="about-image-wrap">
            <div className="about-image-main">
              <Image
                src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80"
                alt="Students learning to code"
                width={800}
                height={600}
                priority
              />
            </div>
          </div>

          {/* TEXT */}
          <div className="about-content">

            <span className="section-label">
              About Us
            </span>

            <h2 className="section-title">
              We Believe Every Child Can Code
            </h2>

            <p className="section-subtitle">
              Futuristic Coders was founded on the belief that coding is the
              new literacy. Our mission is to give every child a structured,
              confidence-building path into technology.
            </p>

            <p className="section-subtitle about-paragraph">
              We don't just teach syntax. We teach problem-solving,
              creative thinking, and perseverance.
            </p>

            <div className="about-values">

              {VALUES.map((value) => (
                <div key={value.title} className="about-value">

                  <div className="about-value-icon">
                    {value.icon}
                  </div>

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
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}