# Yume — Bilingual Story Reader (Learning Reader)

Date: 2026-08-22  
Product: Yume (Tauri desktop)  
Status: Ready for review  
Scope: **Phase 1–3** — Library UI, Reader UI, SQLite persistence (progress / favorite / bookmark / vocabulary), dictionary popover, TTS, reader preferences, INTERNAL_DEMO seed. **Not** Admin Import Center or external source connectors (Phase 4–5).

---

## 1. Context

Yume already has a home galaxy shell, left companion rail (Sora + three quick actions), and a placeholder `story` action labeled “Chuyện hôm nay” that opens a static vocab/phrase lesson card — not a bilingual narrative reader.

Stack constraints (must follow):

- Tauri 2 + React 18 + Zustand + Tailwind + SQLite (`tauri-plugin-sql`)
- No React Router; screen switching via `MainView` / local state in `App.tsx`
- No REST backend; domain in `src/features/`, SQL only in `src/db/`
- User-scoped rows via `requireUserId()`
- Vietnamese UI copy in `src/constants/ui.ts`
- Vitest pure-function tests under `src/**/*.test.ts`

UI references (mandatory spirit/layout):

1. Library — 3 columns: Sora sidebar | story list | story detail
2. Reader — full viewport, no left sidebar; bilingual columns + featured vocabulary panel

### 1.1 Decisions locked in brainstorming

| Topic | Choice |
| --- | --- |
| MVP scope | Phase 1–3 only |
| Architecture | Feature module + SQLite + `MainView` (no new router/REST) |
| Library layout | Keep left sidebar; right side becomes **two columns** → **3 columns total** |
| Reader layout | Full viewport, **no** left sidebar (breadcrumb back to Library) |
| Main window | Default **1280×800** for all main views (Home polish later) |
| Chapter locks | **None** in MVP — all chapters available; no lock icons |
| Content rights | Schema for sources/rights now; seed marked `INTERNAL_DEMO`; no copyrighted crawl |

### 1.2 Goals

1. Learner picks a leveled bilingual story, opens a chapter, reads EN↔VI aligned by content unit.
2. In-place word lookup, pronunciation, save vocabulary with sentence context.
3. Persist reading progress, favorites, bookmarks; resume from Library.
4. Demo seed runs in Tauri (SQLite) and browser demo (local fallback).
5. Design tokens/CSS extend galaxy theme — do not restyle the whole app.

### 1.3 Non-goals (this cycle)

- Admin Story Import Center / alignment review UI
- Global Storybooks, StoryWeaver, Gutenberg connectors
- AI re-translation of human Vietnamese
- Chapter paywall / sequential locks
- React Router or HTTP story API
- Binding story reading to XP/SRS product laws (unless a later product decision)
- Reworking Home chat/lookup layouts beyond what Library needs

---

## 2. Architecture & navigation

```
Home (activeAction)
  chat     → existing companion panel (2-col)
  lookup   → existing quick-lookup panel (2-col)
  story    → Library 3-col (sidebar | list | detail)
                │
                ├─ Đọc từ đầu        → chapter 1
                └─ Đọc chương đã chọn / Tiếp tục đọc
                         │
                         ▼
              MainView "story-reader" (full viewport)
                         │
              breadcrumb "Thư viện truyện" → home + activeAction story
```

### 2.1 View state

| State | UI |
| --- | --- |
| `view: "home"`, `activeAction: "story"` | Library 3 columns |
| `view: "home"`, `chat` / `lookup` / null | Existing home behavior (story default panel replaced when action is story) |
| `view: "story-reader"` | Reader; props: `storyId`, `chapterId` |
| `account` / `edit` / `learning-program` | Unchanged |

No URL routing in MVP. Optional future deep-link via query is out of scope.

### 2.2 Window size

Update `src-tauri/tauri.conf.json` main window to **1280×800** (set sensible `minWidth` / `minHeight`). Home visual rebalance is deferred to the user.

### 2.3 Modules

```
src/features/stories/          domain + public index.ts
src/db/stories.ts              SQL strings only
src/components/stories/        library + reader components
src/data/stories/              seed fixtures (JSON or TS) + attribution notes
src-tauri/migrations/065_*.sql schema (+ seed or load-on-hydrate)
src/constants/ui.ts            Vietnamese copy
src/index.css                  .yume-story* tokens / layout
```

Components call `features/stories` and existing `features/quick-lookup` public APIs only.

---

## 3. Data model

Normalized content — never one EN blob + one VI blob for an entire book.

### 3.1 Content & rights

