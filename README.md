# EnglishApp

Vocab Pet — desktop English flashcards with a Tamagotchi-style pet.

**Design system (locked):** [`design-system/`](design-system/) — tokens, pet overlay rules, copy. Full spec: [`docs/superpowers/specs/2026-08-13-vocab-pet-uiux-design.md`](docs/superpowers/specs/2026-08-13-vocab-pet-uiux-design.md).

**UI automation** (run when developing features):

```bash
pnpm install
pnpm test
```

CI runs the same command on every PR (`.github/workflows/ui-tests.yml`).

Demos: [`docs/uiux-demo/`](docs/uiux-demo/) (pet sample) and [`docs/uiux-demo/app.html`](docs/uiux-demo/app.html) (desktop / nhà / popup).
