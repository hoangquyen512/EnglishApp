# Vocab Pet — agent notes

## Design system

The locked visual system lives in [`design-system/`](design-system/). Full UX spec: [`docs/superpowers/specs/2026-08-13-vocab-pet-uiux-design.md`](docs/superpowers/specs/2026-08-13-vocab-pet-uiux-design.md).

When you add or change UI:

1. Use `design-system/tokens.css` / `tokens.json`. Do not hardcode `#ea580c` on button fills (use `#c2410c`).
2. The live pet floats on the desktop as a transparent PNG — no background plate.
3. **Run UI automation** before claiming the work is done:

```bash
pnpm test
```

`pnpm test` = token contracts + Playwright flows (onboarding, home, popup, floating pet). GitHub Actions runs the same command on every PR (`.github/workflows/ui-tests.yml`).

If you change tokens, update `design-system/tokens.css` and `tokens.json` together, then copy tokens into `docs/uiux-demo/tokens.css` (`pnpm design:sync`).
