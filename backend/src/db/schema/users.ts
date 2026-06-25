// db/schema/users.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: text("email").notNull().unique(),

  username: text("username").notNull().unique(), // fix this

  firstName: text("first_name"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});