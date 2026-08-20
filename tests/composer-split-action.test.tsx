import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
            <button type="button" aria-label="模型" aria-haspopup="menu">模型</button>
            <button type="button" aria-label="命令" aria-haspopup="listbox">命令</button>
            <ComposerSplitAction sessionId="session-a" settings={settings('right')} {...props} />
          </div>
        </div>
      </div>
    </div>,
  )
}

describe('ComposerSplitAction', () => {
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

  it('leaves the native bottom layout alone', async () => {
    measuredWidth = 1_000
    const dismiss = vi.fn()
    fixture({ settings: settings('bottom'), dismissInputTrigger: dismiss })
    await screen.findByRole('button', { name: '打开输入区域布局菜单' })
    fireEvent.pointerDown(screen.getByRole('button', { name: '模型' }))
    expect(dismiss).not.toHaveBeenCalled()
  })
})
