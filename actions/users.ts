"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireRole, hashPassword, hasPermission } from "@/lib/auth-utils";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      avatar: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "ADMIN")) {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const raw = Object.fromEntries(data.entries());
    const parsed = createUserSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: { id: user.id, name: user.name, email: user.email } };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function updateUser(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "ADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = Object.fromEntries(data.entries());
    const parsed = updateUserSchema.safeParse({
      ...raw,
      isActive: raw.isActive === "true",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (parsed.data.password) {
      updateData.passwordHash = await hashPassword(parsed.data.password);
      delete updateData.password;
    } else {
      delete updateData.password;
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });
    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function deleteUser(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "SUPER_ADMIN")) {
      return { success: false, error: "Only Super Admins can delete users" };
    }

    if (session.user.id === id) {
      return { success: false, error: "You cannot delete your own account" };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
