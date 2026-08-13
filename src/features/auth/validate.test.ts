import { describe, expect, it } from "vitest";
import {
  normalizeEmail,
  normalizeUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "./validate";

describe("validateUsername", () => {
  it("accepts minh.anh_1", () => {
    expect(validateUsername("minh.anh_1")).toBeNull();
  });

  it("rejects too short, spaces, email chars, and reserved names", () => {
    expect(validateUsername("ab")).toBe("invalid_username");
    expect(validateUsername("a b")).toBe("invalid_username");
    expect(validateUsername("minh@anh")).toBe("invalid_username");
    expect(validateUsername("Admin")).toBe("reserved_username");
    expect(validateUsername("root")).toBe("reserved_username");
  });

  it("trims and keeps display casing", () => {
    expect(normalizeUsername("  Minh.Anh  ")).toBe("Minh.Anh");
  });
});

describe("validatePassword", () => {
  it("rejects 7 chars and matching username", () => {
    expect(validatePassword("abcdefg")).toBe("invalid_password");
    expect(validatePassword("MinhAnh1", "minhanh1")).toBe("password_matches_username");
  });

  it("accepts 8 chars that differ from username", () => {
    expect(validatePassword("abcdefgh", "minh.anh")).toBeNull();
  });
});

describe("validateEmail", () => {
  it("accepts a.b@x.vn and treats empty as null", () => {
    expect(validateEmail("a.b@x.vn")).toBeNull();
    expect(validateEmail("  ")).toBeNull();
    expect(normalizeEmail("  A.B@X.VN ")).toBe("a.b@x.vn");
  });

  it("rejects incomplete addresses", () => {
    expect(validateEmail("a@b")).toBe("invalid_email");
    expect(validateEmail("a b@x.com")).toBe("invalid_email");
  });
});

describe("validateDisplayName", () => {
  it("allows Vietnamese names and empty", () => {
    expect(validateDisplayName("Minh Anh")).toBeNull();
    expect(validateDisplayName("")).toBeNull();
    expect(validateDisplayName("   ")).toBeNull();
  });

  it("rejects more than 40 characters and newlines", () => {
    expect(validateDisplayName("x".repeat(41))).toBe("invalid_display_name");
    expect(validateDisplayName("Minh\nAnh")).toBe("invalid_display_name");
  });
});
