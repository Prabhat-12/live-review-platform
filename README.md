# LiveReview

LiveReview is an internal feedback platform that wraps live URLs in a collaborative feedback layer. Teams can comment, annotate, and react directly on the product as they use it - no calls, no lost context.

## What it solves
- First-reaction loss: capture feedback at the moment it happens.
- Scattered feedback: keep comments tied to the exact page and flow.
- Context collapse: attach annotations/screenshots to make feedback actionable.

## Key features
- Link-based project workspace (invite your team with a URL)
- Real-time comments and reactions
- Screen annotations (Fabric.js) and screenshot capture (html2canvas)
- Centralized dashboard for project feedback items and status

## Tech stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Zustand (state)
- Fabric.js (annotations)
- html2canvas (screenshots)
- Vercel (deployment)

## Local setup
See [`SETUP.md`](./SETUP.md) for the full step-by-step guide.

Quick start:
1. Copy env vars: `cp .env.example .env.local`
2. Update `.env.local` with your Supabase project URL/keys and app URL
3. Run the SQL migration from `supabase/migrations/`
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000

## Environment variables
Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; do not expose to the browser)
- `NEXT_PUBLIC_SITE_URL`

Optional:
- `RESEND_API_KEY` (used for email notifications)

## Project structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - shared UI components
- `src/lib/` - utilities, Supabase clients, constants, types
- `src/overlay/` - feedback overlay scripts injected into proxied pages
- `supabase/migrations/` - database schema and RLS policies

## Reverse proxy / overlay route
The feedback overlay is served under:
- `/review/[projectId]/` (catch-all route)
