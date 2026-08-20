/** Standalone Chat/Composer split-layout browser plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import {
  ComposerSplitAction,
  type ComposerSplitInjected,
} from './ComposerSplitAction.tsx'
import { ComposerLayoutSettingsTab } from './ComposerLayoutSettingsTab.tsx'
import { composerLayoutLocale } from './locale.ts'
import type { ComposerLayoutLocaleKey } from './locale.ts'
import { COMPOSER_LAYOUT_SETTINGS_NAMESPACE, type ComposerLayoutSettings } from '../settings.ts'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Settings copy owned by the Composer layout plugin. */
    'settings.composerLayout': ComposerLayoutLocaleKey
  }
}

/** Required client services. Layout ownership stays inside this standalone plugin. */
export const inject = ['slots', 'sessions', 'inputTriggers']

/** Register the Composer-card hover controls. */
const fallbackSettings: SettingsScope<ComposerLayoutSettings> = {
  getSnapshot: () => ({ status: 'unavailable', value: undefined, base: undefined, user: undefined, revision: undefined, writable: false, mode: 'memory' }),
  subscribe: () => () => {},
  set: async () => {},
  unset: async () => {},
}

export function apply(ctx: ClientContext): void {
  const settingsService = ctx.get('settingsScope') as { bind: <T>(spec: { namespace: string }) => SettingsScope<T> } | undefined
  const settings = settingsService !== undefined && ctx.get('connection') !== undefined && ctx.get('remote') !== undefined
    ? settingsService.bind<ComposerLayoutSettings>({ namespace: COMPOSER_LAYOUT_SETTINGS_NAMESPACE })
    : fallbackSettings
  const locale = ctx.get('locale') as { register: (namespace: string, dictionaries: unknown) => () => void; bind: (namespace: string) => (key: string) => string } | undefined
  if (locale !== undefined) {
    ctx.effect(() => locale.register('settings.composerLayout', composerLayoutLocale), 'composer-layout: settings locale')
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
      name: 'settings.plugins.tab',
      id: 'composer-layout',
      order: 20,
      label: () => locale.bind('settings.composerLayout')('tab'),
      locale: 'settings.composerLayout',
      inject: (): { settings: SettingsScope<ComposerLayoutSettings> } => ({ settings }),
    }, ComposerLayoutSettingsTab))
  }
  ctx.inject(['slots', 'sessions', 'inputTriggers'], (scope: ClientContext) => {
    const { sessions, inputTriggers } = scope
    scope.slots.inject(
      'conversation.input.overlay',
      () => {
        const disposeEntry = scope.slots.register({
          name: 'conversation.input.overlay',
          id: 'composer-layout-controls',
          order: 30,
          inject: (sessionId): ComposerSplitInjected => ({
            settings,
            dismissInputTrigger: () => {
              const session = sessions.scope(sessionId)
              if (session !== undefined) inputTriggers.sessionOf(session).dismiss()
            },
          }),
        }, ComposerSplitAction)
        return disposeEntry
      },
    )
  })
}
