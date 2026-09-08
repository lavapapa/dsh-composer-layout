# Composer Layout release contract

This document defines the current product behavior and the evidence required before publishing a version. It intentionally describes the released plugin, not earlier experiments or features that were removed.

## Current scope

The plugin owns presentation and interaction around the DSH Composer. It does not alter model requests, session content, permissions, token accounting, or host-side conversation behavior.

| Area | Released behavior | Required evidence |
| --- | --- | --- |
| Placement | Bottom, Right, and Automatic are available. Automatic selects Right when the conversation main area's width-to-height ratio reaches the configured threshold (0.5–2, default 1) and both columns fit. The configured default applies to a new session; with session memory enabled, a session keeps its own preference and width. | Settings check, Automatic threshold check, and session-switch check in a real browser. |
| Responsive layout | Right docking is available only when Chat and Composer can both keep their minimum usable width. Below that threshold the plugin removes its split adapter and hands the Composer back to DSH's normal bottom layout; the recovery rail remains available, shifted left away from the Composer input border, the disabled Right choice explains the width requirement, and the side layout returns when width is restored (with Automatic also requiring its ratio threshold). | `layout-policy` tests, component fallback check, and narrow-to-wide browser check. |
| Width control | The visible divider resizes the right pane only within the shared Chat/Composer bounds. The divider cannot leave the Composer pane at either limit. This is still a released feature and must remain covered until it is deliberately removed from code and documentation. | `layout-policy` tests and min/max drag check in a real browser. |
| Reading and drafting | Chat and a long right-side draft scroll independently. The split adapter handles nested conversation scroll containers and bridges scroll events between the host container and Chat. With a short draft, the native textarea fills the visible right-side input surface, so clicking, multi-click selection, and drag selection work in unused space without scrolling Chat or changing the draft. | Component focus test plus short- and long-draft browser checks. |
| Composer popups | In the right layout, slash and reference candidates stay inside the pane. Opening another Composer popup closes those candidates first; third-party right-slot controls collapse into an ellipsis popup when space is limited. The normal bottom Composer keeps DSH's native popup behavior. | Component popup test plus slash, reference, model, access, context, and third-party overflow checks in a real browser. |
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

`pnpm test` covers the responsive width policy, per-session storage, DOM ownership while switching layouts, width clamping, popup interaction, blank-input focus, and the settings guide. `pnpm test:dsh-compat` packs the exact working tree, installs that tarball into a fresh DSH Web profile, starts DSH, and checks the real Home Hero, plugin settings, and an active conversation. It verifies Hero geometry at desktop and narrow widths, conversation split widths and resizing, Automatic placement, the disabled Right action, and scrolling after the layout has settled. A remembered Right preference must never turn the Hero into a split pane, clip its input, or create horizontal overflow. The workflow stores those browser screenshots as CI artifacts, so a geometry failure can be inspected visually. Its default target is the supported DSH version; set `DSH_VERSION=latest` to check the newest published DSH package. The scheduled GitHub workflow runs that latest-version check weekly.

| Test layer | Catches automatically | Leaves to a real browser pass |
| --- | --- | --- |
| Policy and storage tests | Breakpoint math, resize bounds, and one session leaking into another | Host-provided controls that the plugin does not own |
| Component tests | Installing and removing the split adapter, restoring DSH's original scroll owner, temporary narrow fallback, divider limits, popup dismissal, and draft focus behavior | Browser layout, scrolling, and native text-selection rendering |
| DSH compatibility browser test | Exact packed artifact installation, host startup, plugin loading, Hero geometry, settings, active-conversation split widths and resizing, Automatic placement, disabled Right action, narrow-to-wide restoration, and scrolling after layout settles | Real menus, long drafts, native text selection, and stream-end timing |
| Release browser pass | — | Active-session scrolling, drag-selection, popup positions, narrow-to-wide restore, and bottom-layout non-interference |

Before a release, also complete this short real-browser pass against the intended DSH version:

1. Open a fresh session, switch between Bottom, Right, and Automatic, check Automatic around its configured ratio threshold, then switch sessions to verify the saved session layout behaves as configured.
2. In Right, drag the divider to both limits and back. Confirm both columns remain visible and the handle stays inside the Composer pane.
3. Resize below the two-column threshold. Confirm the temporary stacked view keeps DSH's normal visible bottom Composer, the rail spaced away from the Composer input border, and a disabled Right action with a width explanation; resize back and confirm Right restores automatically. Repeat with Automatic, accounting for its ratio threshold.
4. With a short Right-side draft, click and multi-click unused input space, then drag a selection; confirm the native textarea handles those gestures. Enter a multi-line draft, scroll it, and confirm Chat does not move.
5. Trigger `/` and `@`, then open model, access, and context popups. Confirm candidates close before the other popup opens and every menu stays inside the right pane, including at a short window height. With third-party right-slot controls installed, confirm the ellipsis popup keeps them reachable when space is limited.
6. Open the Home Hero with both Bottom and Right selected as the default placement. Confirm the input keeps the same native height in both cases; the Hero never becomes a split pane.
7. Return to Bottom and confirm the plugin no longer changes DSH's normal input-trigger behavior.

Record the DSH version, plugin version, and the result of this browser pass in the release notes or pull request. A failed DSH host test that does not load this plugin is an upstream test issue; it must be reported separately rather than treated as a Composer Layout regression.

## 0.1.13 release evidence

Version 0.1.13 targets DSH 0.1.2-rc.1 and has also passed isolated compatibility tests on 0.1.3-alpha.2 without changing the plugin implementation. Use `npm view dsh-composer-layout version` to inspect the npm channel, or follow the [GitHub installation instructions](../README.md#install-directly-from-github). Older DSH users can pin 0.1.12.

On both DSH versions, separate temporary homes and Web profiles passed settings registration and threshold persistence, Hero geometry, restored long-answer rendering, two-column geometry, divider dragging, Bottom/Automatic switching, narrow-width disabling, narrow-to-wide restoration, and settled-answer scrolling. This evidence does not cover future alpha versions or completion of every browser check above.

The alpha.2 test initially failed before Web startup because pnpm dlx had not built DSH's native `fs-ext` session-lock dependency. Allowing that specific dependency with `pnpm --allow-build=fs-ext dlx @deepseek-ai/dsh@0.1.3-alpha.2 …` in the test runner resolved startup; the existing browser checks then passed. The build option was a temporary test-runner adjustment, not a plugin code change.

The stream-end timing bug was not fully reproduced. Nested-container adaptation and scroll-event bridging are included, but the available browser evidence does not establish that the timing bug is completely fixed. A complete stream-end reproduction and verification remain outstanding.
