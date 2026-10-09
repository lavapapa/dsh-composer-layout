/** Host plugin whose live Config fields back the Composer layout settings page. */
import { ComposerLayoutSettingsSchema } from './settings.ts'

export const name = 'composer-layout'
export const Config = ComposerLayoutSettingsSchema
export function apply(): void {}
