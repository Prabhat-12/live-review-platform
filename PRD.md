# LiveReview — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** March 30, 2026
**Status:** Draft — Ready for Development
**Target Release:** Phase 1 MVP: 6–8 weeks from kickoff

---
## Agent Instructions
This is a multi-agent project. Read Section 15.4 of PRD.md before doing
anything else. Spawn the full agent team described there and coordinate
autonomously. Only surface decisions that affect product direction.

---

## 1. Executive Summary

LiveReview is an internal feedback platform that lets teams capture real-time, contextual feedback on live web products. Instead of the traditional cycle of sharing a link, scheduling a feedback call, and manually collecting scattered notes, LiveReview wraps any live URL in a collaborative feedback layer — enabling reviewers to comment, annotate, and react directly on the product as they experience it for the first time.

**One-Liner Pitch:** Paste your live product link, invite your team, and capture their real-time reactions, annotations, and feedback as they use it — no calls, no lost context.

---

## 2. Problem Statement

### 2.1 Current Pain Points

- **First-reaction loss:** By the time a feedback call happens, the reviewer's fresh first-impression is gone. They're recalling from memory, not reacting in the moment.
- **Scattered feedback:** Thoughts end up in Slack messages, email threads, meeting notes, and verbal discussions — never in one place tied to the actual product.
- **Context collapse:** Screenshots and screen recordings lose the interactive context. A reviewer saying "the flow felt off" without pointing at the exact step is unactionable.
- **Scheduling overhead:** Coordinating calendars for feedback calls with even a small team adds days of delay to every iteration cycle.
- **No structured capture:** Without a dedicated tool, feedback varies wildly in format, detail, and usefulness. Critical issues get buried in casual comments.

### 2.2 Current Workflow (Before LiveReview)

1. Builder develops MVP using Claude, Cursor, or similar AI-assisted tools.
2. Builder deploys to a live URL (Vercel, Netlify, etc.).
3. Builder shares the link on Slack or email with the team.
4. Team members test the product individually at different times.
5. A feedback call is scheduled (often 2–5 days later).
6. During the call, reviewers try to recall their experience from memory.
7. Feedback is captured in meeting notes, often incomplete and decontextualized.
8. Builder manually translates notes into actionable tasks.

### 2.3 Desired Workflow (With LiveReview)

1. Builder creates a LiveReview project and pastes the live URL.
2. Builder invites team members with a single link.
3. Reviewers open the link and interact with the live product inside LiveReview's feedback layer.
4. As they use the product, they drop comments, annotate screens, and categorize feedback in real time.
5. Builder sees all feedback in a centralized dashboard, organized by page, type, and status.
6. Multiple reviewers can see each other's comments live (Figma-style collaboration).
7. Builder resolves items and iterates — no call needed.

---

## 3. Target Users

### 3.1 Primary Persona: The Solo Builder / Small Team Lead

Someone who ships MVPs fast using AI-assisted development tools (Claude, Cursor, Bolt, v0). They need quick, structured feedback from a small group of 3–15 people without the overhead of formal QA processes or lengthy feedback calls.

### 3.2 Secondary Persona: Internal Product Reviewer

A team member, stakeholder, or collaborator who is asked to test a live product and share thoughts. They want a frictionless way to provide feedback without installing software, creating accounts, or remembering to take notes for a later call.

### 3.3 Future Persona: Agency / Freelancer

As the product matures, it can serve agencies and freelancers collecting client feedback on delivered web projects — similar to existing tools like Ruttl and Markup.io, but with a stronger focus on interactive product testing rather than static design review.

---

## 4. Competitive Landscape

| Feature | LiveReview | Ruttl | Markup.io | BugHerd |
|---|---|---|---|---|
| **Primary Focus** | MVP / product testing | Design review | Visual feedback | Bug tracking |
| **Real-time collab** | ✅ Yes (Figma-like) | ❌ No | ❌ No | ❌ No |
| **Interaction-aware** | ✅ Tracks user journey | ❌ Static pins | ❌ Static pins | ⚠ Partial |
| **Project workspace** | ✅ Multi-project | ✅ Multi-project | ⚠ Limited | ✅ Multi-project |
| **No-signup review** | ✅ Link-based access | ✅ Guest comments | ✅ Shareable link | ❌ Requires install |

**Key Differentiator:** LiveReview is purpose-built for internal teams testing functional MVPs and interactive web apps — not for agencies reviewing static marketing pages. The combination of real-time collaboration, interaction-aware feedback, and project-based organization makes it uniquely suited for the fast-iteration workflow of AI-assisted development.

---

## 5. Tech Stack

