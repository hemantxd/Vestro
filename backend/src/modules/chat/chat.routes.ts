import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { readLimiter, writeLimiter } from "../../middleware/rateLimit.js";
import {
  createConversationSchema,
  sendMessageSchema,
  addMembersSchema,
} from "./chat.schema.js";

const router = Router();

// All chat routes require authentication.
router.use(authenticate as any);

// Conversations
router.post("/", writeLimiter as any, validate(createConversationSchema as any), chatController.createConversation as any);
router.get("/", readLimiter as any, chatController.listConversations as any);
router.get("/:id", readLimiter as any, chatController.getConversation as any);

// Messages
router.get("/:id/messages", readLimiter as any, chatController.getMessages as any);
router.post("/:id/messages", writeLimiter as any, validate(sendMessageSchema as any), chatController.sendMessage as any);

// Read receipts
router.post("/:id/read", readLimiter as any, chatController.markRead as any);

// Group member management
router.post("/:id/members", writeLimiter as any, validate(addMembersSchema as any), chatController.addMembers as any);
router.delete("/:id/members/:userId", writeLimiter as any, chatController.removeMember as any);
router.post("/:id/leave", writeLimiter as any, chatController.leaveGroup as any);

export default router;