# Vocab Pet

Desktop vocabulary learning app (Windows + macOS) with a Tamagotchi-style pet. Answer daily flashcard popups to earn XP and keep your pet happy.

## Tech stack

- **Tauri 2.0** — desktop shell (Rust + WebView)
- **React 18 + TypeScript** (strict)
- **Zustand** — state management
- **TailwindCSS** — styling
- **SQLite** — local data via `tauri-plugin-sql`
- **pnpm** — package manager

## Quick start

```bash
pnpm install
pnpm tauri dev
```

On first launch the app lives in the **system tray** (main window is hidden). Use the tray menu:

- **Open App** — show pet dashboard
- **Study Now** — open flashcard popup
- **Quit** — exit

The popup also appears automatically every **5 minutes** (demo scheduler).

## Project structure

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full architecture notes.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server only |
| `pnpm build` | Build frontend |
| `pnpm tauri dev` | Run desktop app in dev mode |
| `pnpm tauri build` | Build production installer |

## License

Private — MVP scaffold.