### 5.1 Frontend

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Full-stack React framework. Server components, API routes, and middleware in one codebase. Best AI-tool support. |
| Language | **TypeScript** | Type safety across frontend and backend. Better AI code generation accuracy. |
| Styling | **Tailwind CSS** | Rapid UI development. Excellent with AI tools. |
| UI Components | **shadcn/ui** | Accessible, customizable components built on Radix UI. Copy-paste model = full control. |
| Canvas/Drawing | **Fabric.js** | For annotation/drawing overlay. Mature library with full shape, freehand, and selection support. |
| Screenshots | **html2canvas** | Client-side screenshot capture for feedback context. |
| State Management | **Zustand** | Lightweight, minimal boilerplate. Works well for real-time state sync. |

### 5.2 Backend

| Layer | Technology | Rationale |
|---|---|---|
| Database + Auth + Realtime | **Supabase** | PostgreSQL database + built-in Auth (Google OAuth + magic link) + Realtime subscriptions (WebSocket). Single managed service replaces 3 separate tools. |
| API Layer | **Next.js API Routes + Supabase Client** | Server-side API routes for proxy logic. Supabase client for direct DB access with Row Level Security. |
| Reverse Proxy | **Custom Next.js middleware** | Fetches the target URL server-side, rewrites asset paths, and injects the feedback overlay script. |
| File Storage | **Supabase Storage** | For screenshots, annotation exports, and any file attachments. |
| Real-time Engine | **Supabase Realtime (Presence + Broadcast)** | Handles live cursors, presence indicators, and instant comment sync. No separate WebSocket server needed. |

### 5.3 Infrastructure & Deployment

| Layer | Technology | Rationale |
|---|---|---|
| Hosting | **Vercel** | Native Next.js support. Automatic deployments, preview URLs, edge functions, and zero-config SSL. |
| Database Hosting | **Supabase Cloud** | Managed PostgreSQL. Free tier generous enough for MVP. |
| Email | **Resend** | For magic link emails and notification emails. Simple API, generous free tier. |
| Error Tracking | **Sentry** | Real-time error monitoring. Free tier sufficient for MVP. |
| Analytics | **PostHog** (optional) | Product analytics with session replay. Useful for understanding how reviewers use LiveReview itself. |

## 15.4 Multi-Agent Development Strategy

This project must be built using a multi-agent approach inside Claude Code.
When starting development, Claude Code should automatically spawn a team
of specialised agents that work in parallel with minimal human intervention.
The lead agent coordinates the team — humans only intervene to review
milestone outputs or resolve blockers the team cannot resolve autonomously.

### Agent Roles

**Agent 1 — Product Lead (Orchestrator)**
- Reads this PRD in full before any work begins
- Breaks the project into phases and assigns tasks to all other agents
- Monitors progress across agents and resolves conflicts
- Ensures agents are not duplicating work or building in incompatible ways
- Reports milestone summaries to the human at the end of each phase only

**Agent 2 — Frontend Engineer**
- Owns everything in src/components/, src/app/, and src/overlay/
- Uses shadcn/ui and Tailwind exclusively — no custom CSS unless unavoidable
- Builds the project dashboard, review page shell, toolbar, pin UI, and annotation canvas
- Coordinates with Backend agent on API contract (what endpoints exist and their shape)
- Uses Fabric.js for the annotation canvas layer

**Agent 3 — Backend & Infrastructure Engineer**
- Owns src/app/api/ routes and the reverse proxy implementation
- Implements the Next.js catch-all route for proxying external URLs
- Handles header rewriting, relative URL rewriting, and overlay script injection
- Manages environment variables and Vercel deployment configuration
- Coordinates with Database agent on Supabase client usage

**Agent 4 — Database & Realtime Engineer**
- Owns all Supabase work: schema, migrations, RLS policies, realtime subscriptions
- Writes SQL migration files for all tables: projects, feedback_items, annotations,
  team_members, presence
- Sets up Supabase Realtime channels for live collaboration and presence
- Ensures RLS policies are correctly scoped — no data leaks between projects

**Agent 5 — QA & Testing Engineer**
- Writes unit tests for all utility functions in src/lib/
- Writes integration tests for all API routes
- Tests the reverse proxy against at least 5 different target URL types
- Validates RLS policies by testing cross-user data access
- Reports all failures back to the Product Lead agent for resolution

### Coordination Rules

- All agents must read CLAUDE.md and this PRD before starting any task
- Agents communicate findings and blockers through a shared AGENT_LOG.md
  file at the project root — each agent appends to this file, never overwrites
