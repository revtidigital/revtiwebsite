"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function getMedia({
  page = 1,
  limit = 20,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const where: Record<string, any> = {};
  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function uploadMedia(formData: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const altText = formData.get("altText") as string || "";

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save to database
    const media = await prisma.media.create({
      data: {
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        altText,
        metadata: { blobUrl: blob.url, pathname: blob.pathname },
      },
    });

    revalidatePath("/admin/media");
    return { success: true, data: media };
  } catch (error) {
    console.error("Upload media error:", error);
    return { success: false, error: "Failed to upload media" };
  }
}

export async function updateMedia(id: string, data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const altText = data.get("altText") as string;

    const media = await prisma.media.update({
      where: { id },
      data: { altText },
    });

    revalidatePath("/admin/media");
    return { success: true, data: media };
  } catch (error) {
    console.error("Update media error:", error);
    return { success: false, error: "Failed to update media" };
  }
}

export async function deleteMedia(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: "Media not found" };

    // Delete from Vercel Blob
    try {
      await del(media.url);
    } catch (e) {
      console.error("Blob deletion error:", e);
    }

    // Delete from database
    await prisma.media.delete({ where: { id } });

    revalidatePath("/admin/media");
    return { success: true };
  } catch (error) {
    console.error("Delete media error:", error);
    return { success: false, error: "Failed to delete media" };
  }
}
