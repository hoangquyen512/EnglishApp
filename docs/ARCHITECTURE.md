# Yume architecture

MVP desktop app: a hidden-by-default Tauri shell, a small always-on-top study popup, SQLite on disk, and TypeScript domain logic. The product name is **Yume**; the default pet name is **Sora** (user-renameable via `pet_state.pet_name`).

## Stack

| Layer | Choice |
| --- | --- |
| Shell | Tauri 2 (Rust + system WebView, not Electron) |
| UI | React 18 function components + TailwindCSS |
| State | Zustand (dashboard/pet/missions, study mode, scheduler interval) |
| Persistence | SQLite via official `tauri-plugin-sql` |
| Alerts | Official `tauri-plugin-notification` |
| Tray | `tauri::tray::TrayIconBuilder` |

Rust is limited to tray, window show/hide, plugin wiring, and SQL migrations. Flashcards, XP, mood, missions, and progress live in TypeScript.

## Process and windows

```
┌──────────────────────────────────────────────────────────┐
│  OS tray  [Mở app] [Học ngay] [Thoát]                    │
└───────────────┬──────────────────┬───────────────────────┘
                │                  │
                ▼                  ▼
     ┌─────────────────┐   ┌─────────────────────┐
     │  main (880x640) │   │ popup (420x680)     │
     │  visible: false │   │ alwaysOnTop, no     │
     │  onboarding /   │   │ chrome, skipTaskbar │
     │  home + live    │   │ TOEIC flashcard     │
     │  30s cards      │   │ auto-speak + rotate │
     └────────┬────────┘   └──────────┬──────────┘
              │                       │
              └──────────┬────────────┘
                         ▼
              sqlite:vocab_pet.db  (appLocalDataDir)
              settings.json        (appDataDir)
```

Both windows load the same SPA. `getCurrentWebviewWindow().label` selects the tree (`main` vs `popup`). Closing a window hides it; only **Thoát** exits.

Debug builds (`pnpm tauri dev`) show the main window immediately so onboarding is testable. Release builds stay in the tray until **Mở app** (onboarding still forces a show from the frontend).

## Directory map

```
src/                         React + TS
  components/popup|pet|shared
  features/auth              local username/password (Tauri commands + in-memory browser demo)
  features/vocabulary        deck, 30s timer, TTS, recordFlashcardEvent
  features/pet-state         XP, mood, evolution, daily missions, user_progress
  features/scheduler         interval timer + notification + popup
  stores/                    Zustand (app, auth, settings, study)
  db/                        SQL wrappers (the only place with SQL strings); scoped by current user_id
  constants/                 UI copy and mission/pet numbers
  types/
src-tauri/
  src/lib.rs                 plugins, migrations, close-to-hide
  src/tray.rs
  src/auth/                  argon2 accounts, session, password reset mailer
  src/commands/window.rs     show_main_window / show_popup_window / hide_popup_window
  src/commands/auth.rs       register/login/logout/profile
  migrations/                001–025 TOEIC schema/seed, 026–038 accounts + per-user columns
```

Features export a public `index.ts` only. They may call `db/` and another feature's public API (vocabulary → pet-state after an answer). Components do not embed SQL.

## Data flow (one flashcard)

1. Home and popup call `getStudyDeck(contentType, topic)` → due/new TOEIC vocabulary (word, IPA, image key, example) or phrases.
2. A card stays on screen for **30 seconds**, then the pet rotates to the next card. Audio auto-plays in the popup via `speechSynthesis`.
3. `recordFlashcardEvent` records `study_sessions`. Outcomes:
   - `viewed` (timer or next): +2 XP, short 1-day interval, does not count toward mastered
   - `known`: +5 XP, SM-2-ish intervals 1 / 3 / 7 / 14 days, `mastered` at 5 known marks
   - `unknown`: 0 XP, interval resets to 0 days
4. `user_progress` is recomputed (unique seen words/phrases, streak, JSON `progress_by_topic`).
5. Daily missions increment when the event matches (`learn_new` / `review_wrong` / `topic_practice`). Completing a mission grants its `xp_reward`.
6. XP overflow levels the pet (`XP_PER_LEVEL = 50`) and may move `current_stage_id` to the next `pet_evolution_stages` row (`min_level` 1 → 3 → 6).
7. `last_fed_at` is set and mood becomes `happy`.

Idle mood (from `last_fed_at`): 0d happy → 1d neutral → 2d sad → 3d+ hungry. The pet does not die.

## Scheduler

Frontend `setInterval` (default **2 minutes**, editable on the home screen, persisted in `localStorage`). Each tick sends a native notification and shows the popup. Replace with a real daily timetable later; the handle is isolated in `features/scheduler`.

Study mode is persisted with Zustand so the popup WebView can read the same `contentType` / `topic`.

## SQLite and user files