- If one agent is blocked waiting on another (e.g. Frontend needs an API
  that Backend hasn't built yet), it builds with a mock/stub and flags it
  in AGENT_LOG.md — it does not stop and wait
- No agent asks the human for input unless it is a decision that affects
  product direction (not implementation details)
- The Product Lead agent runs a coordination check every time a phase completes
  and decides what the next set of parallel tasks should be

### Phase Order

Phase 1: Project scaffold + database schema + UI shell (all 3 in parallel)
Phase 2: Reverse proxy + pin comment system + realtime foundation (in parallel)
Phase 3: Annotations + real-time collaboration + presence (in parallel)
Phase 4: Auto-capture context + dashboard polish + QA pass (in parallel)

Human reviews output at the end of each phase before Phase 5 begins.
---

## 6. Feature Specification

### 6.1 Project Workspace

**Description:** A dashboard for managing multiple review projects. Each project represents one live product/MVP being reviewed.

**Functional Requirements:**
- Create, edit, archive, and delete projects
- Each project stores: name, description, live URL, creation date, team members, and status (active / archived)
- Project-level settings: who can review, notification preferences
- Dashboard view with project cards showing feedback count, active reviewers, and last activity

### 6.2 Feedback Overlay System

**Description:** The core feature. When a reviewer opens a LiveReview project link, the target product loads inside a feedback-enabled environment with a non-intrusive toolbar overlay.

**Technical Approach — Reverse Proxy (Recommended):**

A server-side reverse proxy fetches the target URL and serves it through LiveReview's domain, injecting the feedback overlay script. This is more reliable than iframes (which are blocked by X-Frame-Options headers on many sites) and doesn't require a browser extension.

**Functional Requirements:**
- Floating toolbar (collapsible) with modes: Comment, Annotate, Navigate
- Toolbar does not interfere with the product's own UI or functionality
- Reviewer can freely interact with the product (click, scroll, type, navigate) when not in feedback mode
- Switching to Comment or Annotate mode activates the overlay without disrupting the loaded page
- Works across multi-page apps — feedback is tied to the specific route/page

### 6.3 Pin Comments

**Description:** Click anywhere on the page to drop a contextual comment pinned to that element/position. Inspired by Figma's comment system.

**Functional Requirements:**
- Click any point on the page to place a comment pin
- Pins are anchored using a combination of CSS selector path + viewport coordinates for resilience across page changes
- Each comment has: author, timestamp, text content, category tag, and a thread for replies
- Category tags: `Bug`, `UX Concern`, `Feature Request`, `General Thought`, `Question`
- Pins are visually numbered and color-coded by category
- Comment threads support replies and @mentions
- Comments can be marked as resolved (visually distinct from open comments)

### 6.4 Annotations & Markup

**Description:** Drawing tools for visual markup directly on the screen — for when pointing at a specific element isn't enough and the reviewer needs to circle, highlight, or sketch.

**Functional Requirements:**
- Freehand drawing (pen tool)
- Shape tools: rectangle, circle/ellipse, arrow
- Highlight tool (semi-transparent overlay)
- Color picker for annotation tools (default: red)
- Undo/redo support
- Annotations are saved as SVG overlays tied to the page state and viewport
- Each annotation can have an attached comment

### 6.5 Auto-Captured Context

**Description:** Every feedback item automatically captures technical and contextual metadata so developers can reproduce issues without back-and-forth.

**Captured Data:**
- Page URL / route at the time of feedback
- Screenshot of the current viewport state (captured via html2canvas)
- Browser name and version
- Operating system
- Viewport dimensions (width × height)
- Device type (desktop / tablet / mobile)
- Timestamp (UTC)
- Console errors (if any, captured via JavaScript error listener)

### 6.6 Real-Time Collaboration

**Description:** Multiple reviewers can see each other's comments, cursors, and annotations in real time — similar to Figma's multiplayer experience.

**Functional Requirements:**
- Live presence indicators: see who's currently reviewing (avatar + colored cursor)
- New comments and annotations appear instantly for all connected reviewers
- Typing indicators in comment threads
- Connection state handling: graceful reconnection on network interruptions
- Powered by Supabase Realtime (Presence + Broadcast + Postgres Changes)

### 6.7 Feedback Dashboard

**Description:** A centralized view for the project creator/admin to review, triage, and manage all feedback across the project.

**Functional Requirements:**
- List view of all feedback items across all pages of the project
- Filter by: category (bug, UX, feature request, etc.), status (open / resolved), page/route, reviewer, date range
- Sort by: newest, oldest, most replies, category
- Bulk actions: resolve multiple items, export selection
- Click any feedback item to see: the pinned location (with screenshot), full thread, and captured context
- Summary statistics: total feedback, open vs. resolved, breakdown by category, activity timeline

### 6.8 Authentication & Access Control

**Functional Requirements:**
- Google OAuth for quick one-click login
- Magic link (email-based passwordless login) as an alternative
- Role-based access per project:
  - **Admin:** full control (manage project, resolve feedback, invite members)
  - **Reviewer:** can add and view feedback
  - **Viewer:** read-only access to feedback history
- Invite by email or shareable link with role pre-assigned
- Reviewers can optionally join with just a name (no account required) via guest access link

---

## 7. System Architecture

### 7.1 High-Level Architecture

```
[Reviewer Browser]
    │
    │  Opens project link
    ▼
[Next.js on Vercel]
    ├── /app/*                    → Dashboard UI (React Server Components)
    ├── /review/:projectId/*      → Reverse Proxy + Overlay Injection
    └── /api/*                    → REST endpoints for CRUD operations
    │
    ▼
[Supabase Cloud]
    ├── PostgreSQL                → All application data
    ├── Auth                      → Google OAuth + Magic Link
    ├── Realtime                  → Presence + Broadcast channels
    └── Storage                   → Screenshots + attachments
```

### 7.2 Reverse Proxy Flow (Feedback Overlay)

This is the most critical technical component. Here's the flow:

1. Reviewer visits: `livereview.app/review/{projectId}`
2. Next.js middleware looks up the project's target URL from the database.
3. Server-side: fetches the target page HTML via HTTP.
4. Rewrites relative asset URLs (CSS, JS, images) to route through the proxy so they load correctly.
5. Injects the LiveReview overlay script (feedback toolbar, comment system, annotation canvas, real-time client) into the HTML `<body>`.
6. Serves the modified HTML to the reviewer's browser.
7. The overlay script connects to Supabase Realtime for live collaboration.

**Edge Cases to Handle:**
- Single-page apps (SPAs) that load content via JavaScript after initial HTML
- Sites with Content Security Policy (CSP) headers that may block injected scripts
- Authentication-protected target URLs (e.g., staging environments behind auth)
- WebSocket connections from the target app (must not conflict with LiveReview's own WebSocket)

### 7.3 Real-Time Collaboration Architecture

Using Supabase Realtime Channels:

- Each project gets a dedicated Realtime channel: `review:{projectId}`
- **Presence:** tracks who's online, cursor positions, and active page
- **Broadcast:** used for ephemeral events like cursor movement, typing indicators, and annotation-in-progress
- **Postgres Changes:** pushes new comments/annotations to all subscribers automatically when database rows change

---

## 8. Database Schema

All tables are in Supabase PostgreSQL with Row Level Security (RLS) policies enabled.

### 8.1 `profiles`

> Managed by Supabase Auth. Extended with a profiles table for display info.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK → auth.users | Supabase auth user ID |
| `display_name` | TEXT | NOT NULL | User's display name |
| `avatar_url` | TEXT | NULLABLE | Profile picture URL |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Account creation time |

### 8.2 `projects`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Project ID |
| `name` | TEXT | NOT NULL | Project name |
| `description` | TEXT | NULLABLE | Project description |
| `target_url` | TEXT | NOT NULL | The live URL being reviewed |
| `owner_id` | UUID | FK → profiles.id | Project creator |
| `status` | TEXT | DEFAULT 'active' | `active` \| `archived` |
| `guest_access_enabled` | BOOLEAN | DEFAULT false | Allow no-account guest access |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update time |

### 8.3 `project_members`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Membership ID |
| `project_id` | UUID | FK → projects.id | Associated project |
| `user_id` | UUID | FK → profiles.id, NULLABLE | Null for guest reviewers |
| `guest_name` | TEXT | NULLABLE | Display name for guests |
| `role` | TEXT | NOT NULL | `admin` \| `reviewer` \| `viewer` |
| `invited_at` | TIMESTAMPTZ | DEFAULT now() | When the invite was sent |

### 8.4 `feedback_items`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Feedback item ID |
| `project_id` | UUID | FK → projects.id | Parent project |
| `author_id` | UUID | FK → project_members.id | Who left the feedback |
| `type` | TEXT | NOT NULL | `comment` \| `annotation` |
| `category` | TEXT | NOT NULL | `bug` \| `ux` \| `feature_request` \| `general` \| `question` |
| `content` | TEXT | NOT NULL | Comment text or annotation description |
| `page_url` | TEXT | NOT NULL | Route/URL when feedback was left |
| `pin_position` | JSONB | NULLABLE | `{x, y, selector, viewportW, viewportH}` |
| `annotation_data` | JSONB | NULLABLE | SVG paths / shapes for annotations |
| `screenshot_url` | TEXT | NULLABLE | Supabase Storage URL of screenshot |
| `context_metadata` | JSONB | NOT NULL | `{browser, os, viewport, consoleErrors}` |
| `status` | TEXT | DEFAULT 'open' | `open` \| `resolved` |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | When feedback was created |

### 8.5 `comments` (thread replies)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Comment ID |
| `feedback_item_id` | UUID | FK → feedback_items.id | Parent feedback item |
| `author_id` | UUID | FK → project_members.id | Reply author |
| `content` | TEXT | NOT NULL | Reply text |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Reply timestamp |

### 8.6 SQL Migration

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  guest_access_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project Members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guest_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Feedback Items
CREATE TABLE feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'annotation')),
  category TEXT NOT NULL CHECK (category IN ('bug', 'ux', 'feature_request', 'general', 'question')),
  content TEXT NOT NULL,
  page_url TEXT NOT NULL,
  pin_position JSONB,
  annotation_data JSONB,
  screenshot_url TEXT,
  context_metadata JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments (thread replies)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_item_id UUID NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_feedback_items_project ON feedback_items(project_id);
