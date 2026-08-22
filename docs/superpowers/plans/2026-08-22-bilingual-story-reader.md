# Bilingual Story Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Learning Reader MVP — 3-column bilingual story library on Home, full-screen chapter reader without Sora sidebar, SQLite persistence for progress/favorites/bookmarks/vocabulary, demo seed, in-place lookup + TTS.

**Architecture:** Domain in `src/features/stories/` with SQL only in `src/db/stories.ts`. Library replaces the placeholder `story` home action (sidebar kept → list + detail = 3 columns). Reader is a new `MainView "story-reader"`. Content is normalized (units → sentences → translations). Browser demo uses `browser-persist` mirrors like dictionary-cache. No React Router, no REST.

**Tech Stack:** Tauri 2, React 18, TypeScript, Zustand (existing), Tailwind + `src/index.css`, SQLite via `tauri-plugin-sql`, Vitest, Web Speech API, existing `quickLookup`.

**Spec:** `docs/superpowers/specs/2026-08-22-bilingual-story-reader-design.md`

## Global Constraints

- Phase 1–3 only — no Admin Import Center, no external story source APIs.
- No React Router; no REST story API; no SQL in components.
- Main window default **1280×800** in `tauri.conf.json`.
- Library: **3 columns** (Sora sidebar | list | detail). Reader: **no** left sidebar.
- No chapter locks / lock icons.
- One SQL statement per migration file; register every version in `src-tauri/src/lib.rs`.
- Vietnamese UI copy only in `src/constants/ui.ts`.
- Seed marked `INTERNAL_DEMO`; never hard-code story lists in JSX.
- `pnpm test` (full suite) must stay green; do not break chat / lookup / flashcards.
- Product laws in `docs/ARCHITECTURE.md` unchanged (no XP/SRS coupling in MVP).

## File map

| File | Responsibility |
| --- | --- |
| `src/features/stories/types.ts` | Domain types (StorySummary, Chapter, ContentUnit, Progress, …) |
| `src/features/stories/publish.ts` | `canPublishStory` rights gate |
| `src/features/stories/publish.test.ts` | Publish allow/deny |
| `src/features/stories/progress.ts` | Chapter % + story “Đã đọc X/Y” math |
| `src/features/stories/progress.test.ts` | Progress math |
| `src/features/stories/filter-sort.ts` | Search / filter / sort pure helpers |
| `src/features/stories/filter-sort.test.ts` | Filter/sort/search |
| `src/features/stories/language-mode.ts` | Mode helpers + preference keys |
| `src/features/stories/language-mode.test.ts` | Mode tests |
| `src/features/stories/chapter-nav.ts` | Prev/next chapter ids |
| `src/features/stories/chapter-nav.test.ts` | Boundary tests |
| `src/features/stories/tts.ts` | `TtsService` Web Speech wrapper |
| `src/features/stories/tts.test.ts` | Fake speechSynthesis stub tests |
| `src/features/stories/seed.ts` | Map fixture → insert ops / ensure seeded |
| `src/features/stories/service.ts` | Public async API (list, get, progress, favorite, …) |
| `src/features/stories/index.ts` | Public exports only |
| `src/data/stories/demo-catalog.ts` | 6 stories metadata + chapters stubs |
| `src/data/stories/a-new-friend-ch1.ts` | Full EN/VI units + featured vocab |
| `src/data/stories/ATTRIBUTION.md` | INTERNAL_DEMO notice |
| `src/db/stories.ts` | SQL + browser-persist fallback |
| `src/db/index.ts` | Re-export stories |
| `src-tauri/migrations/065_…076_….sql` | One CREATE TABLE each |
| `src-tauri/src/lib.rs` | Register migrations 65–76 |
| `src-tauri/tauri.conf.json` | main 1280×800 |
| `src/constants/ui.ts` | Library + Reader copy |
| `src/index.css` | `.yume-story*` layout/tokens |
| `src/components/stories/home-story-library.tsx` | 3-col library body (list + detail) |
| `src/components/stories/story-reader-screen.tsx` | Full reader |
| `src/components/stories/word-popover.tsx` | In-place dictionary popover |
| `src/components/shared/home-screen.tsx` | Wire library when `story` active |
| `src/App.tsx` | `MainView` + `story-reader` |
| `src/features/companion/home-panel.ts` | Keep `story` action (no semantic break) |

