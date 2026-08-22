export type { ContentUnitType, DemoChapterUnit, FeaturedVocab } from "./types";

import { A_NEW_FRIEND_CHAPTERS } from "./content/a-new-friend";

/** @deprecated Import from ./content/a-new-friend — kept for existing tests/imports. */
export const A_NEW_FRIEND_CH1 = {
  units: A_NEW_FRIEND_CHAPTERS[0]!.units,
  featured: (A_NEW_FRIEND_CHAPTERS[0]!.featured ?? []).map((item, index) => ({
    ...item,
    orderNo: index + 1,
  })),
};
