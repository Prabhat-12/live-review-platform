import { FeedbackToolbar } from '@/components/review/FeedbackToolbar'

interface ReviewPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { projectId } = await params

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* Proxied product content — wired to reverse proxy in Phase 2 */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔗</span>
          </div>
          <p className="text-sm text-zinc-400">
            Reverse proxy layer connects here in Phase 2
          </p>
          <p className="text-xs text-zinc-600 font-mono">projectId: {projectId}</p>
        </div>
      </div>

      {/* Feedback overlay toolbar */}
      <FeedbackToolbar projectId={projectId} />
    </div>
  )
}