CREATE INDEX idx_feedback_items_status ON feedback_items(project_id, status);
CREATE INDEX idx_feedback_items_category ON feedback_items(project_id, category);
CREATE INDEX idx_comments_feedback ON comments(feedback_item_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies: Projects
CREATE POLICY "Users can view projects they belong to"
  ON projects FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their projects"
  ON projects FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their projects"
  ON projects FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- RLS Policies: Project Members
CREATE POLICY "Members can view project members"
  ON project_members FOR SELECT TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can manage members"
  ON project_members FOR ALL TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- RLS Policies: Feedback Items
CREATE POLICY "Project members can view feedback"
  ON feedback_items FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );
CREATE POLICY "Reviewers can create feedback"
  ON feedback_items FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );
CREATE POLICY "Authors and admins can update feedback"
  ON feedback_items FOR UPDATE TO authenticated
  USING (
    author_id IN (SELECT id FROM project_members WHERE user_id = auth.uid()) OR
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- RLS Policies: Comments
CREATE POLICY "Project members can view comments"
  ON comments FOR SELECT TO authenticated
  USING (
    feedback_item_id IN (
      SELECT id FROM feedback_items WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM projects WHERE owner_id = auth.uid()
      )
    )
  );
CREATE POLICY "Reviewers can create comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (
    feedback_item_id IN (
      SELECT fi.id FROM feedback_items fi
      JOIN project_members pm ON pm.project_id = fi.project_id
      WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'reviewer')
    )
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_items;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
```

---

## 9. API Specification

All endpoints are implemented as Next.js API routes under `/api/`. Authentication is handled via Supabase session tokens passed in cookies.

### 9.1 Projects API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects for the authenticated user |
| `POST` | `/api/projects` | Create a new project (`name`, `target_url`, `description`) |
| `GET` | `/api/projects/:id` | Get project details including member list and stats |
| `PATCH` | `/api/projects/:id` | Update project settings |
| `DELETE` | `/api/projects/:id` | Archive or delete a project |

### 9.2 Members API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects/:id/members` | Invite a member (`email`, `role`) |
| `PATCH` | `/api/projects/:id/members/:memberId` | Update member role |
| `DELETE` | `/api/projects/:id/members/:memberId` | Remove a member |

