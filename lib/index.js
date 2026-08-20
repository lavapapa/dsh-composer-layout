// src/index.ts
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
var schema = z.object({
  defaultPlacement: z.union(["bottom", "right"]).default("bottom"),
  rememberPlacement: z.boolean().default(true),
  bottomHandleHoverOnly: z.boolean().default(false),
  defaultWidthPreset: z.union(["narrow", "medium", "wide"]).default("medium")
});
function apply(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace("ui-composer-split"), schema);
  });
}
export {
  apply as default
};
