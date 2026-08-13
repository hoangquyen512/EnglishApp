import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "companion"] }).notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  source: text("source", { enum: ["chat", "daily_checkin"] }).notNull(),
  coachJson: text("coach_json"),
});

export const companionState = sqliteTable("companion_state", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  level: text("level", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  mood: text("mood", { enum: ["up", "ok", "down", "unknown"] }).notNull(),
  moodNote: text("mood_note"),
  memorySummary: text("memory_summary").notNull(),
  lastCheckinOn: text("last_checkin_on"),
  pendingLevelDirection: text("pending_level_direction"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
