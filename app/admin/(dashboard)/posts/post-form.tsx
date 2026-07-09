"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/actions/posts";
import { slugify } from "@/utils/slugify";
import { cn } from "@/utils/cn";
import { Loader2, Save, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  _count?: { posts: number };
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
  createdAt: Date;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: unknown;
  contentHtml?: string | null;
  status: string;
  featuredImage?: string | null;
  categoryId?: string | null;
  tags: { id: string; name: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface PostFormProps {
  post?: PostData;
  categories: Category[];
  tags: Tag[];
}

export function PostForm({ post, categories, tags }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!post);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags.map(t => t.id) || []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  }

  function handleSubmit(status: string) {
    setError("");
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("status", status);
    
    const form = document.getElementById("post-form") as HTMLFormElement;
    const data = new FormData(form);
    
    formData.set("excerpt", data.get("excerpt") as string || "");
    formData.set("contentHtml", data.get("contentHtml") as string || "");
    formData.set("categoryId", data.get("categoryId") as string || "");
    formData.set("featuredImage", data.get("featuredImage") as string || "");
    formData.set("seoTitle", data.get("seoTitle") as string || "");
    formData.set("seoDescription", data.get("seoDescription") as string || "");
    
    selectedTags.forEach(tagId => formData.append("tagIds", tagId));

    startTransition(async () => {
      const result = post
        ? await updatePost(post.id, formData)
        : await createPost(formData);

      if (!result.success) {
        setError(result.error || "Something went wrong");
      } else {
        router.push("/admin/posts");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/posts"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form id="post-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Title & Slug */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg"
              placeholder="Enter post title..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Slug
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {autoSlug ? "Edit manually" : "Auto-generate"}
              </button>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={autoSlug}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-60"
              placeholder="post-url-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              placeholder="Brief description of the post..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
          <textarea
            name="contentHtml"
            rows={12}
            defaultValue={post?.contentHtml || ""}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y font-mono text-sm"
            placeholder="Write your content here (HTML supported)..."
          />
        </div>

        {/* Sidebar Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <select
              name="categoryId"
              defaultValue={post?.categoryId || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Featured Image URL</label>
            <input
              type="text"
              name="featuredImage"
              defaultValue={post?.featuredImage || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag.id)
                      ? prev.filter(id => id !== tag.id)
                      : [...prev, tag.id]
                  );
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  selectedTags.includes(tag.id)
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-500"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {tag.name}
              </button>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-slate-500">No tags created yet.</p>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">SEO Settings</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Title</label>
            <input
              type="text"
              name="seoTitle"
              defaultValue={post?.seoTitle || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="SEO title (max 70 chars)"
              maxLength={70}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Description</label>
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={post?.seoDescription || ""}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              placeholder="SEO description (max 160 chars)"
              maxLength={160}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}
