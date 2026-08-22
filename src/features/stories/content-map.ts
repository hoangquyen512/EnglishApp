export interface ContentSentenceRow {
  unit_id: number;
  unit_type: string;
  unit_order_no: number;
  sentence_id: number | null;
  sentence_order_no: number | null;
  source_text: string | null;
  translation_text: string | null;
}

export interface MappedContentUnit {
  id: number;
  type: string;
  orderNo: number;
  en: string[];
  vi: string[];
  sentenceIds: number[];
}

export function mapContentUnits(rows: ContentSentenceRow[]): MappedContentUnit[] {
  const units = new Map<number, MappedContentUnit & { sentenceOrder: number[] }>();

  for (const row of rows) {
    let unit = units.get(row.unit_id);
    if (!unit) {
      unit = {
        id: row.unit_id,
        type: row.unit_type,
        orderNo: row.unit_order_no,
        en: [],
        vi: [],
        sentenceIds: [],
        sentenceOrder: [],
      };
      units.set(row.unit_id, unit);
    }
    if (row.sentence_id !== null) {
      unit.en.push(row.source_text ?? "");
      unit.vi.push(row.translation_text ?? "");
      unit.sentenceIds.push(row.sentence_id);
      unit.sentenceOrder.push(row.sentence_order_no ?? Number.MAX_SAFE_INTEGER);
    }
  }

  return [...units.values()]
    .sort((left, right) => left.orderNo - right.orderNo || left.id - right.id)
    .map(({ sentenceOrder, ...unit }) => {
      const indexes = sentenceOrder
        .map((orderNo, index) => ({ orderNo, index }))
        .sort((left, right) => left.orderNo - right.orderNo);
      return {
        ...unit,
        en: indexes.map(({ index }) => unit.en[index]!),
        vi: indexes.map(({ index }) => unit.vi[index]!),
        sentenceIds: indexes.map(({ index }) => unit.sentenceIds[index]!),
      };
    });
}
