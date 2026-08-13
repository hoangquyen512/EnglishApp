# Vocab Pet

Vocabulary learning app with a Tamagotchi-style pet. Works as:

- **Desktop app** (Windows + macOS) via Tauri — system tray + popup windows
- **Web / mobile** (phone browser) — no install required, open link and study

## Tech stack

- **Tauri 2.0** — desktop shell (Rust + WebView)
- **React 18 + TypeScript** (strict) + **PWA** for mobile web
- **Zustand** — state management
- **TailwindCSS** — styling
- **SQLite** (desktop) / **localStorage** (web) — local data
- **pnpm** — package manager

## Desktop (Windows / macOS)

```bash
pnpm install
pnpm tauri dev
```

On first launch the app lives in the **system tray**. Tray menu: Open App / Study Now / Quit.

## Mobile & web (no install)

Build the web version and open it in your phone browser (Safari / Chrome):

```bash
pnpm install
pnpm build:web
pnpm preview:web
```

Then on your phone (same Wi‑Fi), open the URL shown in the terminal, e.g. `http://192.168.x.x:4173`.

Or deploy the `dist/` folder to any static host (GitHub Pages, Netlify, etc.) and open the link on your phone.

### What you get on mobile

- Full flashcard + pet flow in the browser
- Data saved locally (`localStorage`) — no account needed
- Responsive UI + bottom-sheet flashcard modal
- Optional **Add to Home Screen** for app-like shortcut (still no app store install)
- PWA offline support after first load

> **Note:** Opening raw `index.html` via `file://` on mobile usually does not work (browser security). Use `pnpm preview:web`, a local server, or deploy to a URL.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Dev server for web/mobile (LAN accessible) |
| `pnpm build:web` | Production web/PWA build → `dist/` |
| `pnpm preview:web` | Preview web build (test on phone via LAN) |
| `pnpm tauri dev` | Desktop app in dev mode |
| `pnpm tauri build` | Desktop installer (.exe / .dmg) |

## Project structure

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for architecture details.

## License

Private — MVP scaffold.
