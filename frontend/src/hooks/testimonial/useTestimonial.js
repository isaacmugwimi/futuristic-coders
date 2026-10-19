// hooks/useTestimonials.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// import { fetchTestimonials } from "../../services/testimonial/testimonial.service";
import {
  fetchTestimonials,
  postTestimonial,
} from "../../services/testimonial/testimonial.service";

const PAGE_SIZE = 6;

export function useTestimonials(initial) {
  const [items, setItems] = useState(initial?.data ?? []);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [stats, setStats] = useState(initial?.stats ?? null);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(null);
  const skipFirst = useRef(Boolean(initial));

  const load = useCallback(
    async (nextPage, append) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTestimonials({
          page: nextPage,
          limit: PAGE_SIZE,
          rating,
          sort,
        });
        setItems((prev) => (append ? [...prev, ...res.data] : res.data));
        setTotal(res.total);
        if (res.stats) setStats(res.stats);
        setPage(nextPage);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [rating, sort],
  );

  // Refetch from page 1 when filter or sort changes (server data covers the first render)
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    load(1, false);
  }, [load]);

  return {
    items,
    total,
    stats,
    rating,
    sort,
    loading,
    error,
    hasMore: items.length < total,
    setRating,
    setSort,
    loadMore: () => load(page + 1, true),
    retry: () => load(1, false),
  };
}

export function useSubmitTestimonial() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");

  const submit = async (payload) => {
    setStatus("submitting");
    setMessage("");
    try {
      const res = await postTestimonial(payload);
      setMessage(res.message);
      setStatus("success");
      return true;
    } catch (e) {
      setMessage(e.message);
      setStatus("error");
      return false;
    }
  };

  return { status, message, submit, reset: () => setStatus("idle") };
}
