//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `dsh-composer-layout`.
* @module dsh-composer-layout/invariant
*/
const PACKAGE_NAME = "dsh-composer-layout";
/** Cordis companion plugin name. */
const name = "composer-layout-bundle-invariant";
/** Service required before the companion can register. */
const inject = ["invariants"];
const install = () => {};
/** Register this package's empty runtime invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
