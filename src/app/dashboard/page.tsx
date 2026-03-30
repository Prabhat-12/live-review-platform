import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { NewProjectButton } from '@/components/dashboard/NewProjectButton'
import type { ProjectWithStats } from '@/lib/database.types'

async function getProjects(): Promise<ProjectWithStats[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: projects } = await supabase
    .from('projects')
    .select(`*, feedback_items(id, status), project_members(id)`)
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  return (projects ?? []).map((p) => {
    const row = p as unknown as Record<string, unknown>
    const feedbackItems = (row.feedback_items ?? []) as { id: string; status: string }[]
    const members = (row.project_members ?? []) as { id: string }[]
    return {
      ...p,
      feedback_count: feedbackItems.length,
      open_feedback_count: feedbackItems.filter((f) => f.status === 'open').length,
      member_count: members.length,
      last_activity: feedbackItems.length > 0 ? p.updated_at : null,
    } as unknown as ProjectWithStats
  })
}

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Projects"
        action={<NewProjectButton />}
      />

      <div className="flex-1 p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No projects yet</h3>
            <p className="text-sm text-zinc-400 max-w-sm mb-6">
              Create your first project by pasting a live URL. Invite your team and start collecting real-time feedback.
            </p>
            <NewProjectButton label="Create first project" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
