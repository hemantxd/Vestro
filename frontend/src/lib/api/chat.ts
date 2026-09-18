import { apiRequest } from "./client";
import type { Conversation, ChatMessage, CreateConversationInput } from "@/types/chat";

export const chatApi = {
  // Create a DM (or group) conversation. For DMs it reopens any existing one.
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const res = await apiRequest<{ status: string; data: Conversation }>("/chats", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  // Open an existing conversation with a user (reuses existing DM).
  async getOrCreateDm(userId: string): Promise<Conversation> {
    return this.createConversation({ type: "dm", participantIds: [userId] });
  },

  async listConversations(): Promise<Conversation[]> {
    const res = await apiRequest<{ status: string; data: Conversation[] }>("/chats");
    return res.data;
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await apiRequest<{ status: string; data: Conversation }>(`/chats/${id}`);
    return res.data;
  },

  async getMessages(id: string, limit = 50, page = 1): Promise<ChatMessage[]> {
    const res = await apiRequest<{ status: string; data: ChatMessage[] }>(
      `/chats/${id}/messages?limit=${limit}&page=${page}`
    );
    return res.data;
  },

  async sendMessage(id: string, text: string): Promise<ChatMessage> {
    const res = await apiRequest<{ status: string; data: ChatMessage }>(
      `/chats/${id}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    );
    return res.data;
  },

  async markRead(id: string): Promise<void> {
    await apiRequest<{ status: string; data: unknown }>(`/chats/${id}/read`, {
      method: "POST",
    });
  },

  async addMembers(id: string, participantIds: string[]): Promise<Conversation> {
    const res = await apiRequest<{ status: string; data: Conversation }>(
      `/chats/${id}/members`,
      {
        method: "POST",
        body: JSON.stringify({ participantIds }),
      }
    );
    return res.data;
  },

  async removeMember(id: string, userId: string): Promise<{ removed: boolean }> {
    const res = await apiRequest<{ status: string; data: { removed: boolean } }>(
      `/chats/${id}/members/${userId}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  async leaveGroup(id: string): Promise<{ left: boolean }> {
    const res = await apiRequest<{ status: string; data: { left: boolean } }>(
      `/chats/${id}/leave`,
      { method: "POST" }
    );
    return res.data;
  },
};