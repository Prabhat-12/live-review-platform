import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { feedbackId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { content, project_id } = body

  if (!content || !project_id) {
    return NextResponse.json({ error: 'content and project_id are required' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', project_id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ feedback_item_id: feedbackId, author_id: member.id, content })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
