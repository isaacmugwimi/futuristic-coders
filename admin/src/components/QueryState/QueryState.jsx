"use client";

import "./QueryState.css";
import { CloudOff, Lock, RefreshCw, SearchX, ServerCrash } from "lucide-react";

/**
 * True while there is nothing to show yet: the first load is running, or it
 * failed and there is no cached data. A failed background refetch with data
 * already on screen is NOT blocked, so the page keeps showing what it has.
 */
export function isBlocked(query) {
  return Boolean(
    query.isLoading || (query.isError && query.data === undefined),
  );
}

/** Picks an icon and wording from the error. Works with fetch and axios style errors. */
function describeError(error, resource) {
  const status = error?.status ?? error?.response?.status;

  if (status === 401)
    return {
      Icon: Lock,
      title: "Your session has expired",
      text: "Sign in again to keep going.",
      canRetry: true,
    };
  if (status === 403)
    return {
      Icon: Lock,
      title: "You don’t have access",
      text: `You don’t have permission to view ${resource}.`,
      canRetry: false,
    };
  if (status === 404)
    return {
      Icon: SearchX,
      title: `We couldn’t find ${resource}`,
      text: "It may have been moved or deleted.",
      canRetry: true,
    };
  if (status >= 500)
    return {
      Icon: ServerCrash,
      title: "Something went wrong on our side",
      text: "Please try again in a moment. Nothing has been changed.",
      canRetry: true,
    };
  return {
    Icon: CloudOff,
    title: `Couldn’t load ${resource}`,
    text: "Check your connection and try again. Nothing has been changed.",
    canRetry: true,
  };
}

function Skel({ className = "" }) {
  return <span className={`fc-qs__skel ${className}`} />;
}

/* ---------------- loading views ---------------- */

function TableSkeleton({ rows, stats }) {
  return (
    <>
      {stats > 0 && (
        <div className="fc-qs__stats" aria-hidden="true">
          {Array.from({ length: stats }, (_, i) => (
            <div className="fc-qs__stat" key={i}>
              <Skel className="fc-qs__skel--icon" />
              <div className="fc-qs__stack">
                <Skel className="fc-qs__skel--value" />
                <Skel className="fc-qs__skel--label" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fc-qs__card" aria-hidden="true">
        <div className="fc-qs__toolbar">
          <Skel className="fc-qs__skel--search" />
          <Skel className="fc-qs__skel--select" />
          <Skel className="fc-qs__skel--select" />
          <Skel className="fc-qs__skel--select" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div className="fc-qs__row" key={i}>
            <Skel className="fc-qs__skel--thumb" />
            <div className="fc-qs__stack fc-qs__stack--grow">
              <Skel className="fc-qs__skel--title" />
              <Skel className="fc-qs__skel--sub" />
            </div>
            <Skel className="fc-qs__skel--pill" />
            <Skel className="fc-qs__skel--cell" />
            <Skel className="fc-qs__skel--cell" />
          </div>
        ))}
      </div>
    </>
  );
}

function CardsSkeleton({ rows }) {
  return (
    <div className="fc-qs__tiles" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="fc-qs__tile" key={i}>
          <Skel className="fc-qs__skel--banner" />
          <Skel className="fc-qs__skel--title" />
          <Skel className="fc-qs__skel--sub" />
          <Skel className="fc-qs__skel--sub fc-qs__skel--short" />
          <Skel className="fc-qs__skel--pill" />
        </div>
      ))}
    </div>
  );
}

function PageSpinner({ resource }) {
  return (
    <div className="fc-qs__center" aria-hidden="true">
      <span className="fc-qs__spinner" />
      <p className="fc-qs__center-text">Loading {resource}…</p>
    </div>
  );
}

/* ---------------- error view ---------------- */

function ErrorView({ query, resource, compact }) {
  const { Icon, title, text, canRetry } = describeError(query.error, resource);
  const retrying = query.isFetching;
  const message = query.error?.message;

  return (
    <div className={`fc-qs__card${compact ? " fc-qs__card--compact" : ""}`}>
      <div className="fc-qs__state" role="alert">
        <span className="fc-qs__state-icon">
          <Icon size={compact ? 22 : 26} aria-hidden="true" />
        </span>
        <h3>{title}</h3>
        <p>{text}</p>
        {message && <p className="fc-qs__detail">{message}</p>}
        {canRetry && (
          <button
            type="button"
            className="fc-qs__retry"
            onClick={() => query.refetch()}
            disabled={retrying}
          >
            <RefreshCw
              size={16}
              className={retrying ? "is-spinning" : undefined}
              aria-hidden="true"
            />
            {retrying ? "Retrying…" : "Try again"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Shared loading and error screen for any React Query result.
 *
 *   const query = usePrograms();
 *   if (isBlocked(query))
 *     return <QueryState query={query} resource="programs" variant="table" />;
 *
 * Props
 *   query     the object returned by useQuery / your custom hook
 *   resource  plain-language name used in messages ("programs", "learners")
 *   variant   "page" (spinner, default) | "table" (stats + table) | "cards" (grid)
 *   rows      skeleton rows (table) or tiles (cards). Default 6
 *   stats     summary cards shown in the table skeleton. Default 5, use 0 to hide
 *   compact   smaller error card for widgets inside a page
 */
export default function QueryState({
  query,
  resource = "data",
  variant = "page",
  rows = 6,
  stats = 5,
  compact = false,
}) {
  if (query.isLoading) {
    return (
      <div className="fc-qs" role="status" aria-busy="true" aria-live="polite">
        <span className="fc-qs__sr">Loading {resource}…</span>
        {variant === "table" && <TableSkeleton rows={rows} stats={stats} />}
        {variant === "cards" && <CardsSkeleton rows={rows} />}
        {variant !== "table" && variant !== "cards" && (
          <PageSpinner resource={resource} />
        )}
      </div>
    );
  }

  if (query.isError && query.data === undefined) {
    return (
      <div className="fc-qs">
        <ErrorView query={query} resource={resource} compact={compact} />
      </div>
    );
  }

  return null;
}