import { z } from "zod";

export const createConversationSchema = z
  .object({
    type: z.enum(["dm", "group"]),
    participantIds: z.array(z.string().uuid()).min(1),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine(
    (d) => (d.type === "group" ? !!d.name && d.name.trim().length > 0 : true),
    { message: "Group name is required", path: ["name"] }
  );

export const sendMessageSchema = z.object({
  text: z.string().min(1).max(10000),
  type: z.enum(["text", "image"]).optional(),
});

export const addMembersSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1),
});