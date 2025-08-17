---
goal: Explorer Context Menu - Add context menu contribution for generating VS Code extension boilerplate from TypeScript files
version: 1.0
date_created: 2025-08-15
last_updated: 2025-08-15
owner: Marcus R. Brown
status: 'Planned'
tags: ['feature', 'context-menu', 'boilerplate', 'code-generation', 'explorer']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan details the creation of a VS Code explorer context menu contribution that allows users to generate extension boilerplate code by right-clicking on TypeScript files. The feature will integrate with the existing command registration system and provide a streamlined way to create VS Code extension project structures.

## 1. Requirements & Constraints

- **REQ-001**: Must follow existing command registration pattern using `createCommand` and `registerCommands`
- **REQ-002**: Must add context menu contribution to package.json contributes.menus section
- **REQ-003**: Context menu must only appear when right-clicking on TypeScript (.ts) files
- **REQ-004**: Command must create a complete VS Code extension file structure in the selected directory
- **REQ-005**: Generated files must follow VS Code extension best practices and conventions
- **REQ-006**: Must use the existing logger utility for error handling and debugging
- **REQ-007**: Must integrate with ExtensionController for proper disposal management
- **SEC-001**: File system operations must validate paths and handle permission errors safely
- **SEC-002**: Generated content must be sanitized and not execute arbitrary code
- **CON-001**: Cannot modify existing command registration patterns or break compatibility
- **CON-002**: Must work in both Node.js and web extension environments (where file system access is available)
- **GUD-001**: Follow established error handling patterns with try/catch and logging
- **GUD-002**: Use consistent naming conventions for commands and menu items
- **PAT-001**: Implement boilerplate generation as a separate utility module
- **PAT-002**: Use template-based approach for generating file content

## 2. Implementation Steps

### Implementation Phase 1: Core Command and Menu Integration

- GOAL-001: Create command infrastructure and integrate with existing systems

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `generateBoilerplate` command in `src/commands/index.ts` following existing pattern | | |
| TASK-002 | Add command registration to `src/extension.ts` activation function | | |
| TASK-003 | Add command contribution to package.json contributes.commands section | | |
| TASK-004 | Add context menu contribution to package.json contributes.menus.explorer/context | | |
| TASK-005 | Configure menu visibility to show only for TypeScript files using `when` clause | | |

### Implementation Phase 2: Boilerplate Generation Engine

- GOAL-002: Implement file structure generation and template system

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Create `src/boilerplate/index.ts` module for file generation utilities | | |
| TASK-007 | Implement directory structure creation with proper error handling | | |
| TASK-008 | Create template system for generating package.json with extension metadata | | |
| TASK-009 | Implement src/extension.ts template with basic activation/deactivation functions | | |
| TASK-010 | Add templates for tsconfig.json, README.md, and basic command structure | | |
| TASK-011 | Implement file writing with atomic operations and rollback on failure | | |

### Implementation Phase 3: User Experience and Validation

- GOAL-003: Enhance user experience with validation and feedback

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Add user prompts for extension name, display name, and description | | |
| TASK-013 | Implement directory conflict detection and resolution options | | |
| TASK-014 | Add progress notifications during file generation process | | |
| TASK-015 | Implement validation for extension naming conventions | | |
| TASK-016 | Add success notification with options to open generated files | | |

### Implementation Phase 4: Testing and Documentation

- GOAL-004: Comprehensive testing and documentation for the new feature

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-017 | Create unit tests for boilerplate generation utilities | | |
| TASK-018 | Add integration tests for command registration and menu contribution | | |
| TASK-019 | Implement file system operation tests with mocked file system | | |
| TASK-020 | Create end-to-end tests for complete boilerplate generation workflow | | |
| TASK-021 | Add documentation for the new context menu feature to README.md | | |

## 3. Alternatives

- **ALT-001**: Use VS Code's built-in scaffolding through yeoman generator (rejected - requires external dependencies and complex setup)
- **ALT-002**: Create a separate command palette command instead of context menu (rejected - doesn't meet context-specific requirement)
- **ALT-003**: Use external template files instead of inline templates (rejected - adds complexity and file management overhead)
- **ALT-004**: Integrate with existing configuration module for template customization (rejected - scope creep, can be added later)

## 4. Dependencies

- **DEP-001**: VS Code API `vscode.Uri` and file system operations for directory creation
- **DEP-002**: VS Code API `vscode.window.showInputBox` for user input collection
- **DEP-003**: VS Code API `vscode.window.showInformationMessage` for progress and success notifications
- **DEP-004**: Node.js `fs` and `path` modules for file system operations (Node.js environment only)
- **DEP-005**: Existing command registration system from `src/commands/index.ts`
- **DEP-006**: Logger utility from `src/utils/logger.ts`
- **DEP-007**: ExtensionController from `src/core/extension-controller.ts`

## 5. Files

- **FILE-001**: `src/commands/index.ts` - Updated to include generateBoilerplate command
- **FILE-002**: `src/boilerplate/index.ts` - New module for boilerplate generation utilities
- **FILE-003**: `src/boilerplate/templates.ts` - Template definitions for generated files
- **FILE-004**: `src/extension.ts` - Updated to register the new command
- **FILE-005**: `src/index.ts` - Updated to export boilerplate utilities if needed
- **FILE-006**: `package.json` - Updated with command and menu contributions
- **FILE-007**: `test/boilerplate/index.test.ts` - Unit tests for boilerplate generation
- **FILE-008**: `test/integration/boilerplate/context-menu.test.ts` - Integration tests for context menu
- **FILE-009**: `README.md` - Updated with documentation for the new feature

## 6. Testing

- **TEST-001**: Unit tests for template generation functions with various input parameters
- **TEST-002**: Unit tests for directory structure creation and conflict resolution
- **TEST-003**: Integration tests for command registration and VS Code API interactions
- **TEST-004**: Tests for context menu visibility with different file types
- **TEST-005**: File system operation tests with mocked file system and error scenarios
- **TEST-006**: User input validation tests for extension naming and metadata
- **TEST-007**: End-to-end tests for complete boilerplate generation workflow
- **TEST-008**: Error handling tests for permission errors and invalid paths
- **TEST-009**: Template rendering tests ensuring valid TypeScript and JSON output
- **TEST-010**: Rollback functionality tests when file generation fails partway through

## 7. Risks & Assumptions

- **RISK-001**: File system permission errors when creating directories or files
- **RISK-002**: Directory conflicts when target location already contains files
- **RISK-003**: Web extension environment limitations for file system operations
- **RISK-004**: Large template files causing memory issues during generation
- **ASSUMPTION-001**: Users will primarily use this feature for creating new extension projects
- **ASSUMPTION-002**: TypeScript file context provides sufficient indication of intended usage
- **ASSUMPTION-003**: Generated boilerplate will be customized by users after creation
- **ASSUMPTION-004**: File system access is available in the target environment

## 8. Related Specifications / Further Reading

- [VS Code Menu Contributions API](https://code.visualstudio.com/api/references/contribution-points#contributes.menus)
- [VS Code Command API Documentation](https://code.visualstudio.com/api/references/vscode-api#commands)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [extend-vscode Copilot Instructions](../../.github/copilot-instructions.md)
- [Existing Commands Module](../../src/commands/index.ts)
- [Extension Controller Pattern](../../src/core/extension-controller.ts)
