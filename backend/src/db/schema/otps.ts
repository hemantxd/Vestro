import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const otps = pgTable(
  "otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    otp: varchar("otp", { length: 6 }).notNull(),

    type: varchar("type", { length: 30 }).default("password_reset").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    usedAt: timestamp("used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("otp_user_idx").on(table.userId),
    index("otp_lookup_idx").on(table.userId, table.otp),
  ]
);