# Changelog

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
