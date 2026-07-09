"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deletePost } from "@/actions/posts";
import { POST_STATUS_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { PostStatus } from "@prisma/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  createdAt: Date;
  author: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
  [key: string]: unknown;
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<Post>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (post) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{post.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">/{post.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (post) => (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", POST_STATUS_COLORS[post.status])}>
          {post.status}
        </span>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (post) => <span>{post.author?.name}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (post) => <span>{post.category?.name || "—"}</span>,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (post) => <span>{formatRelativeTime(post.createdAt)}</span>,
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    await deletePost(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={posts}
        searchKey="title"
        searchPlaceholder="Search posts..."
        actions={(post) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/posts/${post.id}/edit`}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </Link>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteId(post.id); }}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
