export const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
export const WIKTIONARY_API_BASE = "https://en.wiktionary.org/api/rest_v1/page/definition";
export const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export function lookupServiceUrls(word: string, dev: boolean) {
  const encoded = encodeURIComponent(word);
  if (dev) {
    return {
      dictionary: `/lookup-dict/api/v2/entries/en/${encoded}`,
      wiktionary: `/lookup-wiki/api/rest_v1/page/definition/${encoded}`,
      mymemory: `/lookup-translate/get?q=${encoded}&langpair=en%7Cvi`,
    };
  }
  return {
    dictionary: `${DICTIONARY_API_BASE}/${encoded}`,
    wiktionary: `${WIKTIONARY_API_BASE}/${encoded}`,
    mymemory: `${MYMEMORY_API}?q=${encoded}&langpair=en%7Cvi`,
  };
}
