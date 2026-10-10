import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ComposerSplitAction, type ComposerSplitActionProps } from '../src/client/ComposerSplitAction.tsx'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  MenuSurface: (props: import('react').ComponentPropsWithoutRef<'div'>) => <div {...props} />,
  useAnchoredPosition: ({ open }: { open: boolean }) => open ? { left: 12, top: 12 } : null,
}))

let measuredWidth = 1_000
let measuredHeight = 800
let trailingWidth = 100
let naturalTrailingWidth = 300
let rowCapacity: number | undefined
const resizeCallbacks = new Set<() => void>()

class ResizeObserverMock {
  private readonly notify: () => void

  constructor(callback: ResizeObserverCallback) {
    this.notify = () => { callback([], this as unknown as ResizeObserver) }
  }

  observe(): void { resizeCallbacks.add(this.notify) }
  disconnect(): void { resizeCallbacks.delete(this.notify) }
}

function notifyResize(): void {
  for (const callback of resizeCallbacks) callback()
}

function pointerEvent(type: string, clientX: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    pointerId: { value: 1 },
  })
  return event
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const body = this.hasAttribute('data-conversation-scroll') || this.hasAttribute('data-dsh-composer-split-body') || this.getAttribute('data-testid') === 'conversation-body-wrapper' || this.hasAttribute('data-phase')
    const testId = this.getAttribute('data-testid')
    const width = body ? measuredWidth
      : testId === 'input-row' ? (rowCapacity ?? trailingWidth) + 100
      : testId === 'input-trailing' ? this.hasAttribute('data-dsh-composer-measuring') ? naturalTrailingWidth : trailingWidth
      : 100
    return {
      x: 0, y: 0, top: 0, left: 0, right: width, bottom: measuredHeight,
      width, height: measuredHeight, toJSON: () => ({}),
    }
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
    return this.getBoundingClientRect().width
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
    return this.getBoundingClientRect().width
  })
  localStorage.clear()
  resizeCallbacks.clear()
  trailingWidth = 100
  naturalTrailingWidth = 300
  rowCapacity = undefined
  measuredHeight = 800
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function settings(defaultPlacement: 'bottom' | 'right' | 'auto') {
  const snapshot = {
    status: 'ready' as const,
    value: {
      defaultPlacement,
      autoThreshold: 1,
      rememberPlacement: true,
      bottomHandleHoverOnly: false,
      defaultWidthPreset: 'medium' as const,
    },
    base: undefined,
    user: undefined,
    revision: 1,
    writable: true,
    mode: 'host' as const,
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: () => () => {},
    set: async () => {},
    unset: async () => {},
  }
}

type FixtureProps = Partial<ComposerSplitActionProps> & {
  rightSlotItems?: ReactNode
  sessionSurface?: boolean
  phase?: 'hero' | 'active'
}

function activeFixture(props: FixtureProps = {}) {
  const {
    sessionId = 'session-a',
    settings: suppliedSettings,
    rightSlotItems,
    sessionSurface = true,
    phase = 'active',
    ...actionProps
  } = props
  return (
    <div data-phase={phase}><div data-testid="conversation-body-wrapper">
      <div data-conversation-scroll="">
        <div {...(sessionSurface ? { 'data-slot': 'conversation.session' } : {})}>
          {sessionSurface && <div key={sessionId} data-testid="chat" />}
        </div>
        <div data-composer-seat="">
          <div data-composer-card="">
            <div data-input-scroll="">
              <div><div contentEditable data-composer-input="" role="textbox" aria-label="给智能体发消息" /></div>
            </div>
            <div data-testid="input-row">
              <div>
                <button type="button" aria-label="命令" aria-haspopup="listbox">命令</button>
              </div>
              <div data-testid="input-trailing">
                <div data-testid="standard-controls">
                  <div data-slot="conversation.input.right">{rightSlotItems}</div>
                  <div data-slot="conversation.input.model">
                    <button type="button" aria-label="模型" aria-haspopup="menu">模型</button>
                  </div>
                </div>
                <div data-slot="conversation.input.activity" />
                <button type="button" aria-label="发送">发送</button>
              </div>
            </div>
            <ComposerSplitAction sessionId={sessionId} settings={suppliedSettings ?? settings('right')} {...actionProps} />
          </div>
        </div>
      </div>
    </div></div>,
  )
}

