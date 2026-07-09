"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const navItemSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  target: z.string().default("_self"),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
});

export async function getNavigations() {
  return prisma.navigation.findMany({
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          children: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}

export async function getNavigationByName(name: string) {
  return prisma.navigation.findUnique({
    where: { name },
    include: {
      items: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}

export async function addNavItem(navigationId: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = navItemSchema.safeParse({
      ...raw,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const item = await prisma.navigationItem.create({
      data: {
        ...parsed.data,
        navigationId,
      },
    });

    revalidatePath("/admin/navigation");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    console.error("Add nav item error:", error);
    return { success: false, error: "Failed to add navigation item" };
  }
}

export async function updateNavItem(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const raw = Object.fromEntries(data.entries());
    const parsed = navItemSchema.safeParse({
      ...raw,
      sortOrder: raw.sortOrder ? Number(raw.sortOrder) : 0,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const item = await prisma.navigationItem.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/navigation");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    console.error("Update nav item error:", error);
    return { success: false, error: "Failed to update navigation item" };
  }
}

export async function deleteNavItem(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.navigationItem.delete({ where: { id } });
    revalidatePath("/admin/navigation");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete nav item error:", error);
    return { success: false, error: "Failed to delete navigation item" };
  }
}
