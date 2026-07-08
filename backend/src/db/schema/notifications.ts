import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // "follow", "follow_request", "like", "comment", "mention", "message"
    type: varchar("type", { length: 30 }).notNull(),

    actorId: uuid("actor_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Optional reference to the entity that triggered the notification
    entityId: uuid("entity_id"),
    entityType: varchar("entity_type", { length: 30 }),

    message: text("message"),

    read: boolean("read").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notif_user_idx").on(table.userId),
    index("notif_unread_idx").on(table.userId, table.read),
  ]
);