import catAdult from "./pets/cat-adult.png";
import catEgg from "./pets/cat-egg.png";
import catYoung from "./pets/cat-young.png";
import dragonAdult from "./pets/dragon-adult.png";
import dragonEgg from "./pets/dragon-egg.png";
import dragonYoung from "./pets/dragon-young.png";
import foxAdult from "./pets/fox-adult.png";
import foxEgg from "./pets/fox-egg.png";
import foxYoung from "./pets/fox-young.png";

/** Bundled PNG URLs keyed by sprite_key. */
export const SPRITE_ART_SRC: Record<string, string> = {
  cat_egg: catEgg,
  cat_young: catYoung,
  cat_adult: catAdult,
  fox_egg: foxEgg,
  fox_young: foxYoung,
  fox_adult: foxAdult,
  dragon_egg: dragonEgg,
  dragon_young: dragonYoung,
  dragon_adult: dragonAdult,
};

/** Onboarding / edit-account previews keyed by species id. */
export const SPECIES_PREVIEW_SRC: Record<number, string> = {
  1: catYoung,
  2: foxYoung,
  3: dragonYoung,
};
