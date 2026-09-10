export type ConversationType = "dm" | "group";

export interface ConversationUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string | null;
  description: string | null;
  participantCount: number;
  lastMessage: string | null;
  lastMessageAuthor: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
  members?: ConversationUser[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  text: string | null;
  type: "text" | "image" | "system";
  readAt: string | null;
  createdAt: string;
}

export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  description?: string;
}