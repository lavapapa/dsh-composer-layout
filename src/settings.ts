import z from '@deepseek-ai/schemastery'

export const COMPOSER_LAYOUT_SETTINGS_NAMESPACE = 'ui-composer-split'
export const COMPOSER_LAYOUT_DEFAULTS = {
  defaultPlacement: 'bottom',
  rememberPlacement: true,
  bottomHandleHoverOnly: false,
  defaultWidthPreset: 'medium',
} as const

export type ComposerLayoutPlacement = 'bottom' | 'right'
export type ComposerLayoutWidthPreset = 'narrow' | 'medium' | 'wide'

export interface ComposerLayoutSettings {
  defaultPlacement: ComposerLayoutPlacement
  rememberPlacement: boolean
  bottomHandleHoverOnly: boolean
  defaultWidthPreset: ComposerLayoutWidthPreset
}

export const ComposerLayoutSettingsSchema: z<ComposerLayoutSettings> = z.object({
  defaultPlacement: z.union(['bottom', 'right']).default(COMPOSER_LAYOUT_DEFAULTS.defaultPlacement),
  rememberPlacement: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.rememberPlacement),
  bottomHandleHoverOnly: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.bottomHandleHoverOnly),
  defaultWidthPreset: z.union(['narrow', 'medium', 'wide']).default(COMPOSER_LAYOUT_DEFAULTS.defaultWidthPreset),
})
