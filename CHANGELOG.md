# Changelog

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
