import { useState, useSyncExternalStore } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type { ComposerLayoutSettings } from '../settings.ts'
import { COMPOSER_LAYOUT_DEFAULTS } from '../settings.ts'
import { readLocalSettings, writeLocalSetting } from './settings-storage.ts'
import css from './ComposerLayoutSettingsTab.module.css'
import guideEn from '../../assets/screenshots/layout-guide-en.webp'
import guideZh from '../../assets/screenshots/layout-guide-zh.webp'

export interface ComposerLayoutSettingsInjected {
  settings: SettingsScope<ComposerLayoutSettings>
}

type Props = PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.composerLayout'>
  & ComposerLayoutSettingsInjected

const unavailableSnapshot = { status: 'unavailable' as const, value: undefined, base: undefined, user: undefined, revision: undefined, writable: false, mode: 'memory' as const }
const unavailableSettings: SettingsScope<ComposerLayoutSettings> = {
  getSnapshot: () => unavailableSnapshot,
  subscribe: () => () => {},
  set: async () => {},
  unset: async () => {},
}

export function ComposerLayoutSettingsTab({ t, settings }: Props) {
  const effectiveSettings = settings ?? unavailableSettings
  const snapshot = useSyncExternalStore(
    effectiveSettings.subscribe.bind(effectiveSettings),
    effectiveSettings.getSnapshot.bind(effectiveSettings),
  )
  const translate = typeof t === 'function' ? t : ((key: string) => key)
  const guide = translate('guideLocale') === 'zh' ? guideZh : guideEn
  const [localOverrides, setLocalOverrides] = useState<Partial<ComposerLayoutSettings>>(readLocalSettings)
  const value = {
    ...COMPOSER_LAYOUT_DEFAULTS,
    ...(snapshot.value ?? {}),
    ...localOverrides,
  }
  const set = <K extends keyof ComposerLayoutSettings>(field: K, next: ComposerLayoutSettings[K]): void => {
    writeLocalSetting(field, next)
    setLocalOverrides(current => ({ ...current, [field]: next }))
    void settings.set(field, next)
  }

  return (
    <section className={css.root} aria-label={translate('title')}>
      <div className={css.intro}>
        <h2>{translate('title')}</h2>
        <p>{translate('description')}</p>
      </div>
      <figure className={css.guide}>
        <img src={guide} alt={translate('guideAlt')} />
      </figure>
      <label className={css.row}>
        <span>
          <strong>{translate('defaultPlacement')}</strong>
          <small>{translate('defaultPlacementHint')}</small>
        </span>
        <select
          value={value.defaultPlacement}
          disabled={!snapshot.writable}
          onChange={event => set('defaultPlacement', event.currentTarget.value as ComposerLayoutSettings['defaultPlacement'])}
        >
          <option value="bottom">{translate('bottom')}</option>
          <option value="right">{translate('right')}</option>
        </select>
      </label>
      <label className={css.row}>
        <span>
          <strong>{translate('rememberPlacement')}</strong>
          <small>{translate('rememberPlacementHint')}</small>
        </span>
        <input
          type="checkbox"
          checked={value.rememberPlacement}
          disabled={!snapshot.writable}
          onChange={event => set('rememberPlacement', event.currentTarget.checked)}
        />
      </label>
      <label className={css.row}>
        <span>
          <strong>{translate('bottomHandleHoverOnly')}</strong>
          <small>{translate('bottomHandleHoverOnlyHint')}</small>
        </span>
        <input
          type="checkbox"
          checked={value.bottomHandleHoverOnly}
          disabled={!snapshot.writable}
          onChange={event => set('bottomHandleHoverOnly', event.currentTarget.checked)}
        />
      </label>
      <label className={css.row}>
        <span>
          <strong>{translate('defaultWidthPreset')}</strong>
          <small>{translate('defaultWidthPresetHint')}</small>
        </span>
        <select
          value={value.defaultWidthPreset}
          disabled={!snapshot.writable}
          onChange={event => set('defaultWidthPreset', event.currentTarget.value as ComposerLayoutSettings['defaultWidthPreset'])}
        >
          <option value="narrow">{translate('narrow')}</option>
          <option value="medium">{translate('medium')}</option>
          <option value="wide">{translate('wide')}</option>
        </select>
      </label>
    </section>
  )
}
