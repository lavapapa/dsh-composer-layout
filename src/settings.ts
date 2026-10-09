import z from '@deepseek-ai/schemastery'

export const COMPOSER_LAYOUT_SETTINGS_NAMESPACE = 'ui-composer-layout'
export const COMPOSER_LAYOUT_DEFAULTS = {
  defaultPlacement: 'bottom',
  autoThreshold: 1,
  rememberPlacement: true,
  bottomHandleHoverOnly: false,
  defaultWidthPreset: 'medium',
} as const

export type ComposerLayoutPlacement = 'bottom' | 'right' | 'auto'
export type ComposerLayoutWidthPreset = 'narrow' | 'medium' | 'wide'

export interface ComposerLayoutSettings {
  defaultPlacement: ComposerLayoutPlacement
  autoThreshold: number
  rememberPlacement: boolean
  bottomHandleHoverOnly: boolean
  defaultWidthPreset: ComposerLayoutWidthPreset
}

export const ComposerLayoutSettingsSchema = z.object({
  defaultPlacement: z.union(['bottom', 'right', 'auto']).default(COMPOSER_LAYOUT_DEFAULTS.defaultPlacement),
  autoThreshold: z.number().min(0.5).max(2).step(0.05).default(COMPOSER_LAYOUT_DEFAULTS.autoThreshold),
  rememberPlacement: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.rememberPlacement),
  bottomHandleHoverOnly: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.bottomHandleHoverOnly),
  defaultWidthPreset: z.union(['narrow', 'medium', 'wide']).default(COMPOSER_LAYOUT_DEFAULTS.defaultWidthPreset),
}).volatile()
