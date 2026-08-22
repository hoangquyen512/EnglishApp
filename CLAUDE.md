# Yume — Claude Code project instructions

> **Source of truth:** `.cursor/rules/` and `.cursor/skills/`.
> Generated files under `.claude/` — do not edit them directly.
> After changing `.cursor/`, run: `pnpm sync-ai-rules`

<!-- AI-RULES:BEGIN -->

## Project overview

**Yume** is a Windows + macOS desktop app for daily TOEIC flashcards with a Tamagotchi-style pet (default name **Sora**).

- **Tauri 2** · **React 18** · **TypeScript** · **Zustand** · **TailwindCSS** · **SQLite**
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Domain in TypeScript; Rust is tray / windows / plugins / migrations / local auth.

## Directory map

```
src/features/     public index.ts per feature
src/db/           SQL wrappers (only TS SQL)
src/stores/       Zustand
src/components/   UI
src-tauri/        tray, window commands, migrations, auth
```

## Key rules (always apply)

### Architecture
- Feature public API is `index.ts`. Components do not embed SQL.
- Do not move XP / SRS / mood into Rust.

### Product laws
- viewed +2 XP, known +5, unknown 0; level every 50 XP.
- SRS known 1 / 3 / 7 / 14; mastered at 5 known marks.
- Mood 0d happy → 1d neutral → 2d sad → 3d+ hungry; pet never dies.

### Packaging
- Windows NSIS `currentUser` only. macOS `app`+`dmg`. Never `msi` / `pkg` / `all`.
- User-scoped SQLite + settings. Never write into the install directory.

### AI config
- `.cursor/` is the source of truth. Run `pnpm sync-ai-rules` after rule/skill changes.

## Available commands

_(No commands)_

## Available rules (`.claude/rules/`)

- **ai-config** (`always`): AI config sync — .cursor/ is the only place to edit rules and skills. Use when adding Cursor rules, skills, commands, AGENTS.md, or CLAUDE.md.
- **yume-code** (`path-scoped`, globs: `src/**/*.ts,src/**/*.tsx`): TypeScript/React conventions for src/ — feature public API, Zustand, no SQL in components. Use when editing frontend, features, stores, or components.
- **yume-deploy** (`path-scoped`, globs: `src-tauri/tauri.conf.json,src/config/**`): Locked installer and data-path constraints for Yume. Use when editing tauri.conf.json, packaging, updater, or src/config/deployment tests.
- **yume-project** (`always`): Yume product map — what the app is, stack, windows, and where domain logic lives. Use when starting a session, navigating the repo, or before changing features.
- **yume-tauri** (`path-scoped`, globs: `src-tauri/**`): Tauri/Rust native layer — tray, windows, plugins, migrations, local auth only. Use when editing src-tauri, Rust commands, or SQL migrations.
- **yume-tests** (`path-scoped`, globs: `**/*.test.ts,**/*.test.tsx,**/*.test.cjs`): Vitest conventions and product-law oracles for Yume tests. Use when writing, extending, or debugging tests, or claiming a feature is done.

## Available skills (on demand)

- **ai-config-sync**: Use when creating or editing Cursor rules, skills, or commands; when adding nested pipeline agents; when Codex, Claude Code, or AGENTS.md may drift from .cursor/; or when the user mentions sync-ai-rules, check-ai-rules, CLAUDE.md, or AGENTS.md.
- **automating-vocab-pet-tests**: Use when writing, extending, reviewing, or debugging automated tests for Vocab Pet / EnglishApp, or when a feature/bugfix is finished and regression / hồi quy / full suite / CI must run — Vitest, Testing Library, Playwright, flaky tests, missing coverage, quiz, flashcard, SRS, XP, mood, streak, missions, scheduler, Tauri, SQLite, deployment/installer, kiểm thử tự động.
- **brainstorming**: You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
- **dispatching-parallel-agents**: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
- **executing-plans**: Use when you have a written implementation plan to execute in a separate session with review checkpoints
- **finishing-a-development-branch**: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work
- **frontend-design**: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when they say 'build UI', 'make it look good', 'design a page', or 'create a component'). Generates creative, polished code and UI design that avoids generic AI aesthetics.
- **receiving-code-review**: Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation
- **requesting-code-review**: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
- **subagent-driven-development**: Use when executing implementation plans with independent tasks in the current session
- **systematic-debugging**: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
- **test-driven-development**: Use when implementing any feature or bugfix, before writing implementation code
- **ui-ux-pro-max**: Senior UI/UX design intelligence for web/app UI — design tokens, semantic color + contrast, type scales, component anatomy/states, WCAG 2.2 AA audits, dark mode, and responsive/container-query layouts. Use when designing, auditing, or implementing UI, picking palettes/fonts, fixing accessibility, or reviewing AI-generated UI.
- **using-git-worktrees**: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
- **using-superpowers**: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
- **verification-before-completion**: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
- **writing-plans**: Use when you have a spec or requirements for a multi-step task, before touching code
- **writing-skills**: Use when creating new skills, editing existing skills, or verifying skills work before deployment

## Available sub-agents

_(No nested sub-agents)_

## Quality gates

```bash
pnpm test
pnpm check-ai-rules
```

## References

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`.cursor/rules/`](.cursor/rules/)
- [`.cursor/skills/`](.cursor/skills/)

<!-- AI-RULES:END -->
