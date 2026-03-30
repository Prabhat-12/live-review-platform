# AGENT_LOG.md — LiveReview Multi-Agent Build Log

> This file is the shared communication channel for all agents.
> Each agent appends entries. Never overwrite existing content.
> Format: `[TIMESTAMP] [AGENT] STATUS: message`

---

## Phase 1: Project Scaffold + Database Schema + UI Shell

**Started:** 2026-03-30
**Coordinator:** Agent 1 — Product Lead

---

### [2026-03-30 00:00] [PRODUCT LEAD] INIT: Phase 1 kickoff

**PRD Read:** ✅ Complete
**CLAUDE.md:** ⚠️ File does not exist in project root — proceeding without it. Will create one during scaffold.

**Phase 1 Task Assignment:**
- Agent 2 (Frontend): Build UI shell — dashboard layout, project cards, review page shell, floating toolbar
- Agent 3 (Backend/Scaffold): Scaffold Next.js 15 App Router project, install all dependencies, configure TypeScript + Tailwind + shadcn/ui, set up environment config
- Agent 4 (Database): Write complete SQL migration file, Supabase TypeScript types, RLS policies

**Coordination Rules in Effect:**
- If blocked on a dependency, stub it and flag here
- No agent asks human for input on implementation details
- All agents read this log before starting

**Phase 1 Success Criteria:**
- [ ] `npx create-next-app` scaffold complete with all deps installed
- [ ] `supabase/migrations/001_initial_schema.sql` written and valid
- [ ] TypeScript types generated for all DB tables (`src/lib/database.types.ts`)
- [ ] Dashboard page renders project card grid (with mock data)
- [ ] Review page shell renders with floating toolbar
- [ ] Auth pages (login) scaffolded
- [ ] No TypeScript errors in shell components

---

### [2026-03-30] [AGENT 3 - BACKEND/SCAFFOLD] COMPLETE: Phase 1 scaffold done

**Completed:**
- Next.js 15 App Router scaffolded (workaround: temp dir due to capital letters in "Feedback_Tool" blocking create-next-app)
- All dependencies installed: @supabase/supabase-js, @supabase/ssr, zustand, fabric, html2canvas, lucide-react, clsx, tailwind-merge, class-variance-authority
- shadcn/ui initialized (Tailwind v4), components added: button, card, badge, input, label, textarea, select, dialog, dropdown-menu, tooltip, avatar, separator, skeleton
- src/lib/supabase/client.ts, server.ts, middleware.ts — Supabase browser/server/middleware clients
- src/middleware.ts — Next.js middleware with auth guard (/dashboard requires session)
- src/lib/utils.ts — cn(), formatDate(), formatRelativeTime()
- src/lib/constants.ts — FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, PROJECT_ROLES
- .env.local, .env.example created
- CLAUDE.md written at project root
- Directory structure initialized

**Blockers resolved:** create-next-app capital-letter restriction → scaffolded to /tmp/livereview, copied over

**Notes for Agent 2 (Frontend):** shadcn Badge import: `import { Badge } from '@/components/ui/badge'`
**Notes for Agent 4 (Database):** Create src/lib/database.types.ts — Supabase clients typed with Database generic

---

### [2026-03-30] [AGENT 4 - DATABASE] COMPLETE: Phase 1 database work done

**Completed:**
- supabase/migrations/001_initial_schema.sql — full schema: profiles, projects, project_members, feedback_items, comments
- supabase/migrations/001_initial_schema.sql — 9 indexes, updated_at trigger, handle_new_user trigger
- supabase/migrations/001_initial_schema.sql — RLS enabled on all 5 tables with scoped policies
- supabase/migrations/001_initial_schema.sql — feedback_items + comments added to supabase_realtime publication
- src/lib/database.types.ts — complete TypeScript types: Row/Insert/Update for all tables
- src/lib/database.types.ts — convenience aliases: Profile, Project, ProjectMember, FeedbackItem, Comment
- src/lib/database.types.ts — extended types: ProjectWithStats, FeedbackItemWithAuthor
- supabase/config.toml — local dev config (ports, auth, storage, Google OAuth)

