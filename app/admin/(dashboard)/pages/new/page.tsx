import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "../page-form";

export const metadata = { title: "New Page" };

export default function NewPageFormPage() {
  return (
    <div>
      <PageHeader title="Create New Page" description="Create a new static page." />
      <PageForm />
    </div>
  );
}
