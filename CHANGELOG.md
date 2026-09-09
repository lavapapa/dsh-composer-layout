# Changelog

## 0.1.16

- Add a shared plugin/DSH/browser pairing matrix and `pnpm test:dsh-matrix`. The legacy npm plugin 0.1.12 is tested with DSH 0.1.1-rc.2; this release is tested with DSH 0.1.2-rc.1 and 0.1.5-alpha.1. Every pair runs in Chromium and WebKit.
- Extend browser tests to empty unfocused editing surfaces and normalize native selection checks across engines. Legacy coverage remains installation, plugin loading, and Hero geometry; current stable/alpha coverage includes active-session editing, selection, and scrolling.
- Expand release CI and scheduled channel probes to the paired browser matrix. This release updates testing and compatibility evidence, retaining the 0.1.15 runtime implementation; it does not add a separate Safari patch.

## 0.1.15

- Restore the full-height native contenteditable surface in the right-side Composer, replacing obsolete textarea/mirror sizing and the blank-area focus proxy. Editable blank space now belongs to the native editor and uses a text cursor.
- Add real-browser checks for short-draft geometry, blank-area hit testing, pointer focus, word/paragraph selection, native drag behavior, independent long-draft wheel scrolling, and compact Bottom/Hero behavior.
- Verify the same implementation on DSH 0.1.2-rc.1 and 0.1.3-alpha.2. Native contenteditable selection follows the browser, including its distant-blank-space drag behavior; this release does not claim a fix for intermittently disappearing questions or stream-end scrolling.

## 0.1.14

- Prevent DSH's native transcript-width handles from overlapping the right-side Composer by hiding both handles while split layout is active. Chat uses the available left-column width, adjusted with the plugin divider; independent transcript whitespace adjustment is unavailable in this mode.
- Restore the native transcript-width handles in Bottom layout without changing DSH's saved width preference. Real-browser checks on DSH 0.1.2-rc.1 and 0.1.3-alpha.2 passed, including native width dragging after returning to Bottom.
- Explicitly allow the test runner to build DSH's `fs-ext` dependency. This release does not claim to fix the intermittently disappearing question composer.

## 0.1.13

- Pass isolated compatibility tests on DSH 0.1.2-rc.1 and 0.1.3-alpha.2 with the same plugin implementation. Available through npm and GitHub tag `v0.1.13`; users of older DSH versions can pin 0.1.12. Future alpha versions require separate verification.
- Add Bottom, Right, and Automatic placement. Automatic uses the conversation main area's width-to-height ratio with a configurable threshold of 0.5–2 (default 1), while preserving the minimum width required by both columns.
- Collapse third-party right-slot controls into an ellipsis popup when space is limited; shift the docking rail left away from the Composer input border and explain why Right is disabled at narrow widths.
- Adapt to nested conversation scroll containers and bridge scroll events between the host container and Chat. Isolated DSH 0.1.2-rc.1 settings and real-conversation checks passed for split layout, divider dragging, Automatic placement, and narrow-to-wide restoration. The stream-end timing bug was not fully reproduced, so these results do not establish a complete fix; see [release checks](docs/RELEASE_CHECKS.md).

## 0.1.9 — 2026-08-27

- Make the right-side Composer's native textarea fill the visible short-draft surface, preserving native multi-click and drag selection in unused space.
- Add compact Chinese and English layout guides to the README and plugin settings.

## 0.1.8 — 2026-08-25

- Correct the npm and GitHub installation guidance so both README versions describe the published package accurately.

## 0.1.7 — 2026-08-25

- Restore the right-side Composer's blank-area focus behavior: clicking below a short draft now focuses the editor without changing controls, menus, or the native bottom layout.

## 0.1.6 — 2026-08-24

- Repair the right-side Composer for the current DSH Web layout: the complete input chain now receives the pane height, so a long draft remains inside the Composer and scrolls independently from Chat.
- Keep slash, reference, and popup menus inside the right pane after that expansion, including in short browser windows.

## 0.1.5 — 2026-08-20

- Make the generated browser bundle repeatable by sorting CSS-module exports before serializing them. This leaves the layout behavior unchanged while ensuring that the release tag and npm package can be rebuilt byte-for-byte.

## 0.1.4 — 2026-08-20

- Keep a visible layout rail when a right-side Composer temporarily stacks in a narrow window; the Right-side choice stays disabled until both columns fit, then the remembered right-side preference returns automatically.
- Close slash/reference candidates before model, permission, context, or other Composer popups open in the right-side layout. The ordinary bottom layout keeps DSH's native behavior.
- Add a reproducible local build, typecheck, and responsive-layout regression tests; validate the package against DSH source commit `141eb6f`.

## 0.1.3 — 2026-08-20

- Keep the right-side layout entirely inside the standalone plugin, including on local DSH builds that expose an experimental placement service.
- Keep the resizable divider anchored to the resolved Composer pane at its width limit.

## 0.1.2 — 2026-08-19

- Anchor the plugin divider to the Composer pane itself, so it cannot drift past the pane when the width reaches its limit.

## 0.1.0 — 2026-08-18

- Initial public release of DSH Composer Layout.
- Adds bottom/right placement, per-session layout memory, a resizable right pane, and narrow-window popup positioning.
- Validation target: `deepseek-ai/deepseek-harness` source commit `47f9438` (local source checkout).
