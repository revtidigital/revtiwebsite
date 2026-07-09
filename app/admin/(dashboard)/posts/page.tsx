import { getPosts } from "@/actions/posts";
import { PageHeader } from "@/components/admin/page-header";
import { PostsTable } from "./posts-table";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Posts" };

export default async function PostsPage() {
  const { data: posts } = await getPosts({ limit: 100 });

  return (
    <div>
      <PageHeader title="Posts" description="Create and manage your blog posts.">
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </PageHeader>
      <PostsTable posts={posts as any[]} />
    </div>
  );
}
