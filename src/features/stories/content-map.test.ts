import { describe, expect, it } from "vitest";
import { mapContentUnits, type ContentSentenceRow } from "./content-map";

describe("mapContentUnits", () => {
  it("pairs English sentences with Vietnamese translations by sentence order", () => {
    const rows: ContentSentenceRow[] = [
      {
        unit_id: 20,
        unit_type: "paragraph",
        unit_order_no: 2,
        sentence_id: 202,
        sentence_order_no: 2,
        source_text: "Second sentence.",
        translation_text: "Câu thứ hai.",
      },
      {
        unit_id: 10,
        unit_type: "heading",
        unit_order_no: 1,
        sentence_id: 101,
        sentence_order_no: 1,
        source_text: "A new friend",
        translation_text: "Một người bạn mới",
      },
      {
        unit_id: 20,
        unit_type: "paragraph",
        unit_order_no: 2,
        sentence_id: 201,
        sentence_order_no: 1,
        source_text: "First sentence.",
        translation_text: "Câu đầu tiên.",
      },
    ];

    expect(mapContentUnits(rows)).toEqual([
      {
        id: 10,
        type: "heading",
        orderNo: 1,
        en: ["A new friend"],
        vi: ["Một người bạn mới"],
        sentenceIds: [101],
      },
      {
        id: 20,
        type: "paragraph",
        orderNo: 2,
        en: ["First sentence.", "Second sentence."],
        vi: ["Câu đầu tiên.", "Câu thứ hai."],
        sentenceIds: [201, 202],
      },
    ]);
  });

  it("keeps an empty Vietnamese string when a translation is unavailable", () => {
    expect(
      mapContentUnits([
        {
          unit_id: 10,
          unit_type: "paragraph",
          unit_order_no: 1,
          sentence_id: 101,
          sentence_order_no: 1,
          source_text: "Untranslated.",
          translation_text: null,
        },
      ]),
    ).toEqual([
      {
        id: 10,
        type: "paragraph",
        orderNo: 1,
        en: ["Untranslated."],
        vi: [""],
        sentenceIds: [101],
      },
    ]);
  });
});
