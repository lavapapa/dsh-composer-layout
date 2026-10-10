import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore,
  type KeyboardEvent, type MouseEvent, type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { MenuSurface, useAnchoredPosition } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ComposerLayoutPlacement, ComposerLayoutSettings } from '../settings.ts'
import { COMPOSER_LAYOUT_DEFAULTS } from '../settings.ts'
import {
  readLocalSettings, readSessionLayout, writeSessionLayout,
  type ComposerSessionLayout,
} from './settings-storage.ts'
import {
  MIN_CHAT_WIDTH, MIN_COMPOSER_WIDTH,
  canUseSideLayout, clampComposerWidth, resolvePlacement,
} from './layout-policy.js'
import css from './ComposerSplitAction.module.css'

const DEFAULT_WIDTH = 420
const HANDLE_HIT_WIDTH = 10

export interface ComposerSplitInjected {
  /** Durable user preferences shared with the Settings tab. */
  settings?: ConfigForm<ComposerLayoutSettings>
  /** Close the current session's slash/reference candidate list. */
  dismissInputTrigger?: () => void
}

export type ComposerSplitActionProps =
  PropsRuntime<'conversation.input.overlay'> & ComposerSplitInjected

interface LegacyLayout {
  root: HTMLElement
  body: HTMLElement
  sessionWrapper: HTMLElement
  frame: HTMLElement
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

interface RightSlotOverflow {
  row: HTMLElement
  trailing: HTMLElement
  slot: HTMLElement
  items: HTMLElement[]
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
    '[data-conversation-scroll], [data-dsh-composer-split-body]',
  )
  if (body === null) return null
  const sessionWrapper = body.querySelector<HTMLElement>(':scope > [data-slot="conversation.session"]')
  const chat = sessionWrapper?.firstElementChild
  const composer = body.querySelector<HTMLElement>(':scope > [data-composer-seat]')
  if (sessionWrapper === null || !(chat instanceof HTMLElement) || composer === null) return null
  const frame = Array.from(composer.children).find(child => child.matches('[data-composer-card]') || child.querySelector('[data-composer-card]') !== null)
  if (!(frame instanceof HTMLElement)) return null
  return { root, body, sessionWrapper, chat, composer, frame }
}

function installLegacyLayout(layout: LegacyLayout): () => void {
  const { root, body, chat, composer, frame } = layout
  root.dataset.dshComposerSplitActive = 'true'
  body.dataset.dshComposerSplitBody = ''
  composer.dataset.dshComposerSplitPane = ''
  frame.dataset.dshComposerSplitFrame = ''
  chat.dataset.dshComposerSplitChat = ''

  return () => {
    delete root.dataset.dshComposerSplitActive
    for (const property of ['--dsh-composer-split-width', '--dsh-composer-pane-top', '--dsh-composer-pane-left', '--dsh-composer-pane-height']) root.style.removeProperty(property)
    delete body.dataset.dshComposerSplitBody
    delete composer.dataset.dshComposerSplitPane
    delete frame.dataset.dshComposerSplitFrame
    delete chat.dataset.dshComposerSplitChat
  }
}

function positionSplit(layout: LegacyLayout, rect: BodyRect, width: number): void {
  const boundedWidth = clampComposerWidth(width, rect.width)
  layout.root.style.setProperty('--dsh-composer-split-width', `${boundedWidth}px`)
  layout.root.style.setProperty('--dsh-composer-pane-top', `${rect.top}px`)
  layout.root.style.setProperty('--dsh-composer-pane-left', `${rect.contentRight - boundedWidth}px`)
  layout.root.style.setProperty('--dsh-composer-pane-height', `${rect.height}px`)
}

function rectOf(body: HTMLElement): BodyRect {
  const area = body.parentElement ?? body
  const rect = area.getBoundingClientRect()
  const contentRight = area.clientWidth > 0 ? rect.left + area.clientWidth : rect.right
  return { top: rect.top, contentRight, height: rect.height, width: rect.width }
}

