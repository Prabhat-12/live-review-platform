-- LiveReview Initial Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension required by gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on new user signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
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

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guest_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ============================================================
-- FEEDBACK ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback_items (
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

-- ============================================================
-- COMMENTS (thread replies on feedback items)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_item_id UUID NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_project ON feedback_items(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_status ON feedback_items(project_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_items_category ON feedback_items(project_id, category);
CREATE INDEX IF NOT EXISTS idx_feedback_items_created ON feedback_items(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_feedback ON comments(feedback_item_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- PROJECTS policies
CREATE POLICY "Users can view projects they belong to"
  ON projects FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their projects"
  ON projects FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their projects"
  ON projects FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- PROJECT_MEMBERS policies
CREATE POLICY "Members can view project members"
  ON project_members FOR SELECT TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members pm2 WHERE pm2.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage members"
  ON project_members FOR ALL TO authenticated
  USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- FEEDBACK_ITEMS policies
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

-- COMMENTS policies
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

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_items;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
