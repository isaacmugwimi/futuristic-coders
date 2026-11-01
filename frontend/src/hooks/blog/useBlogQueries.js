"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllBlogCategories,
  getPostBySlug,
  getPublishedPosts,
} from "../../services/blog/blog.service";

// `initialData` is optional. The server page passes what it already fetched so
// the first paint has real content (better for SEO, no loading flash).
export const usePublishedPosts = (initialData) => {
  return useQuery({
    queryKey: ["blog", "published"],
    queryFn: getPublishedPosts,
    initialData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBlogCategories = (initialData) => {
  return useQuery({
    queryKey: ["blog", "categories"],
    queryFn: getAllBlogCategories,
    initialData,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePostBySlug = (slug, initialData) => {
  return useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    initialData,
    staleTime: 1000 * 60 * 5,
  });
};