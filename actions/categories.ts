"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: { select: { posts: true } },
        children: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Could not fetch categories from database", error);
    return [];
  }
}

export async function createCategory(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = createCategorySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const category = await prisma.category.create({ data: parsed.data });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = updateCategorySchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
