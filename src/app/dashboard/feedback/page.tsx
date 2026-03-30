import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MessageSquare } from 'lucide-react'

export default function AllFeedbackPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="All Feedback" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400">Cross-project feedback view — coming in Phase 3</p>
        </div>
      </div>
    </div>
  )
}
