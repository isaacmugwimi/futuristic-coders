"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import "./BlogPost.css";
import ShareButton from "../../../utils/ShareButton/ShareButton";
import { extractHeadings, formatDate, slugify } from "../BlogAdapter";

function textOf(children) {
  return []
    .concat(children)
    .map((c) =>
      typeof c === "string" ? c : c?.props ? textOf(c.props.children) : "",
    )
    .join("");
}

export default function BlogPost({ post, related = [] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const headings = useMemo(() => extractHeadings(post.content), [post.content]);
  const path = `/blog/${encodeURIComponent(post.slug)}`;

  // Reading progress bar
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = document.getElementById("bp-article");
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight * 0.6;
        setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(total, 1))));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Highlight the current section in the table of contents
  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: "-90px 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  // Memoised so scroll-progress updates don't re-render the whole article.
  // Heading ids must match extractHeadings (same order, same de-duplication).
  const body = useMemo(() => {
    const used = {};
    const heading = (Tag) =>
      function H({ children }) {
        const base = slugify(textOf(children)) || "section";
        used[base] = (used[base] ?? -1) + 1;
        const id = used[base] ? `${base}-${used[base]}` : base;
        return (
          <Tag id={id}>
            <a href={`#${id}`} className="bp-anchor">
              {children}
            </a>
          </Tag>
        );
      };
    return (
      <ReactMarkdown components={{ h2: heading("h2"), h3: heading("h3") }}>
        {post.content}
      </ReactMarkdown>
    );
  }, [post.content]);

  return (
    <>
      <div className="bp-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <main className="bp">
        <div className="bp-wrap">
          <nav className="bp-crumbs" aria-label="Breadcrumb">
            <Link href="/blog">← All articles</Link>
          </nav>

          <header className="bp-header">
            <Link href="/blog" className="bp-cat">
              {post.categoryName}
            </Link>
            <h1 className="bp-title">{post.title}</h1>
            {post.excerpt && <p className="bp-dek">{post.excerpt}</p>}

            <div className="bp-byline">
              <span className="bp-avatar" aria-hidden="true">
                {post.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar} alt="" />
                ) : (
                  post.author.name.charAt(0)
                )}
              </span>
              <div className="bp-byline-text">
                <strong>{post.author.name}</strong>
                <span>
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {post.minutes} min read
                </span>
              </div>
              <ShareButton
                variant="pill"
                path={path}
                title={post.title}
                text={post.excerpt}
                className="bp-share-top"
              />
            </div>
          </header>

          {post.image && (
            <figure className="bp-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.imageAlt}
                width="1200"
                height="630"
                fetchPriority="high"
              />
            </figure>
          )}

          <div className="bp-layout">
            <article id="bp-article" className="bp-prose">
              {body}
            </article>

            <aside className="bp-aside" aria-label="Article tools">
              {headings.length > 1 && (
                <nav className="bp-toc" aria-label="On this page">
                  <p className="bp-aside-h">On this page</p>
                  <ul>
                    {headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? "is-sub" : ""}>
                        <a
                          href={`#${h.id}`}
                          className={activeId === h.id ? "is-active" : ""}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <ShareButton
                variant="pill"
                path={path}
                title={post.title}
                text={post.excerpt}
                className="bp-share-side"
              />
            </aside>
          </div>

          {post.tags.length > 0 && (
            <ul className="bp-tags" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}

          <section className="bp-end">
            <div>
              <h2>Found this useful?</h2>
              <p>Send it to someone who’d like it too.</p>
            </div>
            <ShareButton
              variant="pill"
              path={path}
              title={post.title}
              text={post.excerpt}
            />
          </section>

          {related.length > 0 && (
            <section className="bp-related" aria-labelledby="bp-related-h">
              <h2 id="bp-related-h">Keep reading</h2>
              <div className="bp-related-grid">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${encodeURIComponent(r.slug)}`}
                    className="bp-rel"
                  >
                    <span className="bp-rel-cat">{r.categoryName}</span>
                    <span className="bp-rel-title">{r.title}</span>
                    <span className="bp-rel-meta">{r.minutes} min read</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