---

### Task 1: Publish rule + progress math (pure)

**Files:**
- Create: `src/features/stories/publish.ts`
- Create: `src/features/stories/publish.test.ts`
- Create: `src/features/stories/progress.ts`
- Create: `src/features/stories/progress.test.ts`
- Create: `src/features/stories/types.ts` (minimal types used by helpers)

**Interfaces:**
- Produces:
  - `canPublishStory(input: { status: string; rightsStatus: string; sourceType: string }): boolean`
  - `storyProgressLabel(completedChapters: number, totalChapters: number): { read: number; total: number; labelFraction: string }`
  - `storyProgressRatio(completedChapters: number, currentChapterFraction: number, totalChapters: number): number`
  - `isChapterNearComplete(progressPercentage: number): boolean` — true when `>= 90`
  - Types: `RightsStatus`, `StoryStatus`, `CefrLevel`

- [ ] **Step 1: Write failing tests**

```ts
// publish.test.ts
import { describe, expect, it } from "vitest";
import { canPublishStory } from "./publish";

describe("canPublishStory", () => {
  it("allows published + PUBLIC_DOMAIN", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "PUBLIC_DOMAIN",
        sourceType: "GUTENBERG",
      }),
    ).toBe(true);
  });

  it("denies PENDING_REVIEW and BLOCKED", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "PENDING_REVIEW",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "BLOCKED",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
  });

  it("allows INTERNAL_DEMO when published even if LICENSED", () => {
    expect(
      canPublishStory({
        status: "published",
        rightsStatus: "LICENSED",
        sourceType: "INTERNAL_DEMO",
      }),
    ).toBe(true);
  });

  it("denies draft", () => {
    expect(
      canPublishStory({
        status: "draft",
        rightsStatus: "CC_BY",
        sourceType: "STORYWEAVER",
      }),
    ).toBe(false);
  });
});
```

```ts
// progress.test.ts
import { describe, expect, it } from "vitest";
import {
  isChapterNearComplete,
  storyProgressLabel,
  storyProgressRatio,
} from "./progress";

describe("storyProgressRatio", () => {
  it("counts completed chapters plus current fraction", () => {
    // 2 done + 0.2 into chapter 3 of 12 → (2.2)/12
    expect(storyProgressRatio(2, 0.2, 12)).toBeCloseTo(2.2 / 12);
  });
});

describe("storyProgressLabel", () => {
  it("floors completed for X/Y display", () => {
    expect(storyProgressLabel(2, 12)).toEqual({
      read: 2,
      total: 12,
      labelFraction: "2/12",
    });
  });
});

describe("isChapterNearComplete", () => {
  it("is true at 90%+", () => {
    expect(isChapterNearComplete(89)).toBe(false);
    expect(isChapterNearComplete(90)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm exec vitest run src/features/stories/publish.test.ts src/features/stories/progress.test.ts`

- [ ] **Step 3: Implement**

```ts
// types.ts (excerpt)
export type RightsStatus =
  | "PUBLIC_DOMAIN"
  | "CC_BY"
  | "CC_BY_SA"
  | "LICENSED"
  | "PENDING_REVIEW"
  | "BLOCKED";

export type StoryStatus = "draft" | "review" | "published" | "archived";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";
```

```ts
// publish.ts
const ALLOWED = new Set(["PUBLIC_DOMAIN", "CC_BY", "CC_BY_SA", "LICENSED"]);

export function canPublishStory(input: {
  status: string;
  rightsStatus: string;
  sourceType: string;
}): boolean {
  if (input.status !== "published") return false;
  if (input.sourceType === "INTERNAL_DEMO") return true;
  return ALLOWED.has(input.rightsStatus);
}
```

