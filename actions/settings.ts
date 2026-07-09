"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth-utils";
import { updateSettingsSchema } from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";
import type { ActionResponse, SiteSettings } from "@/types";

export async function getSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSetting.findMany();
  const result: Record<string, string | number> = {};

  for (const setting of settings) {
    try {
      result[setting.key] = JSON.parse(setting.value as string);
    } catch {
      result[setting.key] = setting.value as string;
    }
  }

  return result as unknown as SiteSettings;
}

export async function updateSettings(data: FormData): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, "ADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = Object.fromEntries(data.entries());
    const parsed = updateSettingsSchema.safeParse({
      ...raw,
      posts_per_page: raw.posts_per_page ? Number(raw.posts_per_page) : undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const updates = Object.entries(parsed.data).filter(([, v]) => v !== undefined);

    for (const [key, value] of updates) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
