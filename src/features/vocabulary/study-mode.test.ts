import { describe, expect, it } from "vitest";
import { studyModeFromStored } from "./study-mode";

describe("studyModeFromStored", () => {
  it("maps leftover conversation mode onto giao tiếp", () => {
    expect(studyModeFromStored("conversation")).toBe("phrase");
  });

  it("leaves vocabulary and phrase unchanged", () => {
    expect(studyModeFromStored("vocabulary")).toBe("vocabulary");
    expect(studyModeFromStored("phrase")).toBe("phrase");
  });
});
