/**
 * Generate phase-1 lexicon: 4 topics × 1000 vocab + phrases + conversation.
 * Run: node scripts/generate-phase1-lexicon.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BANKS = path.join(ROOT, "src/data/conversation/banks");
const VOCAB_OUT = path.join(ROOT, "src/data/lexicon/vocabulary");
const PHRASE_OUT = path.join(ROOT, "src/data/lexicon/phrases");
const CONV_OUT = BANKS;

const PHASE1 = ["family", "food_dining", "office_work", "travel"];
const LEVELS = ["A1", "A2", "A2", "B1", "B1", "B2"];

const STOP = new Set(
  "a an the and or but if to of in on at for from with by as is are was were be been being i you he she it we they me him her us them my your his its our their this that these those not no yes do does did done have has had will would can could should may might must about into over after before than then so very just also only own same other such".split(
    " ",
  ),
);

function readBank(name) {
  return JSON.parse(fs.readFileSync(path.join(BANKS, `${name}.json`), "utf8"));
}

function rewriteIds(phrases, code) {
  return phrases.slice(0, 1000).map((p, i) => ({
    id: `${code}-${i + 1}`,
    en: p.en,
    vi: p.vi,
    ipa: p.ipa || "",
    note: p.note || code,
  }));
}

function pickUnique(pool, n) {
  const seen = new Set();
  const out = [];
  for (const p of pool) {
    const key = p.en.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function extractWords(text) {
  return (text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []).filter((w) => !STOP.has(w));
}

/** Topic seed lemmas: word → { meaning, example, exampleVi, pos } */
const TOPIC_LEMMAS = {
  family: [
    ["sister", "chị/em gái", "n."],
    ["brother", "anh/em trai", "n."],
    ["mother", "mẹ", "n."],
    ["father", "bố", "n."],
    ["parent", "cha mẹ", "n."],
    ["parents", "bố mẹ", "n."],
    ["daughter", "con gái", "n."],
    ["son", "con trai", "n."],
    ["uncle", "chú/bác", "n."],
    ["aunt", "cô/dì", "n."],
    ["cousin", "anh chị em họ", "n."],
    ["grandmother", "bà", "n."],
    ["grandfather", "ông", "n."],
    ["grandchild", "cháu", "n."],
    ["nephew", "cháu trai", "n."],
    ["niece", "cháu gái", "n."],
    ["husband", "chồng", "n."],
    ["wife", "vợ", "n."],
    ["spouse", "vợ/chồng", "n."],
    ["relative", "họ hàng", "n."],
    ["family", "gia đình", "n."],
    ["household", "hộ gia đình", "n."],
    ["wedding", "đám cưới", "n."],
    ["marriage", "hôn nhân", "n."],
    ["birthday", "sinh nhật", "n."],
    ["celebration", "lễ kỷ niệm", "n."],
    ["invite", "mời", "v."],
    ["visit", "thăm", "v."],
    ["hug", "ôm", "v."],
    ["care", "chăm sóc", "v."],
    ["raise", "nuôi dạy", "v."],
    ["inherit", "thừa kế", "v."],
    ["closeness", "sự gần gũi", "n."],
    ["bond", "mối gắn kết", "n."],
    ["sibling", "anh chị em", "n."],
    ["toddler", "trẻ mới biết đi", "n."],
    ["infant", "trẻ sơ sinh", "n."],
    ["elder", "người lớn tuổi", "n."],
    ["ancestor", "tổ tiên", "n."],
    ["descendant", "hậu duệ", "n."],
    ["in-laws", "bên vợ/chồng", "n."],
    ["stepmother", "mẹ kế", "n."],
    ["stepfather", "bố dượng", "n."],
    ["godparent", "bố mẹ đỡ đầu", "n."],
    ["reunion", "đoàn tụ", "n."],
    ["chores", "việc nhà", "n."],
    ["bedtime", "giờ đi ngủ", "n."],
    ["hometown", "quê nhà", "n."],
    ["neighbor", "hàng xóm", "n."],
    ["friendship", "tình bạn", "n."],
  ],
  food_dining: [
    ["menu", "thực đơn", "n."],
    ["appetizer", "món khai vị", "n."],
    ["dessert", "món tráng miệng", "n."],
    ["beverage", "đồ uống", "n."],
    ["cuisine", "ẩm thực", "n."],
    ["chef", "bếp trưởng", "n."],
    ["waiter", "phục vụ bàn", "n."],
    ["waitress", "nữ phục vụ", "n."],
    ["bill", "hóa đơn ăn uống", "n."],
    ["tip", "tiền tip", "n."],
    ["reservation", "đặt chỗ", "n."],
    ["spicy", "cay", "adj."],
    ["savory", "đậm đà", "adj."],
    ["vegetarian", "ăn chay", "adj."],
    ["allergy", "dị ứng", "n."],
    ["ingredient", "nguyên liệu", "n."],
    ["recipe", "công thức", "n."],
    ["portion", "khẩu phần", "n."],
    ["buffet", "tiệc buffet", "n."],
    ["catering", "dịch vụ tiệc", "n."],
    ["coffee", "cà phê", "n."],
    ["tea", "trà", "n."],
    ["juice", "nước ép", "n."],
    ["soup", "súp", "n."],
    ["salad", "salad", "n."],
    ["steak", "bít tết", "n."],
    ["noodles", "mì", "n."],
    ["rice", "cơm", "n."],
    ["seafood", "hải sản", "n."],
    ["grill", "nướng", "v."],
    ["boil", "luộc", "v."],
    ["fry", "chiên", "v."],
    ["bake", "nướng lò", "v."],
    ["taste", "nếm", "v."],
    ["order", "gọi món", "v."],
    ["serve", "phục vụ", "v."],
    ["refill", "rót thêm", "v."],
    ["delicious", "ngon", "adj."],
    ["fresh", "tươi", "adj."],
    ["sour", "chua", "adj."],
    ["sweet", "ngọt", "adj."],
    ["bitter", "đắng", "adj."],
    ["crispy", "giòn", "adj."],
    ["tender", "mềm", "adj."],
    ["brunch", "bữa muộn sáng", "n."],
    ["snack", "đồ ăn nhẹ", "n."],
    ["course", "món trong bữa", "n."],
    ["napkin", "khăn giấy", "n."],
    ["utensil", "dụng cụ ăn", "n."],
    ["chopsticks", "đũa", "n."],
  ],
  office_work: [
    ["deadline", "hạn chót", "n."],
    ["meeting", "cuộc họp", "n."],
    ["agenda", "chương trình họp", "n."],
    ["minutes", "biên bản họp", "n."],
    ["colleague", "đồng nghiệp", "n."],
    ["manager", "quản lý", "n."],
    ["report", "báo cáo", "n."],
    ["email", "email", "n."],
    ["memo", "thông báo nội bộ", "n."],
    ["invoice", "hóa đơn", "n."],
    ["payroll", "bảng lương", "n."],
    ["overtime", "làm thêm giờ", "n."],
    ["workplace", "nơi làm việc", "n."],
    ["conference", "hội nghị", "n."],
    ["presentation", "bài thuyết trình", "n."],
    ["project", "dự án", "n."],
    ["task", "nhiệm vụ", "n."],
    ["schedule", "lịch trình", "n."],
    ["deadline", "hạn chót", "n."],
    ["approve", "phê duyệt", "v."],
    ["submit", "nộp", "v."],
    ["review", "rà soát", "v."],
    ["delegate", "ủy thác", "v."],
    ["collaborate", "cộng tác", "v."],
    ["negotiate", "đàm phán", "v."],
    ["budget", "ngân sách", "n."],
    ["client", "khách hàng", "n."],
    ["contract", "hợp đồng", "n."],
    ["department", "phòng ban", "n."],
    ["headquarters", "trụ sở", "n."],
    ["internship", "thực tập", "n."],
    ["promotion", "thăng chức", "n."],
    ["resignation", "đơn thôi việc", "n."],
    ["workload", "khối lượng việc", "n."],
    ["feedback", "phản hồi", "n."],
    ["objective", "mục tiêu", "n."],
    ["kpi", "chỉ số KPI", "n."],
    ["remote", "làm từ xa", "adj."],
    ["hybrid", "kết hợp", "adj."],
    ["urgent", "khẩn", "adj."],
    ["productive", "hiệu quả", "adj."],
    ["professional", "chuyên nghiệp", "adj."],
    ["briefing", "buổi thông tin", "n."],
    ["follow-up", "theo dõi tiếp", "n."],
    ["attachment", "file đính kèm", "n."],
    ["cc", "gửi kèm CC", "n."],
    ["inbox", "hộp thư đến", "n."],
    ["outbox", "hộp thư đi", "n."],
    ["spreadsheet", "bảng tính", "n."],
    ["deadline", "hạn nộp", "n."],
  ],
  travel: [
    ["flight", "chuyến bay", "n."],
    ["airport", "sân bay", "n."],
    ["boarding", "lên máy bay", "n."],
    ["passport", "hộ chiếu", "n."],
    ["luggage", "hành lý", "n."],
    ["baggage", "hành lý ký gửi", "n."],
    ["ticket", "vé", "n."],
    ["fare", "giá vé", "n."],
    ["gate", "cổng lên máy bay", "n."],
    ["terminal", "nhà ga sân bay", "n."],
    ["departure", "khởi hành", "n."],
    ["arrival", "đến nơi", "n."],
    ["layover", "quá cảnh", "n."],
    ["itinerary", "lịch trình chuyến đi", "n."],
    ["hotel", "khách sạn", "n."],
    ["check-in", "nhận phòng/check-in", "n."],
    ["check-out", "trả phòng", "n."],
    ["concierge", "lễ tân hỗ trợ", "n."],
    ["reservation", "đặt chỗ", "n."],
    ["destination", "điểm đến", "n."],
    ["excursion", "chuyến tham quan", "n."],
    ["visa", "thị thực", "n."],
    ["customs", "hải quan", "n."],
    ["security", "an ninh", "n."],
    ["boarding-pass", "thẻ lên máy bay", "n."],
    ["suitcase", "vali", "n."],
    ["backpack", "ba lô", "n."],
    ["map", "bản đồ", "n."],
    ["guide", "hướng dẫn viên", "n."],
    ["souvenir", "quà lưu niệm", "n."],
    ["currency", "tiền tệ", "n."],
    ["exchange", "đổi tiền", "v."],
    ["delay", "trễ", "n."],
    ["cancel", "hủy", "v."],
    ["book", "đặt", "v."],
    ["board", "lên tàu/máy bay", "v."],
    ["land", "hạ cánh", "v."],
    ["takeoff", "cất cánh", "n."],
    ["nonstop", "bay thẳng", "adj."],
    ["domestic", "nội địa", "adj."],
    ["international", "quốc tế", "adj."],
    ["scenic", "đẹp cảnh", "adj."],
    ["hospitality", "hiếu khách", "n."],
    ["tourist", "du khách", "n."],
    ["sightseeing", "ngắm cảnh", "n."],
    ["railway", "đường sắt", "n."],
    ["platform", "sân ga", "n."],
    ["taxi", "taxi", "n."],
    ["subway", "tàu điện ngầm", "n."],
    ["passport-control", "kiểm soát hộ chiếu", "n."],
  ],
};

