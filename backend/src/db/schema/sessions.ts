import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const sessions = pgTable("sessions", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    refreshToken: text("refresh_token").notNull(),

    ip: varchar("ip", { length: 100 }),

    userAgent: text("user_agent"),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});