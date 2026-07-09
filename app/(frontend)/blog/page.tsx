import { getPosts } from "@/actions/posts";
import { getCategories } from "@/actions/categories";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/format";
import { Clock, Tag, BookOpen } from "lucide-react";

export const revalidate = 60; // ISR cache

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const { category, page } = await searchParams;
  const currentPage = Number(page || "1");

  const [postsRes, categories] = await Promise.all([
    getPosts({
      page: currentPage,
      limit: 12,
      status: "PUBLISHED",
      statusFilter: "PUBLISHED", // Fallback parameter name if any
    } as any),
    getCategories(),
  ]);

  const posts = postsRes.data;
  const totalPages = postsRes.totalPages;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Blog</h1>
        <p className="text-slate-500 mt-1">Discover insights, tutorials, and site updates.</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !category
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          }`}
        >
          All Categories
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/blog?category=${cat.slug}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat.slug
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
          >
            {post.featuredImage && (
              <div className="aspect-video w-full relative overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {post.category && (
                  <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {post.category.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeTime(post.createdAt)}
                </span>
              </div>
              <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-xxs uppercase">
                  {post.author.name.charAt(0)}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{post.author.name}</span>
              </div>
            </div>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="font-semibold">No posts found</p>
            <p className="text-sm mt-1">Try selecting a different category or check back later.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-8">
          <Link
            href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors ${
              currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50"
            }`}
          >
            Previous
          </Link>
          <span className="px-4 py-2 text-sm text-slate-500 flex items-center">
            {currentPage} of {totalPages}
          </span>
          <Link
            href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors ${
              currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-50"
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