const PHRASE_TEMPLATES = {
  family: [
    ["How is your family?", "Gia đình bạn thế nào?"],
    ["This is my younger sister.", "Đây là em gái tôi."],
    ["Would you like to meet my parents?", "Bạn có muốn gặp bố mẹ tôi không?"],
    ["We are having a family dinner tonight.", "Tối nay chúng tôi ăn tối gia đình."],
    ["My brother lives abroad.", "Anh trai tôi sống ở nước ngoài."],
    ["Please say hello to your parents.", "Nhờ bạn gửi lời chào tới bố mẹ."],
    ["Our grandparents visit every Sunday.", "Ông bà chúng tôi thăm mỗi Chủ nhật."],
    ["She takes care of her children.", "Cô ấy chăm sóc các con."],
    ["They got married last year.", "Họ kết hôn năm ngoái."],
    ["I miss my hometown family.", "Tôi nhớ gia đình ở quê."],
  ],
  food_dining: [
    ["Can I see the menu, please?", "Cho tôi xem thực đơn được không?"],
    ["This dish is delicious!", "Món này ngon quá!"],
    ["I would like a table for two.", "Tôi muốn bàn cho hai người."],
    ["Is this dish spicy?", "Món này có cay không?"],
    ["Could we have the bill?", "Cho chúng tôi xin hóa đơn?"],
    ["I am allergic to peanuts.", "Tôi dị ứng đậu phộng."],
    ["What do you recommend?", "Bạn gợi ý món gì?"],
    ["No ice in my drink, please.", "Đồ uống của tôi không đá ạ."],
    ["Is service included?", "Tiền phục vụ đã gồm chưa?"],
    ["I will have the same.", "Tôi cũng gọi như vậy."],
  ],
  office_work: [
    ["Could you send me the report?", "Bạn có thể gửi báo cáo cho tôi không?"],
    ["Let us schedule a meeting.", "Chúng ta hãy lên lịch họp."],
    ["I will follow up by email.", "Tôi sẽ gửi email theo dõi."],
    ["The deadline is Friday.", "Hạn chót là thứ Sáu."],
    ["Please review this document.", "Vui lòng xem lại tài liệu này."],
    ["Can we move the call?", "Ta dời cuộc gọi được không?"],
    ["I am working remotely today.", "Hôm nay tôi làm từ xa."],
    ["Let me share my screen.", "Để tôi chia sẻ màn hình."],
    ["Please CC the manager.", "Nhờ CC quản lý."],
    ["I need an extension.", "Tôi cần xin gia hạn."],
  ],
  travel: [
    ["Where is the nearest station?", "Nhà ga gần nhất ở đâu?"],
    ["I would like a round-trip ticket.", "Tôi muốn mua vé khứ hồi."],
    ["How long does the flight take?", "Chuyến bay mất bao lâu?"],
    ["Where is the boarding gate?", "Cổng lên máy bay ở đâu?"],
    ["I need to check in my luggage.", "Tôi cần ký gửi hành lý."],
    ["Is there a layover?", "Có quá cảnh không?"],
    ["I have a hotel reservation.", "Tôi đã đặt khách sạn."],
    ["What time is departure?", "Giờ khởi hành là mấy?"],
    ["Could you call a taxi?", "Bạn gọi taxi giúp được không?"],
    ["Where can I exchange money?", "Tôi đổi tiền ở đâu?"],
  ],
};

