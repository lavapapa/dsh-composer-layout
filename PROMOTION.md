# Launch checklist

This is the small release checklist for the first public version. It deliberately separates actions that change GitHub state from local preparation.

## Positioning and launch material

The product is for the moment a user stops composing a short reply and starts working across two surfaces: an earlier answer, source material, code, a log, or a long draft. The right-side Composer keeps that reference material visible while giving the input its own vertical working space. It is an optional layout choice, not a new chat workflow.

**English one-liner:**

> Keep the answer in view while you write. Dock Composer to the right so the answer and your growing draft can stay side by side.

**中文一句话：**

> 一边读，一边想，一边写：把 Composer 停到右侧，让回答和正在成形的提示词始终并排可见。

The README opens with a bilingual layout-comparison Hero, then follows it with a real DSH Web capture:

- `assets/hero-en.png` and `assets/hero-zh.png` explain the problem directly: a growing bottom draft hides the answer it references, while a docked Composer keeps answer and draft side by side.
- `assets/screenshots/hero-en.png` and `assets/screenshots/hero-zh.png` are 1280×720 screenshots from clean demonstration profiles. Both show a detailed multi-tenant platform architecture proposal beside a long revision instruction; all content was written solely for public material.
- `assets/social-preview.png` is a 1280×640 social-preview image derived from the English capture, ready for the GitHub repository social-preview setting.

Do not describe the layout as making every conversation larger or faster. Its concrete benefit is keeping a referenced conversation visible beside a long input. Use examples such as long instructions, revisions against earlier answers, code and log excerpts, and multi-step tasks.

## Discovery

- Add the repository topics `dsh-plugin`, `deepseek-harness`, `dsh`, and `ui-enhancement`.
- Submit one YAML entry to [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) under `category: ui` after the repository has existed for at least one day and has at least ten meaningful commits. The project uses the list's generated README and does not edit that README by hand.
- The same curated entry is the route used by [dsh-market](https://github.com/dsh-market/dsh-market); the market README asks plugin authors to submit there rather than opening a market-catalog PR.

## Official DSH

Post one concise item in the official repository's **Show Your Plugins!** discussion category after the public repository URL and release tag are live. Link the README, install command, compatibility line, and one limitation. Avoid claiming endorsement or security review.

Suggested title:

> DSH Composer Layout — bottom or right-side Composer placement for Web

Suggested body:

> `dsh-composer-layout` adds an optional Web-only Composer layout: keep the input at the bottom or dock it in a right-side column. It remembers placement per session, keeps the right pane resizable, and positions Composer popups so they are not clipped in a narrow window. It does not change prompts, models, token accounting, or tools.
>
> Install: `dsh plugin --profile web add github:lavapapa/dsh-composer-layout#v0.1.0`
>
> README: https://github.com/lavapapa/dsh-composer-layout
>
> Tested against the `deepseek-ai/deepseek-harness` source checkout at commit `47f9438`. Feedback on narrow layouts and compatibility with newer DSH Web releases is welcome.

## Evidence to keep with the launch

- `node scripts/verify-package.mjs`
- `npm pack --dry-run`
- `dsh plugin --profile web add <release-tarball>` followed by `dsh --profile web --dump-config`
- A browser smoke test that checks both placements and a popup trigger in the right layout.