| Table | Purpose |
| --- | --- |
| `story_sources` | Source registry (`INTERNAL_DEMO`, future open licenses) |
| `story_rights` | License, attribution, `rights_status`, commercial flags |
| `stories` | slug, titles, descriptions, cover, CEFR, genre, minutes, `status` |
| `story_chapters` | chapter_no, titles, minutes, order_no, status |
| `story_content_units` | paragraph / dialogue / heading / quote; order_no |
| `story_sentences` | EN (or source) text per unit; order_no; word_count |
| `story_sentence_translations` | language + text + translation_type + review_status |
| `story_featured_vocabulary` | curated highlights per chapter |

### 3.2 User state

| Table | Unique / notes |
| --- | --- |
| `user_story_progress` | `(user_id, story_id)` — chapter_id, sentence/content_unit, %, last_read_at, completed_at |
| `user_story_favorites` | `(user_id, story_id)` |
| `user_story_bookmarks` | user + story + chapter (+ optional sentence) |
| `user_story_vocabulary` | saved words with story/chapter/sentence context |

Indexes: stories slug/status/cefr; chapters `(story_id, order_no)`; units/sentences order; translations `(sentence_id, language)`; progress/favorites unique pairs; vocab `(user_id, lemma)`.

### 3.3 Publish rule

A story appears in the learner Library only when:

- `stories.status = 'published'`, and
- `story_rights.rights_status` ∈ `{ PUBLIC_DOMAIN, CC_BY, CC_BY_SA, LICENSED }`, or
- source is explicitly `INTERNAL_DEMO` (allowlisted for demo seed only).

Never publish `PENDING_REVIEW` or `BLOCKED`.

Attribution: when `attribution_required`, show “Nguồn & bản quyền” on story detail.

### 3.4 Seed (INTERNAL_DEMO)

