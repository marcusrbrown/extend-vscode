# extend-vscode

Toolkit for building VS Code extensions faster with clean, testable abstractions.

[![CI Status](https://img.shields.io/github/actions/workflow/status/marcusrbrown/extend-vscode/main.yaml?branch=main&style=for-the-badge&logo=github%20actions&logoColor=white&label=CI)](https://github.com/marcusrbrown/extend-vscode/actions?query=workflow%3Amain)
[![Issues](https://img.shields.io/github/issues/marcusrbrown/extend-vscode?style=for-the-badge)](https://github.com/marcusrbrown/extend-vscode/issues)
![VS Code Version](https://img.shields.io/badge/vscode-1.71%2B-23a8f2?logo=visual-studio-code&logoColor=white&style=for-the-badge)

> A modular reference extension showing how to structure commands, webviews, tree views, status bar items, tasks, telemetry, configuration and logging—ready to adapt for your own project.

## Why

Most sample extensions show only one feature. This toolkit gives you a cohesive, minimal-but-complete baseline implementing multiple core patterns with TypeScript, a modern build (tsup + pnpm), dual Node/Web targets, and comprehensive tests. Copy pieces or fork it to accelerate your own extension.

## Features

- Single entry controller `ExtensionController` for lifecycle + disposal
- Strongly typed command creation & bulk registration
- Status bar manager with dynamic items
- Extendable tree view base classes + example provider
- Webview base class with typed messaging + example panel
- Task provider abstraction + example shell task
- Lightweight telemetry layer (console implementation by default)
- Central logger with level filtering & timestamps (`extend-vscode.logLevel`)
- Unified configuration wiring
- Node and Web (browser) build outputs via conditional exports
- Generated metadata scaffold (`generate:meta` script)
- Vitest unit + integration + webview tests
- Strict linting & formatting (ESLint, Prettier) and type safety

## Quick Start

### Install

Clone and bootstrap dependencies:

```bash
git clone https://github.com/marcusrbrown/extend-vscode.git
cd extend-vscode
pnpm install
```

### Develop (Node host)

```bash
pnpm dev-node
```

Launch the Extension Development Host when prompted.

### Develop (Web / browser host)

```bash
pnpm dev-web
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test          # unit tests
pnpm test:integration
pnpm test:web      # web (browser) target
```

> [!TIP]
> Use `pnpm test:watch` during iterative development.

## Architecture Overview

| Area       | Path / Symbol         | Purpose                                                                             |
| ---------- | --------------------- | ----------------------------------------------------------------------------------- |
| Activation | `src/extension.ts`    | Orchestrates setup (commands, webview, config, telemetry, status bar, tree, tasks). |
| Lifecycle  | `ExtensionController` | Centralized state & disposal registration.                                          |
| Commands   | `src/commands/`       | Typed factory + bulk registration with error logging.                               |
| Status Bar | `src/statusBar/`      | Manager + fluent item API.                                                          |
| Tree View  | `src/treeView/`       | Generic base + example hierarchical provider.                                       |
| Webview    | `src/webview/`        | Typed panel base + HTML example & message bridge.                                   |
| Tasks      | `src/tasks/`          | Extensible task provider abstraction + example shell task.                          |
| Telemetry  | `src/telemetry/`      | Pluggable reporter + common property injection.                                     |
| Logging    | `src/utils/logger.ts` | Level-based output channel logging.                                                 |

## Commands

<!-- commands -->

| Command                     | Title                                   |
| --------------------------- | --------------------------------------- |
| `extend-vscode.webHello`    | Extend VSCode: Hello from Web Extension |
| `extend-vscode.showWebview` | Extend VSCode: Show Example Webview     |
| `extend-vscode.refreshTree` | Extend VSCode: Refresh Example Tree     |

<!-- commands -->

## Configuration

<!-- configs -->

| Key                      | Description                                         | Type     | Default  |
| ------------------------ | --------------------------------------------------- | -------- | -------- |
| `extend-vscode.logLevel` | The minimum log level to show in the output channel | `string` | `"info"` |

<!-- configs -->

> [!NOTE]
> Adjust log verbosity in Settings (search for "Extend VSCode").

## Extending the Toolkit

Add a new feature by following the existing pattern:

1. Create a folder (e.g. `src/featureX/`).
2. Expose a `setupFeatureX(context)` function returning disposables.
3. Add conditional exports in `package.json` if it needs public API access.
4. Wire it into `activate()` alongside existing setup calls.
5. Add tests (unit + integration) under `test/` mirroring other suites.

> [!TIP]
> Keep setup functions pure (only side-effect inside VS Code APIs) and isolate logic into testable classes or functions.

## Testing Strategy

- Vitest for fast unit tests (`test/` root)
- Integration tests launching VS Code (`test/integration/`)
- Web target tests with `vitest.config.web.ts`
- Mocked VS Code API in `test/__mocks__/vscode.ts`

Run coverage:

```bash
pnpm test:coverage
pnpm test:web:coverage
```

## Release Flow (Suggested)

1. Bump version, update `CHANGELOG.md`.
2. `pnpm build` and verify tests pass.
3. Package with `vsce package` (optionally publish with `vsce publish`).
4. Tag & push: `git tag vX.Y.Z && git push --tags`.

> [!IMPORTANT]
> Ensure telemetry implementation respects user privacy; current implementation logs only to the output and does not transmit data.

## FAQ

**Does this send telemetry outside my machine?**
No. The default reporter only logs locally. Swap in a different reporter to emit events externally.

**Can I reuse pieces independently?**
Yes. Each subfolder is intentionally decoupled; copy only what you need.

**Why tsup instead of webpack/esbuild directly?**
Simpler config, fast builds, and dual output formats with minimal boilerplate.

## Acknowledgments

This is a learning & acceleration toolkit inspired by patterns from many open-source VS Code extensions.

---

For change history see `CHANGELOG.md`. For license details see `LICENSE.md`.