```ts
// progress.ts
export function storyProgressRatio(
  completedChapters: number,
  currentChapterFraction: number,
  totalChapters: number,
): number {
  if (totalChapters <= 0) return 0;
  const frac = Math.min(1, Math.max(0, currentChapterFraction));
  return (completedChapters + frac) / totalChapters;
}

export function storyProgressLabel(completedChapters: number, totalChapters: number) {
  const read = Math.max(0, Math.floor(completedChapters));
  const total = Math.max(0, totalChapters);
  return { read, total, labelFraction: `${read}/${total}` };
}

export function isChapterNearComplete(progressPercentage: number): boolean {
  return progressPercentage >= 90;
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/features/stories/types.ts src/features/stories/publish.ts src/features/stories/publish.test.ts src/features/stories/progress.ts src/features/stories/progress.test.ts
git commit -m "feat(stories): add publish gate and progress math"
```

---

### Task 2: Filter / sort / chapter nav / language mode (pure)

**Files:**
- Create: `src/features/stories/filter-sort.ts`
- Create: `src/features/stories/filter-sort.test.ts`
- Create: `src/features/stories/chapter-nav.ts`
- Create: `src/features/stories/chapter-nav.test.ts`
- Create: `src/features/stories/language-mode.ts`
- Create: `src/features/stories/language-mode.test.ts`
- Modify: `src/features/stories/types.ts` — add `StorySummary`, `StoryFilter`, `StorySort`, `ReaderLanguageMode`

**Interfaces:**
- Produces:
  - `filterAndSortStories(stories: StorySummary[], query: { search: string; filter: StoryFilter; sort: StorySort }): StorySummary[]`
  - `adjacentChapterId(chapters: { id: number; orderNo: number }[], currentId: number, direction: "prev" | "next"): number | null`
  - `normalizeLanguageMode(raw: string | null): ReaderLanguageMode` — default `"bilingual"`
  - `READER_PREF_KEYS` — fontSize / theme / languageMode localStorage keys

`StoryFilter`: `"all" | "new" | "reading" | "favorite" | "children" | "communication"`  
`StorySort`: `"newest" | "popular" | "az" | "level" | "duration"`  
`ReaderLanguageMode`: `"bilingual" | "en" | "vi"`

- [ ] **Step 1: Write failing tests** for search match on title/description, filter `favorite` / `reading` / genre, sort A–Z, adjacent chapter null at ends, language mode default.

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm exec vitest run src/features/stories/filter-sort.test.ts src/features/stories/chapter-nav.test.ts src/features/stories/language-mode.test.ts`

- [ ] **Step 3: Implement helpers** (pure array filter/sort; case-insensitive search; CEFR order A1→C1 for level sort).

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(stories): add filter, sort, chapter nav, language mode helpers"
```

---

### Task 3: Demo seed fixtures

**Files:**
- Create: `src/data/stories/demo-catalog.ts`
- Create: `src/data/stories/a-new-friend-ch1.ts`
- Create: `src/data/stories/ATTRIBUTION.md`
- Create: `src/features/stories/seed.ts` (pure: build insert plan from fixtures — no DB yet)
- Create: `src/features/stories/seed.test.ts`

**Interfaces:**
- Produces:
  - `DEMO_STORIES: DemoStoryMeta[]` — 6 stories with slug, titles, CEFR, chapterCount, minutes, genre tags, cover key
  - `A_NEW_FRIEND_CH1: { units: Array<{ type; enSentences: string[]; viSentences: string[] }>; featured: FeaturedVocab[] }`
  - `buildDemoSeedPlan(): DemoSeedPlan` — flat structure with stable slugs/ids for tests
  - Featured words exactly: `quiet`, `forest`, `soft`, `fly`, `den`

Content for chapter 1 EN/VI: copy verbatim from the product prompt in the user request / spec §3.4.