### 9.3 Feedback API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects/:id/feedback` | List all feedback with filters (`category`, `status`, `page`) |
| `POST` | `/api/projects/:id/feedback` | Create feedback item (with screenshot upload) |
| `PATCH` | `/api/feedback/:feedbackId` | Update status (resolve/reopen) or edit content |
| `POST` | `/api/feedback/:feedbackId/comments` | Add a reply to a feedback thread |
| `POST` | `/api/projects/:id/feedback/export` | Export feedback as JSON or CSV |

### 9.4 Proxy API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/review/:projectId/**` | Reverse proxy: fetches target URL, injects overlay, serves to reviewer |
| `GET` | `/api/proxy/asset` | Proxies static assets (CSS, JS, images) from the target domain |

---

## 10. UI/UX Specification

### 10.1 Key Screens

**1. Login / Landing Page**
- Clean, minimal landing with product value prop
- Google OAuth button + magic link email input
- Guest access flow: enter name only (if visiting a guest-enabled project link)

**2. Dashboard (Project List)**
- Grid of project cards showing: name, URL thumbnail, feedback count (open/resolved), active reviewers, last activity date
- Create New Project button (prominent)
- Search and filter projects

**3. Project Settings**
- Edit name, description, target URL
- Manage team members: invite, change roles, remove
- Toggle guest access on/off
- Generate shareable review link

