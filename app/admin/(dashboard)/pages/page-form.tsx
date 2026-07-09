"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPage, updatePage } from "@/actions/pages";
import { slugify } from "@/utils/slugify";
import { Loader2, Save, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content?: unknown;
  contentHtml?: string | null;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  template: string;
  sortOrder: number;
}

export function PageForm({ page }: { page?: PageData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!page);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  }

  function handleSubmit(status: string) {
    setError("");
    const form = document.getElementById("page-form") as HTMLFormElement;
    const data = new FormData(form);
    data.set("title", title);
    data.set("slug", slug);
    data.set("status", status);

    startTransition(async () => {
      const result = page ? await updatePage(page.id, data) : await createPage(data);
      if (!result.success) {
        setError(result.error || "Something went wrong");
      } else {
        router.push("/admin/pages");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pages" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form id="page-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg" placeholder="Page title..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Slug
              <button type="button" onClick={() => setAutoSlug(!autoSlug)} className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                {autoSlug ? "Edit manually" : "Auto-generate"}
              </button>
            </label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={autoSlug} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-60" placeholder="page-url-slug" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
          <textarea name="contentHtml" rows={12} defaultValue={page?.contentHtml || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y font-mono text-sm" placeholder="Page content (HTML supported)..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Template</label>
            <select name="template" defaultValue={page?.template || "default"} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
              <option value="default">Default</option>
              <option value="full-width">Full Width</option>
              <option value="sidebar">With Sidebar</option>
            </select>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sort Order</label>
            <input type="number" name="sortOrder" defaultValue={page?.sortOrder || 0} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">SEO Settings</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Title</label>
            <input type="text" name="seoTitle" defaultValue={page?.seoTitle || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="SEO title" maxLength={70} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Description</label>
            <textarea name="seoDescription" rows={2} defaultValue={page?.seoDescription || ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" placeholder="SEO description" maxLength={160} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => handleSubmit("DRAFT")} disabled={isPending} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button type="button" onClick={() => handleSubmit("PUBLISHED")} disabled={isPending} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}