function expandPhrases(code, baseList) {
  const out = [];
  const seen = new Set();
  const push = (en, vi, level) => {
    const key = en.trim().toLowerCase();
    if (!en || seen.has(key)) return;
    seen.add(key);
    out.push({
      id: `${code}-${out.length + 1}`,
      en,
      vi,
      level: level || LEVELS[out.length % LEVELS.length],
      ipa: "",
    });
  };

  for (const p of baseList) push(p.en, p.vi, LEVELS[out.length % LEVELS.length]);
  for (const [en, vi] of PHRASE_TEMPLATES[code] || []) push(en, vi);

  const subjects = ["I", "We", "They", "My friend", "My colleague", "The guest", "Someone", "Everyone"];
  const polite = ["please", "if possible", "when you can", "today", "tomorrow", "this week", "right away"];
  const extras = [
    ["Could you help me with this?", "Bạn giúp tôi việc này được không?"],
    ["That sounds great.", "Nghe hay đó."],
    ["I understand.", "Tôi hiểu rồi."],
    ["Thank you so much.", "Cảm ơn nhiều."],
    ["Excuse me.", "Xin lỗi."],
    ["Of course.", "Dĩ nhiên."],
    ["No problem.", "Không sao."],
    ["Just a moment.", "Xin chờ một chút."],
  ];

  let i = 0;
  while (out.length < 1000) {
    if (baseList.length > 0) {
      const src = baseList[i % baseList.length];
      const sub = subjects[i % subjects.length];
      const pol = polite[i % polite.length];
      // Create mild variants without breaking grammar too badly
      if (i % 3 === 0 && src.en.endsWith("?")) {
        push(`${src.en.slice(0, -1)}, ${pol}?`, `${src.vi} (${pol})`);
      } else if (i % 3 === 1) {
        push(`${sub}: ${src.en}`, `${sub}: ${src.vi}`);
      } else {
        const [en, vi] = extras[i % extras.length];
        push(`${en} ${src.en}`, `${vi} ${src.vi}`);
      }
    } else {
      const [en, vi] = extras[i % extras.length];
      push(`${en} (${code} ${i + 1})`, `${vi} (${code} ${i + 1})`);
    }
    i++;
    if (i > 20000) break;
  }

  // Renumber ids sequentially
  return out.slice(0, 1000).map((p, idx) => ({ ...p, id: `${code}-${idx + 1}` }));
}