**4. Review Mode (The Core Experience)**
- Full-viewport rendering of the target product
- Floating toolbar (bottom-center or side): Comment mode, Annotate mode, Navigate mode toggle
- Presence bar (top-right): avatars of online reviewers with colored indicators
- Comment pins visible as numbered circles on the page
- Comment panel (slide-out right sidebar) showing selected comment thread
- Annotation tools (when active): pen, rectangle, circle, arrow, highlight, color picker, undo/redo

**5. Feedback Dashboard**
- Table/list view of all feedback items
- Columns: #, category (color badge), content preview, page, author, status, date
- Click to expand: full comment thread + screenshot + context metadata
- Filters sidebar: category, status, page, author, date range
- Bulk actions toolbar: resolve selected, export selected
- Summary stats at top: total, open, resolved, by category breakdown

### 10.2 Design Principles

- **Non-intrusive:** The feedback layer must never break or visually alter the target product's UI
- **Instant:** Dropping a comment should feel as fast as clicking in Figma — no loading spinners
- **Minimal onboarding:** A reviewer should understand how to leave feedback within 10 seconds of opening the link
- **Mobile-aware:** The overlay should be usable on tablet/mobile viewports (simplified toolbar)

---

## 11. Phased Implementation Plan

### Phase 1: Foundation (Weeks 1–3)

**Goal:** Core infrastructure, auth, project CRUD, and the reverse proxy working end-to-end.

- Set up Next.js 15 project with TypeScript + Tailwind + shadcn/ui
- Configure Supabase: database schema, Auth (Google OAuth + magic link), RLS policies
- Build project CRUD: create, list, edit, archive
- Implement reverse proxy: fetch target URL, rewrite assets, inject overlay script stub
- Build the overlay script shell: loads on proxied page, shows a minimal toolbar
- Deploy to Vercel with Supabase Cloud

### Phase 2: Core Feedback (Weeks 3–5)

**Goal:** Pin comments, auto-captured context, and the feedback dashboard.

- Build pin comment system: click-to-place, CSS selector anchoring, viewport position
- Implement comment threads with replies
- Auto-capture context on each feedback: screenshot (html2canvas), browser info, page URL, console errors
- Build feedback dashboard: list view, filters, detail panel with screenshot and context
- Category tagging and status management (open/resolved)

### Phase 3: Real-Time + Annotations (Weeks 5–7)

**Goal:** Live collaboration and drawing/annotation tools.

- Integrate Supabase Realtime: live comment sync, presence indicators, cursor tracking
- Build annotation canvas overlay using Fabric.js: freehand, shapes, arrows, highlights
- Annotation persistence: save SVG data to database, render on reload
- Typing indicators and live presence avatars
- Notification system: email notifications via Resend for new feedback on your projects

### Phase 4: Polish + Team Features (Weeks 7–8)

**Goal:** Access control, guest access, export, and UX polish.

- Role-based access control: admin, reviewer, viewer permissions
- Guest access: no-signup review via shareable link with name-only entry
- Invite flow: email invitations with magic link
- Export feedback: JSON and CSV download
- Edge case handling: SPA support, CSP headers, error states
- Performance optimization and responsive design polish

### Phase 5: Post-MVP Enhancements (Weeks 9+)

**Goal:** Advanced features based on initial usage feedback.

- Session replay snippets (10-second recordings before each feedback point)
- Version tracking: compare feedback across deploys
- Integrations: push feedback to Linear, Jira, Notion, Slack via webhooks
- Voice/video note attachments on feedback pins
- AI-powered feedback summary: auto-generate a digest of all feedback per review cycle
- Public-facing mode for client feedback (agency use case)

---

## 12. Project Structure

