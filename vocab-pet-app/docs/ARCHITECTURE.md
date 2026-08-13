# Vocab Pet — Architecture (MVP Scaffold)

Desktop + **web/mobile (PWA)** vocabulary learning app with a Tamagotchi-style pet. Built with **Tauri 2.0**, **React 18**, **TypeScript**, **Zustand**, **TailwindCSS**, and dual storage backends.

## Dual runtime

| Runtime | Storage | Flashcard UI | Scheduler |
|---------|---------|--------------|-----------|
| **Tauri desktop** | SQLite (`tauri-plugin-sql`) | Separate `popup` window | Tray + desktop notification |
| **Web / mobile browser** | `localStorage` (`web-storage.ts`) | In-app modal (`FlashcardModal`) | Browser `Notification` API |

Detection: `src/lib/platform.ts` → `isTauri()`. Same feature modules and stores; `db/vocabulary.ts` and `db/pet-state.ts` branch on runtime.

Web build: `pnpm build:web` (relative `base`, PWA manifest, service worker). Deploy `dist/` or use `pnpm preview:web` for LAN testing on phone.

## High-level overview

```
┌─────────────────────────────────────────────────────────────┐
│                     System Tray (Rust)                       │
│  Open App │ Study Now │ Quit                                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
     ┌─────────────────┐           ┌─────────────────┐
     │  Main Window     │           │  Popup Window    │
     │  (hidden default)│           │  400×500, top    │
     │  Pet dashboard   │           │  Flashcard quiz  │
     │  Scheduler tick  │           │                  │
     └────────┬─────────┘           └────────┬─────────┘
              │                              │
              └──────────────┬───────────────┘
                             ▼
                   ┌──────────────────┐
                   │  Zustand Stores   │
                   │  quiz / pet / sched│
                   └────────┬─────────┘
                             ▼
                   ┌──────────────────┐
                   │  Feature modules  │
                   │  vocabulary       │
                   │  pet-state        │
                   │  scheduler        │
                   └────────┬─────────┘
                             ▼
                   ┌──────────────────┐
                   │  db/ (SQL layer)  │
                   └────────┬─────────┘
                             ▼
                   ┌──────────────────┐
                   │  SQLite (local)   │
                   │  vocab_pet.db     │
                   └──────────────────┘
```

## Directory layout

| Path | Responsibility |
|------|----------------|
| `src/components/popup/` | Flashcard popup UI |
| `src/components/pet/` | Pet avatar / mood display |
| `src/components/shared/` | Reusable UI (loading, main dashboard) |
| `src/features/vocabulary/` | Quiz generation, answer submission |
| `src/features/pet-state/` | XP, level, mood decay |
| `src/features/scheduler/` | Interval popup + notifications |
| `src/stores/` | Zustand state (one store per domain) |
| `src/db/` | All SQL queries (no raw SQL in components) |
| `src/types/` | Shared TypeScript interfaces |
| `src/constants/` | UI strings & config (i18n-ready) |
| `src-tauri/src/tray.rs` | System tray icon + menu (Rust) |
| `src-tauri/migrations/` | SQL migration files |

## Windows

| Label | Purpose | Config |
|-------|---------|--------|
| `main` | Pet dashboard, scheduler host | Hidden by default, 800×600 |
| `popup` | Flashcard study | Hidden, 400×500, frameless, always on top |

Both windows load the same React bundle. `App.tsx` reads `getCurrentWindow().label` and renders either `MainDashboard` or `FlashcardPopup`.

## Database schema

Four tables (see `src-tauri/migrations/001_initial.sql`):

- **vocabulary** — word list (seeded with 10 English words)
- **learning_progress** — per-word SRS-lite state (`new` → `learning` → `mastered`)
- **pet_state** — single pet row (level, XP, mood, streak)
- **study_sessions** — answer history for future analytics

Migrations run via `tauri-plugin-sql` on app start (`preload` in `tauri.conf.json` + `Database.load()` from frontend).

## Data flows

### Flashcard answer

1. User selects an option → `useQuizStore.submit()`
2. `features/vocabulary/submitAnswer()`:
   - Updates `learning_progress` + inserts `study_sessions`
   - On correct: `features/pet-state/rewardCorrectAnswer()` → XP, level-up, streak, mood → `happy`
3. Popup refreshes pet store for feedback

### Mood decay

On main window load, `loadPetSnapshot()` calls `refreshPetMood()`:

| Days since last study | Mood |
|----------------------|------|
| 0 (today) | happy |
| 1 | neutral |
| 2 | sad |
| 3+ | hungry |

Pet never “dies” — mood only degrades to encourage study without negative pressure.

### Scheduler

`features/scheduler/startPopupScheduler()` runs in the **main** window only:

- Default interval: **5 minutes** (`SCHEDULER_CONFIG.popupIntervalMs`)
- Shows `popup` window + optional desktop notification
- Tray “Study Now” and main dashboard button trigger popup immediately

## Rust vs TypeScript boundary

| Layer | Language | Notes |
|-------|----------|-------|
| Tray icon + menu | Rust (`tray.rs`) | Native requirement |
| SQL migrations registration | Rust (`lib.rs`) | Plugin API |
| Business logic | TypeScript | Preferred for maintainability |
| Notifications | TS plugin | `@tauri-apps/plugin-notification` |
| Window show/hide | TS API | `@tauri-apps/api/webviewWindow` |

No custom `invoke` commands in MVP — tray actions use Rust `Manager` API directly.

## State management

| Store | File | State |
|-------|------|-------|
| Quiz | `stores/quiz-store.ts` | Current question, selection, result |
| Pet | `stores/pet-store.ts` | Pet snapshot, loading |
| Scheduler | `stores/scheduler-store.ts` | Interval running, next tick |

## Feature module rules

Each feature exports a public API via `index.ts`. Cross-feature imports go through those index files only (e.g. `vocabulary` → `pet-state/index`, not `db/pet-state`).

## Extension points (post-MVP)

- Replace fixed interval with daily time slots
- Vocabulary CRUD UI
- Pet animations / sprites per mood
- i18n: move `UI_STRINGS` to locale files
- Analytics dashboard from `study_sessions`
- Custom Rust commands only when TS plugins are insufficient

## Build & run

```bash
cd vocab-pet-app
pnpm install
pnpm tauri dev    # development
pnpm tauri build  # production binaries
```

Prerequisites: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS (WebView, Rust toolchain).
