---
goal: Systematic Kebab-Case File Naming Refactor for Source and Test Files
version: 1.0
date_created: 2025-08-16
last_updated: 2025-08-16
owner: Marcus R. Brown
status: 'Planned'
tags: [refactor, file-naming, code-style, automation, tooling]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan systematically converts all source and test files from PascalCase/camelCase to kebab-case convention while maintaining functionality, build processes, and tooling compatibility. The refactor uses automated tooling where possible and ensures all quality gates pass after conversion.

## 1. Requirements & Constraints

- **REQ-001**: Convert all TypeScript files from PascalCase/camelCase to kebab-case (ExtensionController.ts → extension-controller.ts)
- **REQ-002**: Update all import/export statements to reference new file paths
- **REQ-003**: Maintain existing export structure in package.json for external consumers
- **REQ-004**: Preserve dual Node/Web build functionality in tsup configuration
- **REQ-005**: Update all file path references in documentation and configuration files
- **REQ-006**: Ensure vscode-ext-gen tool continues to work with new naming convention
- **REQ-007**: Validate all quality gates (lint, test, build) pass after conversion
- **SEC-001**: Preserve all existing functionality and API surface during refactor
- **CON-001**: Maintain backward compatibility for npm package consumers
- **CON-002**: Keep generated files working with existing tooling
- **CON-003**: Avoid breaking existing import paths in package.json exports
- **GUD-001**: Use automated tooling to minimize manual errors during conversion
- **GUD-002**: Follow conventional kebab-case naming standards (lowercase, hyphen-separated)
- **PAT-001**: Implement incremental refactor with validation at each step
- **PAT-002**: Create rollback strategy in case of conversion issues

## 2. Implementation Steps

### Implementation Phase 1: Analysis and Preparation

- GOAL-001: Analyze current file structure and prepare conversion mapping

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create comprehensive file inventory of all .ts files needing conversion | ✅ | 2025-08-16 |
| TASK-002 | Generate mapping of old filenames to new kebab-case filenames | ✅ | 2025-08-16 |
| TASK-003 | Analyze all import statements to identify conversion dependencies | ✅ | 2025-08-16 |
| TASK-004 | Create backup branch and document rollback procedure | ✅ | 2025-08-16 |
| TASK-005 | Identify edge cases (generated files, type declarations, external references) | ✅ | 2025-08-16 |
| TASK-006 | Create automated conversion scripts for file renaming and import updates | ✅ | 2025-08-16 |

### Implementation Phase 2: Core Source File Conversion

- GOAL-002: Convert all source files in src/ directory to kebab-case

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Rename src/core/ExtensionController.ts to src/core/extension-controller.ts | ✅ | 2025-08-16 |
| TASK-008 | Update imports in src/extension.ts to reference new extension-controller.ts path | ✅ | 2025-08-16 |
| TASK-009 | Convert all camelCase directory index.ts files (statusBar → status-bar) | ✅ | 2025-08-16 |
| TASK-010 | Update all relative import paths in source files to use new naming | ✅ | 2025-08-16 |
| TASK-011 | Validate that all source imports resolve correctly after conversion | ✅ | 2025-08-16 |
| TASK-012 | Run build to ensure tsup configuration handles new file paths | ✅ | 2025-08-16 |

### Implementation Phase 3: Test File Conversion

- GOAL-003: Convert all test files and update test configuration

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Rename test files to kebab-case (extension.test.ts → extension.test.ts already correct) | |  |
| TASK-014 | Update test file imports to reference new source file paths | |  |
| TASK-015 | Convert test/web/webview.test.ts if needed (already kebab-case) | |  |
| TASK-016 | Update test suite configuration files (test/suite/index.ts, etc.) | |  |
| TASK-017 | Validate all test imports and run test suite to ensure functionality | |  |
| TASK-018 | Update test configuration in vitest.config.ts and vitest.config.web.ts | |  |

### Implementation Phase 4: Build Configuration Updates