```
livereview/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/                 # Login, signup routes
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts   # OAuth callback handler
│   │   ├── (dashboard)/            # Protected dashboard routes
│   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   ├── page.tsx            # Project list (home)
│   │   │   ├── projects/
│   │   │   │   ├── new/page.tsx    # Create project form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Feedback dashboard for project
│   │   │   │       └── settings/page.tsx
│   │   │   └── profile/page.tsx    # User profile settings
│   │   ├── review/
│   │   │   └── [projectId]/
│   │   │       └── [...path]/      # Catch-all reverse proxy route
│   │   │           └── route.ts    # Proxy handler
│   │   └── api/
│   │       ├── projects/
│   │       │   ├── route.ts        # GET (list) / POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts    # GET / PATCH / DELETE
│   │       │       ├── members/
│   │       │       │   └── route.ts
│   │       │       └── feedback/
│   │       │           ├── route.ts     # GET / POST
│   │       │           └── export/route.ts
│   │       ├── feedback/
│   │       │   └── [feedbackId]/
│   │       │       ├── route.ts         # PATCH (update status)
│   │       │       └── comments/route.ts
│   │       └── proxy/
│   │           └── asset/route.ts  # Asset proxy for target site resources
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── project-card.tsx
│   │   │   ├── feedback-table.tsx
│   │   │   ├── feedback-detail.tsx
│   │   │   ├── filters-sidebar.tsx
│   │   │   └── stats-summary.tsx
│   │   └── shared/                 # Shared components
│   │       ├── avatar.tsx
│   │       ├── category-badge.tsx
│   │       └── status-badge.tsx
│   ├── overlay/                    # Feedback overlay (injected into proxied pages)
│   │   ├── index.ts                # Entry point — bootstraps the overlay
│   │   ├── toolbar.tsx             # Floating toolbar component
│   │   ├── comments/
│   │   │   ├── pin.tsx             # Comment pin (placed on page)
│   │   │   ├── pin-manager.ts      # Manages pin creation, positioning, anchoring
│   │   │   ├── comment-panel.tsx   # Slide-out comment thread panel
│   │   │   └── comment-form.tsx    # Comment input with category selector
│   │   ├── annotations/
│   │   │   ├── canvas.tsx          # Fabric.js annotation canvas
│   │   │   ├── tools.ts           # Drawing tool definitions
│   │   │   └── toolbar.tsx         # Annotation tools toolbar
│   │   ├── presence/
│   │   │   ├── cursors.tsx         # Live cursor rendering
│   │   │   └── avatars.tsx         # Presence avatar bar
│   │   ├── context-capture.ts      # Auto-captures browser info, console errors, screenshots
│   │   └── realtime.ts             # Supabase Realtime channel management
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   ├── middleware.ts       # Auth middleware
│   │   │   └── types.ts            # Generated database types
│   │   ├── proxy/
│   │   │   ├── fetcher.ts          # Fetches target URL content
│   │   │   ├── rewriter.ts         # Rewrites HTML asset URLs
│   │   │   └── injector.ts         # Injects overlay script into HTML
│   │   ├── utils.ts                # General utilities
│   │   └── constants.ts            # App-wide constants
│   ├── store/                      # Zustand stores
│   │   ├── feedback-store.ts       # Feedback items state
│   │   ├── overlay-store.ts        # Overlay mode state (comment/annotate/navigate)
│   │   ├── presence-store.ts       # Real-time presence state
│   │   └── project-store.ts        # Current project state
│   └── types/
│       ├── database.ts             # Supabase database types
│       ├── feedback.ts             # Feedback-related types
│       └── overlay.ts              # Overlay-related types
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full schema from Section 8.6
│   ├── seed.sql                    # Development seed data
│   └── config.toml                 # Supabase local config
├── public/
│   └── overlay.js                  # Compiled overlay script (for injection)
├── middleware.ts                    # Next.js middleware (auth redirects)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                      # Environment variables
```

---

## 13. Key Implementation Details

### 13.1 Reverse Proxy Implementation

The proxy should be implemented as a Next.js catch-all route at `/review/[projectId]/[...path]/route.ts`.

```typescript
// Pseudocode for the proxy route handler
export async function GET(request: NextRequest, { params }) {
  const { projectId, path } = params;

  // 1. Look up project's target URL from database
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // 2. Construct full target URL
  const targetUrl = new URL(path.join('/'), project.target_url);

  // 3. Fetch the target page
  const response = await fetch(targetUrl.toString());
  const contentType = response.headers.get('content-type');

  // 4. If HTML, rewrite and inject
  if (contentType?.includes('text/html')) {
    let html = await response.text();
    html = rewriteAssetUrls(html, project.target_url, projectId);
    html = injectOverlayScript(html, projectId);
    return new NextResponse(html, { headers: { 'content-type': 'text/html' } });
  }

  // 5. For other assets, pass through
  return new NextResponse(response.body, {
    headers: { 'content-type': contentType || 'application/octet-stream' }
  });
}
```

### 13.2 Comment Pin Anchoring

For resilient pin placement, store both the CSS selector path to the nearest identifiable element AND the x/y percentage offset within the viewport.

```typescript
interface PinPosition {
  // Primary: CSS selector path to nearest element
  selector: string;        // e.g., "#main > div:nth-child(2) > button"

  // Offset within that element (percentage)
  offsetX: number;         // 0-1, percentage from left edge of element
  offsetY: number;         // 0-1, percentage from top edge of element

  // Fallback: absolute viewport position
  viewportX: number;       // 0-1, percentage from left edge of viewport
  viewportY: number;       // 0-1, percentage from top edge of viewport

  // Context
  viewportWidth: number;   // Viewport width at time of placement
  viewportHeight: number;  // Viewport height at time of placement
  pageUrl: string;         // Route/URL at time of placement
}
```

