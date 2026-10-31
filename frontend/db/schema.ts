import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const detectiveProgress = pgTable("detective_progress", {
  key: text("key").primaryKey(),
  progress: jsonb("progress").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const demoUsers = pgTable("demo_users", {
  email: text("email").primaryKey(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
