"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, programs } from "./programsData";
import ProgramModal from "./Programmodal/Programmodal";
import "./Programs.css";

const TIER_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Programs() {
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible = active === "all" ? categories : categories.filter((c) => c.id === active);
  const countFor = (id) => programs.filter((p) => p.category === id).length;

  return (
    <section className="pp">
      <div className="pp-inner">
        <header className="pp-header">
          <h1 className="pp-title">
            Explore Our <span className="pp-grad">Programs</span>
          </h1>
          <p className="pp-lede">
            Carefully designed tracks that take students from complete beginner to confident, job-ready developer.
          </p>
        </header>

        <div className="pp-tabs" role="tablist" aria-label="Program categories">
          <button
            role="tab"
            aria-selected={active === "all"}
            className={`pp-tab ${active === "all" ? "is-active" : ""}`}
            onClick={() => setActive("all")}
          >
            All programs <span className="pp-count">{programs.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={active === c.id}
              className={`pp-tab ${active === c.id ? "is-active" : ""}`}
              onClick={() => setActive(c.id)}
            >
              {c.name} <span className="pp-count">{countFor(c.id)}</span>
            </button>
          ))}
        </div>

        {visible.map((cat) => {
          const items = programs.filter((p) => p.category === cat.id);
          return (
            <div className="pp-category" key={cat.id} role="tabpanel">
              <h2 className="pp-cat-name">{cat.name}</h2>
              <p className="pp-cat-blurb">{cat.blurb}</p>

              <div className="pp-grid">
                {items.map((p, i) => (
                  <article
                    className={`pp-card tier-${p.tier}`}
                    key={p.slug}
                    onClick={() => setSelected(p)}
                    onKeyDown={(e) => {
                      if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setSelected(p);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-haspopup="dialog"
                    aria-label={`View details for ${p.title}`}
                  >
                    <div className="pp-media">
                      <div
                        className="pp-img"
                        style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}
                      />
                      <span className="pp-badge">{TIER_LABEL[p.tier]}</span>
                      <span className="pp-num" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="pp-body">
                      <p className="pp-ages">
                        Ages {p.ages} <span className="pp-dot">·</span> {p.duration}
                      </p>
                      <h3 className="pp-card-title">{p.title}</h3>
                      <p className="pp-summary">{p.summary}</p>

                      <ul className="pp-tags">
                        {p.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>

                      <Link
                        href={`/register?program=${p.slug}`}
                        className="pp-enroll"
                        aria-label={`Enroll in ${p.title}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Enroll Now <Arrow />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}

        <p className="pp-help">
          Not sure which program is right for you or your child?{" "}
          <Link href="/contact" className="pp-help-link">Talk to us</Link>
        </p>
      </div>

      <ProgramModal program={selected} onClose={() => setSelected(null)} />
    </section>
  );
}