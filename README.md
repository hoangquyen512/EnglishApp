# Yume

Desktop app (Windows + macOS) for daily English flashcards with a Tamagotchi-style pet (default name **Sora**). Built with **Tauri 2**, **React 18**, **TypeScript**, **Zustand**, **TailwindCSS**, and **SQLite**.

Correct answers feed the pet (XP, mood, evolution). Missing days makes the pet sad or hungry — it never dies.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- Rust 1.85+ (stable) and [Tauri Linux/macOS/Windows dependencies](https://v2.tauri.app/start/prerequisites/)

## Scripts

```bash
pnpm install
pnpm test
pnpm tauri dev
pnpm tauri build    # Windows: NSIS current-user setup.exe; macOS: drag-and-drop .dmg
```

Installers are **per-user** (no admin / no UAC). The `.app` inside the macOS DMG can live in any writable folder, not only `/Applications`. SQLite and settings are stored under Tauri `appLocalDataDir` / `appDataDir`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) § Deployment constraints.

In release builds the main window starts hidden. Use the tray icon:

- **Mở app** — dashboard (pet, missions, study mode)
- **Học ngay** — flashcard popup
- **Thoát** — quit

## MVP flow

1. Name the pet (default **Sora**) and choose a species (Cat / Fox / Dragon).
2. Pick study mode: vocabulary, or phrases + topic (travel / food / office / family).
3. Answer 4-choice flashcards. Correct answers grant XP; enough XP levels the pet and may change its sprite.
4. Daily missions generate automatically. Completing them grants bonus XP.
5. A demo scheduler opens the popup every N minutes (default 2).

## Content sources

- Sample vocabulary lemmas follow the **NGSL** (New General Service List) by Browne, Culligan & Phillips, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Vietnamese glosses and example sentences in this repo are original.
- Communication phrases are original (not copied from commercial courses).
- Broader NGSL / [WordNet](https://wordnet.princeton.edu/) / [Tatoeba](https://tatoeba.org) (CC-BY) can be imported later.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module boundaries and the SQLite schema.
