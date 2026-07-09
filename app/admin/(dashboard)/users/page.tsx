"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/users";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/utils/format";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Role } from "@prisma/client";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatar: string | null;
  createdAt: Date;
  _count: { posts: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CONTENT_MANAGER");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data as any[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    if (password) formData.set("password", password);
    formData.set("role", role);

    startTransition(async () => {
      const res = editId
        ? await updateUser(editId, formData)
        : await createUser(formData);

      if (!res.success) {
        setError(res.error || "An error occurred");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setRole("CONTENT_MANAGER");
        setEditId(null);
        loadUsers();
      }
    });
  }

  function startEdit(user: UserItem) {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(""); // Keep password blank unless updating
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await deleteUser(deleteId);
    if (!res.success) {
      setError(res.error || "Failed to delete user");
    } else {
      setDeleteId(null);
      loadUsers();
    }
  }

  const columns: Column<UserItem>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (u) => (
        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "posts",
      label: "Posts Created",
      render: (u) => <span>{u._count?.posts ?? 0}</span>,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u) => <span>{formatDate(u.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage administrator and editor permissions." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {editId ? "Edit User" : "Invite New User"}
          </h2>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password {editId && "(Leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required={!editId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? "Update" : "Create User"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setEmail("");
                    setPassword("");
                    setRole("CONTENT_MANAGER");
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
            data={users}
            searchKey="name"
            searchPlaceholder="Search users..."
            actions={(u) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => startEdit(u)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => setDeleteId(u.id)}
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
        title="Delete User"
        description="Are you sure you want to delete this user? Their posts will remain but their account will be permanently closed."
        confirmLabel="Delete"
      />
    </div>
  );
}
