# DSH Composer Layout

**English** · [简体中文](README.zh.md)

[![Release](https://img.shields.io/github/v/tag/lavapapa/dsh-composer-layout?label=release)](https://github.com/lavapapa/dsh-composer-layout/tags)
[![npm](https://img.shields.io/npm/v/dsh-composer-layout?label=npm)](https://www.npmjs.com/package/dsh-composer-layout)
[![Included in Awesome DSH Plugin](https://img.shields.io/badge/Included%20in-Awesome%20DSH%20Plugin-3b82f6?logo=github)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/data/plugins/lavapapa__dsh-composer-layout.yml)
[![Included in Awesome DeepSeek Harness Plugins](https://img.shields.io/badge/Included%20in-Awesome%20DeepSeek%20Harness%20Plugins-3b82f6?logo=github)](https://github.com/Zhiyuan-Fan/Awesome-DeepSeek-Harness-Plugins)
[![Included in Awesome DSH Plugins](https://img.shields.io/badge/Included%20in-Awesome%20DSH%20Plugins-3b82f6?logo=github)](https://github.com/cccakeee/awesome-dsh-plugins/blob/main/docs/categories/web-ui.en.md)
[![Included in Oh My DSH](https://img.shields.io/badge/Included%20in-Oh%20My%20DSH-3b82f6?logo=github)](https://github.com/NoWint/Oh-My-DSH)
[![License](https://img.shields.io/github/license/lavapapa/dsh-composer-layout)](LICENSE)

[Overview](#dsh-composer-layout) · [Install](#install) · [Why side by side?](#why-a-side-by-side-composer) · [See it in DSH](#see-it-in-dsh) · [Switch and resize](#switch-and-resize) · [Features](#what-it-adds) · [Release checks](docs/RELEASE_CHECKS.md) · [Contributing](CONTRIBUTING.md) · [简体中文](README.zh.md)

> **Keep the answer in view while you write.** Dock Composer to the right so the answer and your growing draft can stay side by side.

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that lets the Composer stay at the bottom or dock in a right-side column. The chat and Composer keep their own space, while the normal DSH model, permission, quota, session, and tool behavior remains intact.

![Keep the answer in view while you write](assets/hero-en.png)

## Why a side-by-side Composer?

The familiar bottom Composer works well when both the answer and the next message are short. Once either one grows, they have to compete for the same vertical strip: a long answer pushes the input away, while a long draft hides the material it is supposed to reference. The work then turns into compensation—copy a detail out, resize the input, scroll back to recover context, search for the passage just read, and repeat.

This is especially wasteful on a desktop. Most desktop displays are wide; horizontal room is usually available, while the height shared by a growing answer, a growing draft, and browser chrome is scarce. A vertical layout spends the abundant dimension poorly and makes the constrained one do all the work.

Docking Composer to the right gives reading and writing separate vertical space. The conversation can stay visible as it grows; the draft can become as detailed as the task requires. The important change is simultaneous access: read a passage, think through it, and shape the corresponding part of the next prompt without losing either surface. It is a small layout change that removes a recurring interruption from long-form work.

## See it in DSH

![A real DSH Web session beside a tall right-side Composer](assets/screenshots/hero-en.png)

## Switch and resize

![Right-edge handle, layout switch, and right-pane resize](assets/screenshots/layout-guide-en.webp)

## What it adds

- Bottom and right-side Composer placement from **Settings → Plugins → Composer Layout**.
- A visible docking handle; in the right layout it also resizes the Composer pane.
- Per-session placement and manually resized right-pane width when “Remember this session layout” is enabled.
- When the window cannot fit both columns, temporarily stack the Composer while retaining a layout rail; the remembered right-side layout returns automatically once width is available again.
- In the right-side layout, close slash/reference candidates before another Composer popup opens, so model, access, and context panels do not overlap them.

The plugin is presentation-only: it does not add model-facing tools, change prompts, or alter token accounting.

## Install

### Install from npm

The npm package already contains the prebuilt plugin bundle:

```sh
dsh plugin --profile web add dsh-composer-layout@latest
dsh web --profile web
```

### Install directly from GitHub

DSH installs the plugin bundle directly from a GitHub repository; pinning the command to `v0.1.12` makes the installed source explicit and repeatable.

```sh
dsh plugin --profile web add "github:lavapapa/dsh-composer-layout#v0.1.12"
dsh web --profile web
```

Then open **Settings → Plugins → Composer Layout** and select **Right side**. Restarting the Web profile is required because DSH does not hot-reload profile patches.

The repository ships the prebuilt host and browser artifacts used by this command, so installation does not need an install-time build step. To confirm that DSH added the bundle to the intended profile:

```sh
dsh --profile web --dump-config
```

### Update

To move an existing installation to the current npm release:

```sh
dsh plugin --profile web remove dsh-composer-layout
dsh plugin --profile web add dsh-composer-layout@latest
dsh web --profile web
```

The DSH Web package range supported by the plugin is declared in [`package.json`](package.json). The [DSH compatibility workflow](https://github.com/lavapapa/dsh-composer-layout/actions/workflows/dsh-latest-compat.yml) regularly checks the plugin against the current DSH release.

## Development

The repository intentionally commits the generated `lib/` artifacts used by GitHub installs. The plugin owns its implementation under `src/`; run `pnpm typecheck`, `pnpm build`, and `pnpm test` before publishing. Each release is also checked in a clean matching DSH checkout.

## Related links

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [DSH plugin topic](https://github.com/topics/dsh-plugin)
- [Awesome DSH Plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
- [DSH Market](https://github.com/dsh-market/dsh-market)

## License

MIT. See [`LICENSE`](LICENSE).
