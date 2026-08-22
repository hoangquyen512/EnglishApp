/**
 * Fetch IPA for phase-1 lemmas missing TOEIC phonetics.
 * Dictionary API first; Wiktionary wikitext when the API only has audio.
 * Run: node scripts/enrich-vocab-phonetics.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TOPICS = ["family", "food_dining", "office_work", "travel"];
const OUT = path.join(ROOT, "src/data/lexicon/phonetics.json");
const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const WIKI_API = "https://en.wiktionary.org/w/api.php?action=parse&prop=wikitext&format=json&page=";
const USER_AGENT = "YumeLexicon/0.1 (local vocab IPA enrichment)";
const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const SKIP_WORDS = new Set(
  "nhau vui thay cho gia mai sau anh trai xem mang bao nhi thanh xanh chanh ngon quy khoai hai xin canh rau heo banh tra ngh xong gian ang minh linh hoa nam lan khoa trang thuy thi chuy chay sao khu soi nguyen nguy tran pham hoang bui ngo thu khuy trung".split(
    " ",
  ),
);

function isPlaceholderWord(word) {
  return /^[a-z]+(?:[-_][a-z]+)*-term-\d+$/i.test(word) || /^item[a-z]+\d+$/i.test(word);
}

function normalizeIpa(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed.includes("·")) {
    return null;
  }
  if (trimmed.startsWith("/") && trimmed.endsWith("/") && trimmed.length > 2) {
    return trimmed;
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]") && trimmed.length > 2) {
    return `/${trimmed.slice(1, -1)}/`;
  }
  return `/${trimmed}/`;
}

function firstPhonetic(payload) {
  if (!Array.isArray(payload) || !payload[0]) {
    return null;
  }
  const entry = payload[0];
  if (typeof entry.phonetic === "string") {
    const ipa = normalizeIpa(entry.phonetic);
    if (ipa) {
      return ipa;
    }
  }
  for (const item of entry.phonetics ?? []) {
    if (typeof item.text === "string") {
      const ipa = normalizeIpa(item.text);
      if (ipa) {
        return ipa;
      }
    }
  }
  return null;
}

function ipaFromWikitext(text) {
  const match = String(text).match(/\{\{IPA\|en\|(\/[^}|]+\/)/);
  return match ? normalizeIpa(match[1]) : null;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
  return response;
}

async function fetchDictIpa(word) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetchJson(DICT_API + encodeURIComponent(word));
    if (response.status === 429 || response.status === 502 || response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      continue;
    }
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`dict ${response.status}`);
    }
    return firstPhonetic(await response.json());
  }
  return null;
}

async function fetchWikiIpa(word) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetchJson(WIKI_API + encodeURIComponent(word));
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2500 * (attempt + 1)));
      continue;
    }
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`wiki ${response.status}`);
    }
    const payload = await response.json();
    return ipaFromWikitext(payload?.parse?.wikitext?.["*"] ?? "");
  }
  return null;
}

async function fetchIpa(word) {
  return (await fetchDictIpa(word)) ?? (await fetchWikiIpa(word));
}

async function main() {
  const toeic = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/toeic-vocabulary.json"), "utf8"));
  const have = new Set(
    toeic
      .filter((row) => row.phonetic && !row.phonetic.includes("·"))
      .map((row) => row.word.toLowerCase()),
  );
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const missing = [];
  for (const topic of TOPICS) {
    const rows = JSON.parse(
      fs.readFileSync(path.join(ROOT, "src/data/lexicon/vocabulary", `${topic}.json`), "utf8"),
    );
    for (const row of rows) {
      const word = String(row.word || "").toLowerCase();
      if (
        !word ||
        isPlaceholderWord(word) ||
        have.has(word) ||
        existing[word] ||
        VIETNAMESE.test(word) ||
        SKIP_WORDS.has(word)
      ) {
        continue;
      }
      missing.push(word);
    }
  }
  const unique = [...new Set(missing)];
  console.log(`Need IPA for ${unique.length} lemmas`);
  for (let i = 0; i < unique.length; i += 1) {
    const word = unique[i];
    try {
      const ipa = await fetchIpa(word);
      if (ipa) {
        existing[word] = ipa;
        have.add(word);
      }
      if ((i + 1) % 15 === 0) {
        fs.writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n");
        console.log(`${i + 1}/${unique.length} (${Object.keys(existing).length} saved)`);
      }
    } catch (error) {
      console.warn(word, error.message || error);
      await new Promise((r) => setTimeout(r, 800));
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const sorted = {};
  for (const key of Object.keys(existing).sort()) {
    sorted[key] = existing[key];
  }
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(sorted).length} phonetics, toddler=${sorted.toddler}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
