# EnglishApp / Vocab Pet

Desktop vocabulary + Tamagotchi pet (Tauri 2). App code may live at repo root or `vocab-pet-app/` depending on the branch.

When writing, extending, reviewing, or debugging automated tests, load `.cursor/skills/automating-vocab-pet-tests/SKILL.md`.

## After every feature

A feature or bugfix is not done until full-system regression is green:

```bash
bash scripts/run-regression.sh
```

Do not treat a single new test file as regression. CI workflow `Regression` runs the same script on every pull request and on `main`.