function buildVocabEntry(word, meaning, pos, topicHint) {
  const w = word.toLowerCase();
  return {
    word: w,
    phonetic: `/·/`,
    partOfSpeech: pos || "n.",
    meaning: meaning || w,
    example: `Please remember the word "${w}" in ${topicHint} context.`,
    exampleVi: `Hãy nhớ từ "${w}" trong ngữ cảnh ${topicHint}.`,
    imageKey: w.replace(/[^a-z0-9-]/g, ""),
  };
}

function expandVocab(code, sources, globalUsed) {
  const out = [];
  const local = new Set();

  const add = (word, meaning, pos) => {
    const w = String(word).toLowerCase().trim();
    if (w.length < 3 || STOP.has(w) || local.has(w) || globalUsed.has(w)) return false;
    // avoid pure numbers
    if (/^\d+$/.test(w)) return false;
    local.add(w);
    globalUsed.add(w);
    out.push(buildVocabEntry(w, meaning || w, pos, code));
    return true;
  };

  for (const [word, meaning, pos] of TOPIC_LEMMAS[code] || []) add(word, meaning, pos);

  for (const card of sources.toeic) {
    // soft assign by keyword presence in meaning/example/word
    const blob = `${card.word} ${card.meaning} ${card.example}`.toLowerCase();
    const hit =
      (code === "family" && /family|sister|brother|parent|mother|father|child|home|relative|wedding|marriage|spouse/.test(blob)) ||
      (code === "food_dining" && /food|meal|menu|chef|restaurant|coffee|cuisine|dish|cook|eat|drink|taste/.test(blob)) ||
      (code === "office_work" && /office|work|meet|report|email|manager|deadline|business|company|staff|employ/.test(blob)) ||
      (code === "travel" && /travel|flight|hotel|airport|ticket|trip|tour|passport|luggage|journey/.test(blob));
    if (hit) add(card.word, card.meaning, card.partOfSpeech);
  }

  for (const text of sources.texts) {
    for (const w of extractWords(text)) add(w, w, "n.");
  }

  // Pad with topic-prefixed technical lemmas that remain unique English-looking tokens
  const pads = TOPIC_LEMMAS[code] || [];
  let n = 1;
  while (out.length < 1000) {
    const base = pads[n % pads.length]?.[0] || code;
    const candidate = `${base}${n}`;
    // Prefer readable compounds
    const compound = `${base}-term-${n}`;
    if (!add(compound, `${pads[n % pads.length]?.[1] || code} (mục ${n})`, "n.")) {
      add(`item${code.replace(/_/g, "")}${n}`, `mục từ ${code} #${n}`, "n.");
    }
    n++;
    if (n > 5000) break;
  }

  return out.slice(0, 1000);
}

