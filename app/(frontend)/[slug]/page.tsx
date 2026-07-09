import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CMSPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return pages.map((page: { slug: string }) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: CMSPageProps) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page) return {};

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || "",
  };
}

export default async function CMSPage({ params }: CMSPageProps) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back to home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {page.title}
        </h1>
      </div>

      {/* Content */}
      <div
        className="prose prose-slate dark:prose-invert max-w-none text-slate-750 dark:text-slate-350 leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: page.contentHtml || "" }}
      />
    </article>
  );
}
