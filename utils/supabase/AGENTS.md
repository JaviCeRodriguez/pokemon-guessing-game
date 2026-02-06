# `utils/supabase/` (Supabase SSR helpers) — AI Agent Guide

## Package identity
Supabase client/server helpers and middleware glue for Next.js (SSR patterns).

Primary tech: **@supabase/supabase-js** + **@supabase/ssr** + **Next.js**.

## Setup & run

```bash
pnpm dev
pnpm lint
pnpm build
```

## Patterns & conventions (most important)
- ✅ **DO**: Keep Supabase configuration isolated to this folder.
  - Client helper: `utils/supabase/client.ts`
  - Server helper: `utils/supabase/server.ts`
  - Middleware helper: `utils/supabase/middleware.ts`
- ✅ **DO**: Treat env vars as secrets unless explicitly `NEXT_PUBLIC_*` (see root `AGENTS.md`).
- ✅ **DO**: Prefer server-side access patterns for sensitive operations (never leak service keys to client).
- ❌ **DON'T**: Inline SQL/DB performance decisions without referencing the Postgres best practices skill when relevant.

If you touch SQL/schema/perf/RLS decisions, reference:
`/.agents/skills/supabase-postgres-best-practices/SKILL.md`

## Touch points / key files
- Supabase client (browser): `utils/supabase/client.ts`
- Supabase server (RSC/route handlers): `utils/supabase/server.ts`
- Middleware integration: `utils/supabase/middleware.ts`
- Local env vars: `.env.local` (ignored by git)

## JIT index hints
- Find Supabase usage: `rg -n "@supabase|createClient|supabase" utils app components`
- Find middleware usage: `rg -n "middleware|createMiddlewareClient" utils app`

## Common gotchas
- Client-side usage requires `NEXT_PUBLIC_*` env vars; server-only env vars must never be imported into client modules.

## Pre-PR checks

```bash
pnpm lint && pnpm build
```
