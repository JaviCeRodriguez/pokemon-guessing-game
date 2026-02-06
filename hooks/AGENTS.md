# `hooks/` (shared React hooks) — AI Agent Guide

## Package identity
Shared React hooks (ideally reusable, not feature-specific).

Primary tech: React 19 + TypeScript.

## Setup & run

```bash
pnpm dev
pnpm lint
```

## Patterns & conventions (most important)
- ✅ **DO**: Keep hooks reusable and focused (one responsibility).
- ✅ **DO**: Name hooks `useXxx` and export them from a single file per hook.
- ✅ **DO**: Keep hook inputs/outputs typed (reference: `.agents/skills/typescript/SKILL.md`).
- ❌ **DON'T**: Put UI components in `hooks/`.

## Touch points / key files
- `hooks/use-mobile.tsx`
- `hooks/use-toast.ts`

## JIT index hints
- Find hooks: `rg -n "export (function|const) use[A-Z]" hooks`
- Find hook usage: `rg -n "from '@/hooks/" app components`

## Pre-PR checks

```bash
pnpm lint && pnpm build
```
