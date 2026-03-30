import Link from 'next/link'
import { ExternalLink, Users, MessageSquare, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithStats } from '@/lib/database.types'

interface ProjectCardProps {
  project: ProjectWithStats
}

export function ProjectCard({ project }: ProjectCardProps) {
  const resolvedCount = project.feedback_count - project.open_feedback_count
  const progressPercent = project.feedback_count > 0
    ? Math.round((resolvedCount / project.feedback_count) * 100)
    : 0

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 cursor-pointer">
        {/* Active status dot */}
        {project.status === 'active' && (
          <div className="absolute top-4 right-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        )}

        {/* Project name & description */}
        <div className="mb-4">
          <h3 className="font-semibold text-zinc-100 text-sm mb-1 group-hover:text-blue-400 transition-colors pr-6">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Target URL */}
        <div className="flex items-center gap-1.5 mb-4">
          <ExternalLink className="w-3 h-3 text-zinc-600 flex-shrink-0" />
          <span className="text-xs text-zinc-600 truncate font-mono">
            {project.target_url.replace(/^https?:\/\//, '')}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.open_feedback_count} open</span>
            {project.feedback_count > 0 && (
              <span className="text-zinc-600">/ {project.feedback_count} total</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Users className="w-3.5 h-3.5" />
            <span>{project.member_count}</span>
          </div>
          {project.last_activity && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(project.last_activity)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {project.feedback_count > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600">{resolvedCount} resolved</span>
              <span className="text-zinc-600">{progressPercent}%</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Guest access badge */}
        {project.guest_access_enabled && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 h-5">
              Guest access enabled
            </Badge>
          </div>
        )}
      </div>
    </Link>
  )
}