function sameRightSlotOverflow(left: RightSlotOverflow | null, right: RightSlotOverflow | null): boolean {
  if (left === null || right === null) return left === right
  return left.trailing === right.trailing && left.slot === right.slot
    && left.items.length === right.items.length
    && left.items.every((item, index) => item === right.items[index])
}

/**
 * DSH exposes the third-party input controls through the public
 * `conversation.input.right` slot. Its wrapper is the only stable boundary:
 * model, meter, and send controls are host-owned siblings after it.
 */
function findRightSlotOverflow(composer: HTMLElement): RightSlotOverflow | null {
  const scrollport = composer.querySelector<HTMLElement>('[data-input-scroll]')
  const row = scrollport?.nextElementSibling
  const trailing = row?.lastElementChild
  if (!(row instanceof HTMLElement) || !(trailing instanceof HTMLElement)) return null

  const slot = trailing.querySelector<HTMLElement>('[data-slot="conversation.input.right"]')
  if (slot === null) return null
  const items = Array.from(slot.children).filter((child): child is HTMLElement =>
    child instanceof HTMLElement && !child.hasAttribute('data-dsh-composer-overflow-surface'))
  return items.length === 0 ? null : { row, trailing, slot, items }
}

function shouldCollapseRightSlot(overflow: RightSlotOverflow): boolean {
  const { row, trailing } = overflow
  // Measure both groups in their expanded layout, before folding can change
  // flex allocation. client/offset widths keep padding and gaps in CSS pixels.
  trailing.dataset.dshComposerMeasuring = ''
  try {
    const style = getComputedStyle(row)
    const leading = Array.from(row.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child !== trailing)
    const capacity = row.clientWidth
      - (Number.parseFloat(style.paddingLeft) || 0) - (Number.parseFloat(style.paddingRight) || 0)
      - leading.reduce((total, child) => total + child.offsetWidth, 0)
      - (Number.parseFloat(style.columnGap) || 0) * leading.length
    return capacity > 0 && trailing.offsetWidth > capacity
  } finally {
    delete trailing.dataset.dshComposerMeasuring
  }
}

function clearSlotOverflow(slot: HTMLElement | null): void {
  if (slot === null) return
  delete slot.dataset.dshComposerSlotOverflow
  delete slot.dataset.dshComposerSlotOverflowOpen
  slot.style.removeProperty('--dsh-composer-slot-overflow-left')
  slot.style.removeProperty('--dsh-composer-slot-overflow-top')
}

