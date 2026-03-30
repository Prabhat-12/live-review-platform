import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-auto bg-zinc-950">
        {children}
      </main>
    </div>
  )
}
