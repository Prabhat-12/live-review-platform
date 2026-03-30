/**
 * LiveReview Overlay Script
 * Injected into proxied pages. Runs in Shadow DOM to avoid CSS/JS conflicts.
 */
;(function () {
  'use strict'

  const config = window.__livereview
  if (!config) return

  const { projectId, supabaseUrl, supabaseAnonKey, apiBase } = config

  // ─── State ──────────────────────────────────────────────────────────────────
  let mode = 'navigate' // 'navigate' | 'comment' | 'annotate'
  let pins = []
  let pinCounter = 0
  let capturedConsoleErrors = []
  let supabaseClient = null
  let currentUser = null
  let presenceChannel = null

  // ─── Console error capture ───────────────────────────────────────────────────
  const origError = window.onerror
  window.onerror = function (msg, src, line) {
    capturedConsoleErrors.push(`${msg} (${src}:${line})`)
    if (capturedConsoleErrors.length > 20) capturedConsoleErrors.shift()
    if (origError) origError.apply(this, arguments)
  }

  // ─── Shadow DOM setup ────────────────────────────────────────────────────────
  const host = document.createElement('div')
  host.id = '__livereview_host'
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;'
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    .lr-toolbar {
      position: fixed;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: all;
      z-index: 2147483647;
    }

    .lr-collapse-btn {
      width: 24px;
      height: 48px;
      background: rgba(39,39,42,0.92);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(113,113,122,0.4);
      border-radius: 8px 0 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #a1a1aa;
      transition: background 0.15s, color 0.15s;
    }
    .lr-collapse-btn:hover { background: rgba(63,63,70,0.92); color: #e4e4e7; }

    .lr-toolbar-body {
      background: rgba(24,24,27,0.96);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(113,113,122,0.4);
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      overflow: hidden;
      transition: opacity 0.2s, width 0.2s;
    }
    .lr-toolbar-body.collapsed { width: 0; opacity: 0; pointer-events: none; }

    .lr-toolbar-inner { padding: 8px; display: flex; flex-direction: column; gap: 2px; }

    .lr-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #71717a;
      transition: background 0.15s, color 0.15s;
    }
    .lr-btn:hover { background: rgba(63,63,70,0.8); color: #d4d4d8; }
    .lr-btn.active-navigate { background: rgba(63,63,70,0.6); color: #f4f4f5; }
    .lr-btn.active-comment { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .lr-btn.active-annotate { background: rgba(139,92,246,0.15); color: #a78bfa; }

    .lr-divider { height: 1px; background: rgba(63,63,70,1); margin: 4px 4px; }

    .lr-presence { display: flex; align-items: center; justify-content: center; padding: 6px 4px; gap: 4px; }
    .lr-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: lr-pulse 2s infinite; }
    @keyframes lr-pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
    .lr-presence-count { font-size: 11px; color: #71717a; }

    .lr-mode-label { padding: 6px 12px 8px; text-align: center; font-size: 10px; color: #52525b; text-transform: capitalize; border-top: 1px solid rgba(63,63,70,1); }

    .lr-hint {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(24,24,27,0.92);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(113,113,122,0.4);
      border-radius: 9999px;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #d4d4d8;
      pointer-events: none;
      white-space: nowrap;
    }

    /* Comment pin */
    .lr-pin {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
      z-index: 2147483646;
    }
    .lr-pin-circle {
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: white;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: transform 0.15s;
    }
    .lr-pin:hover .lr-pin-circle { transform: rotate(-45deg) scale(1.15); }
    .lr-pin-number { transform: rotate(45deg); }

    /* Comment form */
    .lr-comment-form {
      position: fixed;
      background: rgba(24,24,27,0.98);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(113,113,122,0.5);
      border-radius: 12px;
      padding: 14px;
      width: 280px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      pointer-events: all;
      z-index: 2147483647;
    }
    .lr-comment-form h3 { font-size: 12px; font-weight: 600; color: #e4e4e7; margin: 0 0 10px; }
    .lr-comment-form textarea {
      width: 100%;
      background: rgba(39,39,42,0.8);
      border: 1px solid rgba(63,63,70,1);
      border-radius: 6px;
      padding: 8px;
      font-size: 12px;
      color: #e4e4e7;
      resize: none;
      outline: none;
      font-family: inherit;
    }
    .lr-comment-form textarea:focus { border-color: #3b82f6; }
    .lr-category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 8px 0; }
    .lr-cat-btn {
      padding: 5px 8px;
      border-radius: 6px;
      border: 1px solid transparent;
      font-size: 11px;
      cursor: pointer;
      background: rgba(39,39,42,0.8);
      color: #a1a1aa;
      text-align: left;
      transition: all 0.15s;
    }
    .lr-cat-btn:hover { color: #e4e4e7; background: rgba(63,63,70,0.8); }
    .lr-cat-btn.selected { font-weight: 600; }
    .lr-form-actions { display: flex; gap: 6px; margin-top: 10px; }
    .lr-form-btn {
      flex: 1;
      padding: 7px;
      border-radius: 6px;
      border: none;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .lr-form-btn:hover { opacity: 0.85; }
    .lr-form-btn.cancel { background: rgba(63,63,70,0.8); color: #a1a1aa; }
    .lr-form-btn.submit { background: #2563eb; color: white; }
    .lr-form-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `
  shadow.appendChild(style)

  // ─── Category config ─────────────────────────────────────────────────────────
  const CATEGORIES = [
    { value: 'bug', label: 'Bug', color: '#ef4444' },
    { value: 'ux', label: 'UX Concern', color: '#f97316' },
    { value: 'feature_request', label: 'Feature', color: '#8b5cf6' },
    { value: 'general', label: 'General', color: '#3b82f6' },
    { value: 'question', label: 'Question', color: '#22c55e' },
  ]

  // ─── SVG icons ───────────────────────────────────────────────────────────────
  function svg(d, size = 16) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  }
  const ICONS = {
    navigate: svg('<circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>'),
    comment: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    annotate: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
    chevronLeft: svg('<polyline points="15 18 9 12 15 6"/>'),
    chevronRight: svg('<polyline points="9 18 15 12 9 6"/>'),
  }

  // ─── Build toolbar DOM ───────────────────────────────────────────────────────
  const toolbar = document.createElement('div')
  toolbar.className = 'lr-toolbar'

  const collapseBtn = document.createElement('button')
  collapseBtn.className = 'lr-collapse-btn'
  collapseBtn.innerHTML = ICONS.chevronRight
  collapseBtn.title = 'Toggle toolbar'

  const toolbarBody = document.createElement('div')
  toolbarBody.className = 'lr-toolbar-body'

  const toolbarInner = document.createElement('div')
  toolbarInner.className = 'lr-toolbar-inner'

  function makeToolBtn(id, icon, title) {
    const btn = document.createElement('button')
    btn.className = 'lr-btn'
    btn.dataset.mode = id
    btn.innerHTML = icon
    btn.title = title
    btn.addEventListener('click', () => setMode(id))
    return btn
  }

  const navigateBtn = makeToolBtn('navigate', ICONS.navigate, 'Navigate')
  const commentBtn = makeToolBtn('comment', ICONS.comment, 'Comment')
  const annotateBtn = makeToolBtn('annotate', ICONS.annotate, 'Annotate')

  const divider = document.createElement('div')
  divider.className = 'lr-divider'

  const presenceEl = document.createElement('div')
  presenceEl.className = 'lr-presence'
  presenceEl.innerHTML = `<div class="lr-dot"></div><span class="lr-presence-count">1</span>`

  const modeLabel = document.createElement('div')
  modeLabel.className = 'lr-mode-label'
  modeLabel.textContent = 'navigate mode'

  toolbarInner.append(navigateBtn, commentBtn, annotateBtn, divider, presenceEl)
  toolbarBody.append(toolbarInner, modeLabel)
  toolbar.append(collapseBtn, toolbarBody)
  shadow.appendChild(toolbar)

  // Hint banner
  const hint = document.createElement('div')
  hint.className = 'lr-hint'
  hint.style.display = 'none'
  hint.innerHTML = `${ICONS.comment} <span>Click anywhere to drop a comment pin</span>`
  shadow.appendChild(hint)

  // Pin container (absolute-positioned overlay on the page)
  const pinContainer = document.createElement('div')
  pinContainer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483645;'
  shadow.appendChild(pinContainer)

  // ─── Toolbar collapse ────────────────────────────────────────────────────────
  let collapsed = false
  collapseBtn.addEventListener('click', () => {
    collapsed = !collapsed
    toolbarBody.classList.toggle('collapsed', collapsed)
    collapseBtn.innerHTML = collapsed ? ICONS.chevronLeft : ICONS.chevronRight
  })

  // ─── Mode switching ──────────────────────────────────────────────────────────
  function setMode(newMode) {
    mode = newMode
    navigateBtn.className = `lr-btn${mode === 'navigate' ? ' active-navigate' : ''}`
    commentBtn.className = `lr-btn${mode === 'comment' ? ' active-comment' : ''}`
    annotateBtn.className = `lr-btn${mode === 'annotate' ? ' active-annotate' : ''}`
    modeLabel.textContent = `${mode} mode`

    if (mode === 'comment') {
      document.body.style.cursor = 'crosshair'
      hint.style.display = 'flex'
      hint.innerHTML = `${ICONS.comment} <span>Click anywhere to drop a comment pin</span>`
    } else if (mode === 'annotate') {
      document.body.style.cursor = 'crosshair'
      hint.style.display = 'flex'
      hint.innerHTML = `${ICONS.annotate} <span>Draw to annotate — coming in Phase 3</span>`
    } else {
      document.body.style.cursor = ''
      hint.style.display = 'none'
    }
  }

  // ─── CSS selector builder ────────────────────────────────────────────────────
  function buildSelector(el) {
    if (!el || el === document.body) return 'body'
    const parts = []
    let current = el
    while (current && current !== document.body && parts.length < 5) {
      let part = current.tagName.toLowerCase()
      if (current.id) {
        parts.unshift(`#${current.id}`)
        break
      }
      const siblings = current.parentElement
        ? Array.from(current.parentElement.children).filter((s) => s.tagName === current.tagName)
        : []
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`
      }
      parts.unshift(part)
      current = current.parentElement
    }
    return parts.join(' > ') || 'body'
  }

  // ─── Click handler for pin placement ─────────────────────────────────────────
  document.addEventListener('click', function handleClick(e) {
    if (mode !== 'comment') return

    // Don't intercept clicks on our overlay
    if (e.target.closest && e.target.closest('#__livereview_host')) return

    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY
    const target = document.elementFromPoint(x, y) || document.body
    const rect = target.getBoundingClientRect()

    const pinPosition = {
      selector: buildSelector(target),
      offsetX: rect.width > 0 ? (x - rect.left) / rect.width : 0,
      offsetY: rect.height > 0 ? (y - rect.top) / rect.height : 0,
      viewportX: x / window.innerWidth,
      viewportY: y / window.innerHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pageUrl: window.location.href,
    }

    showCommentForm(x, y, pinPosition)
  }, true)

  // ─── Comment form ─────────────────────────────────────────────────────────────
  let activeForm = null

  function showCommentForm(x, y, pinPosition) {
    if (activeForm) activeForm.remove()

    let selectedCategory = 'bug'

    const form = document.createElement('div')
    form.className = 'lr-comment-form'

    // Position form near click, keep in viewport
    const formW = 280
    const formH = 240
    let left = x + 12
    let top = y - 20
    if (left + formW > window.innerWidth - 16) left = x - formW - 12
    if (top + formH > window.innerHeight - 16) top = window.innerHeight - formH - 16
    if (top < 8) top = 8

    form.style.left = `${left}px`
    form.style.top = `${top}px`

    form.innerHTML = `
      <h3>Add feedback</h3>
      <textarea rows="3" placeholder="What did you notice?"></textarea>
      <div class="lr-category-grid">
        ${CATEGORIES.map((c) => `<button class="lr-cat-btn${c.value === selectedCategory ? ' selected' : ''}" data-cat="${c.value}" style="${c.value === selectedCategory ? `border-color:${c.color};color:${c.color};background:${c.color}18` : ''}">${c.label}</button>`).join('')}
      </div>
      <div class="lr-form-actions">
        <button class="lr-form-btn cancel">Cancel</button>
        <button class="lr-form-btn submit">Add pin</button>
      </div>
    `

    // Category selection
    form.querySelectorAll('.lr-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.cat
        form.querySelectorAll('.lr-cat-btn').forEach((b) => {
          b.classList.remove('selected')
          b.style.borderColor = 'transparent'
          b.style.color = '#a1a1aa'
          b.style.background = 'rgba(39,39,42,0.8)'
        })
        const cat = CATEGORIES.find((c) => c.value === selectedCategory)
        btn.classList.add('selected')
        btn.style.borderColor = cat.color
        btn.style.color = cat.color
        btn.style.background = `${cat.color}18`
      })
    })

    // Cancel
    form.querySelector('.cancel').addEventListener('click', () => {
      form.remove()
      activeForm = null
    })

    // Submit
    const submitBtn = form.querySelector('.submit')
    form.querySelector('textarea').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitBtn.click()
    })

    submitBtn.addEventListener('click', async () => {
      const content = form.querySelector('textarea').value.trim()
      if (!content) return

      submitBtn.disabled = true
      submitBtn.textContent = 'Saving...'

      const contextMetadata = {
        browser: navigator.userAgent,
        os: detectOS(),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        deviceType: detectDevice(),
        consoleErrors: capturedConsoleErrors.slice(),
        timestamp: new Date().toISOString(),
      }

      try {
        const res = await fetch(`${apiBase}/projects/${projectId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'comment',
            category: selectedCategory,
            content,
            page_url: window.location.href,
            pin_position: pinPosition,
            context_metadata: contextMetadata,
          }),
        })

        if (res.ok) {
          const item = await res.json()
          form.remove()
          activeForm = null
          renderPin(item, pinPosition, x, y)
        } else {
          submitBtn.disabled = false
          submitBtn.textContent = 'Add pin'
        }
      } catch {
        submitBtn.disabled = false
        submitBtn.textContent = 'Add pin'
      }
    })

    shadow.appendChild(form)
    activeForm = form
    form.querySelector('textarea').focus()
  }

  // ─── Render a pin on the page ─────────────────────────────────────────────────
  function renderPin(item, pinPosition, clientX, clientY) {
    pinCounter++
    const cat = CATEGORIES.find((c) => c.value === item.category) || CATEGORIES[3]

    const pin = document.createElement('div')
    pin.className = 'lr-pin'
    pin.dataset.feedbackId = item.id

    const x = clientX ?? pinPosition.viewportX * window.innerWidth
    const y = clientY ?? pinPosition.viewportY * window.innerHeight

    pin.style.left = `${x - 14}px`
    pin.style.top = `${y - 28}px`

    pin.innerHTML = `
      <div class="lr-pin-circle" style="background:${cat.color}">
        <span class="lr-pin-number">${pinCounter}</span>
      </div>
    `

    pin.addEventListener('click', (e) => {
      e.stopPropagation()
      // TODO Phase 3: open comment thread panel
    })

    pinContainer.appendChild(pin)
    pins.push({ id: item.id, el: pin, position: pinPosition })
  }

  // ─── Load existing pins ───────────────────────────────────────────────────────
  async function loadExistingPins() {
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/feedback?page_url=${encodeURIComponent(window.location.href)}`)
      if (!res.ok) return
      const items = await res.json()
      items.forEach((item) => {
        if (item.pin_position) {
          renderPin(item, item.pin_position, null, null)
        }
      })
    } catch {}
  }

  // ─── Supabase Realtime ───────────────────────────────────────────────────────
  async function initRealtime() {
    // Dynamically load Supabase JS from CDN (already available via supabase-js)
    if (!window.__supabase_client) {
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        window.__supabase_client = createClient(supabaseUrl, supabaseAnonKey)
      } catch {
        return
      }
    }

    supabaseClient = window.__supabase_client

    // Get current session
    const { data: { session } } = await supabaseClient.auth.getSession()
    currentUser = session?.user ?? null

    // Subscribe to new feedback items for this project
    presenceChannel = supabaseClient.channel(`review:${projectId}`)

    presenceChannel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback_items',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        const item = payload.new
        if (item.pin_position) {
          renderPin(item, item.pin_position, null, null)
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const count = Object.keys(state).length
        presenceEl.querySelector('.lr-presence-count').textContent = String(count || 1)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUser) {
          await presenceChannel.track({
            user_id: currentUser.id,
            display_name: currentUser.user_metadata?.full_name ?? currentUser.email,
            page_url: window.location.href,
          })
        }
      })
  }

  // ─── OS / device detection ────────────────────────────────────────────────────
  function detectOS() {
    const ua = navigator.userAgent
    if (/Mac/.test(ua)) return 'macOS'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Linux/.test(ua)) return 'Linux'
    if (/iPhone|iPad/.test(ua)) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    return 'Unknown'
  }

  function detectDevice() {
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  setMode('navigate')
  loadExistingPins()
  initRealtime().catch(() => {})
})()
