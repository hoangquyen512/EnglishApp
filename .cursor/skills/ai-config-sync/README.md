# ai-config-sync

Keeps `.cursor/` as the **single source of truth** for Yume AI config, then generates matching files for Codex (`AGENTS.md`, `.agents/`) and Claude Code (`.claude/`, `CLAUDE.md`).

Agents adding or editing rules should follow [`SKILL.md`](SKILL.md). Algorithm detail: [`references/sync-algorithm.md`](references/sync-algorithm.md).

## Why

Yume is edited in parallel on Cursor, Codex, and sometimes Claude Code. Each tool loads context from a different path and format. Duplicating rules by hand drifts. Write once under `.cursor/`, then:

```bash
pnpm sync-ai-rules
pnpm check-ai-rules
```

Node only (no Python, no Make). Windows junctions, otherwise copy; Unix symlinks.

## Routing

| Cursor | Meaning | Claude Code | Codex |
|---|---|---|---|
| `alwaysApply: true` | Always | `.claude/rules/<slug>.md` | `.agents/rules/<slug>.md` + Quick Rules |
| `globs:` | Path-scoped | `.claude/rules/<slug>.md` + `paths:` | `.agents/rules/<slug>.md` + Quick Rules |
| Neither | On demand | skill `SKILL.md` | skill `SKILL.md` |
| Real `.cursor/skills/<slug>/` | Workflow | junction/symlink | junction/symlink |

Codex loads **repo-root `AGENTS.md`** (directory cascade). The script therefore writes that file, not only `.agents/AGENTS.md`.

## Limits (same as upstream)

- No nested `AGENTS.md` for glob rules (Codex cascade is directory-prefix, not arbitrary globs).
- Antigravity `.agents/rules/` vs `.agent/rules/` is unstable — we ship `AGENTS.md` + `.agents/rules/*.md`.
- Quick Rules in `AGENTS.md` are a curated digest; update the `QUICK_RULES` constant in the script when always-on product law changes.
