import { eq } from "drizzle-orm";
import { DEFAULT_TIMEZONE } from "./constants";
import { createCompanionState } from "./companion/service";
import { db } from "./db";
import { newId } from "./ids";
import { hashPassword } from "./password";
import { users } from "./schema";

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const displayName = input.displayName.trim();
  if (!email || !email.includes("@")) {
    throw Object.assign(new Error("Email không hợp lệ"), { status: 400 });
  }
  if (input.password.length < 8) {
    throw Object.assign(new Error("Mật khẩu cần ít nhất 8 ký tự"), { status: 400 });
  }
  if (!displayName) {
    throw Object.assign(new Error("Hãy nhập tên hiển thị"), { status: 400 });
  }
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    throw Object.assign(new Error("Email đã được dùng"), { status: 409 });
  }
  const id = newId();
  db.insert(users)
    .values({
      id,
      email,
      passwordHash: await hashPassword(input.password),
      displayName,
      timezone: input.timezone || DEFAULT_TIMEZONE,
      createdAt: new Date(),
    })
    .run();
  createCompanionState(id);
  return { id, email, displayName };
}