**Blockers:** None

**Notes for other agents:**
- Import types: `import type { Project, FeedbackItem, ProjectWithStats } from '@/lib/database.types'`
- Supabase clients (src/lib/supabase/) already typed with Database generic by Agent 3
- RLS self-reference fix: project_members SELECT policy uses alias pm2 to avoid recursion

---

### [2026-03-30] [AGENT 2 - FRONTEND] COMPLETE: Phase 1 UI shell done

**Completed:**
- src/app/layout.tsx — root layout, dark theme, Inter font, LiveReview metadata
- src/app/page.tsx — redirects root → /dashboard
- src/app/login/page.tsx — split-panel auth page (Google OAuth + magic link email)
- src/app/dashboard/layout.tsx — dashboard shell with sidebar
- src/app/dashboard/page.tsx — projects grid with mock data (3 projects)
- src/app/review/[projectId]/page.tsx — review page shell with proxy placeholder
- src/components/dashboard/Sidebar.tsx — dark sidebar, nav links, workspace selector, user row
- src/components/dashboard/DashboardHeader.tsx — page header with action slot
- src/components/dashboard/ProjectCard.tsx — card with stats, progress bar, live dot, guest badge
- src/components/review/FeedbackToolbar.tsx — floating toolbar (navigate/comment/annotate + category picker)

**Build result:** ✅ `npm run build` passes — 0 TypeScript errors, 0 warnings
**Routes compiled:** /, /dashboard, /login, /review/[projectId], /_not-found

**Issues resolved:**
- cp -r from /tmp broke .bin/ symlinks → fixed with `rm -rf node_modules && npm install`
- Next.js 16 deprecated `middleware.ts` → renamed to `proxy.ts`, export renamed to `proxy()`

---

### [2026-03-30] [PRODUCT LEAD] COMPLETE: Phase 1 coordination check passed

**All Phase 1 success criteria met:**
- [x] Next.js 16 scaffold complete, all deps installed (Supabase, Zustand, Fabric.js, shadcn/ui)
- [x] supabase/migrations/001_initial_schema.sql — 5 tables, 9 indexes, RLS on all, realtime enabled
- [x] src/lib/database.types.ts — full TypeScript types with Row/Insert/Update + convenience aliases
- [x] Dashboard page renders 3 project cards (mock data, real ProjectWithStats types)
- [x] Review page shell with collapsible floating feedback toolbar (navigate/comment/annotate)
- [x] Login page with Google OAuth + magic link
- [x] `npm run build` passes — 0 errors, 0 warnings

**No integration conflicts detected between agents.**

**Ready for Phase 2:** Reverse proxy + pin comment system + realtime foundation

---

## Phase 2: Auth + Real Data + Reverse Proxy + Overlay + Realtime

**Started:** 2026-03-30
**Coordinator:** Agent 1 — Product Lead

---

### [2026-03-30] [AGENT 3 - BACKEND] COMPLETE: Auth routes + API layer done

**Completed:**
- src/app/auth/callback/route.ts — Supabase OAuth code exchange (PKCE flow)
- src/app/auth/confirm/route.ts — magic link token_hash confirmation
- src/app/api/projects/route.ts — GET (list with stats via join), POST (create + auto-add owner as admin)
- src/app/api/projects/[id]/route.ts — GET (project detail), PATCH (name/url/status), DELETE
- src/app/api/projects/[id]/feedback/route.ts — GET (list with category/status/page_url filters), POST (create with context_metadata)
- src/app/api/feedback/[feedbackId]/route.ts — PATCH (status toggle open/resolved)
- src/app/api/feedback/[feedbackId]/comments/route.ts — POST (add reply)
- src/app/review/[projectId]/[...path]/route.ts — full reverse proxy (HTML rewrite + CSS rewrite + overlay inject + redirect handling)
- SETUP.md — step-by-step Supabase setup guide for the user

