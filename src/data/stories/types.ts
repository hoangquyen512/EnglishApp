export type ContentUnitType = "paragraph" | "dialogue" | "heading" | "quote";

export type FeaturedVocab = {
  word: string;
  lemma: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  orderNo: number;
};

export type DemoChapterUnit = {
  type: ContentUnitType;
  enSentences: string[];
  viSentences: string[];
};

export type DemoChapterDefinition = {
  slug: string;
  titleEn: string;
  titleVi: string;
  units: DemoChapterUnit[];
  featured?: Omit<FeaturedVocab, "orderNo">[];
};
