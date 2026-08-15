import { describe, expect, it } from "vitest";
import { DEMO_PET, DEMO_SPECIES } from "../../data/demo-pet";
import { applyBrowserStudyReward, buildAdoptedDemoPet } from "./demo-pet";

const fox = DEMO_SPECIES[1]!;

describe("applyBrowserStudyReward", () => {
  it("keeps fox species instead of swapping to DEMO_PET cat", () => {
    const foxPet = buildAdoptedDemoPet(fox, "Sora");
    const next = applyBrowserStudyReward(foxPet, 5);
    expect(next.speciesId).toBe(2);
    expect(next.speciesName).toBe("Cáo");
    expect(next.spriteKey).toBe("fox_adult");
    expect(next.xp).toBe(5);
    expect(next.mood).toBe("happy");
    expect(next.speciesId).not.toBe(DEMO_PET.speciesId);
  });
});