- [ ] **Step 1: Write test** asserting plan has 6 stories, A New Friend has 12 chapters, ch1 has ≥3 units and 5 featured lemmas.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Author fixtures + `buildDemoSeedPlan`**

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(stories): add INTERNAL_DEMO bilingual seed fixtures"
```

---

### Task 4: SQLite schema migrations + window size

**Files:**
- Create: `src-tauri/migrations/065_story_sources.sql` … `076_user_story_vocabulary.sql` (12 files, **one CREATE TABLE each**)
- Modify: `src-tauri/src/lib.rs` — append Migration version 65–76
- Modify: `src-tauri/tauri.conf.json` — main `width: 1280`, `height: 800` (keep `minWidth`/`minHeight` ≥ 960×640 if present or add them)

**Schema (exact columns — match spec):**

`story_sources(id, name, source_type, website, api_endpoint, created_at)`  
`story_rights(id, story_id, source_id, source_story_url, original_license, license_url, rights_status, commercial_use_allowed, attribution_required, attribution_text, author_credit, illustrator_credit, translator_credit, territory_notes, verified_at, verified_by, evidence_url, notes)`  
`stories(id, slug UNIQUE, title_en, title_vi, description_en, description_vi, author_id, source_id, cover_url, cefr_level, genre, estimated_read_minutes, publication_year, status, created_at, updated_at)`  
`story_chapters(id, story_id, chapter_no, slug, title_en, title_vi, estimated_read_minutes, order_no, status, created_at, updated_at)`  
`story_content_units(id, chapter_id, unit_type, order_no, created_at)`  
`story_sentences(id, content_unit_id, order_no, source_language, source_text, word_count, cefr_level, created_at)`  
`story_sentence_translations(id, sentence_id, language, text, translator_name, translation_type, version, review_status, created_at, updated_at)`  
`story_featured_vocabulary(id, chapter_id, sentence_id, word, lemma, ipa, part_of_speech, meaning_vi, order_no, is_featured, audio_url)`  
`user_story_progress(id, user_id, story_id, chapter_id, sentence_id, content_unit_id, progress_percentage, last_read_at, completed_at, updated_at, UNIQUE(user_id, story_id))`  
`user_story_favorites(user_id, story_id, created_at, PRIMARY KEY(user_id, story_id))`  
`user_story_bookmarks(id, user_id, story_id, chapter_id, sentence_id, created_at)`  
`user_story_vocabulary(id, user_id, word, lemma, ipa, meaning_vi, story_id, chapter_id, sentence_id, original_sentence, context_translation, mastery_level, saved_at, updated_at)`

Use `INTEGER PRIMARY KEY AUTOINCREMENT` and `REFERENCES` where appropriate. Prefer UNIQUE constraints inside CREATE (counts as one statement).

- [ ] **Step 1: Add 12 SQL files**

- [ ] **Step 2: Register in `lib.rs` after version 64** (copy existing Migration block style)

- [ ] **Step 3: Set window size in `tauri.conf.json`**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(stories): add SQLite schema migrations and 1280x800 main window"
```

Note: No automated test for migrations; verify by reading `lib.rs` versions contiguous 65–76.

---

### Task 5: DB layer + ensure seed

**Files:**
- Create: `src/db/stories.ts`
- Modify: `src/db/index.ts` — `export * from "./stories"`
- Create: `src/features/stories/service.ts` (initial: `ensureStoriesSeeded`, `listStorySummaries`)
- Create: `src/features/stories/service.test.ts` — test pure mapping / seed idempotency with mocked db OR test `buildDemoSeedPlan` integration already covered; prefer testing `mapStoryRow` helpers extracted if needed
- Create: `src/features/stories/index.ts`

**Interfaces:**
- Produces (async):
  - `ensureStoriesSeeded(): Promise<void>` — if no published stories, insert demo plan (Tauri SQL; browser: write JSON store)
  - `listStorySummaries(): Promise<StorySummary[]>` — join rights/source; filter with `canPublishStory`; attach favorite + progress for `requireUserId()`
  - Browser key: `yume-stories-v1` via `readBrowserJson` / `writeBrowserJson`

Follow `src/db/dictionary-cache.ts` `isTauri()` branching.

- [ ] **Step 1: Implement `src/db/stories.ts` CRUD primitives** (`insertSource`, `insertStory`, `listPublishedStories`, `getProgress`, `upsertProgress`, `toggleFavorite`, …)

- [ ] **Step 2: Implement `ensureStoriesSeeded` + `listStorySummaries` in service**

- [ ] **Step 3: Add a unit test** that `canPublishStory` filters a mixed fixture list (pure, no SQLite)

