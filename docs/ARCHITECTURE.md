# Vocab Pet architecture

MVP desktop app: a hidden-by-default Tauri shell, a small always-on-top study popup, SQLite on disk, and TypeScript domain logic.

## Stack

| Layer | Choice |
| --- | --- |
| Shell | Tauri 2 (Rust + system WebView, not Electron) |
| UI | React 18 function components + TailwindCSS |
| State | Zustand (dashboard/pet/missions, study mode, scheduler interval) |
| Persistence | SQLite via official `tauri-plugin-sql` |
| Alerts | Official `tauri-plugin-notification` |
| Tray | `tauri::tray::TrayIconBuilder` |

Rust is limited to tray, window show/hide, plugin wiring, and SQL migrations. Quiz, XP, mood, missions, and progress live in TypeScript.

## Process and windows

```
┌──────────────────────────────────────────────────────────┐
│  OS tray  [Mở app] [Học ngay] [Thoát]                    │
└───────────────┬──────────────────┬───────────────────────┘
                │                  │
                ▼                  ▼
     ┌─────────────────┐   ┌─────────────────────┐
     │  main (880x640) │   │ popup (400x500)     │
     │  visible: false │   │ alwaysOnTop, no     │
     │  onboarding /   │   │ chrome, skipTaskbar │
     │  home + missions│   │ flashcard quiz      │
     └────────┬────────┘   └──────────┬──────────┘
              │                       │
              └──────────┬────────────┘
                         ▼
              sqlite:vocab_pet.db  (AppConfig)
```

Both windows load the same SPA. `getCurrentWebviewWindow().label` selects the tree (`main` vs `popup`). Closing a window hides it; only **Thoát** exits.

Debug builds (`pnpm tauri dev`) show the main window immediately so onboarding is testable. Release builds stay in the tray until **Mở app** (onboarding still forces a show from the frontend).

## Directory map

```
src/                         React + TS
  components/popup|pet|shared
  features/vocabulary        next card, spaced repetition, submitAnswer
  features/pet-state         XP, mood, evolution, daily missions, user_progress
  features/scheduler         interval timer + notification + popup
  stores/                    Zustand
  db/                        SQL wrappers (the only place with SQL strings)
  constants/                 UI copy and mission/pet numbers
  types/
src-tauri/
  src/lib.rs                 plugins, migrations, close-to-hide
  src/tray.rs
  src/commands/window.rs     show_main_window / show_popup_window / hide_popup_window
  migrations/                001 schema, 002 pet columns, 003 seed
```

Features export a public `index.ts` only. They may call `db/` and another feature's public API (vocabulary → pet-state after an answer). Components do not embed SQL.

## Data flow (one answer)

1. Popup calls `getNextCard(contentType, topic)` → due/new vocab or unseen/wrong phrases, plus 3 distractors.
2. `submitAnswer` records `study_sessions`, updates `learning_progress` for vocabulary (simple SM-2-ish intervals: 1 / 3 / 7 / 14 days, `mastered` at 5 correct).
3. `user_progress` is recomputed (unique correct words/phrases, streak, JSON `progress_by_topic`).
4. Daily missions increment when the event matches (`learn_new` / `review_wrong` / `topic_practice`). Completing a mission grants its `xp_reward`.
5. A correct answer grants +5 XP. Overflow levels the pet (`XP_PER_LEVEL = 50`) and may move `current_stage_id` to the next `pet_evolution_stages` row (`min_level` 1 → 3 → 6).
6. `last_fed_at` is set and mood becomes `happy`.

Idle mood (from `last_fed_at`): 0d happy → 1d neutral → 2d sad → 3d+ hungry. The pet does not die.

## Scheduler

Frontend `setInterval` (default **2 minutes**, editable on the home screen, persisted in `localStorage`). Each tick sends a native notification and shows the popup. Replace with a real daily timetable later; the handle is isolated in `features/scheduler`.

Study mode is persisted with Zustand so the popup WebView can read the same `contentType` / `topic`.

## SQLite

SQLite via sqlx only runs one statement per migration version, so schema and seed are split into `src-tauri/migrations/001_*.sql` … `016_*.sql`.

Seed: 10 NGSL-based lemmas, 10 original phrases across four topics, three species × three evolution stages, one empty `user_progress` row. `pet_state` is inserted only after onboarding.

Phrases have no `learning_progress` row (FK is `vocabulary_id` only). Phrase review uses `study_sessions` aggregates.

## Native commands

| Command | Input | Output |
| --- | --- | --- |
| `show_main_window` | none | `Result<(), String>` |
| `show_popup_window` | none | `Result<(), String>` |
| `hide_popup_window` | none | `Result<(), String>` |

SQL and notifications go through official plugins, not custom commands.

## Tests

Pure domain tests (`pnpm test`): spaced repetition, choice building, XP/level, mood, streak, mission matching, scheduler interval. UI and SQLite need `pnpm tauri dev` on a machine with WebView libraries installed.
