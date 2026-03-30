import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Headers to strip from proxied responses (security + compatibility)
const BLOCKED_RESPONSE_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'cross-origin-resource-policy',
])

// Headers to strip when forwarding request to target
const BLOCKED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'upgrade',
  'keep-alive',
  'transfer-encoding',
])

function rewriteUrls(html: string, projectId: string, targetOrigin: string): string {
  const proxyBase = `/review/${projectId}`

  // Rewrite absolute URLs from the target origin to go through proxy
  html = html.replace(
    new RegExp(`(href|src|action)=["'](${escapeRegex(targetOrigin)})(\/[^"']*)["']`, 'gi'),
    (_, attr, _origin, path) => `${attr}="${proxyBase}${path}"`
  )

  // Rewrite root-relative URLs (href="/...", src="/...")
  html = html.replace(
    /(href|src|action)=["'](\/(?!\/)[^"']*?)["']/gi,
    (_, attr, path) => {
      // Don't rewrite data URIs or anchor links
      if (path.startsWith('data:') || path.startsWith('#')) return _
      return `${attr}="${proxyBase}${path}"`
    }
  )

  // Rewrite srcset attributes
  html = html.replace(
    /srcset=["']([^"']+)["']/gi,
    (_, srcset) => {
      const rewritten = srcset.replace(/(\/[^\s,]+)/g, (path: string) => {
        if (path.startsWith('data:')) return path
        return `${proxyBase}${path}`
      })
      return `srcset="${rewritten}"`
    }
  )

  // Rewrite url() in inline styles and <style> blocks
  html = html.replace(
    /url\(['"]?(\/[^'")]+)['"]?\)/gi,
    (_, path) => `url(${proxyBase}${path})`
  )

  return html
}

function rewriteCssUrls(css: string, projectId: string, targetOrigin: string): string {
  const proxyBase = `/review/${projectId}`

  // Rewrite absolute origin URLs
  css = css.replace(
    new RegExp(`url\\(['"]?(${escapeRegex(targetOrigin)})(\/[^'"\\)]+)['"]?\\)`, 'gi'),
    (_, _origin, path) => `url(${proxyBase}${path})`
  )

  // Rewrite root-relative URLs in CSS
  css = css.replace(
    /url\(['"]?(\/(?!\/)[^'"\\)]+)['"]?\)/gi,
    (_, path) => `url(${proxyBase}${path})`
  )

  return css
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function injectOverlay(html: string, projectId: string, supabaseUrl: string, supabaseAnonKey: string): string {
  const overlayScript = `
<script>
  window.__livereview = {
    projectId: ${JSON.stringify(projectId)},
    supabaseUrl: ${JSON.stringify(supabaseUrl)},
    supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)},
    apiBase: '/api'
  };
</script>
<script src="/overlay/livereview.js" defer></script>
`
  // Inject before </body>, or at end if no </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${overlayScript}</body>`)
  }
  return html + overlayScript
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const { projectId, path } = await params

  // Look up the project's target URL
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('target_url, guest_access_enabled')
    .eq('id', projectId)
    .single()

  if (!project) {
    return new NextResponse('Project not found', { status: 404 })
  }

  // Construct the target URL
  const targetBase = project.target_url.replace(/\/$/, '')
  const targetPath = path && path.length > 0 ? '/' + path.join('/') : '/'

  // Preserve query string
  const { searchParams } = request.nextUrl
  const queryString = searchParams.toString()
  const targetUrl = `${targetBase}${targetPath}${queryString ? `?${queryString}` : ''}`

  // Parse target origin for URL rewriting
  const targetOrigin = new URL(targetBase).origin

  // Forward the request to target
  const forwardHeaders = new Headers()
  request.headers.forEach((value, key) => {
    if (!BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  })
  forwardHeaders.set('host', new URL(targetUrl).host)
  forwardHeaders.set('referer', targetBase)

  let targetResponse: Response
  try {
    targetResponse = await fetch(targetUrl, {
      headers: forwardHeaders,
      redirect: 'manual', // Handle redirects ourselves
    })
  } catch {
    return new NextResponse(`Failed to reach ${targetUrl}`, { status: 502 })
  }

  // Handle redirects — rewrite Location through proxy
  if (targetResponse.status >= 300 && targetResponse.status < 400) {
    const location = targetResponse.headers.get('location')
    if (location) {
      let proxyLocation: string
      try {
        const locationUrl = new URL(location, targetBase)
        if (locationUrl.origin === targetOrigin) {
          proxyLocation = `/review/${projectId}${locationUrl.pathname}${locationUrl.search}`
        } else {
          proxyLocation = location
        }
      } catch {
        proxyLocation = location.startsWith('/') ? `/review/${projectId}${location}` : location
      }
      return NextResponse.redirect(new URL(proxyLocation, request.url), targetResponse.status)
    }
  }

  // Build response headers (strip security headers that block overlay)
  const responseHeaders = new Headers()
  targetResponse.headers.forEach((value, key) => {
    if (!BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  const contentType = targetResponse.headers.get('content-type') ?? ''

  // HTML response — rewrite URLs + inject overlay
  if (contentType.includes('text/html')) {
    let html = await targetResponse.text()
    html = rewriteUrls(html, projectId, targetOrigin)
    html = injectOverlay(
      html,
      projectId,
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    responseHeaders.set('content-type', 'text/html; charset=utf-8')
    responseHeaders.delete('content-encoding') // We decoded it
    responseHeaders.delete('content-length')   // Length changed

    return new NextResponse(html, {
      status: targetResponse.status,
      headers: responseHeaders,
    })
  }

  // CSS response — rewrite URLs
  if (contentType.includes('text/css')) {
    let css = await targetResponse.text()
    css = rewriteCssUrls(css, projectId, targetOrigin)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')

    return new NextResponse(css, {
      status: targetResponse.status,
      headers: responseHeaders,
    })
  }

  // All other assets (JS, images, fonts, etc.) — pass through as-is
  return new NextResponse(targetResponse.body, {
    status: targetResponse.status,
    headers: responseHeaders,
  })
}
