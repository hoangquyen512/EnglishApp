# Vocab Pet design system

Source of truth for UI across the repo (demo, Tauri app, tests).

| File | Use |
| --- | --- |
| `tokens.css` | CSS variables — import in `src/index.css` / demo |
| `tokens.json` | Machine-readable locks for tests and Tailwind mapping |
| `../docs/superpowers/specs/2026-08-13-vocab-pet-uiux-design.md` | Full UX spec |

## Locks (do not reverse)

- Primary button fill is **`#c2410c`** with **white** label. Never use `#ea580c` as a button fill (fails WCAG AA).
- Live pet is a **transparent PNG** floating on the desktop. No habitat well, no card plate behind it.
- UI language is Vietnamese; English word/phrase uses Fraunces and `lang="en"`.
- Popup is 400×500, frameless, always-on-top. Home is 880×640.
- Tray: **Mở app / Học ngay / Thoát**.
- Quiz: 4 choices + **Submit**.

## When implementing a feature

1. Import tokens — do not hardcode hex in components.
2. Keep the floating pet overlay; do not put the live pet in a cream box.
3. Run UI automation before you call the feature done:

```bash
pnpm test
```

That runs token contract checks and Playwright UI tests against the demo (and later the app).

CI: `.github/workflows/ui-tests.yml` on every push/PR.