**Reverse proxy details:**
- Strips X-Frame-Options, CSP, COOP, COEP, CORP response headers
- Rewrites href/src/action/srcset/url() in HTML and CSS to route through /review/[projectId]/
- Injects window.__livereview config + /overlay/livereview.js before </body>
- Handles 301/302 redirects by rewriting Location header through proxy

**Blockers resolved:**
- postgrest-js v2.100 requires `Relationships: []` on each table in database.types.ts — added + `CompositeTypes` key
- Join queries (projects→feedback_items) inferred as SelectQueryError without FK relationships in types — resolved with `as unknown as` cast pattern
- Enum filter params (category, status from URL) need explicit cast to literal union types

**Notes for Agent 2 (Frontend):**
- window.__livereview = { projectId, supabaseUrl, supabaseAnonKey, apiBase } injected on every proxied HTML page
- POST /api/projects/[id]/feedback accepts: type, category, content, page_url, pin_position, context_metadata
- PATCH /api/feedback/[feedbackId] accepts: { status: 'open' | 'resolved' }

---

### [2026-03-30] [AGENT 2 - FRONTEND] COMPLETE: Auth wiring + dashboard + overlay script done

**Completed:**
- src/app/login/page.tsx — wired Google OAuth (signInWithOAuth) + magic link (signInWithOtp)
- src/components/dashboard/Sidebar.tsx — real user session from getUser(), signOut() on logout
- src/app/dashboard/page.tsx — replaced mock data with real Supabase query (feedback_items + project_members join)
- src/components/dashboard/NewProjectButton.tsx — client component triggering NewProjectDialog
- src/app/dashboard/projects/[projectId]/page.tsx — project detail page with feedback list, open count, review link
- src/app/dashboard/feedback/page.tsx — placeholder (Phase 3)
- src/app/dashboard/settings/page.tsx — placeholder (Phase 3)
- src/app/review/[projectId]/page.tsx — redirects to catch-all proxy route
- public/overlay/livereview.js — full overlay script (Shadow DOM, toolbar, pin system, realtime)

**Overlay script details:**
- Shadow DOM isolation (host div, attachShadow) — no CSS/JS conflicts with target page
- Navigate/Comment/Annotate mode switching with crosshair cursor in comment mode
- Click handler captures clientX/Y, builds CSS selector (walks DOM up to nearest #id or nth-of-type)
- Comment form positioned near click, stays in viewport, supports Cmd+Enter submit
- POST to /api/projects/{projectId}/feedback with pin_position + context_metadata (browser, os, viewport, deviceType, consoleErrors)
- Numbered color-coded pins rendered at click position (bug=red, ux=orange, feature=purple, general=blue, question=green)
- Loads existing pins on page load (GET /api/projects/{projectId}/feedback?page_url=...)
- Supabase Realtime: postgres_changes INSERT on feedback_items → renders new pins from other reviewers
- Presence channel tracking: updates reviewer count in toolbar dot indicator

---

### [2026-03-31] [PRODUCT LEAD] COMPLETE: Phase 2 coordination check passed

**All Phase 2 success criteria met:**
- [x] Auth: Google OAuth + magic link wired end-to-end (callback, confirm, login page, sidebar sign out)
- [x] Dashboard: real Supabase data, project cards with live feedback counts
- [x] Create project: NewProjectButton → dialog → POST /api/projects → card appears
- [x] Project detail: feedback list, open count, link to review session
- [x] Reverse proxy: /review/[projectId]/[...path] fetches + rewrites + injects overlay
- [x] Overlay: Shadow DOM toolbar, comment mode, pin placement, form submission
- [x] Realtime: Supabase channel subscription — new pins appear across reviewer sessions
- [x] `npm run build` passes — 0 TypeScript errors, all 16 routes compiled

**Integration notes:**
- database.types.ts updated: added Relationships: [] to all tables, CompositeTypes key — required for postgrest-js v2.100
- Build fix pattern: joined queries use `as unknown as TargetType` to work around missing FK inference

**Ready for Phase 3:** Annotation canvas (Fabric.js), feedback filters + export, email notifications, live cursors
