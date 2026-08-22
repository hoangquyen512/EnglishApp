/**
 * Translate echo lexicon meanings (English copied as meaning) into Vietnamese.
 * Run: node scripts/enrich-vocab-meanings.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TOPICS = ["family", "food_dining", "office_work", "travel"];
const OUT = path.join(ROOT, "src/data/lexicon/meanings.json");
const API = "https://api.mymemory.translated.net/get?langpair=en%7Cvi&q=";

function isPlaceholderWord(word) {
  return /^[a-z]+(?:[-_][a-z]+)*-term-\d+$/i.test(word) || /^item[a-z]+\d+$/i.test(word);
}

function hasVietnamese(text) {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(
    text,
  );
}

async function translate(word) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(API + encodeURIComponent(word));
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const payload = await response.json();
    const text = payload?.responseData?.translatedText?.trim();
    if (!text) {
      return null;
    }
    const decoded = text.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
    if (decoded.toLowerCase() === word.toLowerCase()) {
      return null;
    }
    if (!hasVietnamese(decoded)) {
      return null;
    }
    return decoded;
  }
  return null;
}

async function main() {
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const toeic = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/toeic-vocabulary.json"), "utf8"));
  const haveToeic = new Set(
    toeic
      .filter((row) => {
        const word = String(row.word || "").toLowerCase();
        const meaning = String(row.meaning || "").trim();
        return word && meaning && meaning.toLowerCase() !== word;
      })
      .map((row) => String(row.word).toLowerCase()),
  );

  const missing = [];
  for (const topic of TOPICS) {
    const rows = JSON.parse(
      fs.readFileSync(path.join(ROOT, "src/data/lexicon/vocabulary", `${topic}.json`), "utf8"),
    );
    for (const row of rows) {
      const word = String(row.word || "").toLowerCase();
      if (!word || isPlaceholderWord(word) || existing[word] || haveToeic.has(word)) {
        continue;
      }
      if (hasVietnamese(word)) {
        continue;
      }
      if (String(row.meaning || "").trim().toLowerCase() !== word) {
        continue;
      }
      missing.push(word);
    }
  }
  const unique = [...new Set(missing)];
  console.log(`Need meanings for ${unique.length} lemmas`);
  for (let i = 0; i < unique.length; i += 1) {
    const word = unique[i];
    try {
      const vi = await translate(word);
      if (vi) {
        existing[word] = vi;
      }
    } catch (error) {
      console.warn(word, error.message || error);
    }
    if ((i + 1) % 15 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n");
      console.log(`${i + 1}/${unique.length} saved ${Object.keys(existing).length}`);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  const sorted = {};
  for (const key of Object.keys(existing).sort()) {
    sorted[key] = existing[key];
  }
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${Object.keys(sorted).length} meanings, pork=${sorted.pork}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
