import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/format";
import { Clock, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
  };
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      {/* Header */}
      <div className="space-y-4">
        {post.category && (
          <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            {post.category.name}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-500 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-700 dark:text-slate-350">
              {post.author.name.charAt(0)}
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{post.author.name}</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video w-full relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <img src={post.featuredImage} alt={post.title} className="object-cover w-full h-full" />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-slate dark:prose-invert max-w-none text-slate-750 dark:text-slate-300 leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
          {post.tags.map((tag: { name: string; slug: string }) => (
            <span
              key={tag.slug}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl font-medium"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
