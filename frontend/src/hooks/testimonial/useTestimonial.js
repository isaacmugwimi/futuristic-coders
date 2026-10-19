// src/hooks/testimonials/useTestimonials.js  (public website)
"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  getPublishedTestimonials,
  getFeaturedTestimonials,
  submitTestimonial,
} from "../../services/testimonial/testimonial.service";

const PAGE_SIZE = 6;
const STALE_TIME = 1000 * 60 * 5;
const DEFAULT_SUCCESS =
  "Thanks! Your review will appear once our team approves it.";

// ----------------------------------------------------------------------------
// QUERY KEYS
//
// ["testimonials", "published", { rating, sort }]   paged list (load more)
// ["testimonials", "featured", limit]               featured strip
// ----------------------------------------------------------------------------

// ============================================================================
// RESPONSE MAPPING (the service returns the raw API body)
// Backend rows are snake_case; the page components use camelCase.
// ============================================================================

const readRows = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  return payload?.testimonials ?? res?.testimonials ?? [];
};

const readTotal = (res) =>
  Number(
    res?.total ??
      res?.pagination?.total ??
      res?.data?.total ??
      readRows(res).length,
  );

const readStats = (res) => res?.stats ?? res?.data?.stats ?? null;

const toTestimonial = (t) => ({
  id: t.id,
  name: t.name,
  relationship: t.relationship,
  rating: Number(t.rating),
  message: t.message,
  featured: Boolean(t.featured),
  createdAt: t.createdAt ?? t.created_at ?? null,
});

const toStats = (raw, fallbackCount) => {
  if (!raw) return null;
  const source = raw.breakdown ?? raw.rating_breakdown ?? {};
  const breakdown = {};
  for (const n of [1, 2, 3, 4, 5]) breakdown[n] = Number(source[n] ?? 0);

  return {
    average: Number(raw.average ?? raw.average_rating ?? 0),
    count: Number(raw.count ?? raw.total ?? fallbackCount ?? 0),
    breakdown,
  };
};

// Validation errors arrive as { message, errors: [{ field, message }] }.
const getErrorMessage = (error) =>
  error?.response?.data?.errors?.[0]?.message ??
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";

// Defined outside the hooks so React Query can reuse the result.
const selectPublished = (data) => {
  const pages = data.pages;
  const total = readTotal(pages[pages.length - 1]);

  return {
    items: pages.flatMap((page) => readRows(page).map(toTestimonial)),
    total,
    stats: toStats(readStats(pages[0]), total),
  };
};

const selectFeatured = (res) => readRows(res).map(toTestimonial);

// ============================================================================
// PUBLISHED TESTIMONIALS (filter, sort, load more)
// ============================================================================

// initial (optional): the raw page-1 response for the default filters,
// e.g. fetched on the server, so the first paint needs no request.
export const useTestimonials = (initial) => {
  const [rating, setRating] = useState(0); // 0 = all ratings
  const [sort, setSort] = useState("newest");

  const isDefault = rating === 0 && sort === "newest";

  const query = useInfiniteQuery({
    queryKey: ["testimonials", "published", { rating, sort }],
    queryFn: ({ pageParam }) =>
      getPublishedTestimonials({
        page: pageParam,
        limit: PAGE_SIZE,
        rating,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, page) => sum + readRows(page).length,
        0,
      );
      return loaded < readTotal(lastPage) ? allPages.length + 1 : undefined;
    },
    // Only seed the default filter. Other filters must hit the server.
    initialData:
      initial && isDefault ? { pages: [initial], pageParams: [1] } : undefined,
    select: selectPublished,
    staleTime: STALE_TIME,
    // Keeps the current cards on screen while a new filter loads.
    placeholderData: (previousData) => previousData,
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    stats: query.data?.stats ?? null,
    rating,
    sort,
    loading:
      query.isLoading || query.isFetchingNextPage || query.isPlaceholderData,
    error: query.isError ? getErrorMessage(query.error) : null,
    hasMore: Boolean(query.hasNextPage),
    setRating,
    setSort,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
    retry: () => query.refetch(),
  };
};

// ============================================================================
// FEATURED TESTIMONIALS
// ============================================================================

export const useFeaturedTestimonials = (limit = 3) => {
  return useQuery({
    queryKey: ["testimonials", "featured", limit],
    queryFn: () => getFeaturedTestimonials({ limit }),
    select: selectFeatured,
    staleTime: STALE_TIME,
  });
};

// ============================================================================
// SUBMIT A TESTIMONIAL
// ============================================================================

// The backend rejects unknown fields, so only these are sent.
const toSubmitPayload = (p) => ({
  name: p.name,
  email: p.email,
  relationship: p.relationship,
  rating: Number(p.rating),
  message: p.message,
  ...(p.website ? { website: p.website } : {}), // honeypot, normally empty
});

export const useSubmitTestimonial = () => {
  // Nothing to invalidate: a new review is "pending" and not public yet.
  const mutation = useMutation({
    mutationFn: (payload) => submitTestimonial(toSubmitPayload(payload)),
  });

  const status = mutation.status === "pending" ? "submitting" : mutation.status; // idle | submitting | success | error

  const message = mutation.isSuccess
    ? (mutation.data?.message ?? DEFAULT_SUCCESS)
    : mutation.isError
      ? getErrorMessage(mutation.error)
      : "";

  const submit = async (payload) => {
    try {
      await mutation.mutateAsync(payload);
      return true;
    } catch {
      return false; // the error message is exposed through `message`
    }
  };

  return { status, message, submit, reset: mutation.reset };
};
