import { db } from "../../db/index.js";
import { eq, and, desc, notInArray, inArray, or, sql, isNull } from "drizzle-orm";
import {
  conversations,
  conversationMembers,
  groupConversations,
  messages,
} from "../../db/schema/conversations.js";
import { users } from "../../db/schema/users.js";
import type { ConversationType, ConversationSummary, MemberRole, MessageType } from "./chat.types.js";

export const chatRepository = {
  // ── Conversations ────────────────────────────────────────────────
  async createConversation(type: ConversationType) {
    const [conversation] = await db
      .insert(conversations)
      .values({ type })
      .returning();
    return conversation;
  },

  async findConversationById(id: string) {
    return db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  },

  async addMembers(conversationId: string, userIds: string[], role: MemberRole = "member") {
    for (const userId of userIds) {
      await db
        .insert(conversationMembers)
        .values({ conversationId, userId, role })
        .onConflictDoNothing();
    }
  },

  async removeMember(conversationId: string, userId: string) {
    await db
      .delete(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId)
        )
      );
  },

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId)
        )
      );
    return row.count > 0;
  },

  async getMemberRole(conversationId: string, userId: string): Promise<MemberRole | null> {
    const [row] = await db
      .select({ role: conversationMembers.role })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId)
        )
      )
      .limit(1);
    return (row?.role as MemberRole) ?? null;
  },

  // Find an existing DM between exactly these two users (no groups).
  async findDmBetween(userA: string, userB: string) {
    const rows = await db
      .select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(inArray(conversationMembers.userId, [userA, userB]));

    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.conversationId, (counts.get(r.conversationId) || 0) + 1);
    }
    const ids = [...counts.entries()].filter(([c, n]) => n === 2).map(([c]) => c);
    if (ids.length === 0) return null;

    let dmId: string | null = null;
    for (const cid of ids) {
      const convo = await this.findConversationById(cid);
      if (convo && convo.type === "dm") {
        dmId = cid;
        break;
      }
    }
    return dmId;
  },

  async getConversationMembers(conversationId: string) {
    return db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        role: conversationMembers.role,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, conversationId));
  },

  async getGroupInfo(conversationId: string) {
    return db.query.groupConversations.findFirst({
      where: eq(groupConversations.conversationId, conversationId),
    });
  },

  async createGroupInfo(input: {
    conversationId: string;
    name: string;
    description?: string;
    createdBy: string;
  }) {
    const [group] = await db
      .insert(groupConversations)
      .values({
        conversationId: input.conversationId,
        name: input.name,
        description: input.description || null,
        createdBy: input.createdBy,
      })
      .returning();
    return group;
  },

  // List conversations the user belongs to, with last message + unread count.
  async listConversations(userId: string): Promise<ConversationSummary[]> {
    const rows = await db
      .select({
        conversationId: conversationMembers.conversationId,
        lastReadAt: conversationMembers.lastReadAt,
      })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));

    const convoIds = rows.map((r) => r.conversationId);
    if (convoIds.length === 0) return [];

    const convos = await db
      .select()
      .from(conversations)
      .where(inArray(conversations.id, convoIds));

    const lastMsgs = await db
      .select({
        conversationId: messages.conversationId,
        text: messages.text,
        type: messages.type,
        createdAt: messages.createdAt,
        authorUsername: users.username,
      })
      .from(messages)
      .innerJoin(users, eq(messages.authorId, users.id))
      .where(inArray(messages.conversationId, convoIds))
      .orderBy(desc(messages.createdAt));

    const groups = await db
      .select()
      .from(groupConversations)
      .where(inArray(groupConversations.conversationId, convoIds));

    const memberCounts = await this.getMemberCounts(convoIds);
    const unreadCounts = await this.getUnreadCounts(userId, rows);
    const dmPeers = await this.getDmPeers(userId, convoIds);

    return convos
      .map((c) => {
        const last = lastMsgs.find((m) => m.conversationId === c.id);
        const group = groups.find((g) => g.conversationId === c.id);
        const peer = dmPeers.get(c.id);

        return {
          id: c.id,
          type: c.type as ConversationType,
          name:
            c.type === "group"
              ? group?.name || "Group"
              : peer?.displayName || peer?.username || "User",
          avatar: c.type === "group" ? group?.avatar || null : peer?.avatar || null,
          description: group?.description || null,
          participantCount: memberCounts.get(c.id) || 0,
          lastMessage: last ? (last.type === "image" ? "📷 Photo" : last.text) : null,
          lastMessageAuthor: last?.authorUsername || null,
          lastMessageAt: last?.createdAt || null,
          unreadCount: unreadCounts.get(c.id) || 0,
          createdAt: c.createdAt,
        };
      })
      .sort(
        (a, b) =>
          (b.lastMessageAt?.getTime() || b.createdAt.getTime()) -
          (a.lastMessageAt?.getTime() || a.createdAt.getTime())
      );
  },

  async getMemberCounts(convoIds: string[]): Promise<Map<string, number>> {
    if (convoIds.length === 0) return new Map();
    const rows = await db
      .select({
        conversationId: conversationMembers.conversationId,
        count: sql<number>`count(*)::int`,
      })
      .from(conversationMembers)
      .where(inArray(conversationMembers.conversationId, convoIds))
      .groupBy(conversationMembers.conversationId);
    return new Map(rows.map((r) => [r.conversationId, r.count]));
  },

  async getUnreadCounts(
    userId: string,
    memberships: { conversationId: string; lastReadAt: Date | null }[]
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    for (const m of memberships) {
      const lastReadAt = m.lastReadAt ?? new Date(0);
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, m.conversationId),
            sql`${messages.createdAt} > ${lastReadAt}`,
            sql`${messages.authorId} <> ${userId}`
          )
        );
      map.set(m.conversationId, row.count);
    }
    return map;
  },

  async getDmPeers(userId: string, convoIds: string[]): Promise<Map<string, any>> {
    if (convoIds.length === 0) return new Map();
    const rows = await db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(
        and(
          inArray(conversationMembers.conversationId, convoIds),
          notInArray(conversationMembers.userId, [userId])
        )
      );
    const map = new Map<string, any>();
    for (const r of rows) {
      if (!map.has(r.conversationId)) map.set(r.conversationId, r);
    }
    return map;
  },

  // ── Messages ────────────────────────────────────────────────────
  async createMessage(input: {
    conversationId: string;
    authorId: string;
    text: string;
    type: MessageType;
  }) {
    const [message] = await db.insert(messages).values(input).returning();
    return message;
  },

  async getMessages(conversationId: string, options?: { limit?: number; page?: number }) {
    const limit = options?.limit || 30;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        authorId: messages.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatar: users.avatar,
        text: messages.text,
        type: messages.type,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(users, eq(messages.authorId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.reverse();
  },

  async markConversationRead(conversationId: string, userId: string) {
    await db
      .update(conversationMembers)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId)
        )
      );
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.authorId} <> ${userId}`,
          isNull(messages.readAt)
        )
      );
  },
};