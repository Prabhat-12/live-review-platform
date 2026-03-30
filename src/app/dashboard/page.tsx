import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import type { ProjectWithStats } from '@/lib/database.types'

// Mock data for Phase 1 — replaced by real Supabase queries in Phase 2
const MOCK_PROJECTS: ProjectWithStats[] = [
  {
    id: '1',
    name: 'Auth Flow Redesign',
    description: 'Complete rework of the onboarding and login experience for the mobile app',
    target_url: 'https://staging.myapp.com',
    owner_id: 'user1',
    status: 'active',
    guest_access_enabled: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    feedback_count: 23,
    open_feedback_count: 14,
    member_count: 5,
    last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Dashboard v2 Beta',
    description: 'New analytics dashboard with real-time charts and improved data visualization',
    target_url: 'https://dashboard-beta.myapp.com',
    owner_id: 'user1',
    status: 'active',
    guest_access_enabled: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    feedback_count: 41,
    open_feedback_count: 8,
    member_count: 3,
    last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Pricing Page',
    description: 'New pricing tier structure with annual/monthly toggle',
    target_url: 'https://myapp.com/pricing',
    owner_id: 'user1',
    status: 'active',
    guest_access_enabled: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    feedback_count: 7,
    open_feedback_count: 7,
    member_count: 8,
    last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Projects"
        action={
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {MOCK_PROJECTS.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-100 mb-2">No projects yet</h3>
            <p className="text-sm text-zinc-400 max-w-sm mb-6">
              Create your first project by pasting a live URL. Invite your team and start collecting real-time feedback.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
              <Plus className="w-4 h-4" />
              Create first project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {MOCK_PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
