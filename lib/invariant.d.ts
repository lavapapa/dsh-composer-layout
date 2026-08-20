import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "composer-layout-invariant";
/** Service required to reserve package ownership. */
export declare const inject: string[];
/** Register the package invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
