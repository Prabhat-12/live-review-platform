import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Settings" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Settings className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-400">Account and workspace settings — coming in Phase 3</p>
        </div>
      </div>
    </div>
  )
}
