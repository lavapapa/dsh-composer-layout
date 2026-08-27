# Composer Layout release contract

This document defines the current product behavior and the evidence required before publishing a version. It intentionally describes the released plugin, not earlier experiments or features that were removed.

## Current scope

The plugin owns presentation and interaction around the DSH Composer. It does not alter model requests, session content, permissions, token accounting, or host-side conversation behavior.

| Area | Released behavior | Required evidence |
| --- | --- | --- |
| Placement | Composer can remain at the bottom or dock to the right. The configured default applies to a new session; with session memory enabled, a session keeps its own placement and width. | Settings check and session-switch check in a real browser. |
| Responsive layout | Right docking is available only when Chat and Composer can both keep their minimum usable width. Below that threshold the plugin removes its split adapter and hands the Composer back to DSH's normal bottom layout; the recovery rail remains available, the Right choice is disabled, and the side layout returns when width is restored. | `layout-policy` tests, component fallback check, and narrow-to-wide browser check. |
| Width control | The visible divider resizes the right pane only within the shared Chat/Composer bounds. The divider cannot leave the Composer pane at either limit. This is still a released feature and must remain covered until it is deliberately removed from code and documentation. | `layout-policy` tests and min/max drag check in a real browser. |
| Reading and drafting | Chat and a long right-side draft scroll independently. With a short draft, the native textarea fills the visible right-side input surface, so clicking, multi-click selection, and drag selection work in unused space without scrolling Chat or changing the draft. | Component focus test plus short- and long-draft browser checks. |
| Composer popups | In the right layout, slash and reference candidates stay inside the pane. Opening another Composer popup closes those candidates first; the normal bottom Composer keeps DSH's native popup behavior. | Component popup test plus slash, reference, model, access, and context checks in a real browser. |
| Host boundary | The plugin uses the current DSH Web Composer structure only. It does not maintain a compatibility path for obsolete host layouts and does not change DSH's own bottom layout or the Home Hero input. | Current-version compatibility check plus Hero and bottom-layout regression checks. |

## Required checks for every update

Run the following from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm test:dsh-compat
```

`pnpm test` covers the responsive width policy and plugin interaction contract. `pnpm test:dsh-compat` packs the exact working tree, installs that tarball into a fresh DSH Web profile, starts DSH, and confirms that the browser loads the plugin. Its default target is the supported DSH version; set `DSH_VERSION=latest` to check the newest published DSH package. The scheduled GitHub workflow runs that latest-version check weekly.

Before a release, also complete this short real-browser pass against the intended DSH version:

1. Open a fresh session, switch between Bottom and Right, then switch sessions to verify the saved session layout behaves as configured.
2. In Right, drag the divider to both limits and back. Confirm both columns remain visible and the handle stays inside the Composer pane.
3. Resize below the two-column threshold. Confirm the temporary stacked view keeps DSH's normal visible bottom Composer and a disabled Right action; resize back and confirm Right restores automatically.
4. With a short Right-side draft, click and multi-click unused input space, then drag a selection; confirm the native textarea handles those gestures. Enter a multi-line draft, scroll it, and confirm Chat does not move.
5. Trigger `/` and `@`, then open model, access, and context popups. Confirm candidates close before the other popup opens and every menu stays inside the right pane, including at a short window height.
6. Open the Home Hero with both Bottom and Right selected as the default placement. Confirm the input keeps the same native height in both cases; the Hero never becomes a split pane.
7. Return to Bottom and confirm the plugin no longer changes DSH's normal input-trigger behavior.

Record the DSH version, plugin version, and the result of this browser pass in the release notes or pull request. A failed DSH host test that does not load this plugin is an upstream test issue; it must be reported separately rather than treated as a Composer Layout regression.
