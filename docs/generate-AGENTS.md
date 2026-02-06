# Generate `AGENTS.md` (hierarchical) — Prompt Template

Use this document whenever we need to **regenerate the hierarchical `AGENTS.md` system** for ANY repository.

## Task
Analyze this codebase and generate a hierarchical `AGENTS.md` structure.

## Context & Principles
We need a **hierarchical `AGENTS.md` system** so AI coding agents work efficiently with minimal token usage.

### Core Principles
1. **Root `AGENTS.md` is LIGHTWEIGHT** — only universal guidance + links to sub-files
2. **Nearest-wins hierarchy** — agents follow the closest `AGENTS.md` to the file being edited
3. **JIT indexing** — provide paths/globs/commands, NOT full content
4. **Token efficiency** — small, actionable guidance over encyclopedic docs
5. **Sub-folder `AGENTS.md` files have MORE detail** — specific patterns, examples, commands

## Skills (if present)

Many repos include “skills” (agent playbooks) to be referenced and auto-invoked. **Do not assume** a skills system exists or where it lives.

### Skills discovery (MANDATORY)
Before generating any `AGENTS.md`, scan the repo for skills-like folders/files and report what you found:
- `**/SKILL.md`
- `**/.agents/skills/**` (common)
- `**/.cursor/skills/**` (common)
- `**/skills/**` (common)

### How to include skills in `AGENTS.md`
- If skills exist, the root `AGENTS.md` MUST include:
  - A **Skills Reference** list (links to the skill files/dirs; do not paste full content)
  - An **Auto-invoke Skills** table mapping common actions → relevant skills
- If no skills exist, omit these sections entirely (do not add placeholders).

## Your process

### Phase 1: Repository Analysis
Analyze the repo and produce:
1. **Repository type**: monorepo vs single project
2. **Primary tech stack** (languages, frameworks, key tools)
3. **Major directories** that should have their own `AGENTS.md`
4. **Build system** (pnpm/npm/yarn/bun; workspaces/turbo/lerna/etc if present)
5. **Testing setup** (if any) and where tests live/config lives
6. **Key patterns to document**
7. **Skills inventory** (only if present): list skill names + file paths + their “trigger”/purpose if documented

Output this as a **structured map** before generating files.

---

### Phase 2: Generate Root `AGENTS.md`
Create a **lightweight root** (~100–200 lines max) that includes:
1. **Project Snapshot** (3–5 lines)
2. **Root Setup Commands** (copy-paste ready; only include commands that exist)
3. **Universal Conventions** (derived from the repo: lint/format, TypeScript strictness, path aliases, runtime constraints, etc.)
4. **Security & Secrets**
5. **Skills reference + Auto-invoke table** (ONLY if skills exist)
6. **JIT Index — Directory Map** (links to sub-AGENTS; no duplication)
7. **Definition of Done** (minimal PR-ready checklist; repo-specific)

---

### Phase 3: Generate Sub-Folder `AGENTS.md`
For each major directory, generate a **detailed** `AGENTS.md` with:
1. **Package Identity**
2. **Setup & Run**
3. **Patterns & Conventions** (most important)
   - Include ✅ DO / ❌ DON'T items with **real file paths from this repo**
4. **Touch points / key files**
5. **JIT index hints** (copy-paste commands; prefer `rg`, `find`; avoid placeholders)
6. **Common gotchas** (only if applicable)
7. **Pre-PR checks**

---

## Output format
Return in this order:
1. **Analysis summary**
2. **Root `AGENTS.md`**
3. **Each sub-folder `AGENTS.md`** (one at a time) with its file path

Use blocks like:

```
---
File: `AGENTS.md` (root)
---
[content]
```

## Constraints & quality checks
- Root `AGENTS.md` under 200 lines
- Root links to all sub `AGENTS.md`
- Sub-files have concrete examples (real file paths)
- Commands are copy/paste ready
- No duplication between root and sub-files
- Auto-invoke skills table included ONLY when skills exist
