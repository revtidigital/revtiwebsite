import { getPosts } from "@/actions/posts";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/format";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function PublicHomePage() {
  const { data: posts } = await getPosts({ limit: 3, status: "PUBLISHED" });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Create, Manage, Scale.
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium">
          A high-performance, developer-friendly CMS built on Next.js 15, Neon Postgres, and Tailwind CSS.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/blog"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 group"
          >
            Explore Blog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </section>

      {/* Featured / Latest Posts */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest from the blog</h2>
            <p className="text-slate-500 mt-1">Stay updated with our latest news and engineering updates.</p>
          </div>
          <Link href="/blog" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
            All posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
            <div className="col-span-full text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="font-semibold">No posts published yet</p>
              <p className="text-sm mt-1">Check back later or log in to admin to add posts.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
