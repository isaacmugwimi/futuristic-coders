"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "./Blog.css";
import ShareButton from "../../../utils/ShareButton/ShareButton";
import { buildBlogCatalog, formatDate } from "../BlogAdapter";
import {
  usePublishedPosts,
  useBlogCategories,
} from "../../../hooks/blog/useBlogQueries";

const PAGE_SIZE = 9;
const ACCENTS = ["sky", "amber", "emerald", "violet"];

// Same category always gets the same accent colour
function accentFor(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

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

function Meta({ post }) {
  return (
    <p className="bl-meta">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <span className="bl-dot" aria-hidden="true">
        ·
      </span>
      <span>{post.minutes} min read</span>
    </p>
  );
}

function PostCard({ post, featured = false }) {
  return (
    <article
      className={`bl-card bl-${accentFor(post.category)} ${featured ? "bl-card--featured" : ""}`}
    >
      <div className="bl-media">
        <div
          className="bl-img"
          role="img"
          aria-label={post.imageAlt}
          style={
            post.image
              ? { backgroundImage: `url(${JSON.stringify(post.image)})` }
              : undefined
          }
        />
        <span className="bl-badge">{post.categoryName}</span>
      </div>

      <div className="bl-body">
        <Meta post={post} />
        <h3 className="bl-card-title">
          <Link
            href={`/blog/${encodeURIComponent(post.slug)}`}
            className="bl-card-link"
          >
            {post.title}
          </Link>
        </h3>
        <p className="bl-excerpt">{post.excerpt}</p>

        <div className="bl-foot">
          <span className="bl-author">
            <span className="bl-avatar" aria-hidden="true">
              {post.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author.avatar} alt="" />
              ) : (
                post.author.name.charAt(0)
              )}
            </span>
            {post.author.name}
          </span>
          <span className="bl-actions">
            <ShareButton
              variant="icon"
              path={`/blog/${encodeURIComponent(post.slug)}`}
              title={post.title}
              text={post.excerpt}
            />
            <span className="bl-read" aria-hidden="true">
              Read <Arrow />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="bl-grid" role="status" aria-busy="true">
      <span className="bl-sr">Loading articles…</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div className="bl-skel-card" key={i} aria-hidden="true">
          <div className="bl-skel bl-skel--media" />
          <div className="bl-skel-body">
            <span className="bl-skel bl-skel--line bl-skel--short" />
            <span className="bl-skel bl-skel--title" />
            <span className="bl-skel bl-skel--line" />
            <span className="bl-skel bl-skel--line bl-skel--mid" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Blog({ initialPosts, initialCategories }) {
  const postsQuery = usePublishedPosts(initialPosts);
  const catsQuery = useBlogCategories(initialCategories);

  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const deferred = useDeferredValue(query);
  const searchRef = useRef(null);

  const { categories, posts } = useMemo(
    () =>
      buildBlogCatalog(catsQuery.data?.data ?? [], postsQuery.data?.data ?? []),
    [catsQuery.data, postsQuery.data],
  );

  const loading = postsQuery.isLoading;
  const failed = postsQuery.isError && !postsQuery.data;

  // Press "/" anywhere to jump to search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (active === "all" || p.category === active) &&
        (!q ||
          `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.categoryName}`
            .toLowerCase()
            .includes(q)),
    );
  }, [posts, active, deferred]);

  const isBrowsing = active === "all" && !deferred.trim();
  const featured = isBrowsing ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;
  const visible = rest.slice(0, shown);
  const countFor = (id) => posts.filter((p) => p.category === id).length;

  // Cursor-follow glow: one handler for the whole grid
  function onPointerMove(e) {
    const card = e.target.closest?.(".bl-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  function reset() {
    setActive("all");
    setQuery("");
    setShown(PAGE_SIZE);
  }

  return (
    <section className="bl">
      <div className="bl-inner">
        <header className="bl-header">
          <h1 className="bl-title">
            Stories, guides and <span className="bl-grad">lessons learned</span>
          </h1>
          <p className="bl-lede">
            Practical writing on coding, careers and growing up with technology,
            from the people who teach it.
          </p>

          <div className="bl-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE_SIZE);
              }}
              placeholder="Search articles"
              aria-label="Search articles"
            />
            <kbd aria-hidden="true">/</kbd>
          </div>
        </header>

        {loading ? (
          <Skeleton />
        ) : failed ? (
          <div className="bl-notice" role="alert">
            <h2>We couldn’t load the blog</h2>
            <p>Check your connection and try again.</p>
            <button
              type="button"
              className="bl-btn"
              onClick={() => postsQuery.refetch()}
              disabled={postsQuery.isFetching}
            >
              {postsQuery.isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bl-notice">
            <h2>The first articles are on the way</h2>
            <p>We’re writing. Meanwhile, see what we teach.</p>
            <Link href="/programs" className="bl-btn">
              Browse programs
            </Link>
          </div>
        ) : (
          <>
            <div
              className="bl-tabs"
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                aria-pressed={active === "all"}
                className={`bl-tab ${active === "all" ? "is-active" : ""}`}
                onClick={() => {
                  setActive("all");
                  setShown(PAGE_SIZE);
                }}
              >
                All <span className="bl-count">{posts.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  aria-pressed={active === c.id}
                  className={`bl-tab ${active === c.id ? "is-active" : ""}`}
                  onClick={() => {
                    setActive(c.id);
                    setShown(PAGE_SIZE);
                  }}
                >
                  {c.name} <span className="bl-count">{countFor(c.id)}</span>
                </button>
              ))}
            </div>

            <p className="bl-sr" role="status" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}{" "}
              found
            </p>

            {filtered.length === 0 ? (
              <div className="bl-notice">
                <h2>No articles match that</h2>
                <p>
                  Try a different word or clear the filters to see everything.
                </p>
                <button type="button" className="bl-btn" onClick={reset}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div onPointerMove={onPointerMove}>
                {featured && <PostCard post={featured} featured />}

                <div className="bl-grid">
                  {visible.map((p) => (
                    <PostCard post={p} key={p.slug} />
                  ))}
                </div>

                {rest.length > shown && (
                  <div className="bl-more">
                    <button
                      type="button"
                      className="bl-btn bl-btn--ghost"
                      onClick={() => setShown((n) => n + PAGE_SIZE)}
                    >
                      Show more articles ({rest.length - shown} left)
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
