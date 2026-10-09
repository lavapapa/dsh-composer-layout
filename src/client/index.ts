/** Standalone Chat/Composer split-layout browser plugin. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
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
export const inject = ['slots', 'sessions', 'inputTriggers', 'configForms', 'locale']

/** Register the Composer-card hover controls. */
export function apply(ctx: Context): void {
  const settings = ctx.configForms.get<ComposerLayoutSettings>(COMPOSER_LAYOUT_SETTINGS_NAMESPACE)
  ctx.effect(() => ctx.locale.register('settings.composerLayout', composerLayoutLocale), 'composer-layout: settings locale')
  ctx.effect(() => ctx.configForms.whileServed([COMPOSER_LAYOUT_SETTINGS_NAMESPACE], () => ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'composer-layout',
    order: 20,
    label: () => ctx.locale.bind('settings.composerLayout')('tab'),
    locale: 'settings.composerLayout',
    inject: (): { settings: ConfigForm<ComposerLayoutSettings> } => ({ settings }),
  }, ComposerLayoutSettingsTab))))
  ctx.inject(['slots', 'sessions', 'inputTriggers'], (scope: Context) => {
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
