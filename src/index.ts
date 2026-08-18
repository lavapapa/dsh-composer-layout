/** Host plugin that registers the Composer layout settings namespace. */
import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

const schema = z.object({
  defaultPlacement: z.union(['bottom', 'right']).default('bottom'),
  rememberPlacement: z.boolean().default(true),
  bottomHandleHoverOnly: z.boolean().default(false),
  defaultWidthPreset: z.union(['narrow', 'medium', 'wide']).default('medium'),
})

export default function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace('ui-composer-split'), schema)
  })
}