- Six library cards matching the UI reference titles/levels (A New Friend, The Lost Star, Milo and the Moon, A Day at the Park, The Brave Little Bird, Sora's Secret Garden).
- **A New Friend** chapter 1: full bilingual content from the product prompt + featured vocab `quiet`, `forest`, `soft`, `fly`, `den`.
- Remaining chapters for A New Friend: metadata + minimal placeholder units so Next chapter works.
- Other stories: chapter lists + short chapter-1 units sufficient to open Reader.
- Seed lives under `src/data/stories/` (and/or migration seed); **never** hard-coded story lists in JSX.
- Mark rights/source as demo — not production licensed content.

Browser (`pnpm dev`): same feature API hydrates from fixtures into localStorage / in-memory mirrors.

---

## 4. Library UI & behavior

### 4.1 Layout

When `activeAction === "story"`:

1. **Left** — existing Sora rail; rename action copy to **Đọc truyện · Song ngữ** (active).
2. **Center** — library header, filters, sort, story list.
3. **Right** — selected story detail + chapter list + CTAs.

Remove the old static lesson card for this action.

### 4.2 Header / search / filter / sort

- Eyebrow / title / subtitle per product copy (Vietnamese in `ui.ts`).
- Search (debounce ~300–400ms) over title EN/VI, description, genre/tag, author if present.
- Filters: Tất cả | Mới bắt đầu | Đang đọc | Yêu thích | Thiếu nhi | Giao tiếp.
- Sort: Mới nhất (default) | Phổ biến | A–Z | Level | Thời lượng.

### 4.3 Story list & detail

Card: cover, favorite heart, title, VI blurb, CEFR, chapter count, minutes, progress if any, CTA.

- No progress → **Xem truyện** (select + focus detail).
- In progress → **Tiếp tục đọc** (open last chapter + position).
- Selected card: violet border / soft glow.

Detail: cover, title, CEFR, description, `Đã đọc X/Y`, favorite, share, more menu; chapter list **without locks**; **Đọc từ đầu** / **Đọc chương đã chọn**.

Share: Web Share API if available, else copy an internal deep-link string (no fake production URLs).

Empty / loading / error: skeletons; empty search + clear filters.

### 4.4 Progress display (library vs reader)

- Library story progress: completed chapters (+ optional fraction) → “Đã đọc X/Y”.
- Reader progress bar: **chapter-local** percentage only. Do not conflate the two.

---

## 5. Reader UI & learning loop

### 5.1 Shell

- No left Sora sidebar.
- Top: logo, breadcrumb (Thư viện / story / chapter), streak chip, profile.
- Title + chapter subtitle; toolbar: Nghe, Lưu, Cỡ chữ, Chế độ nền, language mode pills.
- Progress bar (chapter %).
- Main: bilingual content + right “Từ vựng nổi bật”.
- Bottom: Chương trước | Chọn chương | Chương tiếp theo (disable at ends).

### 5.2 Content rendering

Load **one chapter** at a time. Render `content_unit` by `order_no`. Each unit shares one id for EN and VI alignment (paragraph-level MVP; sentences nested inside units).

Language modes (persist preference):

- Song ngữ — two columns (stack on narrow widths: EN then VI per unit)
- Chỉ Anh / Chỉ Việt — single column; vocab panel may remain

Featured vocabulary highlights from DB (`is_featured`), not auto-CEFR flooding.

### 5.3 Progress persistence

Compute from scroll position or last visible content unit / sentence. Persist with debounce (5–10s) and on chapter change, visibility change, unmount. Fields: story_id, chapter_id, sentence/content_unit, progress_percentage, last_read_at.

Chapter completed when user reaches near end of chapter or navigates Next after near-end — no explicit “Hoàn thành” button.

### 5.4 Word interaction

Click English word → popover: word, lemma, IPA, POS, contextual VI meaning, original sentence, [Nghe] [Lưu từ]. Use quick-lookup / `DictionaryService` abstraction. Dictionary failure shows inline message; Reader must not crash.

Save → `user_story_vocabulary` with story/chapter/sentence context.

Featured panel: list + speak; “Xem tất cả từ vựng” opens chapter vocab drawer/modal.

### 5.5 TTS & preferences

`TtsService`: speakText, speakSentence, speakChapter, stop, pause/resume, setRate. MVP: Web Speech API + unsupported fallback UI. Optional sentence highlight while speaking.

Font size: Small / Medium / Large / XL — applies to reader content only; persist.

Reading theme: Galaxy (default) + Dark plain structure ready; Sepia optional if time allows.

Bookmark (**Lưu**): `user_story_bookmarks` for current chapter (± sentence).

---

## 6. Services & integrations

Conceptual APIs implemented as TypeScript functions (not HTTP):

- `listStories`, `getStory`, `listChapters`, `getChapterContent`
- `getProgress` / `upsertProgress`
- `toggleFavorite` / `listFavorites`
- `addBookmark` / `removeBookmark`
- `listFeaturedVocabulary` / `saveUserVocabulary` / `listUserVocabulary`
- `canPublishStory` (pure)
- `TtsService`, dictionary via quick-lookup

Responsive: desktop ≥1280 matches references; tablet may drawer detail; mobile stacks library and stacks bilingual units; vocab → sheet.

Accessibility: focus rings, aria-labels on icon buttons, keyboard language mode, popover focus management, non-color-only status.

Analytics: only if project already has a hook — optional events listed in the product prompt; skip if none exists.

---

## 7. Testing

Vitest (pure):

- Progress calculation (story-level vs chapter-level)
- Chapter navigation boundaries
- License / publish rule
- Language mode helpers
- Content-unit EN/VI mapping
- Favorite toggle state machine
- Filter / sort / search helpers

No requirement for Playwright in this cycle unless already wired; critical path covered by unit tests + manual UI check.

---

## 8. Implementation phases (within this cycle)

1. **Foundation** — migration, db helpers, seed, pure domain helpers + tests, window size, CSS tokens.
2. **Library UI** — 3-col home story mode, search/filter/sort, detail, favorite, open reader.
3. **Reader UI** — full-screen view, bilingual render, nav, progress save, preferences.
4. **Learning loop** — dictionary popover, featured vocab, save vocab, TTS, bookmark, share.

Phase 4–5 (Admin import, external sources) are **explicitly deferred**.

---

## 9. Definition of Done

- Library 3-col and Reader full-screen match reference spirit/layout.
- Story/chapter data from data layer; no hard-coded business lists in components.
- Progress, favorite, bookmark, vocabulary persist on Tauri SQLite; browser demo has local persistence.
- EN/VI aligned by content unit; featured highlights from DB.
- Source/rights tables exist; demo seed tagged INTERNAL_DEMO; no PENDING/BLOCKED publish.
- Search, filter, sort, chapter navigation real.
- TTS + dictionary usable (Web Speech + quick-lookup).
- `pnpm test` passes; TypeScript/lint clean for touched code; chat, lookup, flashcards unbroken.

---

## 10. Open follow-ups (not blocking MVP)

- Admin Import Center and open-license source pipelines
- Stronger sentence-level alignment tooling
- Sequential unlock rules if product wants them later
- Reading XP / streak coupling
- URL deep links for share targets
