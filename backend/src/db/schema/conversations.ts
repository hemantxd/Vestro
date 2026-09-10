import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

// A conversation is either a 1:1 DM ("dm") or a group chat ("group").
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 10 }).default("dm").notNull(), // "dm" | "group"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("convo_type_idx").on(table.type)]
);

// Which users are members of a conversation (many-to-many).
export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 10 }).default("member").notNull(), // "owner" | "admin" | "member"
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    lastReadAt: timestamp("last_read_at"),
    notificationsEnabled: boolean("notifications_enabled").default(true),
  },
  (table) => [
    uniqueIndex("convo_member_unique").on(table.conversationId, table.userId),
    index("convo_member_user_idx").on(table.userId),
  ]
);

// Group-specific metadata (name, avatar, description, creator).
export const groupConversations = pgTable(
  "group_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    avatar: text("avatar"),
    description: text("description"),
    createdBy: uuid("created_by")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [index("group_convo_idx").on(table.conversationId)]
);

// A message belongs to a conversation.
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text"),
    type: varchar("type", { length: 20 }).default("text").notNull(), // "text" | "image" | "system"
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_convo_idx").on(table.conversationId, table.createdAt),
  ]
);