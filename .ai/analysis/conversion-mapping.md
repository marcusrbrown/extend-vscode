# Kebab-Case Conversion Mapping

**Created**: 2025-08-16
**Purpose**: Detailed mapping for automated file and directory renaming

## File Mapping Configuration

### Source File Mappings

```json
{
  "files": [
    {
      "from": "src/core/ExtensionController.ts",
      "to": "src/core/extension-controller.ts",
      "type": "file",
      "priority": 1
    }
  ],
  "directories": [
    {
      "from": "src/statusBar",
      "to": "src/status-bar",
      "type": "directory",
      "priority": 1,
      "files": [
        {
          "from": "src/statusBar/index.ts",
          "to": "src/status-bar/index.ts"
        }
      ]
    },
    {
      "from": "src/treeView",
      "to": "src/tree-view",
      "type": "directory",
      "priority": 1,
      "files": [
        {
          "from": "src/treeView/index.ts",
          "to": "src/tree-view/index.ts"
        }
      ]
    }
  ]
}
```

## Import Path Mappings

### Direct Import Updates Required

| Current Import | New Import | Files Affected |
|----------------|------------|----------------|
| `'./core/ExtensionController'` | `'./core/extension-controller'` | src/extension.ts |
| `'../core/ExtensionController'` | `'../core/extension-controller'` | Various subdirectories |
| `'./statusBar'` | `'./status-bar'` | src/extension.ts |
| `'../statusBar'` | `'../status-bar'` | Various subdirectories |
| `'./treeView'` | `'./tree-view'` | src/extension.ts |
| `'../treeView'` | `'../tree-view'` | Various subdirectories |

### Relative Import Patterns

| Pattern | Replacement | Context |
|---------|-------------|---------|
| `from './statusBar'` | `from './status-bar'` | Same directory |
| `from '../statusBar'` | `from '../status-bar'` | Parent directory |
| `from './treeView'` | `from './tree-view'` | Same directory |
| `from '../treeView'` | `from '../tree-view'` | Parent directory |
| `from './core/ExtensionController'` | `from './core/extension-controller'` | Same directory |
| `from '../core/ExtensionController'` | `from '../core/extension-controller'` | Parent directory |

## Conversion Script Configuration

### Bash Script Variables

```bash
# File mappings
declare -A FILE_MAPPINGS=(
  ["src/core/ExtensionController.ts"]="src/core/extension-controller.ts"
)

# Directory mappings
declare -A DIR_MAPPINGS=(
  ["src/statusBar"]="src/status-bar"
  ["src/treeView"]="src/tree-view"
)

# Import pattern mappings
declare -A IMPORT_PATTERNS=(
  ["./core/ExtensionController"]="./core/extension-controller"
  ["../core/ExtensionController"]="../core/extension-controller"
  ["./statusBar"]="./status-bar"
  ["../statusBar"]="../status-bar"
  ["./treeView"]="./tree-view"
  ["../treeView"]="../tree-view"
)
```

### Node.js Script Configuration

```javascript
const conversionConfig = {
  fileRenames: [
    {
      from: "src/core/ExtensionController.ts",
      to: "src/core/extension-controller.ts"
    }
  ],
  directoryRenames: [
    {
      from: "src/statusBar",
      to: "src/status-bar",
      recursive: true
    },
    {
      from: "src/treeView",
      to: "src/tree-view",
      recursive: true
    }
  ],
  importPatterns: [
    {
      pattern: /from ['"]\.\/core\/ExtensionController['"]/g,
      replacement: "from './core/extension-controller'"
    },
    {
      pattern: /from ['"]\.\.\/core\/ExtensionController['"]/g,
      replacement: "from '../core/extension-controller'"
    },
    {
      pattern: /from ['"]\.\/statusBar['"]/g,
      replacement: "from './status-bar'"
    },
    {
      pattern: /from ['"]\.\.\/statusBar['"]/g,
      replacement: "from '../status-bar'"
    },
    {
      pattern: /from ['"]\.\/treeView['"]/g,
      replacement: "from './tree-view'"
    },
    {
      pattern: /from ['"]\.\.\/treeView['"]/g,
      replacement: "from '../tree-view'"
    }
  ]
};
```

## Validation Checks

### Pre-Conversion Validation

- [ ] Verify all source files exist at expected paths
- [ ] Check for any symbolic links or aliases
- [ ] Validate import statements resolve correctly
- [ ] Ensure backup branch is created

### Post-Conversion Validation

- [ ] Verify all renamed files exist at new paths
- [ ] Check all import statements resolve correctly
- [ ] Run TypeScript compiler to verify no errors
- [ ] Execute test suite to ensure functionality
- [ ] Validate build process completes successfully

## Rollback Mapping

### Reverse Mappings (for rollback)

```json
{
  "files": [
    {
      "from": "src/core/extension-controller.ts",
      "to": "src/core/ExtensionController.ts"
    }
  ],
  "directories": [
    {
      "from": "src/status-bar",
      "to": "src/statusBar"
    },
    {
      "from": "src/tree-view",
      "to": "src/treeView"
    }
  ]
}
```
