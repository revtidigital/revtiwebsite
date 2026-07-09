"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { slugify } from "@/utils/slugify";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  _count: { posts: number };
  createdAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const data = await getCategories();
    setCategories(data as any[]);
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
    formData.set("description", description);
    formData.set("parentId", parentId);

    startTransition(async () => {
      const res = editId
        ? await updateCategory(editId, formData)
        : await createCategory(formData);

      if (!res.success) {
        setError(res.error || "An error occurred");
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setParentId("");
        setEditId(null);
        loadCategories();
      }
    });
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setAutoSlug(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await deleteCategory(deleteId);
    if (res.success) {
      setDeleteId(null);
      loadCategories();
    }
  }

  const columns: Column<Category>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (cat) => <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>,
    },
    {
      key: "slug",
      label: "Slug",
      render: (cat) => <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">/{cat.slug}</code>,
    },
    {
      key: "description",
      label: "Description",
      render: (cat) => <span className="text-slate-500">{cat.description || "—"}</span>,
    },
    {
      key: "posts",
      label: "Posts",
      render: (cat) => <span>{cat._count?.posts ?? 0}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Categories" description="Organize your blog posts into categories." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {editId ? "Edit Category" : "Add New Category"}
          </h2>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">None</option>
                {categories.filter(c => c.id !== editId).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Update" : "Add Category"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setSlug("");
                    setDescription("");
                    setParentId("");
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={categories}
            searchKey="name"
            searchPlaceholder="Search categories..."
            actions={(cat) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Any posts inside will remain but without category."
        confirmLabel="Delete"
      />
    </div>
  );
}
