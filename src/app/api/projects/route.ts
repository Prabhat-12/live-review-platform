import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProjectWithStats } from '@/lib/database.types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      feedback_items(id, status),
      project_members(id)
    `)
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const projectsWithStats: ProjectWithStats[] = (projects ?? []).map((p) => {
    const row = p as unknown as Record<string, unknown>
    const feedbackItems = (row.feedback_items ?? []) as { id: string; status: string }[]
    const members = (row.project_members ?? []) as { id: string }[]
    const openCount = feedbackItems.filter((f) => f.status === 'open').length
    const lastActivity = feedbackItems.length > 0 ? p.updated_at : null

    return {
      ...p,
      feedback_count: feedbackItems.length,
      open_feedback_count: openCount,
      member_count: members.length,
      last_activity: lastActivity,
    } as unknown as ProjectWithStats
  })

  return NextResponse.json(projectsWithStats)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, target_url, description } = body

  if (!name || !target_url) {
    return NextResponse.json({ error: 'name and target_url are required' }, { status: 400 })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, target_url, description, owner_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-add owner as admin member
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'admin',
  })

  return NextResponse.json(project, { status: 201 })
}
