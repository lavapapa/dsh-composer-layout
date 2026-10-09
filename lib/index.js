// src/settings.ts
import z from "@deepseek-ai/schemastery";
var COMPOSER_LAYOUT_DEFAULTS = {
  defaultPlacement: "bottom",
  autoThreshold: 1,
  rememberPlacement: true,
  bottomHandleHoverOnly: false,
  defaultWidthPreset: "medium"
};
var ComposerLayoutSettingsSchema = z.object({
  defaultPlacement: z.union(["bottom", "right", "auto"]).default(COMPOSER_LAYOUT_DEFAULTS.defaultPlacement),
  autoThreshold: z.number().min(0.5).max(2).step(0.05).default(COMPOSER_LAYOUT_DEFAULTS.autoThreshold),
  rememberPlacement: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.rememberPlacement),
  bottomHandleHoverOnly: z.boolean().default(COMPOSER_LAYOUT_DEFAULTS.bottomHandleHoverOnly),
  defaultWidthPreset: z.union(["narrow", "medium", "wide"]).default(COMPOSER_LAYOUT_DEFAULTS.defaultWidthPreset)
}).volatile();

// src/index.ts
var name = "composer-layout";
var Config = ComposerLayoutSettingsSchema;
function apply() {
}
export {
  Config,
  apply,
  name
};
