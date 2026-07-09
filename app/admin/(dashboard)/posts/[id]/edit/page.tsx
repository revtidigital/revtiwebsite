import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../../post-form";
import { getPostById } from "@/actions/posts";
import { getCategories } from "@/actions/categories";
import { getTags } from "@/actions/tags";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Post" };

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageParams) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getCategories(),
    getTags(),
  ]);

  if (!post) notFound();

  return (
    <div>
      <PageHeader title="Edit Post" description={`Editing: ${post.title}`} />
      <PostForm post={post as any} categories={categories as any[]} tags={tags as any[]} />
    </div>
  );
}
