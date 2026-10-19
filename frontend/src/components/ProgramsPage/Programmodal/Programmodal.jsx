"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import "./Programmodal.css";

const TIER_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="pm-section">
      <h3 className="pm-h">{title}</h3>
      <ul className="pm-list">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ProgramModal({ program, onClose }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(null);

  // Portals need the DOM, so wait until we're on the client
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!program) return;

    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock page scroll
    closeRef.current?.focus();

    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.(); // return focus to the card
    };
  }, [program, onClose]);

  if (!mounted || !program) return null;

  const d = program.details || {};
  // Empty values are hidden automatically
  const facts = [
    ["Duration", program.duration],
    ["Ages", program.ages],
    ["Schedule", d.schedule],
    ["Format", d.format],
    ["Class days", d.classDays],
    ["Starts", d.startsOn],
  ].filter(([, v]) => v);

  return createPortal(
    <div className="pm-backdrop" onClick={onClose}>
      <div
        className={`pm tier-${program.tier}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          className="pm-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="pm-media">
          <div
            className="pm-img"
            style={
              program.image
                ? { backgroundImage: `url(${JSON.stringify(program.image)})` }
                : undefined
            }
          />
          <span className="pm-badge">{TIER_LABEL[program.tier]}</span>
        </div>

        <div className="pm-body">
          <h2 id="pm-title" className="pm-title">
            {program.title}
          </h2>

          {/* The full description is written in Markdown in the admin */}
          {d.overview ? (
            <div className="pm-overview pm-markdown">
              <ReactMarkdown>{d.overview}</ReactMarkdown>
            </div>
          ) : (
            <p className="pm-overview">{program.summary}</p>
          )}

          {facts.length > 0 && (
            <dl className="pm-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <List title="What you'll learn" items={d.outcomes} />
          <List title="Prerequisites" items={d.prerequisites} />
          <List title="What you'll need" items={d.requirements} />

          {program.tags?.length > 0 && (
            <ul className="pm-tags">
              {program.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}

          <div className="pm-actions">
            <Link
              href={`/register?program=${program.slug}`}
              className="pm-enroll"
            >
              Enroll Now
            </Link>
            <Link href="/contact" className="pm-secondary">
              Ask a question
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}