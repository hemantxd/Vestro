import { pgTable, uuid, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const posts = pgTable("posts", {
    id: uuid("id").defaultRandom().primaryKey(),

    authorId: uuid("author_id")
        .references(() => users.id)
        .notNull(),

    text: text("text"),

    visibility: varchar("visibility", {
        length: 20,
    }).default("public"),

    likesCount: integer("likes_count").default(0),

    commentsCount: integer("comments_count").default(0),

    sharesCount: integer("shares_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
});