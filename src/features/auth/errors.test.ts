import { describe, expect, it } from "vitest";
import { errorCode, errorMessage } from "./errors";

describe("auth error copy", () => {
  it("maps known codes to Vietnamese", () => {
    expect(errorMessage("auth_failed")).toBe("Username hoặc mật khẩu không đúng.");
    expect(errorMessage("username_taken")).toContain("đã dùng");
    expect(errorMessage("mail_not_configured")).toContain("Chưa cấu hình");
  });

  it("falls back for unknown errors", () => {
    expect(errorCode(new Error("nope"))).toBe("nope");
    expect(errorMessage("nope")).toBe("Có lỗi. Thử lại.");
  });
});