On re-render: first try to find the element by selector; if found, position relative to it. If the element is gone (DOM changed), fall back to the viewport percentage position. Use a `MutationObserver` to re-anchor pins when the DOM changes (important for SPAs).

### 13.3 Overlay Script Isolation

The injected overlay script must not conflict with the target site's JavaScript:

- Use **Shadow DOM** for the toolbar and comment UI to isolate styles
- Namespace all global variables under `window.__livereview`
- Prefix all CSS classes with `lr-` (e.g., `.lr-toolbar`, `.lr-pin`)
- Use `!important` sparingly to avoid cascade issues
- Register event listeners with `{ capture: true }` where needed to intercept before target site handlers
- The overlay should have a higher z-index than any target content (use `z-index: 2147483647`)

### 13.4 Context Capture Implementation

```typescript
interface CapturedContext {
  pageUrl: string;
  browser: string;          // e.g., "Chrome 122"
  os: string;               // e.g., "macOS 14.3"
  viewport: {
    width: number;
    height: number;
  };
  deviceType: 'desktop' | 'tablet' | 'mobile';
  timestamp: string;        // ISO 8601 UTC
  consoleErrors: Array<{
    message: string;
    source: string;
    line: number;
    timestamp: string;
  }>;
  screenshotUrl: string;    // Supabase Storage URL after upload
}
```

Console errors are captured by attaching a listener on `window.onerror` and `window.addEventListener('unhandledrejection', ...)` early in the overlay script lifecycle. Errors are buffered and attached to the next feedback item created.

---

## 14. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-side only, never expose to client

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or production URL

# Email (Resend)
RESEND_API_KEY=re_...

# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://...

# Analytics (PostHog - optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 15. Development Setup Commands

```bash
# Initial setup
npx create-next-app@latest livereview --typescript --tailwind --app --src-dir
cd livereview
npx shadcn@latest init

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr zustand fabric html2canvas resend

# Dev dependencies
npm install -D @types/fabric

# Supabase local development
npx supabase init
npx supabase start
npx supabase db push

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 16. Success Metrics

### 16.1 MVP Success Criteria

- A complete review cycle (create project → invite team → collect feedback → resolve items) can be completed in under 10 minutes
- Reviewers can leave their first piece of feedback within 30 seconds of opening the review link
- Real-time comments appear for other connected reviewers within 1 second
- The reverse proxy successfully loads and renders 90%+ of tested target URLs

### 16.2 Key Performance Indicators (Post-Launch)

- **Time to first feedback:** Average time from reviewer opening link to first comment
- **Feedback density:** Average number of feedback items per review session
- **Resolution rate:** Percentage of feedback items resolved within 48 hours
- **Reviewer return rate:** Percentage of invited reviewers who actually leave feedback
- **Review cycle time:** Time from sharing project link to all feedback being resolved

---

## 17. Risks & Mitigations

| Priority | Risk | Impact | Mitigation |
|---|---|---|---|
| **HIGH** | Target sites block reverse proxy (CSP, CORS, X-Frame-Options) | Core feature broken for some URLs | Fallback to browser extension mode; strip restrictive headers server-side |
| **HIGH** | SPAs load content dynamically after proxy serves initial HTML | Feedback pins may not align with dynamic content | Use MutationObserver to track DOM changes; re-anchor pins after SPA navigation |
| **MEDIUM** | Real-time sync latency under load | Comments appear delayed, poor collaboration feel | Use Supabase Broadcast for ephemeral events; optimize Postgres Changes subscriptions |
| **MEDIUM** | Screenshot capture fails on complex pages | Missing visual context for feedback | Fallback: offer manual screenshot upload; consider server-side screenshotting |
| **LOW** | Supabase free tier limits hit during testing | Development slowdown | Supabase Pro plan is $25/month — trivial cost. Upgrade preemptively. |

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Target URL** | The live web product URL being reviewed inside LiveReview |
| **Feedback Overlay** | The injected toolbar and comment/annotation layer that sits on top of the target product |
| **Pin Comment** | A comment anchored to a specific position/element on the reviewed page |
| **Review Mode** | The state where a reviewer is interacting with the proxied product with the feedback overlay active |
| **Reverse Proxy** | Server-side fetching and serving of the target URL through LiveReview's domain to enable overlay injection |
| **Presence** | Real-time awareness of which reviewers are currently active in a project |
| **RLS** | Row Level Security — Supabase/PostgreSQL feature that restricts data access at the database row level |
| **SPA** | Single Page Application — web apps that dynamically rewrite the page rather than loading new pages from the server |