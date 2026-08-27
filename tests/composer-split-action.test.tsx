import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ComposerSplitAction, type ComposerSplitActionProps } from '../src/client/ComposerSplitAction.tsx'

let measuredWidth = 1_000
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
    const body = this.hasAttribute('data-conversation-scroll') || this.hasAttribute('data-dsh-composer-split-body')
    const width = body ? measuredWidth : 100
    return {
      x: 0, y: 0, top: 0, left: 0, right: width, bottom: 800,
      width, height: 800, toJSON: () => ({}),
    }
  })
  localStorage.clear()
  resizeCallbacks.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function settings(defaultPlacement: 'bottom' | 'right') {
  const snapshot = {
    status: 'ready' as const,
    value: {
      defaultPlacement,
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

function activeFixture(props: Partial<ComposerSplitActionProps> = {}) {
  const {
    sessionId = 'session-a',
    settings: suppliedSettings,
    ...actionProps
  } = props
  return (
    <div data-phase="active">
      <div data-conversation-scroll="">
        <div data-slot="conversation.session"><div data-testid="chat" /></div>
        <div data-composer-seat="">
          <div data-composer-card="">
            <div data-input-scroll="">
              <textarea aria-label="给智能体发消息" />
            </div>
            <button type="button" aria-label="模型" aria-haspopup="menu">模型</button>
            <button type="button" aria-label="命令" aria-haspopup="listbox">命令</button>
            <ComposerSplitAction sessionId={sessionId} settings={suppliedSettings ?? settings('right')} {...actionProps} />
          </div>
        </div>
      </div>
    </div>,
  )
}

function fixture(props: Partial<ComposerSplitActionProps> = {}) {
  return render(activeFixture(props))
}

function heroFixture() {
  return render(
    <div data-phase="hero">
      <div data-conversation-scroll="">
        <div data-composer-seat="">
          <div data-composer-card="">
            <div data-input-scroll="">
              <textarea aria-label="给智能体发消息" />
            </div>
            <ComposerSplitAction sessionId="new-session" settings={settings('right')} />
          </div>
        </div>
      </div>
    </div>,
  )
}

describe('ComposerSplitAction', () => {
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
    expect(screen.getByRole('button', { name: '停靠到右侧' }).disabled).toBe(true)
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
    expect(body.hasAttribute('data-conversation-scroll')).toBe(false)
    expect(chat.hasAttribute('data-conversation-scroll')).toBe(true)
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
    expect(body.hasAttribute('data-conversation-scroll')).toBe(false)
    expect(chat.hasAttribute('data-conversation-scroll')).toBe(true)
    expect(composer.dataset.dshComposerSplitPane).toBe('')
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

  it('focuses the draft when its right-side blank scroll area is clicked', async () => {
    measuredWidth = 1_000
    fixture()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const input = screen.getByRole('textbox', { name: '给智能体发消息' })
    const blankArea = input.parentElement
    if (blankArea === null) throw new Error('fixture input scroll area is missing')
    fireEvent.pointerDown(blankArea, { button: 0 })
    expect(document.activeElement).toBe(input)
  })

  it('leaves native pointer gestures on the right-side textarea untouched', async () => {
    measuredWidth = 1_000
    fixture()
    await screen.findByRole('separator', { name: /调整输入区域宽度/ })
    const input = screen.getByRole('textbox', { name: '给智能体发消息' })
    const pointerDown = createEvent.pointerDown(input, { button: 0 })
    fireEvent(input, pointerDown)
    expect(pointerDown.defaultPrevented).toBe(false)
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
