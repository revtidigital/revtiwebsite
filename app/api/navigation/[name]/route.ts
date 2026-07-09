import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ name: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { name } = await params;
    const navigation = await prisma.navigation.findUnique({
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

    if (!navigation) {
      return NextResponse.json({ error: "Navigation menu not found" }, { status: 404 });
    }

    return NextResponse.json(navigation.items);
  } catch (error) {
    console.error("API navigation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
