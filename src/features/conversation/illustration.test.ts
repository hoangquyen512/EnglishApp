import { describe, expect, it } from "vitest";
import { illustrationSrc } from "./illustration";

describe("illustrationSrc", () => {
  it("reuses the eight topic pictures in a cycle", () => {
    expect(illustrationSrc("greet-1")).toBe("/illustrations/greet-1.jpg");
    expect(illustrationSrc("greet-8")).toBe("/illustrations/greet-8.jpg");
    expect(illustrationSrc("greet-9")).toBe("/illustrations/greet-1.jpg");
    expect(illustrationSrc("cafe-16")).toBe("/illustrations/cafe-8.jpg");
  });
});
