import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../post-form";
import { getCategories } from "@/actions/categories";
import { getTags } from "@/actions/tags";

export const metadata = { title: "New Post" };

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <div>
      <PageHeader title="Create New Post" description="Write and publish a new blog post." />
      <PostForm categories={categories as any[]} tags={tags as any[]} />
    </div>
  );
}
