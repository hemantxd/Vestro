import { AppError } from "../../common/errors/AppError.js";
import { chatRepository } from "./chat.repository.js";
import { userRepository } from "../users/user.repository.js";
import { broadcastMessage } from "../../websocket/chat.websocket.js";
import type {
  CreateConversationInput,
  SendMessageInput,
  ConversationSummary,
  MessageResponse,
} from "./chat.types.js";

function assertValidText(text?: string) {
  if (!text || !text.trim()) {
    throw new AppError("Message text is required", 400);
  }
}

export const chatService = {
  // ── Create conversation (DM or group) ────────────────────────────
  async createConversation(userId: string, input: CreateConversationInput) {
    const participantIds = [...new Set(input.participantIds)];
    if (participantIds.length === 0) {
      throw new AppError("At least one participant is required", 400);
    }

    if (input.type === "dm") {
      // A DM is a conversation between exactly the current user and one peer.
      if (participantIds.length !== 1) {
        throw new AppError("A direct message requires exactly one participant", 400);
      }
      const peerId = participantIds[0];
      if (peerId === userId) {
        throw new AppError("You cannot message yourself", 400);
      }

      const peer = await userRepository.findById(peerId);
      if (!peer) throw new AppError("Recipient not found", 404);

      const existing = await chatRepository.findDmBetween(userId, peerId);
      if (existing) {
        return chatService.getConversation(userId, existing);
      }

      const conversation = await chatRepository.createConversation("dm");
      await chatRepository.addMembers(conversation.id, [userId, peerId], "member");
      return chatService.getConversation(userId, conversation.id);
    }

    // Group chat: create a new group with the creator + participants.
    const { name } = input;
    if (!name || !name.trim()) {
      throw new AppError("Group name is required", 400);
    }

    for (const pid of participantIds) {
      const user = await userRepository.findById(pid);
      if (!user) throw new AppError("One or more participants were not found", 404);
    }

    const conversation = await chatRepository.createConversation("group");
    await chatRepository.addMembers(conversation.id, [userId, ...participantIds], "member");
    await chatRepository.addMembers(conversation.id, [userId], "owner");
    await chatRepository.createGroupInfo({
      conversationId: conversation.id,
      name: name.trim(),
      description: input.description?.trim() || undefined,
      createdBy: userId,
    });

    return chatService.getConversation(userId, conversation.id);
  },

  // ── Get a single conversation ────────────────────────────────────
  async getConversation(userId: string, conversationId: string) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member of this conversation", 403);
    }

    const members = await chatRepository.getConversationMembers(conversationId);
    const group =
      conversation.type === "group"
        ? await chatRepository.getGroupInfo(conversationId)
        : null;

    const peer = members.find((m) => m.id !== userId);
    return {
      id: conversation.id,
      type: conversation.type,
      name:
        conversation.type === "group"
          ? group?.name || "Group"
          : peer?.displayName || peer?.username || "Chat",
      avatar:
        conversation.type === "group"
          ? group?.avatar || null
          : peer?.avatar || null,
      description: group?.description || null,
      members,
      createdAt: conversation.createdAt,
    };
  },

  async listConversations(userId: string): Promise<ConversationSummary[]> {
    return chatRepository.listConversations(userId);
  },
// ── Messages ─────────────────────────────────────────────────────
  async getMessages(userId: string, conversationId: string, options?: { limit?: number; page?: number }) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member of this conversation", 403);
    }

    const messages = await chatRepository.getMessages(conversationId, options);
    await chatRepository.markConversationRead(conversationId, userId);
    return messages;
  },

  async sendMessage(
    userId: string,
    conversationId: string,
    input: SendMessageInput
  ): Promise<MessageResponse> {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member of this conversation", 403);
    }
    assertValidText(input.text);

    const message = await chatRepository.createMessage({
      conversationId,
      authorId: userId,
      text: input.text.trim(),
      type: input.type || "text",
    });

    const author = await userRepository.findById(userId);
    const response: MessageResponse = {
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      authorUsername: author?.username || "",
      authorDisplayName: author?.displayName || null,
      authorAvatar: author?.avatar || null,
      text: message.text,
      type: message.type as MessageResponse["type"],
      readAt: message.readAt,
      createdAt: message.createdAt,
    };

    // Realtime: push to all members subscribed to this conversation.
    try {
      const members = await chatRepository.getConversationMembers(conversationId);
      broadcastMessage(response, members.map((m) => m.id));
    } catch {
      // Realtime broadcast is non-blocking; if it fails, REST still works.
    }

    return response;
  },

  // ── Group member management ──────────────────────────────────────
  async addMembers(userId: string, conversationId: string, newMemberIds: string[]) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (conversation.type !== "group") throw new AppError("Only group chats have members to add", 400);
    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member", 403);
    }

    for (const pid of newMemberIds) {
      if (!(await userRepository.findById(pid))) {
        throw new AppError("One or more users were not found", 404);
      }
    }

    await chatRepository.addMembers(conversationId, newMemberIds, "member");
    return chatService.getConversation(userId, conversationId);
  },

  async removeMember(userId: string, conversationId: string, targetUserId: string) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (conversation.type !== "group") throw new AppError("Only group chats support member removal", 400);

    const role = await chatRepository.getMemberRole(conversationId, userId);
    const isSelf = userId === targetUserId;
    if (!isSelf && role !== "owner" && role !== "admin") {
      throw new AppError("You must be an admin or owner to remove members", 403);
    }

    await chatRepository.removeMember(conversationId, targetUserId);
    return { removed: true };
  },

  async leaveGroup(userId: string, conversationId: string) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (conversation.type !== "group") throw new AppError("Only group chats can be left", 400);
    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member", 403);
    }

    await chatRepository.removeMember(conversationId, userId);
    return { left: true };
  },

  // ── Read receipts ────────────────────────────────────────────────
  async markRead(userId: string, conversationId: string) {
    if (!(await chatRepository.isMember(conversationId, userId))) {
      throw new AppError("You are not a member of this conversation", 403);
    }
    await chatRepository.markConversationRead(conversationId, userId);
    return { read: true };
  },
};