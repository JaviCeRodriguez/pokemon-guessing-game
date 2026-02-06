# AI Agent Guide (Nearest-wins)

This repo uses a **hierarchical `AGENTS.md` system**.
- **Root is lightweight**: universal rules + links.
- **Nearest file wins**: when editing a file, follow the closest `AGENTS.md` in that directory tree.

## Project snapshot
- **Repo type**: single Next.js app (not a monorepo)
- **Stack**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind + shadcn/ui + Supabase
- **Skills live in**: `.agents/skills/**` (reference them instead of pasting long guidance)

## Root setup commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Universal conventions
- **TypeScript**: `strict: true` in `tsconfig.json` (keep types tight; avoid `any`).
- **Imports**: absolute alias `@/*` maps to repo root (see `tsconfig.json`).
- **Styling**: Tailwind + CSS variables; class merging via `cn()` in `lib/utils.ts`.
- **Next.js**: prefer Server Components by default; use `"use client"` only when needed.

## Security & secrets
- **Never commit secrets**: `.env*.local` is ignored by git (see `.gitignore`).
- **Public env vars**: only `NEXT_PUBLIC_*` is safe to expose to the browser.
- **PII**: don’t log sensitive user data; sanitize error messages.

## Skills reference (auto-invoke)
Skills are in `.agents/skills/`:
- [`typescript`](.agents/skills/typescript/SKILL.md)
- [`next-best-practices`](.agents/skills/next-best-practices/SKILL.md)
- [`vercel-react-best-practices`](.agents/skills/vercel-react-best-practices/SKILL.md)
- [`playwright`](.agents/skills/playwright/SKILL.md)
- [`supabase-postgres-best-practices`](.agents/skills/supabase-postgres-best-practices/SKILL.md)

When performing these actions, **read the corresponding skill first**:

| Action | Skill |
|---|---|
| Writing/refactoring `.ts/.tsx` types, interfaces, generics | `typescript` |
| Editing Next.js routes/layouts, RSC boundaries, data fetching | `next-best-practices` |
| React/Next performance work (waterfalls, bundle size, rendering) | `vercel-react-best-practices` |
| Writing Playwright E2E tests | `playwright` |
| SQL/schema/query performance or Supabase/Postgres tuning | `supabase-postgres-best-practices` |

## JIT Index (what to open, not what to paste)

### Directory map
- Next.js App Router: `app/` → see [app/AGENTS.md](app/AGENTS.md)
- UI + shadcn components: `components/` → see [components/AGENTS.md](components/AGENTS.md)
- Utilities: `lib/`, `hooks/` → see [lib/AGENTS.md](lib/AGENTS.md), [hooks/AGENTS.md](hooks/AGENTS.md)
- Supabase helpers (SSR/middleware): `utils/supabase/` → see [utils/supabase/AGENTS.md](utils/supabase/AGENTS.md)
- Skills library: `.agents/skills/` (reference only; don’t duplicate)

### Quick find commands
- Find a component export: `rg -n "export (function|const) [A-Z]" components`
- Find `"use client"` boundaries: `rg -n "\"use client\"" app components`
- Find Supabase usage: `rg -n "supabase|createClient|@supabase" utils app components`
- Find Tailwind helper usage: `rg -n "cn\\(" app components`

## Definition of Done (minimal)
- `pnpm lint` passes
- `pnpm build` passes
- No secrets added; env vars remain in `.env*.local`
