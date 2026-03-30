import { ReactNode } from 'react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-800 flex-shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
