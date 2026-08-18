/** Optional Chat/Composer split-layout browser plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
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

interface NativeConversationLayout {
  register(spec: { composerPlacement: 'inline-end' }): () => void
}

/** Required client services. The native layout service stays optional for old DSH builds. */
export const inject = ['slots']

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
  ctx.slots.inject(
    'conversation.input.overlay',
    () => {
      let releasePlacement: (() => void) | undefined
      const nativeLayout = (): NativeConversationLayout | undefined =>
        ctx.get('conversationLayout') as NativeConversationLayout | undefined
      const setNativeSplit = (active: boolean): void => {
        releasePlacement?.()
        releasePlacement = undefined
        const native = nativeLayout()
        if (active && native !== undefined) {
          releasePlacement = native.register({ composerPlacement: 'inline-end' })
        }
      }
      const disposeEntry = ctx.slots.register({
        name: 'conversation.input.overlay',
        id: 'composer-layout-controls',
        order: 30,
        inject: (): ComposerSplitInjected => ({
          nativeAvailable: nativeLayout() !== undefined,
          setNativeSplit,
          settings,
        }),
      }, ComposerSplitAction)
      return () => {
        disposeEntry()
        setNativeSplit(false)
      }
    },
  )
}
