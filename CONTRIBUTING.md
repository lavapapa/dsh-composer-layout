# Contributing

This repository is the release mirror for the Composer Layout bundle. Keep runtime changes in the matching DSH workspace first, run that workspace's focused GUI and browser checks, then copy the reviewed `lib/` artifact and update the README and changelog here.

Before opening a pull request, run:

```sh
node scripts/verify-package.mjs
npm pack --dry-run
```

Please include the DSH commit, package version, and the exact install path used for a manual smoke test. Keep descriptions factual: the plugin changes Composer presentation and must not claim model, token, or security behavior it does not implement.
