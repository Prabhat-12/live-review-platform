# LiveReview — CLAUDE.md

## Project Overview
LiveReview is an internal feedback platform that wraps live URLs in a collaborative feedback layer. Teams can comment, annotate, and react directly on live products in real time — no calls, no lost context.

## Tech Stack
- **Framework:** Next.js 15 App Router + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Database:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State:** Zustand
- **Annotations:** Fabric.js
- **Screenshots:** html2canvas
- **Deployment:** Vercel

## Project Structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Shared UI components
- `src/components/ui/` — shadcn/ui primitives (do not edit manually)
- `src/lib/` — Utilities, Supabase clients, constants, types
- `src/overlay/` — Feedback overlay scripts (injected into proxied pages)
- `supabase/migrations/` — SQL migration files

## Key Rules
- Use shadcn/ui and Tailwind exclusively — no custom CSS unless unavoidable
- All DB access goes through Supabase client with RLS enforced
- Never expose SUPABASE_SERVICE_ROLE_KEY to the client
- The reverse proxy lives at `/review/[projectId]/` as a catch-all route
- Agents communicate through AGENT_LOG.md — never overwrite, only append

## Multi-Agent Build
This project is built by a 5-agent team coordinated through AGENT_LOG.md:
- Agent 1: Product Lead (orchestrator)
- Agent 2: Frontend Engineer (src/components/, src/app/, src/overlay/)
- Agent 3: Backend & Infrastructure (src/app/api/, middleware, proxy)
- Agent 4: Database & Realtime (supabase/migrations/, database.types.ts)
- Agent 5: QA & Testing (src/lib/__tests__/, integration tests)
