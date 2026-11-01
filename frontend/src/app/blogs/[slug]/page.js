// src/app/blog/[slug]/page.js
import { notFound } from "next/navigation";
import {
  buildBlogCatalog,
  normalizePost,
  relatedPosts,
} from "../../../components/Blogs/BlogAdapter";
import { API_PATHS, BASE_URL } from "../../../utils/apiPaths";
import BlogPost from "../../../components/Blogs/BlogPost/BlogPost";

const SITE_URL = "https://www.futuristiccoders.co.ke";
const LOGO_URL = `${SITE_URL}/flogo.png`;
const ORG_ID = `${SITE_URL}/#organization`;

export const revalidate = 300;

async function getJson(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function loadPost(slug) {
  const res = await getJson(API_PATHS.BLOG.GET_PUBLISHED_BY_SLUG(slug));
  return res?.data ? normalizePost(res.data) : null;
}

export async function generateStaticParams() {
  const res = await getJson(API_PATHS.BLOG.GET_PUBLISHED);
  return (res?.data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };

  const description =
    post.excerpt || post.content.replace(/[#*_`>\[\]]/g, "").slice(0, 155);
  const url = `${SITE_URL}/blogs/${encodeURIComponent(post.slug)}`;
  const title = `${post.title} | Futuristic Coders`;
  const image = post.image || LOGO_URL;

  return {
    title: { absolute: title },
    description,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      siteName: "Futuristic Coders",
      locale: "en_KE",
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [{ url: image, alt: post.imageAlt }],
    },
    twitter: {
      card: post.image ? "summary_large_image" : "summary",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const [postsRes, catsRes] = await Promise.all([
    getJson(API_PATHS.BLOG.GET_PUBLISHED),
    getJson(API_PATHS.BLOG.CATEGORIES.GET_ALL),
  ]);
  const { posts } = buildBlogCatalog(catsRes?.data ?? [], postsRes?.data ?? []);
  const related = relatedPosts(posts, post, 3);

  const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        image: post.image ? [post.image] : undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { "@type": "Person", name: post.author.name },
        publisher: { "@id": ORG_ID },
        keywords: post.tags.join(", "),
        inLanguage: "en-KE",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "EducationalOrganization",
        "@id": ORG_ID,
        name: "Futuristic Coders",
        url: SITE_URL,
        logo: LOGO_URL,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BlogPost post={post} related={related} />
    </>
  );
}