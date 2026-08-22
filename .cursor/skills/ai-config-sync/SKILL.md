---
name: ai-config-sync
description: Use when creating or editing Cursor rules, skills, or commands; when adding nested pipeline agents; when Codex, Claude Code, or AGENTS.md may drift from .cursor/; or when the user mentions sync-ai-rules, check-ai-rules, CLAUDE.md, or AGENTS.md.
---

# AI Config Sync

Yume keeps AI configuration in **one place**. `.cursor/` is the source of truth — `.agents/`, `.claude/`, root `AGENTS.md`, and root `CLAUDE.md` are generated from it so Cursor, Codex, and Claude Code share the same project map and coding rules.

## When to use

- New or edited rule in `.cursor/rules/`
- New or edited skill in `.cursor/skills/`
- New command in `.cursor/commands/`
- Nested sub-agent (`agents/*.md`) inside a skill pipeline
- Suspect Codex/Claude is missing a rule that Cursor already has

## Architecture

```
.cursor/                        ← SOURCE OF TRUTH
├── rules/*.mdc                 # alwaysApply / globs → rules  |  agent-requested → Skill
├── skills/<slug>/
│   ├── SKILL.md
│   └── agents/NN-<name>.md     # "# Role: ..." → .claude/agents/<slug>-<name>.md
└── commands/*.md

.agents/                        ← Codex / Antigravity (generated)
├── AGENTS.md
├── SKILL.md
├── rules/                      # always-apply / glob rules, full text
└── skills/                     # junction/symlink or generated SKILL.md

.claude/                        ← Claude Code (generated)
├── CLAUDE.md
├── rules/
├── agents/
├── commands/
└── skills/

AGENTS.md                       ← Codex entry (generated copy at repo root)
CLAUDE.md                       ← Claude Code entry (generated copy at repo root)
```

## Rule vs Skill — route by meaning, not 1-1 copy

| Frontmatter | Meaning | Claude Code | Codex (`.agents/`) |
|---|---|---|---|
| `alwaysApply: true` | Every request | `.claude/rules/<slug>.md` (no `paths:`) | Full text in `.agents/rules/` + Quick Rules digest |
| `globs: <pattern>` | When matching files | `.claude/rules/<slug>.md` (`paths:`) | Full text in `.agents/rules/` + Quick Rules digest |
| Neither | Agent decides via `description` | `.claude/skills/<slug>/SKILL.md` | `.agents/skills/<slug>/SKILL.md` |

Claude Skills load **on demand**. Putting an always-on rule only in a Skill means Codex/Claude may never read it.

`.agents/` has no path-scoped primitive. Glob/always-on rules are summarized in Quick Rules; full text still lives in `.agents/rules/<slug>.md`.

## Sync tool

**Backend:** `scripts/sync-ai-rules.mjs` (Node, no extra packages).

```bash
pnpm sync-ai-rules    # write generated files
pnpm check-ai-rules   # drift only (exit 1 if stale)
```

Or:

```bash
node .cursor/skills/ai-config-sync/scripts/sync-ai-rules.mjs
node .cursor/skills/ai-config-sync/scripts/sync-ai-rules.mjs --check
```

On Windows the script uses **directory junctions** (fallback: recursive copy). Unix uses symlinks.

## Create a rule

1. Add `.cursor/rules/<name>.mdc`:

```markdown
---
description: When this rule applies (trigger text)
alwaysApply: true | false
# Optional — only when alwaysApply is false:
globs: src/**/*.ts,src/**/*.tsx
---

# Rule body
```

2. Run `pnpm sync-ai-rules`

**File naming:** `snake_case.mdc` → slug `kebab-case`

Always-on core + on-demand playbook for the same topic = **two** `.mdc` files with different slugs. One file cannot be both always-on and agent-requested.

## Create a skill (multi-file / workflow)

1. Add `.cursor/skills/<slug>/SKILL.md` with `name` + `description`
2. Optional: `references/`, `scripts/`, `examples/`
3. Run `pnpm sync-ai-rules`
4. Script links `.agents/skills/<slug>` and `.claude/skills/<slug>` → `.cursor/skills/<slug>`

## Nested sub-agent

1. `.cursor/skills/<slug>/agents/<NN>-<name>.md` whose **first** non-empty line is:

```markdown
# Role: <Title>
```

2. `pnpm sync-ai-rules` → `.claude/agents/<slug>-<name>.md`
3. Files without `# Role:` are shared docs, not subagents.

Codex has no subagent frontmatter — it reads the source files through the skill link.

## Create a command

1. `.cursor/commands/<name>.md`
2. `pnpm sync-ai-rules` → symlink/junction `.claude/commands/<name>.md`

## Invariants

- **Do not** edit `.agents/` or `.claude/` or generated root `AGENTS.md` / `CLAUDE.md` by hand
- Every AI-config change: edit `.cursor/` → `pnpm sync-ai-rules`
- This is architecture, not a preference

## References

- [Sync algorithm](references/sync-algorithm.md)
- [Script](scripts/sync-ai-rules.mjs)
