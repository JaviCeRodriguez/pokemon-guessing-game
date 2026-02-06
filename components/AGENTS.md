# `components/` (UI + shis) — AI Agent Guide

## Package identity
Reusable UI and feature components.

Primary tech: **React 19** + **TypeScript** + **Tailwind** + **shadcn/ui (Radix)**.

## Setup & run

```bash
pnpm dev
pnpm lint
pnpm build
```

## Patterns & conventions (most important)
- ✅ **DO**: Keep shadcn primitives in `components/ui/*`. Example: `components/ui/button.tsx`, `components/ui/card.tsx`.
- ✅ **DO**: Use the Tailwind class merge helper `cn()` from `lib/utils.ts` when combining classes.
- ✅ **DO**: Use absolute imports via `@/…` (see `tsconfig.json`).
- ✅ **Client components**: Add `"use client"` at the top when using hooks. Example: `components/pokemon-hangman.tsx`.
- ❌ **DON'T**: Create deep nested inline types; keep interfaces flat (reference: `.agents/skills/typescript/SKILL.md`).

React/Next performance guidance: reference `.agents/skills/vercel-react-best-practices/SKILL.md`.

### Concrete examples in this repo
- ✅ Feature component pattern (state + effects): `components/pokemon-hangman.tsx`
- ✅ Theme provider wrapper: `components/theme-provider.tsx`
- ✅ UI primitives live here: `components/ui/*` (Radix-based)

### Known legacy/anti-patterns (avoid in new code)
- ❌ `components/theme-provider.tsx` currently uses `import * as React from 'react'`.
  - Prefer named imports (`import { ... } from "react"`) for consistency with other files like `components/pokemon-hangman.tsx`.
  - If you touch this file, consider aligning imports (no behavior change).

## Touch points / key files
- Main game UI: `components/pokemon-hangman.tsx`
- Theme wiring: `components/theme-provider.tsx`
- Shadcn primitives: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/dialog.tsx`

## JIT index hints
- Find components: `rg -n "export (function|const) [A-Z]" components`
- Find shadcn primitives: `ls components/ui`
- Find `cn()` usage: `rg -n "cn\\(" components`
- Find client components: `rg -n "\"use client\"" components`

## Common gotchas
- This codebase includes v0 scaffolding hints (see `.gitignore` entries like `__v0_*`). Avoid reintroducing runtime loader files into git.

## Pre-PR checks

```bash
pnpm lint && pnpm build
```