function fixture(props: FixtureProps = {}) {
  return render(activeFixture(props))
}

function heroFixture() {
  return render(
    <div data-phase="hero">
      <div data-conversation-scroll="">
        <div data-composer-seat="">
          <div data-composer-card="">
            <div data-input-scroll="">
              <div><div contentEditable data-composer-input="" role="textbox" aria-label="给智能体发消息" /></div>
            </div>
            <ComposerSplitAction sessionId="new-session" settings={settings('right')} />
          </div>
        </div>
      </div>
    </div>,
  )
}

describe('ComposerSplitAction', () => {
  it('uses the uncollapsed intrinsic width regardless of the overflow trigger and popup state', async () => {
    measuredWidth = 1_000
    trailingWidth = 600
    rowCapacity = 250
    const view = fixture({ rightSlotItems: <button type="button" aria-label="额度">额度</button> })
    const trigger = await screen.findByRole('button', { name: '显示额外输入控件' })
    fireEvent.click(trigger)
    for (let i = 0; i < 3; i++) {
      notifyResize()
      expect(screen.getByRole('button', { name: '显示额外输入控件' })).toBe(trigger)
    }
    expect(view.container.querySelector('[data-dsh-composer-measuring]')).toBeNull()
    rowCapacity = 500
    notifyResize()
    await waitFor(() => expect(screen.queryByRole('button', { name: '显示额外输入控件' })).toBeNull())
    expect(view.container.querySelector('[data-dsh-composer-slot-overflow]')).toBeNull()
  })

  it('never folds controls on a new-session page, including after leaving a side-layout session', async () => {
    measuredWidth = 1_000
    const rightSlotItems = <button type="button" aria-label="额度">额度</button>
    const view = fixture({ rightSlotItems })
    await screen.findByRole('button', { name: '显示额外输入控件' })
    view.rerender(activeFixture({ phase: 'hero', sessionId: 'new-session', sessionSurface: false, rightSlotItems }))
    await waitFor(() => expect(screen.queryByRole('button', { name: '显示额外输入控件' })).toBeNull())
    expect(view.container.querySelector('[data-dsh-composer-slot-overflow]')).toBeNull()
    notifyResize()
    fireEvent.pointerDown(screen.getByRole('button', { name: '模型' }))
    expect(screen.queryByRole('button', { name: '显示额外输入控件' })).toBeNull()
  })

  it('does not apply side-layout input sizing on the Hero page', async () => {
    measuredWidth = 1_000
    const view = heroFixture()
    await waitFor(() => {
      expect(view.container.querySelector('[data-dsh-composer-split-active]')).toBeNull()
    })
    expect(view.container.querySelector('[data-dsh-composer-side-max]')).toBeNull()
    expect(view.container.querySelector('[data-dsh-composer-split-pane]')).toBeNull()
  })

  it('keeps the recovery rail when a remembered side layout temporarily stacks', async () => {
    measuredWidth = 640
    const view = fixture()
    const recovery = await screen.findByRole('button', { name: /窗口过窄/ })
    fireEvent.click(recovery)
    expect(screen.getByRole('toolbar', { name: '输入区域布局' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '停靠到底部' })).toBeTruthy()
    expect((screen.getByRole('button', { name: /停靠到右侧/ }) as HTMLButtonElement).disabled).toBe(true)
    expect(view.container.querySelector('[data-dsh-composer-split-active]')).toBeNull()
    expect(view.container.querySelector('[data-dsh-composer-split-pane]')).toBeNull()
  })

  it('restores the right divider as soon as both columns fit', async () => {
    measuredWidth = 680
    fixture()
    await waitFor(() => {
      expect(screen.getByRole('separator', { name: /调整输入区域宽度/ })).toBeTruthy()
    })
  })

  it('returns the host DOM to its native bottom layout below the breakpoint and reapplies the split after widening', async () => {
    measuredWidth = 1_000
    const view = fixture()
    const root = view.container.querySelector<HTMLElement>('[data-phase="active"]')
    const composer = view.container.querySelector<HTMLElement>('[data-composer-seat]')
    const body = composer?.parentElement
    const chat = view.container.querySelector<HTMLElement>('[data-testid="chat"]')
    if (root === null || body === null || chat === null || composer === null) throw new Error('fixture layout is missing')

    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(root.dataset.dshComposerSplitActive).toBe('true')
    expect(body.hasAttribute('data-conversation-scroll')).toBe(true)
    expect(chat.hasAttribute('data-conversation-scroll')).toBe(false)
    expect(composer.dataset.dshComposerSplitPane).toBe('')

    measuredWidth = 640
    notifyResize()
    await screen.findByRole('button', { name: /窗口过窄/ })
    expect(root.dataset.dshComposerSplitActive).toBeUndefined()
    expect(root.style.getPropertyValue('--dsh-composer-split-width')).toBe('')
    expect(body.hasAttribute('data-conversation-scroll')).toBe(true)
    expect(chat.hasAttribute('data-conversation-scroll')).toBe(false)
    expect(composer.dataset.dshComposerSplitPane).toBeUndefined()

    measuredWidth = 1_000
    notifyResize()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(root.dataset.dshComposerSplitActive).toBe('true')
    expect(body.hasAttribute('data-conversation-scroll')).toBe(true)
    expect(chat.hasAttribute('data-conversation-scroll')).toBe(false)
    expect(composer.dataset.dshComposerSplitPane).toBe('')
  })

  it('installs a remembered right layout when DSH mounts the session surface after the Composer', async () => {
    measuredWidth = 1_000
    const view = fixture({ sessionSurface: false })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(view.container.querySelector('[data-dsh-composer-split-active]')).toBeNull()

    view.rerender(activeFixture({ sessionSurface: true }))
    await waitFor(() => {
      expect(view.container.querySelector('[data-dsh-composer-split-active]')).not.toBeNull()
      expect(view.container.querySelector('[data-dsh-composer-split-pane]')).not.toBeNull()
      const root = view.container.querySelector<HTMLElement>('[data-dsh-composer-split-active]')
      expect(root?.style.getPropertyValue('--dsh-composer-pane-height')).toBe('800px')
      expect(root?.style.getPropertyValue('--dsh-composer-pane-left')).not.toBe('')
    })
  })

  it('reapplies shared placement settings and marks the new session surface without a resize', async () => {
    measuredWidth = 1_000
    const sharedSettings = settings('right')
    const view = fixture({ sessionId: 'session-a', settings: sharedSettings })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const firstChat = view.container.querySelector('[data-testid="chat"]')

    view.rerender(activeFixture({ sessionId: 'session-b', settings: sharedSettings }))
    await waitFor(() => {
      expect(screen.queryByRole('separator', { name: /调整输入区域宽度/ })).not.toBeNull()
      const nextChat = view.container.querySelector('[data-testid="chat"]')
      expect(nextChat).not.toBe(firstChat)
      expect(nextChat?.hasAttribute('data-dsh-composer-split-chat')).toBe(true)
    })
  })

  it('preserves the native scroll owner, position, and event stream in side layout', async () => {
    measuredWidth = 1_000
    const view = fixture({ settings: settings('bottom') })
    const body = view.container.querySelector<HTMLElement>('[data-conversation-scroll]')
    const chat = view.getByTestId('chat')
    if (body === null) throw new Error('fixture scroll owner is missing')
    body.scrollTop = 240
    let bodyEvents = 0
    body.addEventListener('scroll', () => { bodyEvents += 1 })
    fireEvent.click(await screen.findByRole('button', { name: '打开输入区域布局菜单' }))
    fireEvent.click(await screen.findByRole('button', { name: '停靠到右侧' }))
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(view.container.querySelector('[data-conversation-scroll]')).toBe(body)
    expect(body.scrollTop).toBe(240)
    fireEvent.scroll(chat)
    expect(bodyEvents).toBe(0)
    fireEvent.scroll(body)
    expect(bodyEvents).toBe(1)
  })

  it('keeps a divider drag inside the shared Composer and Chat width limits', async () => {
    measuredWidth = 1_000
    const view = fixture()
    const separator = await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const root = view.container.querySelector<HTMLElement>('[data-phase="active"]')
    if (root === null) throw new Error('fixture root is missing')
    Object.assign(separator, {
      setPointerCapture: () => {},
      hasPointerCapture: () => true,
      releasePointerCapture: () => {},
    })

    fireEvent(separator, pointerEvent('pointerdown', 500))
    fireEvent(separator, pointerEvent('pointermove', -1_000))
    expect(separator.getAttribute('aria-valuenow')).toBe('680')
    expect(root.style.getPropertyValue('--dsh-composer-split-width')).toBe('680px')

    fireEvent(separator, pointerEvent('pointermove', 2_000))
    expect(separator.getAttribute('aria-valuenow')).toBe('360')
    expect(root.style.getPropertyValue('--dsh-composer-split-width')).toBe('360px')
  })

  it('dismisses a slash list before another side-layout popup opens', async () => {
    measuredWidth = 1_000
    const dismiss = vi.fn()
    fixture({ dismissInputTrigger: dismiss })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    fireEvent.pointerDown(screen.getByRole('button', { name: '模型' }))
    expect(dismiss).toHaveBeenCalledTimes(1)
    fireEvent.pointerDown(screen.getByRole('button', { name: '命令' }))
    expect(dismiss).toHaveBeenCalledTimes(1)
  })

  it('closes a candidate list for every non-candidate Composer popup in the side layout', async () => {
    measuredWidth = 1_000
    const dismiss = vi.fn()
    const view = fixture({ dismissInputTrigger: dismiss })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const composer = view.container.querySelector<HTMLElement>('[data-composer-card]')
    if (composer === null) throw new Error('fixture Composer card is missing')
    const access = document.createElement('button')
    access.type = 'button'
    access.setAttribute('aria-label', '访问模式')
    access.setAttribute('aria-haspopup', 'menu')
    composer.appendChild(access)

    fireEvent.pointerDown(access)
    expect(dismiss).toHaveBeenCalledTimes(1)
  })

  it('does not replace native input gestures with a blank-area focus proxy', async () => {
    measuredWidth = 1_000
    fixture()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const input = screen.getByRole('textbox', { name: '给智能体发消息' })
    const blankArea = input.parentElement
    if (blankArea === null) throw new Error('fixture input scroll area is missing')
    const pointerDown = createEvent.pointerDown(blankArea, { button: 0 })
    fireEvent(blankArea, pointerDown)
    expect(pointerDown.defaultPrevented).toBe(false)
    expect(document.activeElement).not.toBe(input)
  })

  it('leaves native pointer gestures on the right-side contenteditable untouched', async () => {
    measuredWidth = 1_000
    fixture()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const input = screen.getByRole('textbox', { name: '给智能体发消息' })
    const pointerDown = createEvent.pointerDown(input, { button: 0 })
    fireEvent(input, pointerDown)
    expect(pointerDown.defaultPrevented).toBe(false)
  })

  it('collects extra right-slot controls behind a model-adjacent overflow trigger in the side layout', async () => {
    measuredWidth = 1_000
    const view = fixture({
      rightSlotItems: <>
        <button type="button" aria-label="加速">加速</button>
        <button type="button" aria-label="额度">额度</button>
        <span role="status" aria-label="本周额度"><span data-testid="quota-bar" /></span>
      </>,
    })
    const trigger = await screen.findByRole('button', { name: '显示额外输入控件' })
    const trailing = view.getByTestId('input-trailing')
    expect(trigger.parentElement).toBe(trailing)
    expect(trigger.className).toContain('slotOverflowTrigger')
    const slot = trailing.querySelector<HTMLElement>('[data-slot="conversation.input.right"]')
    expect(slot?.dataset.dshComposerSlotOverflow).toBe('')

    fireEvent.click(trigger)
    await waitFor(() => { expect(slot?.dataset.dshComposerSlotOverflowOpen).toBe('') })
    expect(screen.getByRole('button', { name: '加速' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '额度' })).toBeTruthy()
    expect(screen.getByRole('status', { name: '本周额度' })).toBeTruthy()

    fireEvent.pointerDown(document.body)
    await waitFor(() => {
      expect(slot?.dataset.dshComposerSlotOverflowOpen).toBeUndefined()
      expect(slot?.dataset.dshComposerSlotOverflow).toBe('')
    })
  })

  it.each(['right', 'bottom'] as const)('uses a native menu surface without replacing %s overflow controls', async placement => {
    measuredWidth = 1_000
    const onAction = vi.fn()
    const view = fixture({
      settings: settings(placement),
      rightSlotItems: <><button type="button" onClick={onAction}>任务控制</button><span role="status">7d</span></>,
    })
    const action = screen.getByRole('button', { name: '任务控制' })
    const status = screen.getByRole('status')
    const trigger = await screen.findByRole('button', { name: '显示额外输入控件' })
    const slot = action.closest('[data-slot="conversation.input.right"]')
    fireEvent.click(trigger)
    expect(slot?.querySelector('[data-dsh-composer-overflow-surface]')).not.toBeNull()
    notifyResize()
    expect(screen.getByRole('button', { name: '任务控制' })).toBe(action)
    expect(screen.getByRole('status')).toBe(status)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => { expect(slot?.querySelector('[data-dsh-composer-overflow-surface]')).toBeNull() })
    expect(document.activeElement).toBe(trigger)
    view.unmount()
    expect(document.querySelector('[data-dsh-composer-overflow-surface]')).toBeNull()
  })

  it('keeps third-party right-slot controls visible when the native toolbar has enough width', async () => {
    measuredWidth = 1_000
    trailingWidth = 500
    const view = fixture({
      rightSlotItems: <button type="button" aria-label="额度">额度</button>,
    })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const trailing = view.getByTestId('input-trailing')
    const slot = trailing.querySelector<HTMLElement>('[data-slot="conversation.input.right"]')
    expect(screen.queryByRole('button', { name: '显示额外输入控件' })).toBeNull()
    expect(slot?.dataset.dshComposerSlotOverflow).toBeUndefined()
    expect(screen.getByRole('button', { name: '额度' })).toBeTruthy()
  })

  it('folds overflowing third-party controls in bottom layout without remounting them', async () => {
    measuredWidth = 1_000
    fixture({
      settings: settings('bottom'),
      rightSlotItems: <button type="button" aria-label="额度">额度</button>,
    })
    await screen.findByRole('button', { name: '打开输入区域布局菜单' })
    const quota = screen.getByRole('button', { name: '额度' })
    const trigger = await screen.findByRole('button', { name: '显示额外输入控件' })
    expect(quota.closest('[data-slot="conversation.input.right"]')?.dataset.dshComposerSlotOverflow).toBe('')
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: '额度' })).toBe(quota)
    expect(quota.closest('[data-slot="conversation.input.right"]')?.dataset.dshComposerSlotOverflowOpen).toBe('')
  })

  it('records an explicit dock choice for the current session', async () => {
    measuredWidth = 1_000
    fixture({ settings: settings('bottom') })
    await screen.findByRole('button', { name: '打开输入区域布局菜单' })
    fireEvent.click(screen.getByRole('button', { name: '打开输入区域布局菜单' }))
    await screen.findByRole('toolbar', { name: '输入区域布局' })
    fireEvent.click(screen.getByRole('button', { name: '停靠到右侧' }))
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(JSON.parse(localStorage.getItem('dsh.composer-split.session-layouts') ?? '{}')).toEqual({
      'session-a': { placement: 'right' },
    })
  })

  it('recomputes automatic placement when only the main-area height changes', async () => {
    measuredWidth = 1_000
    const view = fixture({ settings: settings('auto') })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    measuredHeight = 1_200
    notifyResize()
    await waitFor(() => expect(view.container.querySelector('[data-dsh-composer-split-active]')).toBeNull())
    measuredHeight = 800
    notifyResize()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(localStorage.getItem('dsh.composer-split.session-layouts')).toBeNull()
  })

  it('records automatic placement for the current session', async () => {
    measuredWidth = 1_000
    fixture({ settings: settings('bottom') })
    fireEvent.click(await screen.findByRole('button', { name: '打开输入区域布局菜单' }))
    fireEvent.click(await screen.findByRole('button', { name: /自动选择布局/ }))
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    expect(JSON.parse(localStorage.getItem('dsh.composer-split.session-layouts') ?? '{}')).toEqual({
      'session-a': { placement: 'auto' },
    })
  })

  it('explains why the right-side action is unavailable in a narrow main area', async () => {
    measuredWidth = 640
    fixture()
    fireEvent.click(await screen.findByRole('button', { name: /窗口过窄/ }))
    const right = screen.getByRole('button', { name: /停靠到右侧/ })
    expect((right as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('至少 680px')).toBeTruthy()
  })

  it('shows a concise hint for each layout option', async () => {
    measuredWidth = 1_000
    fixture({ settings: settings('bottom') })
    fireEvent.click(await screen.findByRole('button', { name: '打开输入区域布局菜单' }))

    const bottom = screen.getByRole('button', { name: '停靠到底部' })
    fireEvent.mouseEnter(bottom)
    expect(screen.getByRole('tooltip').textContent).toBe('固定在底部')

    const right = screen.getByRole('button', { name: '停靠到右侧' })
    fireEvent.mouseEnter(right)
    expect(screen.getByRole('tooltip').textContent).toBe('固定在右侧')

    const automatic = screen.getByRole('button', { name: /自动选择布局/ })
    fireEvent.mouseEnter(automatic)
    expect(screen.getByRole('tooltip').textContent).toBe('宽幅靠右，窄幅靠下')
    expect(automatic.querySelector('svg')).not.toBeNull()
    expect(automatic.textContent).toBe('')
  })

  it('restores each session placement when the mounted conversation changes', async () => {
    localStorage.setItem('dsh.composer-split.session-layouts', JSON.stringify({
      'session-a': { placement: 'right' },
      'session-b': { placement: 'bottom' },
    }))
    measuredWidth = 1_000
    const view = fixture({ sessionId: 'session-a' })
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })

    view.rerender(activeFixture({ sessionId: 'session-b' }))
    await screen.findByRole('button', { name: '打开输入区域布局菜单' })
    expect(screen.queryByRole('separator', { name: /调整输入区域宽度/ })).toBeNull()

    view.rerender(activeFixture({ sessionId: 'session-a' }))
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
  })

  it('leaves the native bottom layout alone', async () => {
    measuredWidth = 1_000
    const dismiss = vi.fn()
    fixture({ settings: settings('bottom'), dismissInputTrigger: dismiss })
    await screen.findByRole('button', { name: '打开输入区域布局菜单' })
    fireEvent.pointerDown(screen.getByRole('button', { name: '模型' }))
    expect(dismiss).not.toHaveBeenCalled()
    const input = screen.getByRole('textbox', { name: '给智能体发消息' })
    const blankArea = input.parentElement
    if (blankArea === null) throw new Error('fixture input scroll area is missing')
    fireEvent.pointerDown(blankArea, { button: 0 })
    expect(document.activeElement).not.toBe(input)
  })
})
