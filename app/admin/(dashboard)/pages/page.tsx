import { getPages } from "@/actions/pages";
export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/admin/page-header";
import { PagesTable } from "./pages-table";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Pages" };

export default async function PagesListPage() {
  const { data: pages } = await getPages({ limit: 100 });

  return (
    <div>
      <PageHeader title="Pages" description="Create and manage your static pages.">
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </PageHeader>
      <PagesTable pages={pages as any[]} />
    </div>
  );
}
