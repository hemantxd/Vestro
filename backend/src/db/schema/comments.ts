import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { posts } from "./posts.js";

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    parentId: uuid("parent_id"), // null = top-level comment, has value = reply

    text: text("text").notNull(),

    likesCount: integer("likes_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("comment_post_idx").on(table.postId),
    index("comment_author_idx").on(table.authorId),
    index("comment_parent_idx").on(table.parentId),
  ]
);