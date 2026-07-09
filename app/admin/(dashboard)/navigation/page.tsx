"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getNavigations, addNavItem, updateNavItem, deleteNavItem } from "@/actions/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  url: string;
  target: string;
  sortOrder: number;
  parentId: string | null;
  children?: NavItem[];
}

interface NavigationMenu {
  id: string;
  name: string;
  items: NavItem[];
}

export default function NavigationPage() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenu | null>(null);
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState("_self");
  const [sortOrder, setSortOrder] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMenus();
  }, []);

  async function loadMenus() {
    const data = await getNavigations();
    setMenus(data as any[]);
    if (data.length > 0) {
      // Keep selected menu if exists, else select first
      setSelectedMenu((prev) => {
        const found = data.find((m) => m.id === prev?.id);
        return found ? (found as any) : (data[0] as any);
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMenu) return;
    setError("");

    const formData = new FormData();
    formData.set("label", label);
    formData.set("url", url);
    formData.set("target", target);
    formData.set("sortOrder", String(sortOrder));

    startTransition(async () => {
      const res = editId
        ? await updateNavItem(editId, formData)
        : await addNavItem(selectedMenu.id, formData);

      if (!res.success) {
        setError(res.error || "An error occurred");
      } else {
        setLabel("");
        setUrl("");
        setTarget("_self");
        setSortOrder(0);
        setEditId(null);
        loadMenus();
      }
    });
  }

  function startEdit(item: NavItem) {
    setEditId(item.id);
    setLabel(item.label);
    setUrl(item.url);
    setTarget(item.target);
    setSortOrder(item.sortOrder);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await deleteNavItem(deleteId);
    if (res.success) {
      setDeleteId(null);
      loadMenus();
    }
  }

  return (
    <div>
      <PageHeader title="Navigation" description="Build and manage headers and footers menus." />

      <div className="flex gap-4 mb-6">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setSelectedMenu(menu)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedMenu?.id === menu.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            {menu.name.toUpperCase()} Menu
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {editId ? "Edit Menu Link" : "Add New Link"}
          </h2>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. Contact Us"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL / Path</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. /contact or https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Update" : "Add Link"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setLabel("");
                    setUrl("");
                    setTarget("_self");
                    setSortOrder(0);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List of links */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Menu Structure</h2>
          <div className="space-y-2">
            {selectedMenu?.items.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No links in this menu yet.</p>
            ) : (
              selectedMenu?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      Order: {item.sortOrder}
                    </span>
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Navigation Item"
        description="Are you sure you want to delete this link from the menu?"
        confirmLabel="Delete"
      />
    </div>
  );
}
