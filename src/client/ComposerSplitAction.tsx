import {
  useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore,
  type KeyboardEvent, type MouseEvent, type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { ComposerLayoutSettings } from '../settings.ts'
import { COMPOSER_LAYOUT_DEFAULTS } from '../settings.ts'
import {
  readLocalSettings, readSessionLayout, writeSessionLayout,
  type ComposerSessionLayout,
} from './settings-storage.ts'
import {
  MIN_CHAT_WIDTH, MIN_COMPOSER_WIDTH, SIDE_LAYOUT_BREAKPOINT,
  canUseSideLayout, clampComposerWidth,
} from './layout-policy.js'
import css from './ComposerSplitAction.module.css'

const DEFAULT_WIDTH = 420
const HANDLE_HIT_WIDTH = 10

export interface ComposerSplitInjected {
  /** Durable user preferences shared with the Settings tab. */
  settings?: SettingsScope<ComposerLayoutSettings>
  /** Close the current session's slash/reference candidate list. */
  dismissInputTrigger?: () => void
}

export type ComposerSplitActionProps =
  PropsRuntime<'conversation.input.overlay'> & ComposerSplitInjected

interface LegacyLayout {
  root: HTMLElement
  body: HTMLElement
  sessionWrapper: HTMLElement
  chat: HTMLElement
  composer: HTMLElement
}

interface OwnerLayout {
  root: HTMLElement
  body: HTMLElement
  composer: HTMLElement
}

interface BodyRect {
  top: number
  contentRight: number
  height: number
  width: number
}

interface MenuAnchor {
  top: number
  left: number
}

function widthForPreset(preset: ComposerLayoutSettings['defaultWidthPreset'], bodyWidth: number): number {
  const fraction = preset === 'narrow' ? 0.28 : preset === 'wide' ? 0.46 : 0.36
  return clampComposerWidth(bodyWidth * fraction, bodyWidth)
}

function findOwner(control: HTMLElement): OwnerLayout | null {
  const root = control.closest<HTMLElement>('[data-phase]')
  const composer = control.closest<HTMLElement>('[data-composer-seat]')
  const body = composer?.parentElement
  if (root === null || composer === null || !(body instanceof HTMLElement)) return null
  return { root, body, composer }
}

function findLegacyLayout(control: HTMLElement): LegacyLayout | null {
  const root = control.closest<HTMLElement>('[data-phase]')
  if (root === null) return null
  const body = root.querySelector<HTMLElement>(
    ':scope > [data-conversation-scroll], :scope > [data-dsh-composer-split-body]',
  )
  if (body === null) return null
  const sessionWrapper = body.querySelector<HTMLElement>(':scope > [data-slot="conversation.session"]')
  const chat = sessionWrapper?.firstElementChild
  const composer = body.querySelector<HTMLElement>(':scope > [data-composer-seat]')
  if (sessionWrapper === null || !(chat instanceof HTMLElement) || composer === null) return null
  return { root, body, sessionWrapper, chat, composer }
}

function installLegacyLayout(layout: LegacyLayout): () => void {
  const { root, body, chat, composer } = layout
  const initialScrollTop = body.scrollTop
  root.dataset.dshComposerSplitActive = 'true'
  body.dataset.dshComposerSplitBody = ''
  composer.dataset.dshComposerSplitPane = ''
  body.removeAttribute('data-conversation-scroll')
  chat.setAttribute('data-conversation-scroll', '')
  chat.dataset.dshComposerSplitChat = ''
  body.scrollTop = 0
  chat.scrollTop = initialScrollTop

  return () => {
    const chatScrollTop = chat.scrollTop
    delete root.dataset.dshComposerSplitActive
    root.style.removeProperty('--dsh-composer-split-width')
    delete body.dataset.dshComposerSplitBody
    delete composer.dataset.dshComposerSplitPane
    delete chat.dataset.dshComposerSplitChat
    chat.removeAttribute('data-conversation-scroll')
    body.setAttribute('data-conversation-scroll', '')
    body.scrollTop = chatScrollTop
  }
}

function rectOf(body: HTMLElement): BodyRect {
  const rect = body.getBoundingClientRect()
  const contentRight = body.clientWidth > 0 ? rect.left + body.clientWidth : rect.right
  return { top: rect.top, contentRight, height: rect.height, width: rect.width }
}

/** Placement menu plus the plugin-owned, reversible split adapter. */
const fallbackSnapshot = { status: 'unavailable' as const, value: undefined, base: undefined, user: undefined, revision: undefined, writable: false, mode: 'memory' as const }
const fallbackSettings: SettingsScope<ComposerLayoutSettings> = {
  getSnapshot: () => fallbackSnapshot,
  subscribe: () => () => {},
  set: async () => {},
  unset: async () => {},
}

export function ComposerSplitAction({ settings, sessionId, dismissInputTrigger }: ComposerSplitActionProps) {
  const effectiveSettings = settings ?? fallbackSettings
  const settingsSnapshot = useSyncExternalStore(
    effectiveSettings.subscribe.bind(effectiveSettings),
    effectiveSettings.getSnapshot.bind(effectiveSettings),
  )
  const localPreferences = readLocalSettings()
  const preferences = {
    ...COMPOSER_LAYOUT_DEFAULTS,
    ...(settingsSnapshot.value ?? {}),
    ...localPreferences,
  }
  const controlRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const edgeTriggerRef = useRef<HTMLButtonElement>(null)
  const separatorRef = useRef<HTMLDivElement>(null)
  const ownerRef = useRef<OwnerLayout | null>(null)
  const sessionLayoutRef = useRef<ComposerSessionLayout>(readSessionLayout(sessionId))
  const sessionIdRef = useRef(sessionId)
  const widthOverrideRef = useRef(sessionLayoutRef.current.width !== undefined)
  const sessionChangedRef = useRef(false)
  const legacyRef = useRef<LegacyLayout | null>(null)
  const widthDragRef = useRef<{ x: number; width: number; moved: boolean } | null>(null)
  const appliedPresetRef = useRef<ComposerLayoutSettings['defaultWidthPreset'] | null>(null)
  const [split, setSplit] = useState(false)
  const [composerWidth, setComposerWidth] = useState(DEFAULT_WIDTH)
  const [bodyRect, setBodyRect] = useState<BodyRect | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sideMenuAnchor, setSideMenuAnchor] = useState<MenuAnchor | null>(null)

  // ConversationRoot keeps the Composer bar mounted while the active session
  // changes. Refresh the session-scoped record here instead of letting the
  // previous conversation's placement and width leak into the new one.
  useLayoutEffect(() => {
    if (sessionIdRef.current === sessionId) return
    sessionIdRef.current = sessionId
    sessionLayoutRef.current = readSessionLayout(sessionId)
    widthOverrideRef.current = sessionLayoutRef.current.width !== undefined
    sessionChangedRef.current = true
    appliedPresetRef.current = null
    setMenuOpen(false)
    setSideMenuAnchor(null)
    setSplit(false)
    setComposerWidth(DEFAULT_WIDTH)
  }, [sessionId])

  useEffect(() => {
    if (bodyRect === null) return
    const remembered = sessionLayoutRef.current
    const placement = preferences.rememberPlacement && remembered.placement !== undefined
      ? remembered.placement
      : preferences.defaultPlacement
    setSplit(placement === 'right')

    if (appliedPresetRef.current === preferences.defaultWidthPreset) return
    appliedPresetRef.current = preferences.defaultWidthPreset
    const rememberedWidth = preferences.rememberPlacement
      ? sessionLayoutRef.current.width
      : undefined
    widthOverrideRef.current = rememberedWidth !== undefined
    if (rememberedWidth !== undefined) {
      setComposerWidth(clampComposerWidth(rememberedWidth, bodyRect.width))
    } else {
      setComposerWidth(widthForPreset(preferences.defaultWidthPreset, bodyRect.width))
    }
  }, [bodyRect, preferences])

  useEffect(() => {
    const root = ownerRef.current?.root
    if (root === undefined) return
    root.dataset.dshComposerBottomHandleHoverOnly = String(preferences.bottomHandleHoverOnly)
    return () => { delete root.dataset.dshComposerBottomHandleHoverOnly }
  }, [preferences.bottomHandleHoverOnly])

  useLayoutEffect(() => {
    const control = controlRef.current
    if (control === null) return
    const owner = findOwner(control)
    if (owner === null) return
    ownerRef.current = owner
    setBodyRect(rectOf(owner.body))

    const observer = new ResizeObserver(() => {
      const next = rectOf(owner.body)
      setBodyRect(next)
      setComposerWidth(current => clampComposerWidth(current, next.width))
      setMenuOpen(false)
    })
    observer.observe(owner.body)
    return () => {
      observer.disconnect()
      ownerRef.current = null
      delete owner.composer.dataset.dshComposerSideMax
      setBodyRect(null)
    }
  }, [])

  useLayoutEffect(() => {
    const owner = ownerRef.current
    if (owner === null) return
    if (split && canUseSideLayout(bodyRect?.width ?? 0)) {
      owner.composer.dataset.dshComposerSideMax = ''
    } else {
      delete owner.composer.dataset.dshComposerSideMax
      if (!split) owner.body.style.removeProperty('--dsh-composer-inline-width')
    }
  }, [bodyRect, split])

  // In a side-by-side Composer, every competing popup must first dismiss the
  // slash/reference candidate list. The listener deliberately lives only in
  // the side layout so the normal bottom Composer retains DSH's own behavior.
  useEffect(() => {
    const composer = ownerRef.current?.composer
    if (!split || composer === undefined || dismissInputTrigger === undefined) return
    const onPopupTriggerPointerDown = (event: globalThis.PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[role="listbox"]') !== null) return
      const trigger = target.closest<HTMLElement>('button, [role="button"]')
      if (trigger === null || trigger.getAttribute('aria-haspopup') === 'listbox') return
      dismissInputTrigger()
    }
    composer.addEventListener('pointerdown', onPopupTriggerPointerDown, true)
    return () => { composer.removeEventListener('pointerdown', onPopupTriggerPointerDown, true) }
  }, [dismissInputTrigger, split])

  // The right pane deliberately gives the draft scrollport the remaining
  // vertical space. DSH's textarea itself still grows only with its content,
  // which leaves a large blank area below a short draft. Treat that blank area
  // as part of the editor, without intercepting controls, menus, or text
  // selection inside the actual textarea.
  useEffect(() => {
    const composer = ownerRef.current?.composer
    if (!split || composer === undefined) return
    const onBlankDraftPointerDown = (event: globalThis.PointerEvent): void => {
      if (event.button !== 0 && event.button !== undefined) return
      const target = event.target
      if (!(target instanceof Element)) return
      const scrollport = target.closest<HTMLElement>('[data-input-scroll]')
      if (scrollport === null || !composer.contains(scrollport)) return
      if (target.closest('textarea, input, [contenteditable="true"], button, a, [role="button"], [role="listbox"], [role="menu"]') !== null) return
      const editor = composer.querySelector<HTMLElement>(
        'textarea:not([disabled]), input:not([disabled]), [contenteditable="true"], [role="textbox"]',
      )
      if (editor === null) return
      event.preventDefault()
      editor.focus({ preventScroll: true })
    }
    composer.addEventListener('pointerdown', onBlankDraftPointerDown)
    return () => { composer.removeEventListener('pointerdown', onBlankDraftPointerDown) }
  }, [split])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: globalThis.PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (controlRef.current?.contains(target) === true) return
      if (edgeTriggerRef.current?.contains(target) === true) return
      if (toolbarRef.current?.contains(target) === true) return
      if (separatorRef.current?.contains(target) === true) return
      if (target instanceof Element && target.closest('[data-composer-width-handle]') !== null) return
      setMenuOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  useLayoutEffect(() => {
    const control = controlRef.current
    if (!split || control === null) return
    const layout = findLegacyLayout(control)
    if (layout === null) return
    legacyRef.current = layout
    const dispose = installLegacyLayout(layout)
    return () => {
      legacyRef.current = null
      dispose()
    }
  }, [split])

  useEffect(() => {
    const owner = ownerRef.current
    if (owner === null || !split) return
    if (sessionChangedRef.current) {
      sessionChangedRef.current = false
      return
    }
    const next = clampComposerWidth(composerWidth, owner.body.getBoundingClientRect().width)
    owner.body.style.setProperty('--dsh-composer-inline-width', `${next}px`)
    const layout = legacyRef.current
    if (layout !== null) layout.root.style.setProperty('--dsh-composer-split-width', `${next}px`)
    if (preferences.rememberPlacement && widthOverrideRef.current) {
      sessionLayoutRef.current = { ...sessionLayoutRef.current, width: next }
      writeSessionLayout(sessionId, sessionLayoutRef.current)
    }
  }, [composerWidth, preferences.defaultWidthPreset, preferences.rememberPlacement, sessionId, split])

  const setDock = (nextSplit: boolean): void => {
    setMenuOpen(false)
    setSplit(nextSplit)
    if (preferences.rememberPlacement) {
      const placement = nextSplit ? 'right' : 'bottom'
      sessionLayoutRef.current = { ...sessionLayoutRef.current, placement }
      writeSessionLayout(sessionId, sessionLayoutRef.current)
    }
  }
  const resetWidth = useCallback(() => {
    const width = bodyRect === null ? MIN_COMPOSER_WIDTH : widthForPreset('medium', bodyRect.width)
    widthOverrideRef.current = true
    setComposerWidth(width)
  }, [bodyRect])

  const onWidthPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    widthDragRef.current = { x: event.clientX, width: composerWidth, moved: false }
  }, [composerWidth])

  const onWidthPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = widthDragRef.current
    const rect = bodyRect
    if (drag === null || rect === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true
    widthOverrideRef.current = true
    setComposerWidth(clampComposerWidth(drag.width - (event.clientX - drag.x), rect.width))
  }, [bodyRect])

  const onWidthPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  const openLegacyMenu = (event: MouseEvent<HTMLDivElement>): void => {
    const drag = widthDragRef.current
    widthDragRef.current = null
    if (drag?.moved === true) return
    const rect = event.currentTarget.getBoundingClientRect()
    setSideMenuAnchor({
      top: rect.top + rect.height / 2,
      left: Math.min(rect.right + 6, window.innerWidth - 6),
    })
    setMenuOpen(open => !open)
  }

  const onWidthKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.currentTarget.click()
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      widthOverrideRef.current = true
      setComposerWidth(value => bodyRect === null ? value : clampComposerWidth(value + 16, bodyRect.width))
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      widthOverrideRef.current = true
      setComposerWidth(value => bodyRect === null ? value : clampComposerWidth(value - 16, bodyRect.width))
    } else if (event.key === 'Home') {
      event.preventDefault()
      resetWidth()
    }
  }, [bodyRect, resetWidth])

  const sideLayoutAvailable = canUseSideLayout(bodyRect?.width ?? 0)
  const toolbar = (className: string | undefined, style?: { top: number; left: number }) => (
    <div
      ref={toolbarRef}
      className={className}
      role="toolbar"
      aria-label="输入区域布局"
      style={style}
    >
      <button
        type="button"
        className={css.toolButton}
        aria-pressed={!split}
        title="停靠到底部"
        aria-label="停靠到底部"
        onClick={() => { setDock(false) }}
      >
        <span className={`${css.dockIcon} ${css.dockBottom}`} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={css.toolButton}
        aria-pressed={split}
        title="停靠到右侧"
        aria-label="停靠到右侧"
        disabled={!sideLayoutAvailable}
        onClick={() => { setDock(true) }}
      >
        <span className={`${css.dockIcon} ${css.dockRight}`} aria-hidden="true" />
      </button>
    </div>
  )

  const separator = split && bodyRect !== null && sideLayoutAvailable && ownerRef.current !== null
    ? createPortal(
      <div
        ref={separatorRef}
        className={css.separator}
        role="separator"
        aria-label="调整输入区域宽度；点击打开布局菜单"
        aria-orientation="vertical"
        aria-valuemin={MIN_COMPOSER_WIDTH}
        aria-valuemax={Math.max(MIN_COMPOSER_WIDTH, Math.round(bodyRect.width - MIN_CHAT_WIDTH))}
        aria-valuenow={Math.round(clampComposerWidth(composerWidth, bodyRect.width))}
        tabIndex={0}
        onClick={openLegacyMenu}
        onDoubleClick={resetWidth}
        onPointerDown={onWidthPointerDown}
        onPointerMove={onWidthPointerMove}
        onPointerUp={onWidthPointerUp}
        onPointerCancel={() => { widthDragRef.current = null }}
        onKeyDown={onWidthKeyDown}
      />,
      ownerRef.current.composer,
    )
    : null

  const sideToolbar = split && menuOpen && sideMenuAnchor !== null
    ? createPortal(toolbar(css.toolbarSide, sideMenuAnchor), document.body)
    : null

  const openSideToolbar = (event: MouseEvent<HTMLButtonElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect()
    setSideMenuAnchor({
      top: rect.top + rect.height / 2,
      left: Math.min(rect.right + 6, window.innerWidth - 6),
    })
    setMenuOpen(open => !open)
  }

  // A right-layout preference survives the temporary stacked layout below the
  // breakpoint. The recovery rail keeps that state legible and lets the user
  // choose Bottom; Right stays disabled until two usable columns fit again.
  const recoveryTrigger = split && bodyRect !== null && !sideLayoutAvailable
    ? (
      <button
        ref={edgeTriggerRef}
        type="button"
        className={css.edgeTrigger}
        aria-label="打开输入区域布局菜单；窗口过窄，已暂时停靠到底部"
        aria-expanded={menuOpen}
        style={{
          top: bodyRect.top,
          left: bodyRect.contentRight - 13,
          width: HANDLE_HIT_WIDTH,
          height: bodyRect.height,
        }}
        onClick={openSideToolbar}
      />
    )
    : null

  const bottomTrigger = !split && bodyRect !== null
    ? (
      <button
        ref={edgeTriggerRef}
        type="button"
        className={css.edgeTrigger}
        aria-label="打开输入区域布局菜单"
        aria-expanded={menuOpen}
        style={{
          top: bodyRect.top,
          left: bodyRect.contentRight - 13,
          width: HANDLE_HIT_WIDTH,
          height: bodyRect.height,
        }}
        onClick={() => { setMenuOpen(open => !open) }}
      />
    )
    : null

  const bottomToolbar = !split && menuOpen && bodyRect !== null
    ? toolbar(css.toolbarBottom, {
      top: bodyRect.top + bodyRect.height / 2,
      left: bodyRect.contentRight - 19,
    })
    : null

  return (
    <div
      ref={controlRef}
      className={css.control}
      data-dsh-composer-split-mode={split ? 'split' : 'stacked'}
      data-dsh-composer-split-adapter="plugin"
    >
      {bottomTrigger}
      {bottomToolbar}
      {separator}
      {recoveryTrigger}
      {sideToolbar}
    </div>
  )
}
