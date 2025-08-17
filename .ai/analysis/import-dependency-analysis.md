# Import Dependency Analysis

**Created**: 2025-08-16
**Purpose**: Comprehensive analysis of import statements affected by kebab-case conversion

## Files with Import Dependencies

### Primary Import Dependencies

#### src/extension.ts
```typescript
// Current imports that need updating:
import {ExtensionController} from './core/ExtensionController';  // → './core/extension-controller'
import {setupStatusBar} from './statusBar';                     // → './status-bar'
import {setupTreeView} from './treeView';                       // → './tree-view'

// Imports that remain unchanged:
import {commands, registerCommands} from './commands';           // ✅ No change
import {setupConfiguration} from './configuration';             // ✅ No change
import {setupTaskProvider} from './tasks';                      // ✅ No change
import {setupTelemetry} from './telemetry';                     // ✅ No change
import {logger} from './utils/logger';                          // ✅ No change
import {setupWebviewProvider} from './webview';                 // ✅ No change
```

#### src/index.ts
```typescript
// Current exports that need updating:
export * from './core/ExtensionController';  // → './core/extension-controller'
export * from './statusBar';                 // → './status-bar'
export * from './treeView';                  // → './tree-view'

// Exports that remain unchanged:
export * from './commands';                  // ✅ No change
export * from './configuration';             // ✅ No change
export * from './tasks';                     // ✅ No change
export * from './telemetry';                 // ✅ No change
export * from './utils/logger';              // ✅ No change
export * from './webview';                   // ✅ No change
```

## Dependency Graph

### ExtensionController Dependencies
```
src/extension.ts
  └── imports ExtensionController from './core/ExtensionController'

src/index.ts
  └── exports * from './core/ExtensionController'

Test files (no direct imports found)
```

### statusBar Dependencies
```
src/extension.ts
  └── imports setupStatusBar from './statusBar'

src/index.ts
  └── exports * from './statusBar'

src/statusBar/index.ts
  └── no internal dependencies on renamed files
```

### treeView Dependencies
```
src/extension.ts
  └── imports setupTreeView from './treeView'

src/index.ts
  └── exports * from './treeView'

src/treeView/index.ts
  └── no internal dependencies on renamed files
```

## Import Pattern Analysis

### Direct Import Patterns Found

| File | Line | Current Import | New Import |
|------|------|----------------|------------|
| `src/extension.ts` | 6 | `from './core/ExtensionController'` | `from './core/extension-controller'` |
| `src/extension.ts` | 7 | `from './statusBar'` | `from './status-bar'` |
| `src/extension.ts` | 10 | `from './treeView'` | `from './tree-view'` |
| `src/index.ts` | 6 | `from './core/ExtensionController'` | `from './core/extension-controller'` |
| `src/index.ts` | 7 | `from './statusBar'` | `from './status-bar'` |
| `src/index.ts` | 10 | `from './treeView'` | `from './tree-view'` |

### Regular Expression Patterns for Replacement

```javascript
const importPatterns = [
  {
    // ExtensionController imports
    pattern: /from\s+['"]\.\/core\/ExtensionController['"]/g,
    replacement: "from './core/extension-controller'"
  },
  {
    // statusBar imports
    pattern: /from\s+['"]\.\/statusBar['"]/g,
    replacement: "from './status-bar'"
  },
  {
    // treeView imports
    pattern: /from\s+['"]\.\/treeView['"]/g,
    replacement: "from './tree-view'"
  }
];
```

## Cross-Reference Analysis

### Files That Import Renamed Modules

| Importing File | Imports From | Impact Level |
|----------------|--------------|-------------|
| `src/extension.ts` | ExtensionController, statusBar, treeView | **High** - Core entry point |
| `src/index.ts` | ExtensionController, statusBar, treeView | **High** - Library exports |

### Files That Do NOT Import Renamed Modules

| File | Status |
|------|--------|
| `src/commands/index.ts` | ✅ No dependencies |
| `src/configuration/index.ts` | ✅ No dependencies |
| `src/tasks/index.ts` | ✅ No dependencies |
| `src/telemetry/index.ts` | ✅ No dependencies |
| `src/utils/logger.ts` | ✅ No dependencies |
| `src/webview/index.ts` | ✅ No dependencies |
| All test files | ✅ No direct dependencies found |

## Internal Module Dependencies

### Within Renamed Modules

#### src/statusBar/index.ts
- Expected: Standard imports from vscode, utils, etc.
- **Action**: Verify no internal imports of renamed files

#### src/treeView/index.ts
- Expected: Standard imports from vscode, utils, etc.
- **Action**: Verify no internal imports of renamed files

#### src/core/ExtensionController.ts
- Expected: Standard imports from vscode, utils, etc.
- **Action**: Verify no internal imports of renamed files

## Update Priority Order

### Phase 1: Rename Files/Directories
1. Create new directories: `src/status-bar/`, `src/tree-view/`
2. Move files to new locations
3. Rename `ExtensionController.ts` → `extension-controller.ts`

### Phase 2: Update Import Statements
1. Update `src/extension.ts` imports (highest priority - entry point)
2. Update `src/index.ts` exports (highest priority - library interface)
3. Verify no other files need updates

### Phase 3: Validation
1. TypeScript compilation check
2. Test execution
3. Build process validation

## Risk Assessment

### Low Risk Areas
- No test files directly import renamed modules
- Most feature modules are independent
- Configuration files don't reference internal paths

### Medium Risk Areas
- Package.json exports may need verification
- Build system entry points may need checking

### High Risk Areas
- `src/extension.ts` - Core extension entry point
- `src/index.ts` - Library export interface
- Any generated files or tooling that references file paths
