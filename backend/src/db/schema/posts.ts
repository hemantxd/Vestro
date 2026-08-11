import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    authorId: uuid("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    text: text("text"),

    // Currency the post is denominated in (e.g. "USD", "INR", "JPY").
    // Kept separate from tickers — tickers never include a currency symbol.
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),

    // Media is stored in post_media table, but we keep a quick reference
    hasMedia: boolean("has_media").default(false),

    mediaType: varchar("media_type", { length: 10 }), // "image", "video", "mixed"

    visibility: varchar("visibility", { length: 20 }).default("public"),

    likesCount: integer("likes_count").default(0),
    commentsCount: integer("comments_count").default(0),
    sharesCount: integer("shares_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("post_author_idx").on(table.authorId),
    index("post_created_idx").on(table.createdAt),
  ]
);

// Tickers live in their own table so a post can be tagged with multiple
// symbols ("$AAPL" is entered as the plain ticker "AAPL", currency is separate).
export const postTickers = pgTable(
  "post_tickers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    ticker: varchar("ticker", { length: 20 }).notNull(),

    orderIndex: integer("order_index").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ticker_post_idx").on(table.postId),
    index("post_tickers_ticker_idx").on(table.ticker),
  ]
);

export const postMedia = pgTable(
  "post_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),

    url: text("url").notNull(),
    type: varchar("type", { length: 10 }).notNull(), // "image" or "video"
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"), // for videos (seconds)
    thumbnail: text("thumbnail"), // for videos

    orderIndex: integer("order_index").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_post_idx").on(table.postId),
  ]
);