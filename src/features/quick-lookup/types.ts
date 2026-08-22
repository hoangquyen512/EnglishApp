export type DictionaryCacheEntry = {
  word: string;
  phoneticIpa: string | null;
  partOfSpeech: string | null;
  meaningVi: string;
  definitionEn: string | null;
  exampleEn: string | null;
  source: string;
  cachedAt: string;
};

export type DictionaryEnSense = {
  word: string;
  phoneticIpa: string | null;
  partOfSpeech: string | null;
  definitionEn: string | null;
  exampleEn: string | null;
};
