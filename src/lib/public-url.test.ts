import { describe, expect, it } from "vitest";
import { publicUrl } from "./public-url";

describe("publicUrl", () => {
  it("keeps root-relative paths under the Vite base", () => {
    expect(publicUrl("/arts/invoice.jpg")).toBe("/arts/invoice.jpg");
    expect(publicUrl("yume-icon.png")).toBe("/yume-icon.png");
  });
});
