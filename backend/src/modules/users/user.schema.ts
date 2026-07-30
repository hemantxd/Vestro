import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  avatar: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().max(30).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});