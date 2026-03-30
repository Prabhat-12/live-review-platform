'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Pencil,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Bug,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ToolbarMode = 'navigate' | 'comment' | 'annotate'

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { value: 'ux', label: 'UX', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'feature_request', label: 'Feature', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { value: 'general', label: 'General', icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
] as const

interface FeedbackToolbarProps {
  projectId: string
}

export function FeedbackToolbar({ projectId: _projectId }: FeedbackToolbarProps) {
  const [mode, setMode] = useState<ToolbarMode>('navigate')
  const [collapsed, setCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('bug')

  return (
    <>
      {/* Floating toolbar — anchored to right edge */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-12 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 rounded-l-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/90 transition-colors shadow-xl"
        >
          {collapsed ? (
            <ChevronLeft className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {/* Toolbar body */}
        <div
          className={cn(
            'bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="p-2 space-y-1">
            <ToolbarButton
              icon={<Navigation className="w-4 h-4" />}
              label="Navigate"
              active={mode === 'navigate'}
              onClick={() => setMode('navigate')}
            />
            <ToolbarButton
              icon={<MessageSquare className="w-4 h-4" />}
              label="Comment"
              active={mode === 'comment'}
              onClick={() => setMode('comment')}
              activeColor="text-blue-400"
              activeBg="bg-blue-500/15"
            />
            <ToolbarButton
              icon={<Pencil className="w-4 h-4" />}
              label="Annotate"
              active={mode === 'annotate'}
              onClick={() => setMode('annotate')}
              activeColor="text-purple-400"
              activeBg="bg-purple-500/15"
            />

            <div className="h-px bg-zinc-800 mx-1 my-1" />

            {/* Live presence indicator */}
            <div className="flex items-center justify-center px-1 py-1.5">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-zinc-500">1</span>
              </div>
            </div>
          </div>

          {/* Category picker — comment mode only */}
          {mode === 'comment' && (
            <div className="border-t border-zinc-800 p-2 space-y-1">
              <p className="text-xs text-zinc-600 px-1 mb-2 font-medium uppercase tracking-wider">
                Category
              </p>
              {FEEDBACK_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      selectedCategory === cat.value
                        ? `${cat.bg} ${cat.color}`
                        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Mode label */}
          <div className="border-t border-zinc-800 px-3 py-2">
            <p className="text-xs text-zinc-600 text-center capitalize">{mode} mode</p>
          </div>
        </div>
      </div>

      {/* Mode hint banner */}
      {mode === 'comment' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xl">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-zinc-300">Click anywhere to drop a comment pin</span>
          </div>
        </div>
      )}

      {mode === 'annotate' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xl">
            <Pencil className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-zinc-300">Draw to annotate — Fabric.js canvas active in Phase 3</span>
          </div>
        </div>
      )}
    </>
  )
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  activeColor?: string
  activeBg?: string
}

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
  activeColor = 'text-zinc-100',
  activeBg = 'bg-zinc-700/60',
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
        active
          ? `${activeBg} ${activeColor}`
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
      )}
    >
      {icon}
    </button>
  )
}
