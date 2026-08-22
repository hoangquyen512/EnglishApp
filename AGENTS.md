---
name: yume-agent
description: Applies Yume desktop-app standards. Use when writing or editing TypeScript, React, Tauri/Rust, SQLite, flashcards, pet XP/mood, SRS, or packaging. Follow feature public APIs, keep SQL in src/db/, and treat docs/ARCHITECTURE.md as product law.
---

# Yume Agent

> **Source of truth:** `.cursor/rules/` and `.cursor/skills/`.
> Generated files under `.agents/`, `.claude/`, root `AGENTS.md`, and root `CLAUDE.md` — do not edit them directly.
> After changing `.cursor/`, run: `pnpm sync-ai-rules`

Apply project rules from the tables below. English for code, comments, and docs. Vietnamese only in UI copy (`src/constants/ui.ts`).

## Project overview

**Yume** is a Windows + macOS desktop app for daily TOEIC flashcards with a Tamagotchi-style pet (default name **Sora**).

- **Tauri 2** · **React 18** · **TypeScript (strict)** · **Zustand** · **TailwindCSS** · **SQLite**
- Two windows: `main` (onboarding/home) and `popup` (always-on-top companion). Tray: **Mở app** / **Học ngay** / **Thoát**.
- Domain logic is TypeScript. Rust is tray, windows, plugins, migrations, local auth.
- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) from repo root.

```
src/components/     UI
src/features/       domain (public index.ts)
src/stores/         Zustand
src/db/             SQL strings (only here in TS)
src/constants/      copy + numeric product laws
src-tauri/          tray, windows, migrations, auth
```

## Available rules (always-apply / path-scoped)

| Rule | Scope | Description |
|------|-------|-------------|
| [ai-config](.agents/rules/ai-config.md) | `always` | AI config sync — .cursor/ is the only place to edit rules and skills. Use when adding Cursor rules, skills, commands, AGENTS.md, or CLAUDE.md. |
| [yume-code](.agents/rules/yume-code.md) | `path-scoped` (`src/**/*.ts,src/**/*.tsx`) | TypeScript/React conventions for src/ — feature public API, Zustand, no SQL in components. Use when editing frontend, features, stores, or components. |
| [yume-deploy](.agents/rules/yume-deploy.md) | `path-scoped` (`src-tauri/tauri.conf.json,src/config/**`) | Locked installer and data-path constraints for Yume. Use when editing tauri.conf.json, packaging, updater, or src/config/deployment tests. |
| [yume-project](.agents/rules/yume-project.md) | `always` | Yume product map — what the app is, stack, windows, and where domain logic lives. Use when starting a session, navigating the repo, or before changing features. |
| [yume-tauri](.agents/rules/yume-tauri.md) | `path-scoped` (`src-tauri/**`) | Tauri/Rust native layer — tray, windows, plugins, migrations, local auth only. Use when editing src-tauri, Rust commands, or SQL migrations. |
| [yume-tests](.agents/rules/yume-tests.md) | `path-scoped` (`**/*.test.ts,**/*.test.tsx,**/*.test.cjs`) | Vitest conventions and product-law oracles for Yume tests. Use when writing, extending, or debugging tests, or claiming a feature is done. |

## Skills overview

