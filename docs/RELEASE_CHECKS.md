# Composer Layout release contract

This document defines the current presentation contract and the evidence required before publishing a version. Versioned evidence below identifies tested artifacts; npm publication and profile activation are separate steps.

## Current scope

The plugin owns Composer placement, sizing, and overflow presentation. DSH owns submission, transcript following, reading position, requests, session content, permissions, and token accounting; native editor selection and draft scrolling follow the browser.

| Area | Implementation behavior | Required evidence |
| --- | --- | --- |
| Placement | Bottom, Right, and Automatic are available. Automatic selects Right when the conversation main area's width-to-height ratio reaches the configured threshold (0.5–2, default 1) and both columns fit. The configured default applies to a new session; with session memory enabled, a session keeps its own preference and width. | Settings check, Automatic threshold check, and session-switch check in a real browser. |
| Responsive layout | Right docking is available only when Chat and Composer can both keep their minimum usable width. Below that threshold the plugin removes its split adapter and hands the Composer back to DSH's normal bottom layout; the recovery rail remains available, shifted left away from the Composer input border, the disabled Right choice explains the width requirement, and the side layout returns when width is restored (with Automatic also requiring its ratio threshold). | `layout-policy` tests, component fallback check, and narrow-to-wide browser check. |
| Width control | The visible divider resizes the right pane within the shared Chat/Composer bounds. In split layout, both native transcript-width handles are hidden and Chat uses the available left-column width; independent transcript whitespace adjustment is unavailable. Bottom layout restores the native handles and retains DSH's saved width preference. | `layout-policy` tests, min/max divider drag, hidden native handles in split, and restored native width dragging in Bottom in a real browser. |
| Reading and drafting | Chat and a long right-side draft scroll independently. Both layouts retain DSH's original transcript scroll owner, submission following, reading anchors, and navigation. Right docking changes the input presentation while keeping the native bottom seat's viewport geometry. With a short draft, the native contenteditable editor fills the visible right-side input surface, so clicking, multi-click selection, and drag selection work in unused space without scrolling Chat or changing the draft. | Real-browser assertions against `[data-composer-input]`: short-draft geometry fills the scrollport, blank-area hit testing reaches the native editor with a text cursor, native pointer selection works, and long-draft scrolling leaves Chat unchanged. A focus-only test is insufficient. |
| Composer popups | In the right layout, slash and reference candidates stay inside the pane. Opening another Composer popup closes those candidates first; a reference picker remains reachable beside a long draft and inserts the selected file token; third-party right-slot controls collapse into an ellipsis popup when space is limited in either placement. Native model/access/context popup behavior stays unchanged in Bottom; only overflowing third-party controls move into the plugin's bounded popup. | Component popup test plus slash, long-draft reference picker, model, access, context, and third-party overflow checks in a real browser. |
| Host boundary | The adapter targets the current DSH Web Composer structure. Bottom retains the native editor, submission, and popup behavior, with shared folding for third-party controls; Home Hero retains its native layout. | Current-version compatibility check plus Hero and bottom-layout regression checks. |

The native editor contract follows the host's contenteditable behavior, not the removed textarea implementation. Pointer tests require word/paragraph selection and nonempty selection when dragging from blank space into text. Dragging from text into distant blank space is compared against a bare native contenteditable in the same browser: Chromium can collapse this selection in both, so that outcome alone is not attributed to the plugin.

## Version-paired browser checks

The executable pairing contract is [`scripts/dsh-compat-matrix.json`](../scripts/dsh-compat-matrix.json), keyed by `channel`, `plugin`, `dsh`, and `browser`. Release CI expands all configured pairs independently with `fail-fast: false`. Each pairing runs in Chromium and Playwright WebKit; WebKit coverage does not constitute testing the user's installed Safari browser.

The active matrix currently covers the DSH current RC `0.2.0-rc.2` and latest alpha `0.2.1-alpha.2`; each row packs the working tree and exercises the current feature contract against its explicitly pinned host. The previous RC line `0.1.2` was verified in earlier releases and is intentionally not rerun in this maintenance cycle. A new host version is a test target until its run passes, not an automatic extension of an older compatibility claim.

The scheduled channel probe resolves npm `next` (the current RC line) and `alpha` to concrete DSH versions before building its job matrix. A passing probe informs the next reviewed matrix update; it does not rewrite the release matrix or publish a plugin.

