import { z } from "zod";

export const updateSettingsSchema = z.object({
  site_name: z.string().min(1).max(100).optional(),
  site_description: z.string().max(500).optional(),
  site_logo: z.string().url().or(z.literal("")).optional(),
  site_favicon: z.string().url().or(z.literal("")).optional(),
  seo_title: z.string().max(70).optional(),
  seo_description: z.string().max(160).optional(),
  social_twitter: z.string().url().or(z.literal("")).optional(),
  social_facebook: z.string().url().or(z.literal("")).optional(),
  social_instagram: z.string().url().or(z.literal("")).optional(),
  social_linkedin: z.string().url().or(z.literal("")).optional(),
  footer_text: z.string().max(500).optional(),
  posts_per_page: z.number().int().min(1).max(100).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
