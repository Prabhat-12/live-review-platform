import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FeedbackItemInsert } from '@/lib/database.types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query = supabase
    .from('feedback_items')
    .select(`*, author:project_members(*, profile:profiles(*)), comments(*, author:project_members(*, profile:profiles(*)))`)
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const page_url = searchParams.get('page_url')

  if (category) query = query.eq('category', category as 'bug' | 'ux' | 'feature_request' | 'general' | 'question')
  if (status) query = query.eq('status', status as 'open' | 'resolved')
  if (page_url) query = query.eq('page_url', page_url)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find membership record for this user in this project
  const { data: member } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const feedbackData: FeedbackItemInsert = {
    project_id: id,
    author_id: member.id,
    type: body.type ?? 'comment',
    category: body.category,
    content: body.content,
    page_url: body.page_url,
    pin_position: body.pin_position ?? null,
    annotation_data: body.annotation_data ?? null,
    screenshot_url: body.screenshot_url ?? null,
    context_metadata: body.context_metadata ?? {},
  }

  const { data, error } = await supabase
    .from('feedback_items')
    .insert(feedbackData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
