import { describe, expect, it } from "vitest";
import {
  alignPetToSpecies,
  applyPetProfileChange,
  buildAdoptedDemoPet,
  demoStageForLevel,
} from "./demo-pet";
import { DEMO_SPECIES } from "../../data/demo-pet";
import type { PetState } from "../../types";

const fox = DEMO_SPECIES[1]!;

describe("demoStageForLevel", () => {
  it("returns fox egg at level 1–2", () => {
    expect(demoStageForLevel(2, 1)?.spriteKey).toBe("fox_egg");
    expect(demoStageForLevel(2, 2)?.spriteKey).toBe("fox_egg");
  });

  it("returns fox young at level 3–5", () => {
    expect(demoStageForLevel(2, 3)?.spriteKey).toBe("fox_young");
  });
});

describe("buildAdoptedDemoPet", () => {
  it("adopts fox with fox sprite, not DEMO_PET cat sprite", () => {
    const pet = buildAdoptedDemoPet(fox, "Sora");
    expect(pet.speciesId).toBe(2);
    expect(pet.speciesName).toBe("Cáo");
    expect(pet.spriteKey).toBe("fox_egg");
    expect(pet.petName).toBe("Sora");
    expect(pet.level).toBe(1);
  });
});

describe("alignPetToSpecies", () => {
  it("repairs cat sprite when species is fox", () => {
    const broken: PetState = {
      id: 1,
      petName: "Sora",
      level: 2,
      xp: 18,
      mood: "happy",
      streakDays: 3,
      lastFedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      speciesId: 2,
      currentStageId: 2,
      spriteKey: "cat_young",
      speciesName: "Cáo",
    };
    const fixed = alignPetToSpecies(broken, DEMO_SPECIES);
    expect(fixed.spriteKey).toBe("fox_egg");
    expect(fixed.speciesName).toBe("Cáo");
    expect(fixed.speciesId).toBe(2);
  });
});

describe("applyPetProfileChange", () => {
  it("changes species and keeps level", () => {
    const pet = { ...buildAdoptedDemoPet(fox, "Sora"), level: 4, xp: 10 };
    const next = applyPetProfileChange(pet, { speciesId: 3, petName: "Ryu" }, DEMO_SPECIES);
    expect(next.petName).toBe("Ryu");
    expect(next.speciesId).toBe(3);
    expect(next.speciesName).toBe("Rồng");
    expect(next.spriteKey).toBe("dragon_young");
    expect(next.level).toBe(4);
  });
});
