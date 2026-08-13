import { describe, expect, it } from "vitest";
import { setLlmClientForTests } from "../llm/client";
import { LlmFailedError } from "../llm/client";
import { registerUser } from "../users";
import { ensureDailyCheckin, getCoach, listMessages, sendUserMessage } from "./service";

async function makeUser(suffix: string) {
  return registerUser({
    email: `${suffix}@example.com`,
    password: "password1",
    displayName: suffix,
  });
}

describe("companion service", () => {
  it("creates one check-in for a new user and does not duplicate it", async () => {
    const user = await makeUser("checkin");
    const first = await ensureDailyCheckin(user.id);
    const second = await ensureDailyCheckin(user.id);
    expect(first?.source).toBe("daily_checkin");
    expect(first?.body).toMatch(/Hey/i);
    expect(second).toBeNull();
    expect(listMessages(user.id).filter((m) => m.source === "daily_checkin")).toHaveLength(1);
  });

  it("skips check-in when the user already chatted today", async () => {
    const user = await makeUser("already");
    await sendUserMessage(user.id, "Hello Sora");
    const checkin = await ensureDailyCheckin(user.id);
    expect(checkin).toBeNull();
    expect(listMessages(user.id).some((m) => m.source === "daily_checkin")).toBe(false);
  });

  it("keeps the user message when the LLM fails", async () => {
    const user = await makeUser("llmfail");
    setLlmClientForTests({
      async complete() {
        throw new LlmFailedError("boom");
      },
    });
    await expect(sendUserMessage(user.id, "I am tired")).rejects.toThrow(/boom|LLM/);
    const listed = listMessages(user.id);
    expect(listed.some((m) => m.role === "user" && m.body === "I am tired")).toBe(true);
    expect(listed.some((m) => m.role === "companion" && m.source === "chat")).toBe(false);
    setLlmClientForTests(null);
  });

  it("hides coach body on the list and returns it only on getCoach", async () => {
    const user = await makeUser("coach");
    const result = await sendUserMessage(user.id, "I sleep a little better last night");
    expect(result.user.hasCoach).toBe(true);
    const listed = listMessages(user.id);
    const listedUser = listed.find((m) => m.id === result.user.id);
    expect(listedUser && "coach" in listedUser).toBe(false);
    expect(listedUser?.hasCoach).toBe(true);
    const chips = getCoach(user.id, result.user.id);
    expect(chips[0]?.suggestion_en).toMatch(/slept/i);
  });

  it("does not let user A read user B coach", async () => {
    const a = await makeUser("alice");
    const b = await makeUser("bob");
    const sent = await sendUserMessage(a.id, "I sleep a little better last night");
    expect(() => getCoach(b.id, sent.user.id)).toThrow(/Không tìm thấy/);
  });

  it("updates mood from a signal and keeps it when the next line has none", async () => {
    const user = await makeUser("mood");
    await sendUserMessage(user.id, "I am exhausted after work");
    const { getProfile } = await import("./service");
    expect(getProfile(user.id).mood).toBe("down");
    await sendUserMessage(user.id, "What about lunch?");
    expect(getProfile(user.id).mood).toBe("down");
  });
});
