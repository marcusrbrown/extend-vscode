# Copilot Instructions for extend-vscode

## Architecture Overview

This is a VS Code extension toolkit with a **modular architecture** centered around `ExtensionController`. Each feature is a separate module that exports a `setup*` function accepting `vscode.ExtensionContext`.

### Central Controller Pattern
- `ExtensionController` manages extension lifecycle and disposable cleanup
- All disposables must be registered via `controller.registerDisposable()` OR `context.subscriptions.push()`
- Features initialize through setup functions in `src/extension.ts`

### Dual Platform Support
- Builds for both Node.js (`out/node/`) and web extensions (`out/web/`)
- Platform detection via `process.env.PLATFORM` (defined in tsup config)
- Use `tsup.config.ts` for build configuration with separate node/web targets

### File Naming Convention
- **CRITICAL**: Use kebab-case for all directories and file names (e.g., `status-bar`, `tree-view`, `extension-controller.ts`)
- Import paths must match actual file structure exactly

## Key Development Patterns

### Command Registration
Use the standardized command pattern from `src/commands/index.ts`:
```typescript
export const commands = {
  myCommand: createCommand(
    'extend-vscode.myCommand',
    async () => { /* handler */ },
    {title: 'My Command', category: 'Extend VSCode'}
  ),
};
```
Then register in extension.ts: `registerCommands(context, commands.myCommand)`

### Feature Module Structure
Each feature module should export a setup function:
```typescript
export async function setupMyFeature(context: vscode.ExtensionContext): Promise<void> {
  // Feature initialization
  // Register disposables with context.subscriptions.push()
}
```

### Generated Metadata
- Types and constants auto-generated from `package.json` via `vscode-ext-gen`
- Run `pnpm run generate:meta` after modifying package.json contributions
- Import types from `src/generated/meta.ts` (CommandKey, ConfigKey, etc.)

## Testing Strategy

### Test Organization
- **Unit tests**: `test/*.test.ts` (Vitest, Node environment)
- **Web tests**: `test/web/*.test.ts` (separate Vitest config)
- **Integration tests**: `test/integration/*.test.ts` (real VS Code instance)

### Key Commands
- `pnpm test` - Run unit tests
- `pnpm test:web` - Run web extension tests
- `pnpm test:integration` - Run integration tests with VS Code
- `pnpm dev-node` / `pnpm dev-web` - Development with auto-reload

## Configuration & Build

### Development Workflow
1. Modify package.json contributions → run `pnpm run generate:meta`
2. Use `pnpm run watch` for development builds
3. Launch debug sessions via `dev-node` or `dev-web` scripts

### Export Structure
The toolkit exports feature modules individually (e.g., `extend-vscode/commands`) plus a main export with re-exported VS Code types for consumer convenience.

## Code Style Notes

- Use `type` imports for vscode: `import type * as vscode from 'vscode'`
- All async operations should include proper error handling with logger
- Prefer interfaces over types for extensibility
- Use the centralized logger from `src/utils/logger.ts`
- Follow the existing pattern of setup functions for new features
