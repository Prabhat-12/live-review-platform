'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: 'Google sign-in failed. Please try again.',
  magic_link_failed: 'Magic link expired or already used. Please request a new one.',
  auth_failed: 'Authentication failed. Please try again.',
  missing_params: 'Invalid sign-in link. Please request a new one.',
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(ERROR_MESSAGES[urlError] ?? `Sign-in error: ${urlError}`)
  }, [searchParams])

  const supabase = createClient()

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-lg">LiveReview</span>
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-xl font-medium text-zinc-100 leading-relaxed">
              &ldquo;We shipped 3 rounds of revisions in 48 hours. No calls, just real feedback on the actual product.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">— Early user, AI-assisted startup</footer>
          </blockquote>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Real-time collaboration — see feedback as it happens
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Pin comments anywhere on your live product
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            No calls needed — async feedback that stays in context
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-lg">LiveReview</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Sign in to LiveReview
            </h1>
            <p className="text-sm text-zinc-400">
              Real-time feedback on live products. No calls required.
            </p>
          </div>

          {magicLinkSent ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 space-y-1">
              <p className="font-medium text-zinc-100">Check your email</p>
              <p className="text-zinc-400">We sent a sign-in link to <span className="text-zinc-200">{email}</span>.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 font-medium"
                variant="outline"
                size="lg"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
                </div>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  size="lg"
                >
                  {loading ? 'Sending...' : 'Send magic link'}
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
