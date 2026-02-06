# `app/` (Next.js App Router) — AI Agent Guide

## Package identity
This is the **Next.js App Router** entrypoint: routing, layouts, metadata, global styles.

Primary tech: **Next.js 16 App Router** + **React 19** + **TypeScript**.

## Setup & run

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Patterns & conventions (most important)
- ✅ **DO**: Keep routing in `app/**` with `page.tsx` and `layout.tsx`. Example: `app/page.tsx`, `app/layout.tsx`.
- ✅ **DO**: Prefer Server Components by default; only add `"use client"` when using hooks, browser APIs, or client-only libs.
- ❌ **DON'T**: Put client-only hooks in `app/layout.tsx` without `"use client"`.
- ✅ **Metadata**: use the exported `metadata` object pattern as in `app/layout.tsx`.
- ✅ **Global CSS**: use `app/globals.css` for Next’s global styles (don’t scatter global selectors across many files).

Next.js-specific guidance: reference `.agents/skills/next-best-practices/SKILL.md`.

## Touch points / key files
- App shell & metadata: `app/layout.tsx`
- Home route: `app/page.tsx`
- Global styles: `app/globals.css`

## JIT index hints
- Find routes: `find app -name "page.tsx" -o -name "route.ts"`
- Find layouts: `find app -name "layout.tsx"`
- Find metadata usage: `rg -n "export const metadata" app`
- Find `"use client"` in routing layer: `rg -n "\"use client\"" app`

## Common gotchas
- `next.config.mjs` currently sets `typescript.ignoreBuildErrors: true` — don’t rely on this; keep TS clean anyway.
- Avoid `<img>` in pages; prefer `next/image` unless there’s a reason (see Next image guidance in the Next skill).

## Pre-PR checks

```bash
pnpm lint && pnpm build
```
