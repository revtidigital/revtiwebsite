import { z } from "zod";

export const updateMediaSchema = z.object({
  altText: z.string().max(200).optional().nullable(),
  metadata: z.any().optional().nullable(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
