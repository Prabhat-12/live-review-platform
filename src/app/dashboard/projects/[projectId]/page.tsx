import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, MessageSquare, ArrowLeft, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { FEEDBACK_CATEGORIES } from '@/lib/constants'
import type { FeedbackItem } from '@/lib/database.types'

const CATEGORY_STYLES: Record<string, string> = {
  bug: 'border-red-500/30 text-red-400 bg-red-500/10',
  ux: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  feature_request: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  general: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  question: 'border-green-500/30 text-green-400 bg-green-500/10',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) notFound()

  const { data: feedbackItems } = await supabase
    .from('feedback_items')
    .select('*, comments(id)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  const items = (feedbackItems ?? []) as unknown as (FeedbackItem & { comments: { id: string }[] })[]
  const openCount = items.filter((i) => i.status === 'open').length

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={project.name}
        subtitle={project.target_url.replace(/^https?:\/\//, '')}
        action={
          <Link href={`/review/${projectId}`} target="_blank">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Play className="w-3.5 h-3.5" />
              Open Review
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Back + stats row */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            All projects
          </Link>
          <div className="flex items-center gap-3 ml-auto text-xs text-zinc-500">
            <span>{openCount} open</span>
            <span className="text-zinc-700">·</span>
            <span>{items.length - openCount} resolved</span>
            <a
              href={project.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors font-mono"
            >
              <ExternalLink className="w-3 h-3" />
              {project.target_url.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>

        {/* Feedback list */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 mb-1">No feedback yet</p>
            <p className="text-xs text-zinc-600 max-w-xs">
              Open the review link and start dropping comment pins on the live product.
            </p>
            <Link href={`/review/${projectId}`} target="_blank" className="mt-4">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                <Play className="w-3 h-3" />
                Open Review
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const cat = FEEDBACK_CATEGORIES.find((c) => c.value === item.category)
              const catStyle = CATEGORY_STYLES[item.category] ?? ''
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                >
                  {/* Pin number */}
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-mono text-zinc-400">{i + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs border h-5 ${catStyle}`}>
                        {cat?.label ?? item.category}
                      </Badge>
                      {item.status === 'resolved' && (
                        <Badge className="text-xs border h-5 border-zinc-700 text-zinc-500 bg-transparent">
                          Resolved
                        </Badge>
                      )}
                      <span className="text-xs text-zinc-600 ml-auto flex-shrink-0">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed">{item.content}</p>
                    {item.page_url && (
                      <p className="text-xs text-zinc-600 mt-1 font-mono truncate">{item.page_url}</p>
                    )}
                    {item.comments.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-2">
                        {item.comments.length} {item.comments.length === 1 ? 'reply' : 'replies'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
