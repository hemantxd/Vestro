export type ConversationType = "dm" | "group";
export type MemberRole = "owner" | "admin" | "member";
export type MessageType = "text" | "image" | "system";

export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  description?: string;
}

export interface SendMessageInput {
  text: string;
  type?: MessageType;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string | null;
  description: string | null;
  participantCount: number;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
}

export interface ConversationUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: MemberRole;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatar: string | null;
  text: string | null;
  type: MessageType;
  readAt: Date | null;
  createdAt: Date;
}