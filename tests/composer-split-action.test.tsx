import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ComposerSplitAction, type ComposerSplitActionProps } from '../src/client/ComposerSplitAction.tsx'

let measuredWidth = 1_000

class ResizeObserverMock {
  observe(): void {}
  disconnect(): void {}
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

function fixture(props: Partial<ComposerSplitActionProps> = {}) {
  return render(
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
            <ComposerSplitAction sessionId="session-a" settings={settings('right')} {...props} />
          </div>
        </div>
      </div>
    </div>,
  )
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
    fixture()
    const recovery = await screen.findByRole('button', { name: /窗口过窄/ })
    fireEvent.click(recovery)
    expect(screen.getByRole('toolbar', { name: '输入区域布局' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '停靠到底部' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '停靠到右侧' }).disabled).toBe(true)
  })

  it('restores the right divider as soon as both columns fit', async () => {
    measuredWidth = 680
    fixture()
    await waitFor(() => {
      expect(screen.getByRole('separator', { name: /调整输入区域宽度/ })).toBeTruthy()
    })
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
