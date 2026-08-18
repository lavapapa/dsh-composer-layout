import z from '@deepseek-ai/schemastery';
export declare const COMPOSER_LAYOUT_SETTINGS_NAMESPACE = "ui-composer-split";
export declare const COMPOSER_LAYOUT_DEFAULTS: {
    readonly defaultPlacement: "bottom";
    readonly rememberPlacement: true;
    readonly bottomHandleHoverOnly: false;
    readonly defaultWidthPreset: "medium";
};
export type ComposerLayoutPlacement = 'bottom' | 'right';
export type ComposerLayoutWidthPreset = 'narrow' | 'medium' | 'wide';
export interface ComposerLayoutSettings {
    defaultPlacement: ComposerLayoutPlacement;
    rememberPlacement: boolean;
    bottomHandleHoverOnly: boolean;
    defaultWidthPreset: ComposerLayoutWidthPreset;
}
export declare const ComposerLayoutSettingsSchema: z<ComposerLayoutSettings>;
//# sourceMappingURL=settings.d.ts.map