"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getTags, createTag, deleteTag } from "@/actions/tags";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { slugify } from "@/utils/slugify";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
  createdAt: Date;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    const data = await getTags();
    setTags(data as any[]);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);

    startTransition(async () => {
      const res = await createTag(formData);
      if (!res.success) {
        setError(res.error || "An error occurred");
      } else {
        setName("");
        setSlug("");
        loadTags();
      }
    });
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await deleteTag(deleteId);
    if (res.success) {
      setDeleteId(null);
      loadTags();
    }
  }

  const columns: Column<Tag>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (tag) => <span className="font-medium text-slate-900 dark:text-white">{tag.name}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      render: (tag) => <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">#{tag.slug}</code>,
    },
    {
      key: "posts",
      label: "Posts",
      render: (tag) => <span>{tag._count?.posts ?? 0}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Tags" description="Create taxonomies to tag your content." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add New Tag</h2>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Slug
                <button type="button" onClick={() => setAutoSlug(!autoSlug)} className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  {autoSlug ? "Edit" : "Auto"}
                </button>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={autoSlug}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Tag"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={tags}
            searchKey="name"
            searchPlaceholder="Search tags..."
            actions={(tag) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setDeleteId(tag.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? The posts tagged with it will remain but won't have this tag."
        confirmLabel="Delete"
      />
    </div>
  );
}
