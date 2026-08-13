import { afterEach, describe, expect, it } from "vitest";
import { invoke, resetMemoryAuth } from "./memory";

afterEach(() => {
  resetMemoryAuth();
});

describe("memory auth", () => {
  it("registers unique usernames and keeps a session", async () => {
    const session = (await invoke("register_account", {
      username: "minh.anh",
      password: "password1",
    })) as { username: string; email: null };
    expect(session.username).toBe("minh.anh");
    expect(session.email).toBeNull();
    await expect(
      invoke("register_account", { username: "Minh.Anh", password: "password2" }),
    ).rejects.toThrow("username_taken");
  });

  it("uses a generic login error", async () => {
    await invoke("register_account", { username: "minh.anh", password: "password1" });
    await invoke("logout_account");
    await expect(
      invoke("login_account", { username: "minh.anh", password: "nope!!!!" }),
    ).rejects.toThrow("auth_failed");
  });

  it("saves email on first reset and requires it later", async () => {
    await invoke("register_account", { username: "minh.anh", password: "password1" });
    await invoke("logout_account");
    await invoke("request_password_reset", { username: "minh.anh", email: "minh@example.com" });
    await expect(
      invoke("request_password_reset", { username: "minh.anh", email: "other@example.com" }),
    ).rejects.toThrow("reset_failed");
    const session = await invoke("confirm_password_reset", {
      username: "minh.anh",
      defaultPassword: "default12",
      newPassword: "newpass12",
    });
    expect((session as { username: string }).username).toBe("minh.anh");
  });
});
