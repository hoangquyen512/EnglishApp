# Yume

Desktop app (Windows + macOS) for daily **TOEIC flashcards** with a Tamagotchi-style pet (default name **Sora**). Built with **Tauri 2**, **React 18**, **TypeScript**, **Zustand**, **TailwindCSS**, and **SQLite**.

Brand mark (sleeping companion + moon/star) lives in [`brand/`](brand/) and is used for the tray / installer icons.

The pet sits on your desk as a **small floating companion**. Click the pet to open a vocabulary card on the left; cards rotate about every **30 seconds** while expanded. Each card shows the English word, IPA, pronunciation audio, an illustration, and an example sentence. Viewing cards feeds the pet (XP, mood, evolution). Missing days makes the pet sad or hungry — it never dies.

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

Open `http://localhost:1420/?window=popup` for the floating companion widget in the browser preview (click the pet to expand the study card).

Installers are **per-user** (no admin / no UAC). SQLite and settings live under Tauri `appLocalDataDir` / `appDataDir`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

In **release** builds the floating companion starts collapsed (always-on-top pet). Use the tray icon:

- **Mở app** — full pet desk + settings / missions
- **Học ngay** — show/focus the floating companion (click pet to study)
- **Thoát** — quit

## Study flow

1. Create a local username/password account (or log in). Pet data is scoped to that account.
2. Name the pet (default **Sora**) and choose a species (Cat / Fox / Dragon).
3. Click the floating pet to open a TOEIC card (card left · pet right). While open, the pet rotates a card every 30 seconds with auto-speak.
4. Collapse by clicking the pet again; study pauses until you reopen. **Học ngay** focuses the companion; **Mở app** opens the full desk.
5. Viewing a card grants a little XP; marking **Đã nhớ** grants more and advances spaced repetition.
6. Daily missions still generate automatically.

## Content

- Seed vocabulary is original TOEIC-style business English (invoice, deadline, occupancy, …) with IPA, Vietnamese glosses, and example sentences.
- Communication phrases remain available as a second mode.
- **Hội thoại** mode ports 12 everyday-conversation topics (1,000 phrases each) from the topic-learning branch.
- **Nói với Sora** is a local daily companion chat (check-in + optional English chips). It does not use the Next.js stack from the daily-companion branch.
- Pronunciation uses the system `speechSynthesis` voice (en-US). Illustrations are bundled images so the app works offline.

Phone-only TOEIC mock (no login): [study.html](https://cdn.jsdelivr.net/gh/hoangquyen512/EnglishApp@main/docs/uiux-demo/study.html). See [docs/uiux-demo/README.md](docs/uiux-demo/README.md).

## Web demo

Full app in the browser (register/login, onboard Sora, TOEIC, communication phrases, hội thoại, Nói với Sora):

**https://hoangquyen512.github.io/EnglishApp/**

Accounts, pet, study mode, and chat persist in `localStorage`. Tray, native notifications, and SQLite spaced-repetition need `pnpm tauri build`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module boundaries and the SQLite schema.
