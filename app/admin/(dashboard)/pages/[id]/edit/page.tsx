import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "../../page-form";
import { getPageById } from "@/actions/pages";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Page" };

interface EditPageParams {
  params: Promise<{ id: string }>;
}

export default async function EditPageFormPage({ params }: EditPageParams) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div>
      <PageHeader title="Edit Page" description={`Editing: ${page.title}`} />
      <PageForm page={page as any} />
    </div>
  );
}
