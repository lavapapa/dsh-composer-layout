# Contributing

This repository owns the Composer Layout plugin and its release bundle. Treat [the release contract](docs/RELEASE_CHECKS.md) as the source of truth for the behavior that must remain intact on every update.

Before opening a pull request, run:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm test:dsh-compat
```

For a release, complete the real-browser checks in the contract against the target DSH version and record the tested version in the changelog. Keep descriptions factual: the plugin changes Composer presentation and must not claim model, token, or security behavior it does not implement.
