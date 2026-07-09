"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function getPosts({
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
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      category: true,
      tags: true,
    },
  });
}

export async function createPost(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = Object.fromEntries(data.entries());
    const tagIds = data.getAll("tagIds") as string[];

    const parsed = createPostSchema.safeParse({
      ...raw,
      tagIds,
      content: raw.content ? JSON.parse(raw.content as string) : null,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const { tagIds: tags, ...postData } = parsed.data;

    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: session.user.id,
        publishedAt: postData.status === "PUBLISHED" ? new Date() : null,
        tags: tags.length > 0 ? { connect: tags.map((id) => ({ id })) } : undefined,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true, data: post };
  } catch (error) {
    console.error("Create post error:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function updatePost(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = Object.fromEntries(data.entries());
    const tagIds = data.getAll("tagIds") as string[];

    const parsed = updatePostSchema.safeParse({
      ...raw,
      tagIds,
      content: raw.content ? JSON.parse(raw.content as string) : undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const { tagIds: tags, ...postData } = parsed.data;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        publishedAt:
          postData.status === "PUBLISHED" && !existingPost.publishedAt
            ? new Date()
            : postData.status !== "PUBLISHED"
              ? null
              : existingPost.publishedAt,
        tags: tags
          ? { set: [], connect: tags.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${id}/edit`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return { success: true, data: post };
  } catch (error) {
    console.error("Update post error:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function deletePost(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.post.delete({ where: { id } });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Delete post error:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
