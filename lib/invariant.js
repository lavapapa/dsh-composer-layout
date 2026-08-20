// src/invariant.ts
var PACKAGE_NAME = "dsh-composer-layout";
var name = "composer-layout-invariant";
var inject = ["invariants"];
var install = () => {
};
var apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
export {
  apply,
  inject,
  name
};
