# Yume

Desktop app (Windows + macOS) for daily **TOEIC flashcards** with a Tamagotchi-style pet (default name **Sora**). Built with **Tauri 2**, **React 18**, **TypeScript**, **Zustand**, **TailwindCSS**, and **SQLite**.

Brand mark (sleeping companion + moon/star) lives in [`brand/`](brand/) and is used for the tray / installer icons.

The pet sits on your desk and changes a vocabulary card about every **30 seconds**. Each card shows the English word, IPA, pronunciation audio, an illustration, and an example sentence. Viewing cards feeds the pet (XP, mood, evolution). Missing days makes the pet sad or hungry — it never dies.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- Rust 1.85+ (stable) and [Tauri Linux/macOS/Windows dependencies](https://v2.tauri.app/start/prerequisites/)

## Scripts

```bash
pnpm install
pnpm test
pnpm dev          # browser preview of the TOEIC desk (no tray / SQLite)
pnpm tauri dev
pnpm tauri build  # Windows: NSIS current-user setup.exe; macOS: drag-and-drop .dmg
```

Open `http://localhost:1420/?window=popup` for the always-on-top study widget in the browser preview.

Installers are **per-user** (no admin / no UAC). SQLite and settings live under Tauri `appLocalDataDir` / `appDataDir`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

In release builds the main window starts hidden. Use the tray icon:

- **Mở app** — pet desk + live flashcards
- **Học ngay** — always-on-top TOEIC widget (auto-speak, 30s rotate)
- **Thoát** — quit

## Study flow

1. Name the pet (default **Sora**) and choose a species (Cat / Fox / Dragon).
2. Watch TOEIC cards on the desk. The pet rotates a card every 30 seconds.
3. **Học ngay** opens a focused widget: auto-play pronunciation, pause / next, **Đã nhớ** / **Chưa nhớ**.
4. Viewing a card grants a little XP; marking **Đã nhớ** grants more and advances spaced repetition.
5. Daily missions still generate automatically.

## Content

- Seed vocabulary is original TOEIC-style business English (invoice, deadline, occupancy, …) with IPA, Vietnamese glosses, and example sentences.
- Communication phrases remain available as a second mode.
- Pronunciation uses the system `speechSynthesis` voice (en-US). Illustrations are bundled SVGs so the app works offline.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module boundaries and the SQLite schema.
