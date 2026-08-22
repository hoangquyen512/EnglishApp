import { describe, expect, it } from "vitest";
import { lookupServiceUrls } from "./urls";

describe("lookupServiceUrls", () => {
  it("uses same-origin Vite proxies in browser/dev", () => {
    expect(lookupServiceUrls("project", true)).toEqual({
      dictionary: "/lookup-dict/api/v2/entries/en/project",
      wiktionary: "/lookup-wiki/api/rest_v1/page/definition/project",
      mymemory: "/lookup-translate/get?q=project&langpair=en%7Cvi",
    });
  });

  it("uses public hosts outside dev", () => {
    const urls = lookupServiceUrls("project", false);
    expect(urls.dictionary).toContain("api.dictionaryapi.dev");
    expect(urls.wiktionary).toContain("en.wiktionary.org");
    expect(urls.mymemory).toContain("api.mymemory.translated.net");
  });
});
