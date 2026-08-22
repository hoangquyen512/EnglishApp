import { describe, expect, it } from "vitest";
import { composeLocalReply } from "./compose-reply";

describe("composeLocalReply", () => {
  it("answers tired in a way that names the feeling, not a canned line", () => {
    const reply = composeLocalReply({ text: "i so tired" });
    expect(reply.toLowerCase()).toMatch(/tired/);
    expect(reply).not.toBe("That sounds real. What happened next?");
    expect(reply).toMatch(/\?/);
  });

  it("answers house-cleaning differently from being tired", () => {
    const tired = composeLocalReply({ text: "i so tired" });
    const cleaning = composeLocalReply({ text: "today i have to clean my house all day" });
    expect(cleaning.toLowerCase()).toMatch(/clean|house/);
    expect(cleaning).not.toBe(tired);
    expect(cleaning).not.toBe("That sounds real. What happened next?");
  });

  it("does not repeat the last companion line", () => {
    const first = composeLocalReply({ text: "i so tired" });
    const second = composeLocalReply({
      text: "i so tired",
      lastCompanionReply: first,
    });
    expect(second).not.toBe(first);
  });

  it("greets without echoing hello or using a formula", () => {
    const reply = composeLocalReply({ text: "hello" });
    expect(reply.toLowerCase()).not.toMatch(/you said/);
    expect(reply.toLowerCase()).not.toBe("hello");
    expect(reply).not.toBe("That sounds real. What happened next?");
    expect(reply).toMatch(/\?/);
  });

  it("talks about rain instead of repeating the user's sentence", () => {
    const hello = composeLocalReply({ text: "hello" });
    const rain = composeLocalReply({ text: "today it's ranining" });
    expect(rain.toLowerCase()).toMatch(/rain/);
    expect(rain.toLowerCase()).not.toMatch(/you said/);
    expect(rain.toLowerCase()).not.toMatch(/ranining/);
    expect(rain).not.toBe(hello);
  });
});
