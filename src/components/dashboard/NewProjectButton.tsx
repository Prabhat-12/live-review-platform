'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NewProjectButtonProps {
  label?: string
}

export function NewProjectButton({ label = 'New Project' }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      target_url: (form.elements.namedItem('target_url') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Failed to create project')
      setLoading(false)
      return
    }

    const project = await res.json()
    setOpen(false)
    router.refresh()
    router.push(`/dashboard/projects/${project.id}`)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        {label}
      </Button>

      {/* Modal backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-100">New Project</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium text-zinc-400">
                  Project name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Auth Flow Redesign"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="target_url" className="text-xs font-medium text-zinc-400">
                  Live URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="target_url"
                    name="target_url"
                    type="url"
                    required
                    placeholder="https://your-app.vercel.app"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-zinc-600">The live URL your team will review</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-medium text-zinc-400">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What is your team reviewing?"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className={cn('flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {loading ? 'Creating...' : 'Create project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
