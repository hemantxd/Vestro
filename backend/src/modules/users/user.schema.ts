import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
});