import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    followerId: uuid("follower_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    followingId: uuid("following_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_follow").on(table.followerId, table.followingId),
  ]
);
