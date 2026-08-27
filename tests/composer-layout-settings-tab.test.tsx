import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ComposerLayoutSettingsTab } from '../src/client/ComposerLayoutSettingsTab.tsx'
import { composerLayoutLocale, type ComposerLayoutLocaleKey } from '../src/client/locale.ts'

afterEach(cleanup)

const snapshot = {
  status: 'ready' as const,
  value: undefined,
  base: undefined,
  user: undefined,
  revision: 1,
  writable: true,
  mode: 'host' as const,
}

const settings = {
  getSnapshot: () => snapshot,
  subscribe: () => () => {},
  set: async () => {},
  unset: async () => {},
}

function renderTab(language: 'en' | 'zh') {
  const dictionary = composerLayoutLocale[language]
  return render(
    <ComposerLayoutSettingsTab
      settings={settings}
      t={(key: ComposerLayoutLocaleKey) => dictionary[key]}
    />,
  )
}

describe('ComposerLayoutSettingsTab', () => {
  it('shows the compact English guide in plugin settings', () => {
    renderTab('en')
    const guide = screen.getByRole('img', { name: composerLayoutLocale.en.guideAlt })
    expect(guide.getAttribute('src')).toBe('/assets/screenshots/layout-guide-en.webp')
  })

  it('switches the guide with the plugin locale', () => {
    renderTab('zh')
    expect(screen.getByRole('img', { name: composerLayoutLocale.zh.guideAlt })).toBeTruthy()
  })
})