To run one pair locally, use the `script` and `dsh` values from the matrix:

```sh
DSH_VERSION=<pinned-host-version> DSH_BROWSER=chromium node scripts/test-dsh-compat.mjs
DSH_VERSION=<pinned-host-version> DSH_BROWSER=webkit node scripts/test-dsh-compat.mjs
```

For this maintenance cycle, evaluate the current RC and alpha targets listed above. The previous RC remains historical evidence and is not part of the active run, following the user's maintenance scope in [AGENTS.md](../AGENTS.md#dsh-当前-rc-与-alpha-的变更与发布).

The browser script uses a temporary DSH home and verifies the packed plugin version; do not run simultaneous tests on the same port. Set `DSH_COMPAT_ARTIFACT_DIR` to keep screenshots after the temporary home is cleaned up.

## Required checks for every update

Run the following from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm exec playwright install chromium webkit
pnpm test:dsh-matrix
```

`pnpm test` covers the responsive width policy, per-session storage, DOM ownership while switching layouts, width clamping, popup interaction, native pointer-event non-interference, and the settings guide. `pnpm test:dsh-compat` packs the exact working tree, installs that tarball into a fresh DSH Web profile, starts DSH, and checks the real Home Hero, plugin settings, and an active conversation. It verifies Hero geometry at desktop and narrow widths, conversation split widths and resizing, Automatic placement, the disabled Right action, scrolling after the layout has settled, slash/reference menu placement, and dismissal before native model/access popups. Native editor checks cover short-draft height, blank-area hit testing and text cursor, real pointer focus and selection, independent long-draft wheel scrolling, and restoration of the compact bottom editor. A remembered Right preference must never turn the Hero into a split pane, clip its input, or create horizontal overflow. The workflow stores those browser screenshots as CI artifacts, so a geometry failure can be inspected visually. A local invocation checks one host/browser combination. Release acceptance requires every configured version/browser pair above. The scheduled workflow additionally probes the current npm RC (`next`) and alpha channels weekly.

| Test layer | Catches automatically | Leaves to a real browser pass |
| --- | --- | --- |
| Policy and storage tests | Breakpoint math, resize bounds, and one session leaking into another | Host-provided controls that the plugin does not own |
| Component tests | Installing and removing the split adapter, restoring DSH's original scroll owner, temporary narrow fallback, divider limits, popup dismissal, and native pointer-event non-interference | Browser layout, scrolling, and native text-selection rendering |
| DSH compatibility browser test | Exact packed artifact installation, host startup, plugin loading, Hero geometry, settings, active-conversation split widths and resizing, hidden native transcript-width handles in split, restored native width dragging in Bottom, Automatic placement, disabled Right action, narrow-to-wide restoration, sampled reader and following-tail restoration across sessions in both placements, scrolling after layout settles, native editor blank-area geometry and hit testing, pointer selection, and independent long-draft scrolling | Real menus and stream-end timing |
| Release browser pass | — | Active-session scrolling, drag-selection, popup positions, narrow-to-wide restore, and bottom-layout non-interference |

Before a release, also complete this short real-browser pass against the intended DSH version:

1. Open a fresh session, switch between Bottom, Right, and Automatic, check Automatic around its configured ratio threshold, then switch sessions to verify the saved session layout behaves as configured.
2. In Right, drag the divider to both limits and back. Confirm both columns remain visible, the handle stays inside the Composer pane, both native `[data-width-handle]` controls are hidden, and Chat fills its available column width.
3. Resize below the two-column threshold. Confirm the temporary stacked view keeps DSH's normal visible bottom Composer, the rail spaced away from the Composer input border, and a disabled Right action with a width explanation; resize back and confirm Right restores automatically. Repeat with Automatic, accounting for its ratio threshold.
4. With a short Right-side draft, click and multi-click unused input space, then drag a selection; confirm the native contenteditable editor handles those gestures. Enter a multi-line draft, scroll it, and confirm Chat does not move.
5. Trigger `/` and `@`, then open model, access, and context popups. Confirm candidates close before the other popup opens and every menu stays inside the right pane, including at a short window height. With third-party right-slot controls installed, confirm the ellipsis popup keeps them reachable when space is limited.
6. Open the Home Hero with both Bottom and Right selected as the default placement. Confirm the input keeps the same native height in both cases; the Hero never becomes a split pane.
7. Return to Bottom and confirm the plugin no longer changes DSH's normal input-trigger behavior. Confirm both native transcript-width handles return, DSH's saved width preference is retained, and dragging a native handle adjusts the transcript width.

Record the DSH version, plugin version, and the result of this browser pass in the release notes or pull request. A failed DSH host test that does not load this plugin is an upstream test issue; it must be reported separately rather than treated as a Composer Layout regression.

## 0.1.24 release evidence

On 2026-10-10, the frozen 0.1.24 package passed DSH `0.2.0-rc.2` and `0.2.1-alpha.2` in isolated Chromium and WebKit profiles. All 36 local tests, type checking, frozen-lockfile installation, build, package checks, and independent source review passed. The existing icon and English/Chinese metadata were also read successfully from the packed package by the official RC2 `readPluginMeta` reader.

The four browser pairings cover 48 sampled reader-position returns, 32 native following-tail returns, and 16 official click/Enter submissions through an isolated transport fixture. They include Host-persisted settings, native editor selection and draft scrolling, Hero geometry, responsive layout and width controls, slash/reference pickers, and third-party control folding in both placements. Overflow checks preserve original node identity, callbacks, font metrics and widget sizes; verify a fitting 30px/70px/130px horizontal row; exercise an inline 340px quota tooltip outside the popup without resizing or scrollbars; and check cross-divider hits, native overlay layers, viewport changes and natural five-line widget growth.

These browser controls are synthetic. Installed Codex/AGY widgets, arbitrary nested body-portaled menus, extremely large control collections, real RPC latency/failure, queue/steer, sub-500ms session switches, and anchors outside the initial history window remain integration checks. Earlier local 0.1.23 Codex checks are separate evidence. Playwright WebKit coverage does not establish a pass in the user's installed Safari browser.

## 0.1.22 validation evidence

On 2026-10-09, the packed 0.1.22 artifact passed the complete RC2/alpha × Chromium/WebKit matrix. All 35 local tests, type checking, and build/package checks passed. Independent source review accepted the native surface/stacking change and its native anchored-positioning follow-up.

New default browser assertions compare the overflow shell's radius, elevation, material fill, and backdrop filter with the real native permissions menu. They verify vertical 34px/13px/20px button rows, original control nodes and callbacks, real cross-divider pointer hits and hover/click, and body overlays at native HoverCard/Menu levels remaining above the pane. In both placements the controls stay within the viewport. With the popup open, viewport resizing and actual widget-height growth re-anchor the unchanged controls. The frozen 0.1.21 artifact fails the new surface assertion; the interim static-position candidate independently fails the open-popup viewport regression.

Third-party entries in this matrix are synthetic controls, not installed AGY/Codex widgets. Their state, DOM ownership and interaction are preserved rather than replaced with Menu items; popup shell and positioning reuse native primitives. Arbitrary nested third-party menus remain an integration check.

## 0.1.21 validation evidence

The exact packed 0.1.21 artifact passed DSH `0.2.0-rc.2` and `0.2.1-alpha.1` in Chromium and WebKit on 2026-10-09. The default matrix includes 48 sampled cross-session reader returns, 32 following-tail returns, and 16 official click/Enter submissions with native durable and streamed-response projection. It also checks independent native draft scrolling and third-party control overflow in both placements. Transport is isolated; real RPC delay/failure, queue/steer, sub-500ms switching, and anchors outside the initial history window remain integration checks. All 33 unit/component tests, type checking, package verification, and independent source/test review passed.

The unchanged formal 0.1.20 archive reproduced all six Right-layout returns at the top in a Composer-only profile. Its Bottom control and a profile without Composer retained their reading positions. The same ordinary switching scenarios pass with 0.1.21; the adapter preserves the native scrollport's identity and complete clipping region, along with the native bottom seat's reading geometry.

## 0.1.20 release evidence

The packed 0.1.20 artifact passed isolated installation and all four Chromium/WebKit browser pairings on DSH `0.2.0-rc.2` and `0.2.1-alpha.1`. These cover the new Host Config settings form, Host revision acceptance and persistence after clearing local overrides and reloading, Hero dimensions, active-session split sizing and scrolling, native editor hit testing and selection, popup placement, third-party right-slot overflow, and restoration of the bottom layout. Type checking, build verification, and all 32 unit/component tests passed on 2026-10-09.

## 0.1.18 release evidence

The current RC `0.1.5-rc.2` and alpha `0.1.6-alpha.1` passed the complete isolated browser matrix in Chromium and WebKit. The run used the packed working tree in a fresh DSH profile and covered Hero geometry, settings, split sizing and divider limits, temporary narrow fallback with automatic restoration, native editor hit testing and pointer selection, independent draft scrolling, native Bottom restoration, late-mounted right-slot overflow, slash/reference menus, and a long-draft `@` reference picker that inserts a selected file token. The new popup regression confirms that trigger menus stay above the side Composer controls, remain inside the viewport, and disappear before model or access menus open. The previous RC `0.1.2` was not rerun in this cycle by design; its earlier release evidence remains below.

## 0.1.15 release evidence

The native editing-surface regression was reproduced before the fix: a short draft's contenteditable was 28px tall inside a 720px input scrollport, with no textarea mirror node for the old selector to match. The replacement sizes the actual editor and its wrapper and removes the legacy pointer-focus proxy.

Isolated browser checks passed on DSH 0.1.2-rc.1 and 0.1.3-alpha.2: full-height short drafts, blank-area native hit testing and text cursor, real mouse focus, double/triple-click selection, reverse drag selection, forward-drag comparison against a bare contenteditable, long-draft wheel scrolling from an explicitly reset position without moving Chat, short-window resizing, and compact Bottom/Hero behavior. The rc.1 question-visibility diagnostic also passed; it remains a simulated-client-request experiment, not proof that the reported intermittent question issue is fixed.

## 0.1.14 release evidence

The width-control change passed isolated real-browser compatibility checks on DSH 0.1.2-rc.1 and 0.1.3-alpha.2. In split layout, both native transcript-width handles were hidden and Chat used its available column width. Returning to Bottom restored the native handles, preserved the stored width preference, and allowed native width dragging. Existing layout compatibility checks also passed. These results apply to the tested versions, not future alpha releases or every manual check above.

The intermittent disappearance of the question composer remains a separate unresolved issue; this release does not claim a fix. An isolated rc.1 experiment using real UI components and simulated client-side question requests did not reproduce it: 17 samples covered long drafts and questions, narrow/short viewports, pane scrolling, settings changes, and rapid request replacement after minimizing. Each sample retained a pending question, a visible hit-testable question panel, and a hidden fallback Composer. This does not exercise the complete model-to-Host Remote request path, other installed plugins, or prove the reported bug absent.

To repeat that diagnostic without using real conversations or model calls, run `node scripts/test-question-visibility.mjs`. It uses a temporary DSH home on port 3814 and writes screenshots plus `samples.json` to `QUESTION_ARTIFACT_DIR` (default `/tmp/dsh-question-visibility-results`).

## 0.1.13 release evidence

Version 0.1.13 targets DSH 0.1.2-rc.1 and has also passed isolated compatibility tests on 0.1.3-alpha.2 without changing the plugin implementation. Use `npm view dsh-composer-layout version` to inspect the npm channel, or follow the [GitHub installation instructions](../README.md#install-directly-from-github). Older DSH users can pin 0.1.12.

On both DSH versions, separate temporary homes and Web profiles passed settings registration and threshold persistence, Hero geometry, restored long-answer rendering, two-column geometry, divider dragging, Bottom/Automatic switching, narrow-width disabling, narrow-to-wide restoration, and settled-answer scrolling. This evidence does not cover future alpha versions or completion of every browser check above.

The alpha.2 test initially failed before Web startup because pnpm dlx had not built DSH's native `fs-ext` session-lock dependency. Allowing that specific dependency with `pnpm --allow-build=fs-ext dlx @deepseek-ai/dsh@0.1.3-alpha.2 …` in the test runner resolved startup; the existing browser checks then passed. For the 0.1.13 check this was a temporary test-runner adjustment. The current runner now explicitly allows `fs-ext` builds; no plugin runtime workaround is involved.

The stream-end timing bug was not fully reproduced. Nested-container adaptation and scroll-event bridging are included, but the available browser evidence does not establish that the timing bug is completely fixed. A complete stream-end reproduction and verification remain outstanding.