- [ ] **Step 4: Export from `index.ts`**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(stories): add db helpers and demo seed ensure"
```

---

### Task 6: Remaining service APIs (chapter content, vocab, bookmark)

**Files:**
- Modify: `src/db/stories.ts`
- Modify: `src/features/stories/service.ts`
- Modify: `src/features/stories/index.ts`
- Create: `src/features/stories/content-map.ts` — join units → `{ id, type, en, vi, sentenceIds }`
- Create: `src/features/stories/content-map.test.ts`

**Interfaces:**
- Produces:
  - `getStoryDetail(storyId: number): Promise<StoryDetail | null>`
  - `listChapters(storyId: number): Promise<StoryChapter[]>`
  - `getChapterContent(chapterId: number): Promise<ChapterContent>`
  - `getStoryProgress(storyId: number): Promise<UserStoryProgress | null>`
  - `saveStoryProgress(input: SaveProgressInput): Promise<void>`
  - `toggleStoryFavorite(storyId: number): Promise<boolean>`
  - `addStoryBookmark` / `removeStoryBookmark`
  - `listFeaturedVocabulary(chapterId: number)`
  - `saveUserStoryVocabulary(input)` / `listUserStoryVocabulary()`

`ChapterContent.units: Array<{ id: number; unitType: string; orderNo: number; sentences: Array<{ id: number; en: string; vi: string }> }>`

- [ ] **Step 1: Write `content-map.test.ts`** pairing EN sentences with VI translations by order

- [ ] **Step 2: Implement content-map + service methods**

- [ ] **Step 3: Run targeted tests + `pnpm test` subset for stories**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(stories): chapter content, progress, favorite, vocab APIs"
```

---

### Task 7: UI copy + CSS tokens

**Files:**
- Modify: `src/constants/ui.ts` — replace/add keys (keep unused old keys only if referenced; prefer rename in place for home story labels)
- Modify: `src/index.css` — `.yume-home--stories` 3-col grid; `.yume-story-*` surfaces, reader layout, CTA gradient

**Copy keys (minimum):**
- `homeDailyStory`: `"Đọc truyện · Song ngữ"`
- `homeStoryShortHint`: `"Thư viện"`
- `storyLibraryEyebrow`, `storyLibraryTitle`, `storyLibrarySubtitle`
- `storySearchPlaceholder`, filter/sort labels, CTA labels, reader toolbar, empty/error strings

CSS: reuse galaxy shell; violet borders; glass panels; purple→coral CTA; reader content font-size CSS variables `--yume-reader-font-size`.

- [ ] **Step 1: Add copy + CSS**

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(stories): add library/reader UI copy and CSS tokens"
```

---

### Task 8: Library UI components

**Files:**
- Create: `src/components/stories/home-story-library.tsx`
- Create: `src/components/stories/story-detail-panel.tsx` (optional split if file grows)
- Modify: `src/components/shared/home-screen.tsx`

**Behavior:**
- When `panel === "story"`, render `HomeStoryLibrary` instead of lesson card; use layout class `yume-home--stories` (3-col: existing aside + library main + detail).
- On mount: `ensureStoriesSeeded()` then `listStorySummaries()`.
- Local state: search (debounced 350ms), filter, sort, selectedStoryId, selectedChapterId.
- Wire favorite toggle, share (navigator.share or clipboard), CTAs call `onOpenReader(storyId, chapterId)`.

**Interfaces:**
- Consumes: stories service APIs from Task 5–6
- Produces: `HomeStoryLibraryProps { pet streak already in parent; session; onOpenAccount; onOpenReader: (storyId, chapterId) => void }`

- [ ] **Step 1: Implement library + detail UI matching reference spirit**

- [ ] **Step 2: Wire `home-screen.tsx`** — pass `onOpenReader` up via new optional prop to App later; for now accept callback prop from HomeScreen

- [ ] **Step 3: Manual smoke in `pnpm dev`** — open story action, see 6 cards (browser persist path)

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(stories): add 3-column story library on home"
```

---

### Task 9: Reader screen shell + App routing

**Files:**
- Create: `src/components/stories/story-reader-screen.tsx`
- Modify: `src/App.tsx` — extend `MainView` with `"story-reader"`; hold `{ storyId, chapterId }`; render reader; breadcrumb back sets home + signal to open story action
- Modify: `src/components/shared/home-screen.tsx` — `openStorySignal` optional number to force `activeAction = "story"`

