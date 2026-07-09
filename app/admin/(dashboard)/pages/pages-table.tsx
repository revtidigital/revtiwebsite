"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deletePage } from "@/actions/pages";
import { PAGE_STATUS_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { PageStatus } from "@prisma/client";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  template: string;
  sortOrder: number;
  createdAt: Date;
  [key: string]: unknown;
}

export function PagesTable({ pages }: { pages: PageItem[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<PageItem>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (page) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{page.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">/{page.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (page) => (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", PAGE_STATUS_COLORS[page.status])}>
          {page.status}
        </span>
      ),
    },
    {
      key: "template",
      label: "Template",
      render: (page) => <span className="capitalize">{page.template}</span>,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (page) => <span>{formatRelativeTime(page.createdAt)}</span>,
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    await deletePage(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={pages}
        searchKey="title"
        searchPlaceholder="Search pages..."
        actions={(page) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/pages/${page.id}/edit`}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </Link>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteId(page.id); }}
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
        title="Delete Page"
        description="Are you sure you want to delete this page? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