SQLite via sqlx only runs one statement per migration version, so schema and seed are split into `src-tauri/migrations/001_*.sql` … `038_*.sql`. Account tables start at `026_accounts.sql` so they do not collide with TOEIC lexicon migrations `017`–`025`.

The database file is `{appLocalDataDir}/vocab_pet.db`. Settings are `{appDataDir}/settings.json`. Both directories are created at startup through Tauri's path API (`app.path().app_local_data_dir()` / `app_data_dir()` on the Rust side, `@tauri-apps/api/path` on the frontend). `tauri-plugin-sql` is registered with that absolute `sqlite:` URL so migrations apply to the same file the UI opens.

Seed: **1000** original TOEIC-style lemmas (IPA, illustration key, example + Vietnamese gloss) from `src/data/toeic-vocabulary.json`, unique index on `vocabulary.word`, 10 original phrases across four topics, three species × three evolution stages, one empty `user_progress` row. `pet_state` is inserted only after onboarding. The phone demo loads the same JSON from `docs/uiux-demo/vocabulary.json`.

Phrases have no `learning_progress` row (FK is `vocabulary_id` only). Phrase review uses `study_sessions` aggregates.

## Deployment constraints

These rules are locked in `src-tauri/tauri.conf.json` and guarded by `src/config/deployment.test.ts`. Do not reverse them.

### Installers (no admin)

| Platform | Ship | Do not ship |
| --- | --- | --- |
| Windows | NSIS `.exe` with `"installMode": "currentUser"` | WiX `.msi`, `perMachine`, or `both` (those trigger UAC and write under Program Files) |
| macOS | Drag-and-drop `.dmg` containing a `.app` (`targets` includes `app` + `dmg`) | `.pkg` installer |

Windows current-user NSIS installs under `%LOCALAPPDATA%` (typically `C:\Users\<user>\AppData\Local\...`), not `C:\Program Files`. Registry keys go to `HKCU`. A standard (non-admin) account must be able to run the installer with **no UAC prompt**.

macOS: the `.app` is relocatable. The DMG may show an Applications shortcut as a convenience, but the user may drag Yume into Desktop, `~/Applications`, or any other folder they can write. Runtime data does not follow the `.app`.

`bundle.targets` is the explicit list `["nsis", "app", "dmg"]` — never `"all"` (that would reintroduce `.msi`).

### Data writes (always user-scoped)

| File | Path API | Typical location |
| --- | --- | --- |
| SQLite | `appLocalDataDir()` | Windows `%LOCALAPPDATA%\com.hoangquyen.yume\vocab_pet.db`; macOS `~/Library/Application Support/com.hoangquyen.yume/vocab_pet.db` |
| Settings JSON | `appDataDir()` | Windows `%APPDATA%\com.hoangquyen.yume\settings.json`; macOS same Application Support folder |

Never write into the install directory, `Program Files`, `/Applications`, `/Library`, or any other path that needs elevation. The WebView profile is also under the user AppData tree.

### Manual install check (non-admin account)

This Linux CI/agent environment cannot click through Windows UAC or mount a macOS DMG. Before a release, on a **standard user** (not Administrator / not in sudoers for the test):

1. **Windows:** run the NSIS `*-setup.exe`. Confirm no UAC dialog, install completes under `%LOCALAPPDATA%`, app launches, then confirm `vocab_pet.db` and `settings.json` appear under the user AppData folders in the table above — not under `C:\Program Files`.
2. **macOS:** open the `.dmg`, drag `Yume.app` to Desktop (not `/Applications`), launch it, and confirm the same user-scoped files under `~/Library/Application Support/com.hoangquyen.yume/`.

Automated guard: `pnpm test` includes `src/config/deployment.test.ts`.


## Native commands

| Command | Input | Output |
| --- | --- | --- |
| `show_main_window` | none | `Result<(), String>` |
| `show_popup_window` | none | `Result<(), String>` |
| `hide_popup_window` | none | `Result<(), String>` |
| `sqlite_db_url` | none | `sqlite:` URL under `appLocalDataDir` |
| `user_data_paths` | none | user-scoped dirs + sqlite URL + settings path |
| `read_app_settings` | none | `{appDataDir}/settings.json` or `{}` |
| `write_app_settings` | `contents: string` | `Result<(), String>` |
| `current_session` / `has_accounts` | none | session DTO / bool |
| `register_account` / `login_account` / `logout_account` | username+password | session DTO |
| `change_password` / `request_password_reset` / `confirm_password_reset` | passwords / email | `Result` |
| `update_account_profile` / avatar / `delete_account` | profile fields | session DTO |

Flashcards and notifications go through official SQL/notification plugins. Account hashing and session writes use `rusqlite` in `src-tauri/src/auth` against the same `vocab_pet.db`.

## Tests

Pure domain tests (`pnpm test`): spaced repetition, choice building, XP/level, mood, streak, mission matching, scheduler interval, auth validation. UI and SQLite need `pnpm tauri dev` on a machine with WebView libraries installed.
