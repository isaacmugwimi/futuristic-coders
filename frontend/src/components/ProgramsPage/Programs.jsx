"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "./Programs.css";
import { buildCatalog } from "./programsAdapter";
import {
  usePublishedPrograms,
  useCategories,
} from "../../hooks/programs/useProgramQueries";

const TIER_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Placeholder cards shown while programs load. */
function ProgramsSkeleton() {
  return (
    <div className="pp-state" role="status" aria-busy="true" aria-live="polite">
      <span className="pp-sr">Loading programs…</span>
      <div className="pp-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="pp-skel-card" key={i}>
            <div className="pp-skel pp-skel--media" />
            <div className="pp-skel-body">
              <span className="pp-skel pp-skel--line pp-skel--short" />
              <span className="pp-skel pp-skel--title" />
              <span className="pp-skel pp-skel--line" />
              <span className="pp-skel pp-skel--line pp-skel--mid" />
              <span className="pp-skel pp-skel--pill" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Programs() {
  const programsQuery = usePublishedPrograms();
  const categoriesQuery = useCategories();

  const [active, setActive] = useState("all");

  const { categories, programs } = useMemo(
    () =>
      buildCatalog(
        categoriesQuery.data?.data ?? [],
        programsQuery.data?.data ?? [],
      ),
    [categoriesQuery.data, programsQuery.data],
  );

  const loading = programsQuery.isLoading || categoriesQuery.isLoading;
  const failed =
    (programsQuery.isError && !programsQuery.data) ||
    (categoriesQuery.isError && !categoriesQuery.data);
  const retrying = programsQuery.isFetching || categoriesQuery.isFetching;

  // If the open tab's category no longer has programs, fall back to "all".
  const current =
    active === "all" || categories.some((c) => c.id === active)
      ? active
      : "all";
  const visible =
    current === "all" ? categories : categories.filter((c) => c.id === current);
  const countFor = (id) => programs.filter((p) => p.category === id).length;

  function retry() {
    programsQuery.refetch();
    categoriesQuery.refetch();
  }

  return (
    <section className="pp">
      <div className="pp-inner">
        <header className="pp-header">
          <h1 className="pp-title">
            Explore Our <span className="pp-grad">Programs</span>
          </h1>
          <p className="pp-lede">
            Carefully designed tracks that take students from complete beginner
            to confident, job-ready developer.
          </p>
        </header>

        {loading ? (
          <ProgramsSkeleton />
        ) : failed ? (
          <div className="pp-notice" role="alert">
            <h2>We couldn’t load our programs</h2>
            <p>Check your connection and try again.</p>
            <button
              type="button"
              className="pp-notice-btn"
              onClick={retry}
              disabled={retrying}
            >
              {retrying ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : programs.length === 0 ? (
          <div className="pp-notice">
            <h2>New programs are on the way</h2>
            <p>
              We’re preparing our next classes. Talk to us and we’ll help you
              find the right fit.
            </p>
            <Link href="/contact" className="pp-notice-btn">
              Talk to us
            </Link>
          </div>
        ) : (
          <>
            <div
              className="pp-tabs"
              role="tablist"
              aria-label="Program categories"
            >
              <button
                role="tab"
                aria-selected={current === "all"}
                className={`pp-tab ${current === "all" ? "is-active" : ""}`}
                onClick={() => setActive("all")}
              >
                All programs <span className="pp-count">{programs.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={current === c.id}
                  className={`pp-tab ${current === c.id ? "is-active" : ""}`}
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
                  {cat.blurb && <p className="pp-cat-blurb">{cat.blurb}</p>}

                  <div className="pp-grid">
                    {items.map((p, i) => (
                      <article
                        className={`pp-card tier-${p.tier}`}
                        key={p.slug}
                      >
                        <div className="pp-media">
                          <div
                            className="pp-img"
                            style={
                              p.image
                                ? {
                                    backgroundImage: `url(${JSON.stringify(p.image)})`,
                                  }
                                : undefined
                            }
                          />
                          <span className="pp-badge">{TIER_LABEL[p.tier]}</span>
                          <span className="pp-num" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="pp-body">
                          <p className="pp-ages">
                            {p.agesLabel}
                            {p.agesLabel && p.duration && (
                              <span className="pp-dot"> · </span>
                            )}
                            {p.duration}
                          </p>

                          <h3 className="pp-card-title">
                            {/* Stretched link: the whole card is clickable */}
                            <Link
                              href={`/programs/${encodeURIComponent(p.slug)}`}
                              className="pp-card-link"
                            >
                              {p.title}
                            </Link>
                          </h3>

                          <p className="pp-summary">{p.summary}</p>

                          {p.tags.length > 0 && (
                            <ul className="pp-tags">
                              {p.tags.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          )}

                          <Link
                            href={`/register?program=${p.slug}`}
                            className="pp-enroll"
                            aria-label={`Enroll in ${p.title}`}
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
          </>
        )}

        <p className="pp-help">
          Not sure which program is right for you or your child?{" "}
          <Link href="/contact" className="pp-help-link">
            Talk to us
          </Link>
        </p>
      </div>
    </section>
  );
}
