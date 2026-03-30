import { redirect } from 'next/navigation'

// The review page root redirects into the proxy catch-all route
// which serves the target URL with the overlay injected
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  redirect(`/review/${projectId}/`)
}
