import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const media = await prisma.media.create({
      data: {
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        altText: file.name.split(".")[0],
        metadata: { blobUrl: blob.url, pathname: blob.pathname },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("API upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