**Reader MVP shell (this task):**
- Header breadcrumb, titles, language mode pills, font size control, theme toggle (galaxy/dark), progress bar placeholder driven by state
- Bilingual unit list from `getChapterContent`
- Bottom chapter nav using `adjacentChapterId`
- Highlight featured lemmas in EN text (simple split/wrap by word)

- [ ] **Step 1: Implement reader load/error/retry**

- [ ] **Step 2: Wire App MainView**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(stories): add fullscreen story reader view"
```

---

### Task 10: Persist progress + preferences + bookmark

**Files:**
- Modify: `src/components/stories/story-reader-screen.tsx`
- Modify: `src/features/stories/language-mode.ts` if needed for font/theme prefs
- Create: `src/features/stories/reader-prefs.ts` + `reader-prefs.test.ts`

**Behavior:**
- Debounced `saveStoryProgress` every 5s while scrolling; also on chapter change / `visibilitychange` / unmount
- Mark chapter complete when `isChapterNearComplete` then Next, or scroll ≥90%
- Bookmark button ↔ `user_story_bookmarks`
- Persist languageMode / fontSize / theme via `localStorage` keys in `READER_PREF_KEYS`

- [ ] **Step 1: Tests for prefs normalize**

- [ ] **Step 2: Wire persistence in reader**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(stories): persist reader progress, prefs, and bookmarks"
```

---

### Task 11: Dictionary popover + featured vocab + save word

**Files:**
- Create: `src/components/stories/word-popover.tsx`
- Modify: `src/components/stories/story-reader-screen.tsx`
- Modify: `src/features/stories/service.ts` if save vocab needs polish

**Behavior:**
- Click word in EN → popover; call `quickLookup(word)` from `features/quick-lookup`
- Show IPA/POS/meaning; Save → `saveUserStoryVocabulary` with sentence context
- Right panel lists featured vocab; click speaks or opens detail; “Xem tất cả” opens simple modal listing featured (+ saved for chapter if easy)

Error: show `UI.storyDictError` without crashing.

- [ ] **Step 1: Implement popover + panel**

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(stories): in-reader lookup, featured vocab, save words"
```

---

### Task 12: TTS + final verification

**Files:**
- Create: `src/features/stories/tts.ts`
- Create: `src/features/stories/tts.test.ts`
- Modify: `src/components/stories/story-reader-screen.tsx` — Nghe chapter / word / sentence
- Modify: `src/features/stories/index.ts`

**Interfaces:**
```ts
export interface TtsService {
  speakText(text: string, lang?: string): void;
  speakSentence(text: string): void;
  speakChapter(texts: string[]): void;
  stop(): void;
  pause(): void;
  resume(): void;
  setRate(rate: number): void;
  supported: boolean;
}
export function createWebTts(speech?: SpeechSynthesis): TtsService;
```

- [ ] **Step 1: Failing tests with fake `speechSynthesis` mock**

- [ ] **Step 2: Implement + wire Nghe button / vocab speakers**

- [ ] **Step 3: Run full suite**

Run: `pnpm test`  
Expected: exit 0

- [ ] **Step 4: Fix any regressions**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(stories): add Web Speech TTS and finish reader MVP"
```

---

## Spec coverage checklist

| Spec area | Task(s) |
| --- | --- |
| 3-col Library + sidebar | 7–8 |
| Fullscreen Reader | 9 |
| Schema + rights | 4–5 |
| Seed INTERNAL_DEMO | 3, 5 |
| Progress / favorite / bookmark / vocab | 6, 10, 11 |
| Search/filter/sort | 2, 8 |
| Language modes / font / theme | 2, 9–10 |
| Dictionary popover | 11 |
| TTS | 12 |
| No chapter locks | 8–9 (UI omits locks) |
| 1280×800 | 4 |
| Out of scope Phase 4–5 | — deferred |

## Self-review notes

- No TBD placeholders in task steps.
- Types/names consistent: `StorySummary`, `canPublishStory`, `ensureStoriesSeeded`, `getChapterContent`.
- Migrations split for one-statement rule.
- Browser path covered via `isTauri` + `browser-persist`.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-22-bilingual-story-reader.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with executing-plans checkpoints  

Which approach?
