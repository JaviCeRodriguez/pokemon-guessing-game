# `lib/` (shared utilities) — AI Agent Guide

## Package identity
Shared utilities used across the app.

Primary tech: TypeScript utilities for React/Next.

## Setup & run

```bash
pnpm lint
pnpm build
```

## Patterns & conventions (most important)
- ✅ **DO**: Put small, reusable helpers here when used in 2+ places.
- ✅ **DO**: Keep helpers pure and side-effect free when possible.
- ✅ **Styling helper**: use `cn()` from `lib/utils.ts` to merge Tailwind classes.
- ❌ **DON'T**: Add business logic that belongs in a feature component (keep `lib/` generic).

## Touch points / key files
- Tailwind class merge helper: `lib/utils.ts`

## JIT index hints
- Find utility usage: `rg -n "from '@/lib/" app components utils`
- Find `cn()` usage: `rg -n "cn\\(" app components`

## Pre-PR checks

```bash
pnpm lint && pnpm build
```
