import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().unique().notNull(),

    username: varchar("username", { length: 30 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),

    passwordHash: text("password_hash"),

    displayName: varchar("display_name", { length: 100 }),

    bio: text("bio"),

    avatar: text("avatar"),

    coverImage: text("cover_image"),

    location: varchar("location", { length: 255 }),

    birthDate: timestamp("birth_date"),

    gender: varchar("gender", { length: 30 }),

    verified: boolean("verified").default(false),

    privateAccount: boolean("private_account").default(false),

    emailVerified: boolean("email_verified").default(false),

    phoneVerified: boolean("phone_verified").default(false),

    phone: varchar("phone", { length: 20 }),

    followersCount: integer("followers_count").default(0),

    followingCount: integer("following_count").default(0),

    postsCount: integer("posts_count").default(0),

    likesReceived: integer("likes_received").default(0),

    lastSeenAt: timestamp("last_seen_at"),

    lastLoginAt: timestamp("last_login_at"),

    isOnline: boolean("is_online").default(false),

    role: varchar("role", { length: 20 }).default("user"),

    status: varchar("status", { length: 20 }).default("active"),

    onboardingStep: integer("onboarding_step").default(0),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  }
);