- GOAL-004: Update build and configuration files to handle new naming convention

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Update tsup.config.ts entry points if they reference specific files | |  |
| TASK-020 | Verify package.json exports still work with new directory structure | |  |
| TASK-021 | Update any TypeScript path mappings in tsconfig.json if needed | |  |
| TASK-022 | Test both Node and Web builds to ensure dual-target functionality | |  |
| TASK-023 | Update eslint.config.ts if it has specific file path references | |  |
| TASK-024 | Verify generated meta.ts continues to work with vscode-ext-gen tool | |  |

### Implementation Phase 5: Documentation and Validation

- GOAL-005: Update documentation and perform comprehensive validation

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Update README.md and any file path references in documentation | |  |
| TASK-026 | Update CONTRIBUTING.md if it references specific file paths | |  |
| TASK-027 | Run full quality gate pipeline (lint, test, build) to validate refactor | |  |
| TASK-028 | Test extension loading in VS Code to ensure runtime functionality | |  |
| TASK-029 | Verify npm package exports work correctly for library consumers | |  |
| TASK-030 | Update .ai/plan/ documentation if it references old file paths | |  |

## 3. Alternatives

- **ALT-001**: Manual file-by-file conversion - Rejected due to high error potential and time consumption
- **ALT-002**: Gradual conversion over multiple releases - Rejected as it would create inconsistent naming
- **ALT-003**: Keeping current naming convention - Rejected as kebab-case is more conventional for file systems
- **ALT-004**: Using automated IDE refactoring only - Rejected as it may miss configuration files and documentation

## 4. Dependencies

- **DEP-001**: Git version control for branch management and rollback capability
- **DEP-002**: Node.js file system APIs for automated file renaming scripts
- **DEP-003**: Regular expressions for automated import/export statement updates
- **DEP-004**: TypeScript compiler for validation of import resolution
- **DEP-005**: vscode-ext-gen tool compatibility with new file structure
- **DEP-006**: tsup build system for dual Node/Web target validation
- **DEP-007**: Vitest test framework for validating test file updates
- **DEP-008**: ESLint for code style validation after conversion

## 5. Files

- **FILE-001**: src/core/ExtensionController.ts → src/core/extension-controller.ts
- **FILE-002**: src/statusBar/index.ts → src/status-bar/index.ts (directory rename)
- **FILE-003**: src/treeView/index.ts → src/tree-view/index.ts (directory rename)
- **FILE-004**: All import statements in src/ files requiring path updates
- **FILE-005**: All test files with imports referencing renamed source files
- **FILE-006**: package.json exports structure validation (no changes expected)
- **FILE-007**: tsup.config.ts for build configuration validation
- **FILE-008**: Documentation files (README.md, CONTRIBUTING.md) with path references

## 6. Testing

- **TEST-001**: Automated script to validate all import paths resolve correctly
- **TEST-002**: Full unit test suite execution after file conversions
- **TEST-003**: Integration test execution to validate extension functionality
- **TEST-004**: Web extension test suite validation for browser compatibility
- **TEST-005**: Build validation for both Node and Web targets
- **TEST-006**: VS Code extension loading test in development environment
- **TEST-007**: npm package import testing for library consumer scenarios
- **TEST-008**: vscode-ext-gen tool execution to ensure generated files work

## 7. Risks & Assumptions

- **RISK-001**: Automated conversion scripts may miss edge cases in import paths
- **RISK-002**: External tooling (vscode-ext-gen) may not handle new naming convention
- **RISK-003**: Build system caching may cause issues with renamed files
- **RISK-004**: IDE autocomplete and navigation may be temporarily affected
- **ASSUMPTION-001**: All import paths use relative imports that can be systematically updated
- **ASSUMPTION-002**: Package.json exports structure doesn't need modification for file renames
- **ASSUMPTION-003**: VS Code extension marketplace accepts extensions with kebab-case files
- **ASSUMPTION-004**: Current file structure has no external dependencies on specific file names

## 8. Related Specifications / Further Reading

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js File System Best Practices](https://nodejs.org/api/fs.html)
- [Conventional Naming Conventions](https://www.conventionalcommits.org/)
- [VS Code Extension Development Guide](https://code.visualstudio.com/api/get-started/your-first-extension)
- [tsup Build Tool Documentation](https://tsup.egoist.dev/)
- [vscode-ext-gen Tool Documentation](https://github.com/antfu/vscode-ext-gen)