/** Placement menu plus the plugin-owned, reversible split adapter. */
const fallbackSnapshot = { status: 'unavailable' as const, value: undefined, base: undefined, user: undefined, revision: undefined, writable: false, mode: 'memory' as const }
const fallbackSettings: ConfigForm<ComposerLayoutSettings> = {
  getSnapshot: () => fallbackSnapshot,
  subscribe: () => () => {},
  set: async () => false,
  unset: async () => false,
  mutate: async () => false,
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
  const [placementIntent, setPlacementIntent] = useState<ComposerLayoutPlacement>('bottom')
  const [split, setSplit] = useState(false)
  const [composerWidth, setComposerWidth] = useState(DEFAULT_WIDTH)
  const [bodyRect, setBodyRect] = useState<BodyRect | null>(null)
  const [active, setActive] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sideMenuAnchor, setSideMenuAnchor] = useState<MenuAnchor | null>(null)
  const [toolbarHint, setToolbarHint] = useState<string | null>(null)
  const [rightSlotOverflow, setRightSlotOverflow] = useState<RightSlotOverflow | null>(null)
  const [rightSlotCollapsed, setRightSlotCollapsed] = useState(false)
  const [rightSlotOverflowOpen, setRightSlotOverflowOpen] = useState(false)
  const rightSlotOverflowTriggerRef = useRef<HTMLButtonElement>(null)
  const rightSlotOverflowSlotRef = useRef<HTMLElement | null>(null)

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
    clearSlotOverflow(rightSlotOverflowSlotRef.current)
    rightSlotOverflowSlotRef.current = null
    setRightSlotCollapsed(false)
    setRightSlotOverflowOpen(false)
    setPlacementIntent('bottom')
    setSplit(false)
    setComposerWidth(DEFAULT_WIDTH)
  }, [sessionId])

  useEffect(() => {
    if (bodyRect === null) return
    const remembered = sessionLayoutRef.current
    const placement = preferences.rememberPlacement && remembered.placement !== undefined
      ? remembered.placement
      : preferences.defaultPlacement
    setPlacementIntent(placement)
    setSplit(active && resolvePlacement(placement, bodyRect.width, bodyRect.height, preferences.autoThreshold) === 'right')

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
  }, [active, bodyRect, preferences])

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
    const updatePhase = (): void => { setActive(owner.root.dataset.phase === 'active') }
    updatePhase()
    const phaseObserver = new MutationObserver(updatePhase)
    phaseObserver.observe(owner.root, { attributes: true, attributeFilter: ['data-phase'] })
    setBodyRect(rectOf(owner.body))

    const observer = new ResizeObserver(() => {
      const next = rectOf(owner.body)
      setBodyRect(next)
      setComposerWidth(current => clampComposerWidth(current, next.width))
      setMenuOpen(false)
    })
    observer.observe(owner.body.parentElement ?? owner.body)
    return () => {
      observer.disconnect()
      phaseObserver.disconnect()
      ownerRef.current = null
      setBodyRect(null)
    }
  }, [])

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

  // Third-party right-slot entries have no host-provided overflow container.
  // Keep them in their original slot so controls with their own state (such as
  // a quota meter) remain intact. Only collapse that slot when its natural
  // width would force the native toolbar into a second row.
  useLayoutEffect(() => {
    const composer = ownerRef.current?.composer
    if (!active || composer === undefined || ownerRef.current?.root.dataset.phase !== 'active') {
      clearSlotOverflow(rightSlotOverflowSlotRef.current)
      rightSlotOverflowSlotRef.current = null
      setRightSlotOverflow(null)
      setRightSlotCollapsed(false)
      setRightSlotOverflowOpen(false)
      return
    }

    let observed: HTMLElement[] = []
    const resizeObserver = new ResizeObserver(() => { refresh() })
    const refresh = (): void => {
      if (ownerRef.current?.root.dataset.phase !== 'active') return
      const next = findRightSlotOverflow(composer)
      // Plugin controls can mount after this effect. Observe their actual boxes;
      // a display:contents slot has no box and cannot report width changes.
      const targets = next === null ? [] : [next.row, ...next.items]
      if (targets.length !== observed.length || targets.some((target, index) => target !== observed[index])) {
        resizeObserver.disconnect()
        targets.forEach(target => { resizeObserver.observe(target) })
        observed = targets
      }
      const previous = rightSlotOverflowSlotRef.current
      if (previous !== null && previous !== next?.slot) clearSlotOverflow(previous)
      const collapsed = next !== null && shouldCollapseRightSlot(next)
      if (next !== null && collapsed) {
        next.slot.dataset.dshComposerSlotOverflow = ''
      } else {
        clearSlotOverflow(next?.slot ?? null)
      }
      rightSlotOverflowSlotRef.current = next?.slot ?? null
      setRightSlotOverflow(current => sameRightSlotOverflow(current, next) ? current : next)
      setRightSlotCollapsed(collapsed)
      if (!collapsed) {
        setRightSlotOverflowOpen(false)
      }
    }

    refresh()
    const mutationObserver = new MutationObserver(refresh)
    mutationObserver.observe(composer, { childList: true, subtree: true })
    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      clearSlotOverflow(rightSlotOverflowSlotRef.current)
      rightSlotOverflowSlotRef.current = null
    }
  }, [active, split, sessionId])

  useLayoutEffect(() => {
    if (rightSlotOverflowOpen) return
    clearSlotOverflow(rightSlotOverflow?.slot ?? null)
    if (rightSlotCollapsed && rightSlotOverflow !== null) {
      rightSlotOverflow.slot.dataset.dshComposerSlotOverflow = ''
    }
  }, [rightSlotCollapsed, rightSlotOverflow, rightSlotOverflowOpen])

  useLayoutEffect(() => {
    if (rightSlotOverflowOpen && rightSlotOverflow !== null) {
      rightSlotOverflow.slot.dataset.dshComposerSlotOverflowOpen = ''
    }
  }, [rightSlotOverflow, rightSlotOverflowOpen])

  // 原生定位跟踪窗口/面板尺寸；分栏几何变化时也重新测量同一个原始 slot。
  const rightSlotPanelRef = useMemo(() => ({ current: rightSlotOverflow?.slot ?? null }),
    [rightSlotOverflow?.slot, bodyRect, composerWidth])
  const rightSlotPosition = useAnchoredPosition({
    open: rightSlotOverflowOpen,
    anchorRef: rightSlotOverflowTriggerRef,
    panelRef: rightSlotPanelRef,
    side: 'top',
    align: 'end',
    gap: 4,
    margin: 12,
  })
  useLayoutEffect(() => {
    if (rightSlotPosition === null || rightSlotOverflow === null) return
    rightSlotOverflow.slot.style.setProperty('--dsh-composer-slot-overflow-left', `${rightSlotPosition.left}px`)
    rightSlotOverflow.slot.style.setProperty('--dsh-composer-slot-overflow-top', `${rightSlotPosition.top}px`)
  }, [rightSlotPosition, rightSlotOverflow])

  useEffect(() => {
    if (!rightSlotOverflowOpen) return
    const onPointerDown = (event: globalThis.PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rightSlotOverflowTriggerRef.current?.contains(target) === true) return
      if (rightSlotOverflowSlotRef.current?.contains(target) === true) return
      setRightSlotOverflowOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setRightSlotOverflowOpen(false)
        rightSlotOverflowTriggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [rightSlotOverflowOpen])

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
    if (!active || !split || !canUseSideLayout(bodyRect?.width ?? 0) || control === null) return
    let dispose: (() => void) | undefined
    let observer: MutationObserver | undefined
    const install = (): void => {
      if (dispose !== undefined) return
      const layout = findLegacyLayout(control)
      if (layout === null) return
      legacyRef.current = layout
      dispose = installLegacyLayout(layout)
      if (bodyRect !== null) positionSplit(layout, bodyRect, composerWidth)
      observer?.disconnect()
      observer = undefined
    }

    install()
    if (dispose === undefined) {
      // A remembered right layout can be resolved before ConversationRoot has
      // mounted the session surface. Wait for that one host mount instead of
      // leaving the Composer's logical state split while its DOM is still
      // stacked.
      const root = control.closest<HTMLElement>('[data-phase]')
      if (root !== null) {
        observer = new MutationObserver(install)
        observer.observe(root, { childList: true, subtree: true })
      }
    }
    return () => {
      observer?.disconnect()
      legacyRef.current = null
      dispose?.()
    }
  }, [active, bodyRect?.width, split])

  useEffect(() => {
    const owner = ownerRef.current
    if (owner === null || !split) return
    if (sessionChangedRef.current) {
      sessionChangedRef.current = false
      return
    }
    const next = clampComposerWidth(composerWidth, bodyRect?.width ?? 0)
    const layout = legacyRef.current
    if (layout !== null && bodyRect !== null) {
      positionSplit(layout, bodyRect, next)
    }
    if (preferences.rememberPlacement && widthOverrideRef.current) {
      sessionLayoutRef.current = { ...sessionLayoutRef.current, width: next }
      writeSessionLayout(sessionId, sessionLayoutRef.current)
    }
  }, [bodyRect, composerWidth, preferences.defaultWidthPreset, preferences.rememberPlacement, sessionId, split])

  const setDock = (placement: ComposerLayoutPlacement): void => {
    setMenuOpen(false)
    setPlacementIntent(placement)
    setSplit(resolvePlacement(placement, bodyRect?.width ?? 0, bodyRect?.height ?? 0, preferences.autoThreshold) === 'right')
    if (preferences.rememberPlacement) {
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
      onMouseLeave={() => { setToolbarHint(null) }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setToolbarHint(null)
      }}
    >
      <button
        type="button"
        className={css.toolButton}
        aria-pressed={placementIntent === 'bottom'}
        aria-label="停靠到底部"
        aria-describedby={toolbarHint === '固定在底部' ? 'dsh-composer-layout-hint' : undefined}
        onMouseEnter={() => { setToolbarHint('固定在底部') }}
        onFocus={() => { setToolbarHint('固定在底部') }}
        onClick={() => { setDock('bottom') }}
      >
        <span className={`${css.dockIcon} ${css.dockBottom}`} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={css.toolButton}
        aria-pressed={placementIntent === 'right'}
        aria-label={sideLayoutAvailable ? '停靠到右侧' : '停靠到右侧；需要至少 680px 的会话主区域'}
        aria-describedby={toolbarHint === '固定在右侧' ? 'dsh-composer-layout-hint' : undefined}
        disabled={!sideLayoutAvailable}
        onMouseEnter={() => { setToolbarHint('固定在右侧') }}
        onFocus={() => { setToolbarHint('固定在右侧') }}
        onClick={() => { setDock('right') }}
      >
        <span className={`${css.dockIcon} ${css.dockRight}`} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={css.toolButton}
        aria-pressed={placementIntent === 'auto'}
        aria-label={`自动选择布局；当前停靠到${split ? '右侧' : '底部'}`}
        aria-describedby={toolbarHint === '宽幅靠右，窄幅靠下' ? 'dsh-composer-layout-hint' : undefined}
        onMouseEnter={() => { setToolbarHint('宽幅靠右，窄幅靠下') }}
        onFocus={() => { setToolbarHint('宽幅靠右，窄幅靠下') }}
        onClick={() => { setDock('auto') }}
      >
        <svg className={css.autoIcon} viewBox="0 0 20 16" fill="none" aria-hidden="true">
          <rect x="2.25" y="2.25" width="15.5" height="11.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.25 3.5V9.5H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {!sideLayoutAvailable && <span className={css.unavailableHint}>至少 680px</span>}
      {toolbarHint !== null && <span id="dsh-composer-layout-hint" className={css.toolbarHint} role="tooltip">{toolbarHint}</span>}
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

  const showingRecoveryRail = placementIntent === 'right' && bodyRect !== null && !sideLayoutAvailable
  const sideToolbar = (split || showingRecoveryRail) && menuOpen && sideMenuAnchor !== null
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
  const recoveryTrigger = showingRecoveryRail
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

  const bottomTrigger = !split && !showingRecoveryRail && bodyRect !== null
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

  const bottomToolbar = !split && !showingRecoveryRail && menuOpen && bodyRect !== null
    ? toolbar(css.toolbarBottom, {
      top: bodyRect.top + bodyRect.height / 2,
      left: bodyRect.contentRight - 19,
    })
    : null

  const rightSlotOverflowTrigger = active && rightSlotCollapsed && rightSlotOverflow !== null
    ? createPortal(
      <button
        ref={rightSlotOverflowTriggerRef}
        type="button"
        className={css.slotOverflowTrigger}
        data-dsh-composer-slot-overflow-trigger=""
        aria-label="显示额外输入控件"
        aria-expanded={rightSlotOverflowOpen}
        onClick={() => {
          setRightSlotOverflowOpen(open => !open)
        }}
      >
        <svg className={css.slotOverflowIcon} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="3" cy="8" r="1.25" fill="currentColor" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
          <circle cx="13" cy="8" r="1.25" fill="currentColor" />
        </svg>
      </button>,
      rightSlotOverflow.trailing,
    )
    : null

  // 原生菜单材质作为装饰层；第三方控件保留原 DOM、React owner 与事件路径。
  const rightSlotOverflowSurface = rightSlotOverflowOpen && rightSlotOverflow !== null
    ? createPortal(
      <MenuSurface
        aria-hidden="true"
        data-dsh-composer-overflow-surface=""
        className={css.slotOverflowSurface}
      />,
      rightSlotOverflow.slot,
    )
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
      {rightSlotOverflowTrigger}
      {rightSlotOverflowSurface}
    </div>
  )
}
