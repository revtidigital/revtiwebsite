import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

// One-time bootstrap route to create the initial Super Admin on a fresh
// production database (Vercel serverless — no shell access to run db:seed).
//
// Safety:
//  - Refuses to run once ANY user exists (idempotent, can't be abused later).
//  - If SETUP_SECRET env is set, it must be passed as ?secret=... .
//
// Usage: POST (or GET) https://<your-app>/api/setup?secret=<SETUP_SECRET>
// Optional env: ADMIN_EMAIL, ADMIN_PASSWORD (default admin@revti.com / admin123)

export const dynamic = "force-dynamic";

async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const expected = process.env.SETUP_SECRET;

    if (expected && secret !== expected) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing setup secret." },
        { status: 401 }
      );
    }

    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Setup already completed — users exist. This endpoint is disabled.",
        },
        { status: 403 }
      );
    }

    const email = process.env.ADMIN_EMAIL || "admin@revti.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const passwordHash = await hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        passwordHash,
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Super Admin created. You can now log in at /admin/login.",
      email: admin.email,
      note:
        process.env.ADMIN_PASSWORD
          ? "Password is the ADMIN_PASSWORD you set."
          : "Default password is 'admin123' — change it after first login.",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Setup failed. Ensure DATABASE_URL is configured on Vercel and the schema is pushed (prisma db push).",
      },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