| Skill | Source | When to use |
|-------|--------|-------------|
| [ai-config-sync](.cursor/skills/ai-config-sync/SKILL.md) | `skill` | Use when creating or editing Cursor rules, skills, or commands; when adding nested pipeline agents; when Codex, Claude Code, or AGENTS.md may drift from .cursor/; or when the user mentions sync-ai-rules, check-ai-rules, CLAUDE.md, or AGENTS.md. |
| [automating-vocab-pet-tests](.cursor/skills/automating-vocab-pet-tests/SKILL.md) | `skill` | Use when writing, extending, reviewing, or debugging automated tests for Vocab Pet / EnglishApp, or when a feature/bugfix is finished and regression / hồi quy / full suite / CI must run — Vitest, Testing Library, Playwright, flaky tests, missing coverage, quiz, flashcard, SRS, XP, mood, streak, missions, scheduler, Tauri, SQLite, deployment/installer, kiểm thử tự động. |
| [brainstorming](.cursor/skills/brainstorming/SKILL.md) | `skill` | You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation. |
| [dispatching-parallel-agents](.cursor/skills/dispatching-parallel-agents/SKILL.md) | `skill` | Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies |
| [executing-plans](.cursor/skills/executing-plans/SKILL.md) | `skill` | Use when you have a written implementation plan to execute in a separate session with review checkpoints |
| [finishing-a-development-branch](.cursor/skills/finishing-a-development-branch/SKILL.md) | `skill` | Use when implementation is complete, all tests pass, and you need to decide how to integrate the work |
| [frontend-design](.cursor/skills/frontend-design/SKILL.md) | `skill` | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when they say 'build UI', 'make it look good', 'design a page', or 'create a component'). Generates creative, polished code and UI design that avoids generic AI aesthetics. |
| [receiving-code-review](.cursor/skills/receiving-code-review/SKILL.md) | `skill` | Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation |
| [requesting-code-review](.cursor/skills/requesting-code-review/SKILL.md) | `skill` | Use when completing tasks, implementing major features, or before merging to verify work meets requirements |
| [subagent-driven-development](.cursor/skills/subagent-driven-development/SKILL.md) | `skill` | Use when executing implementation plans with independent tasks in the current session |
| [systematic-debugging](.cursor/skills/systematic-debugging/SKILL.md) | `skill` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| [test-driven-development](.cursor/skills/test-driven-development/SKILL.md) | `skill` | Use when implementing any feature or bugfix, before writing implementation code |
| [ui-ux-pro-max](.cursor/skills/ui-ux-pro-max/SKILL.md) | `skill` | Senior UI/UX design intelligence for web/app UI — design tokens, semantic color + contrast, type scales, component anatomy/states, WCAG 2.2 AA audits, dark mode, and responsive/container-query layouts. Use when designing, auditing, or implementing UI, picking palettes/fonts, fixing accessibility, or reviewing AI-generated UI. |
| [using-git-worktrees](.cursor/skills/using-git-worktrees/SKILL.md) | `skill` | Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback |
| [using-superpowers](.cursor/skills/using-superpowers/SKILL.md) | `skill` | Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions |
| [verification-before-completion](.cursor/skills/verification-before-completion/SKILL.md) | `skill` | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always |
| [writing-plans](.cursor/skills/writing-plans/SKILL.md) | `skill` | Use when you have a spec or requirements for a multi-step task, before touching code |
| [writing-skills](.cursor/skills/writing-skills/SKILL.md) | `skill` | Use when creating new skills, editing existing skills, or verifying skills work before deployment |

## Scenario → skill mapping

| Scenario | Skills to apply |
|----------|-----------------|
| Daily coding / first turn | `using-superpowers` |
| New feature | `brainstorming` + `writing-plans` + `test-driven-development` |
| Bug / unexpected behavior | `systematic-debugging` |
| Tests / regression | `automating-vocab-pet-tests` + `verification-before-completion` |
| UI / visual polish | `ui-ux-pro-max` + `frontend-design` |
| Parallel independent tasks | `dispatching-parallel-agents` + `subagent-driven-development` |
| Code review | `requesting-code-review` + `receiving-code-review` |
| Finish branch / PR | `finishing-a-development-branch` |
| Edit skills or AGENTS.md | `ai-config-sync` + `writing-skills` |
| Git worktrees | `using-git-worktrees` |

## Quick rules (digest — full text in the rules table)

- **Architecture**: Tauri 2 shell. Domain (flashcards, XP, mood, SRS, missions) lives in TypeScript. Rust is tray, windows, plugins, SQL migrations, and local auth only.
- **UI**: React 18 + Tailwind. Zustand stores in `src/stores/`. Features export a public `index.ts`. Components do not embed SQL.
- **Persistence**: SQLite via `tauri-plugin-sql`. SQL strings only in `src/db/` and `src-tauri/migrations/`. Rows scoped by current `user_id`. Browser demo uses localStorage.
- **Product**: App name **Yume**. Default pet name **Sora**. Two windows: `main` (desk) and `popup` (always-on-top companion). Close hides; tray **Thoát** quits.
- **Pet / SRS**: viewed +2 XP, known +5, unknown 0. `XP_PER_LEVEL = 50`. SRS known `1 / 3 / 7 / 14` days; mastered at 5 known marks. Mood: 0d happy → 1d neutral → 2d sad → 3d+ hungry. Pet never dies.
- **Installers**: Windows NSIS `currentUser` only (no MSI / UAC). macOS `app`+`dmg` (no pkg). Data under `appLocalDataDir` / `appDataDir`, never the install dir.
- **Tests**: `pnpm test` (Vitest, full suite). Oracle is `docs/ARCHITECTURE.md`. Do not open `pnpm tauri dev` to verify a pure function.
- **AI config**: `.cursor/` is the source of truth. After adding/editing rules or skills → `pnpm sync-ai-rules`. Never hand-edit `.agents/` or `.claude/`.

## Additional detail

Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
AI config: [.cursor/skills/ai-config-sync/SKILL.md](.cursor/skills/ai-config-sync/SKILL.md)
