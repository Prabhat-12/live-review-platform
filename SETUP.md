# LiveReview — Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase account (free tier works fine)

## 1. Supabase Project

Your Supabase project is already configured. The credentials are in `.env.local`.

If you need to reset or use a different project:

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy these values into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 2. Run the Database Migration

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql`
3. Paste the entire contents and click **Run**

This creates all tables, RLS policies, indexes, and realtime configuration.

## 3. Enable Google OAuth (Optional)

To use "Continue with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

In Supabase dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable it and paste Client ID + Secret
3. Add `http://localhost:3000/auth/callback` to allowed redirect URLs in Auth settings

## 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only, never expose) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your app URL (http://localhost:3000 for local) |
| `RESEND_API_KEY` | No | For email notifications (Phase 3) |
