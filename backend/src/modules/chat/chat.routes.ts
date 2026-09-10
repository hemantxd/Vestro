import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createConversationSchema,
  sendMessageSchema,
  addMembersSchema,
} from "./chat.schema.js";

const router = Router();

// All chat routes require authentication.
router.use(authenticate as any);

// Conversations
router.post("/", validate(createConversationSchema as any), chatController.createConversation as any);
router.get("/", chatController.listConversations as any);
router.get("/:id", chatController.getConversation as any);

// Messages
router.get("/:id/messages", chatController.getMessages as any);
router.post("/:id/messages", validate(sendMessageSchema as any), chatController.sendMessage as any);

// Read receipts
router.post("/:id/read", chatController.markRead as any);

// Group member management
router.post("/:id/members", validate(addMembersSchema as any), chatController.addMembers as any);
router.delete("/:id/members/:userId", chatController.removeMember as any);
router.post("/:id/leave", chatController.leaveGroup as any);

export default router;