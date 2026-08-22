# Sync algorithm — 7 steps

`scripts/sync-ai-rules.mjs` runs these steps in order. Repo root is the directory that contains both `package.json` and `src-tauri/`.

## Rule routing

| Cursor frontmatter | Target |
|---|---|
| `alwaysApply: true` **or** `globs:` | `.claude/rules/<slug>.md` + `.agents/rules/<slug>.md` |
| Neither | `.claude/skills/<slug>/SKILL.md` + `.agents/skills/<slug>/SKILL.md` (skip if a hand-authored skill already has that slug) |

`ruleTarget(fm)` returns `"rule"` or `"skill"`.

Windows: directory **junctions** (`fs.symlinkSync(..., 'junction')`). If that fails, recursive copy. Unix: relative symlinks.

## Step 1 — Route `.cursor/rules/*.mdc`

Slug: stem with `_` → `-`.

Always-apply / glob: write Claude rule markdown (`paths:` only when glob and not always-apply) and a paths-free `.agents/rules/<slug>.md`. Always route even if a skill directory shares the slug.

Agent-requested: generate a SKILL.md wrapper unless `.cursor/skills/<slug>/` exists.

## Step 2 — Link real skills

Each `.cursor/skills/<slug>/` → `.claude/skills/<slug>` and `.agents/skills/<slug>`.

If a **real directory** already exists at the destination (not a link), skip and warn. Do not delete hand-edited trees.

## Step 3 — Nested `# Role:` files

`.cursor/skills/<skill>/agents/*.md` whose first non-empty line matches `# Role: <title>` → `.claude/agents/<skill>-<name>.md` (strip numeric prefix on the file stem). Other files are shared policy, skipped. Codex has no subagent slot.

## Step 4 — Commands

`.cursor/commands/<name>.md` → `.claude/commands/<name>.md`

## Step 5 — Root `CLAUDE.md` AI-RULES block

If a root `CLAUDE.md` already existed with `<!-- AI-RULES:BEGIN -->`, splice the tables. Step 7 **overwrites** root `CLAUDE.md` / `.claude/CLAUDE.md` for Yume so the index always matches `.cursor/`.

## Step 6 — Orphans

Delete generated skills/rules/agents/commands whose source no longer exists. Unlink junctions; `rmSync` real generated dirs.

## Step 7 — Index files

Write:

- `AGENTS.md` (repo root, Codex)
- `.agents/AGENTS.md`
- `.agents/SKILL.md`
- `CLAUDE.md` (repo root, Claude Code)
- `.claude/CLAUDE.md`

Link prefixes differ: root files point at `.agents/rules/` and `.cursor/skills/`; files inside `.agents/` use `rules/` and `skills/`.

`QUICK_RULES` and scenario rows are **constants in the script**. Update them when always-on product law changes.

## Idempotency and `--check`

Compare bytes before write. `--check` never writes; `driftCount > 0` → exit 1.

## Not automated

- Nested `AGENTS.md` for glob rules
- Antigravity-native rule folders
- Regenerating Quick Rules from `.mdc` bodies
