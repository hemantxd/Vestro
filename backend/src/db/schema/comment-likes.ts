import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { comments } from "./comments.js";

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_comment_like").on(table.userId, table.commentId),
  ]
);