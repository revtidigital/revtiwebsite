"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function getTags() {
  try {
    return await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Could not fetch tags from database", error);
    return [];
  }
}

export async function createTag(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = tagSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const tag = await prisma.tag.create({ data: parsed.data });
    revalidatePath("/admin/tags");
    return { success: true, data: tag };
  } catch (error) {
    console.error("Create tag error:", error);
    return { success: false, error: "Failed to create tag" };
  }
}

export async function deleteTag(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.tag.delete({ where: { id } });
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error) {
    console.error("Delete tag error:", error);
    return { success: false, error: "Failed to delete tag" };
  }
}
