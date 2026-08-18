/** Package invariant companion for the optional Composer split layout. */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-composer-layout'

/** Cordis companion plugin name. */
export const name = 'composer-layout-invariant'
/** Service required to reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the package owns presentation-only layout state. Its
 * Slot contribution and fallback DOM adapter are covered by disposal tests.
 */
const install: InvariantInstaller = () => {}

/** Register the package invariant companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
