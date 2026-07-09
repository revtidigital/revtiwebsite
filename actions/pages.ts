"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPageSchema, updatePageSchema } from "@/lib/validations/page";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function getPages({
  page = 1,
  limit = 10,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [data, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.page.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}

export async function createPage(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = createPageSchema.safeParse({
      ...raw,
      content: raw.content ? JSON.parse(raw.content as string) : null,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const page = await prisma.page.create({
      data: {
        ...parsed.data,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true, data: page };
  } catch (error) {
    console.error("Create page error:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function updatePage(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = updatePageSchema.safeParse({
      ...raw,
      content: raw.content ? JSON.parse(raw.content as string) : undefined,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const page = await prisma.page.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true, data: page };
  } catch (error) {
    console.error("Update page error:", error);
    return { success: false, error: "Failed to update page" };
  }
}

export async function deletePage(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    console.error("Delete page error:", error);
    return { success: false, error: "Failed to delete page" };
  }
}