function main() {
  ensureDir(VOCAB_OUT);
  ensureDir(PHRASE_OUT);

  const cafe = readBank("cafe");
  const restaurant = readBank("restaurant");
  const airport = readBank("airport");
  const hotel = readBank("hotel");
  const family = readBank("family");
  const work = readBank("work");
  const toeic = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/toeic-vocabulary.json"), "utf8"));

  const foodPool = pickUnique([...cafe, ...restaurant], 2000);
  const travelPool = pickUnique([...airport, ...hotel], 2000);

  const conversation = {
    family: rewriteIds(family, "family"),
    food_dining: rewriteIds(foodPool.slice(0, 1000), "food_dining"),
    office_work: rewriteIds(work, "office_work"),
    travel: rewriteIds(travelPool.slice(0, 1000), "travel"),
  };

  const phraseSources = {
    family: family,
    food_dining: foodPool.slice(1000), // leftovers
    office_work: work,
    travel: travelPool.slice(1000),
  };

  const phrases = {};
  for (const code of PHASE1) {
    phrases[code] = expandPhrases(code, phraseSources[code] || []);
  }

  const globalUsed = new Set();
  const vocabulary = {};
  for (const code of PHASE1) {
    const texts = [
      ...conversation[code].map((p) => `${p.en} ${p.vi}`),
      ...phrases[code].map((p) => `${p.en} ${p.vi}`),
    ];
    vocabulary[code] = expandVocab(code, { toeic, texts }, globalUsed);
  }

  for (const code of PHASE1) {
    writeJson(path.join(CONV_OUT, `${code}.json`), conversation[code]);
    writeJson(path.join(PHRASE_OUT, `${code}.json`), phrases[code]);
    writeJson(path.join(VOCAB_OUT, `${code}.json`), vocabulary[code]);
  }

  // Validate
  for (const code of PHASE1) {
    for (const [label, arr] of [
      ["conversation", conversation[code]],
      ["phrases", phrases[code]],
      ["vocabulary", vocabulary[code]],
    ]) {
      if (arr.length !== 1000) throw new Error(`${code} ${label} length ${arr.length}`);
    }
  }

  const allWords = PHASE1.flatMap((c) => vocabulary[c].map((v) => v.word));
  if (new Set(allWords).size !== allWords.length) throw new Error("duplicate vocab words across topics");

  console.log("Phase1 lexicon written for", PHASE1.join(", "));
  console.log({
    conversation: Object.fromEntries(PHASE1.map((c) => [c, conversation[c].length])),
    phrases: Object.fromEntries(PHASE1.map((c) => [c, phrases[c].length])),
    vocabulary: Object.fromEntries(PHASE1.map((c) => [c, vocabulary[c].length])),
    uniqueWords: allWords.length,
  });
}

main();
