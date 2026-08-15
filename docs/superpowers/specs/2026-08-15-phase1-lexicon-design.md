# Yume — Phase 1 Lexicon (4 topics × 1000 × 3) Design

Date: 2026-08-15  
Product: Yume  
Status: Approved for implementation (build ngay)  
Scope: Đủ **1000 từ + 1000 cụm + 1000 hội thoại** cho 4 chủ đề mặc định; pipeline import JSON→SQLite; thống nhất bank id = `topics.code`.

---

## Decisions

| Item | Choice |
| --- | --- |
| Scope đợt 1 | `family`, `food_dining`, `office_work`, `travel` |
| Full 18×3×1000 | Đợt sau, cùng pipeline |
| Storage | JSON ship + import SQLite (vocab/phrases); conversation JSON |
| Bank id | 1:1 `topics.code` |
| Old 12 banks | Input để remap; app đọc bank theo catalog code |

## Files

```
src/data/lexicon/vocabulary/{code}.json
src/data/lexicon/phrases/{code}.json
src/data/conversation/banks/{code}.json   # phase1 codes
src/data/lexicon/phase1.ts                # CONTENT_VERSION + codes
```

## Import

- Table `content_import_state (dataset, topic_code, content_version, imported_at)`
- Unique phrases `(phrase_en, topic_id)`
- Hydrate: import if version differs
- Conversation: no SQL import

## Remap conversation

| code | source |
| --- | --- |
| family | family.json |
| food_dining | cafe ∪ restaurant → 1000 |
| office_work | work.json |
| travel | airport ∪ hotel → 1000 |

Leftover cafe/restaurant/airport/hotel sentences → phrases for those topics.  
family/office phrases: templates + seeds + leftover patterns to 1000.

## Vocab

TOEIC assign + extract from banks + topic word lists → 1000 unique `word` per topic (global unique).

## Illustration

Map catalog prefix → existing art: `family→fam`, `food_dining→cafe`, `office_work→work`, `travel→air`.

## Tests

File length 1000, unique ids/words, idempotent import, deck filter by active topic.
