---
goal: Dual-Purpose Documentation and Project Structure for Template and Library Usage
version: 1.0
date_created: 2025-08-16
last_updated: 2025-08-16
owner: Marcus R. Brown
status: 'Planned'
tags: [documentation, architecture, dual-purpose, template, library, npm]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan refactors the project documentation and structure to clearly articulate its dual nature as both a template/starter kit for new VS Code extensions and an npm library package for existing extensions. The plan creates comprehensive documentation, usage examples, and proper metadata to support both use cases effectively.

## 1. Requirements & Constraints

- **REQ-001**: Clearly document when to fork/clone vs install as dependency
- **REQ-002**: Create comprehensive usage examples for both template and library scenarios
- **REQ-003**: Update package.json description and keywords to reflect dual purpose
- **REQ-004**: Add shields.io badges for npm metrics alongside VS Code marketplace metrics
- **REQ-005**: Ensure export structure supports granular imports (e.g., `import {ExtensionController} from 'extend-vscode/core'`)
- **REQ-006**: Create CONTRIBUTING.md with contributor guidelines for both use cases
- **REQ-007**: Establish docs/ folder with detailed documentation structure
- **REQ-008**: Maintain existing modular architecture and generated metadata approach
- **SEC-001**: Ensure library exports don't expose internal implementation details
- **CON-001**: Preserve existing functionality for current users
- **CON-002**: Maintain backward compatibility with current export structure
- **CON-003**: Keep template functionality fully independent of library usage
- **GUD-001**: Follow npm package best practices for library distribution
- **GUD-002**: Use clear, beginner-friendly documentation for template usage
- **PAT-001**: Structure documentation to minimize confusion between use cases
- **PAT-002**: Implement progressive disclosure in documentation (quick start → advanced)

## 2. Implementation Steps

### Implementation Phase 1: Core Documentation Structure

- GOAL-001: Establish comprehensive documentation framework for dual-purpose project

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create docs/ directory with structured documentation layout | |  |
| TASK-002 | Create CONTRIBUTING.md with guidelines for both template and library contributions | |  |
| TASK-003 | Design documentation navigation structure for dual use cases | |  |
| TASK-004 | Create docs/template-usage.md with comprehensive starter kit guide | |  |
| TASK-005 | Create docs/library-usage.md with npm package consumption examples | |  |
| TASK-006 | Create docs/architecture.md explaining the modular design philosophy | |  |

### Implementation Phase 2: README.md Refactoring

- GOAL-002: Transform README.md to clearly present both use cases upfront

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Add dual-purpose badges (npm version, downloads, VS Code marketplace, CI) | |  |
| TASK-008 | Restructure README intro to explain template vs library usage clearly | |  |
| TASK-009 | Create side-by-side comparison table for when to use each approach | |  |
| TASK-010 | Add "Quick Start as Template" and "Quick Start as Library" sections | |  |
| TASK-011 | Include granular import examples (ExtensionController, commands, etc.) | |  |
| TASK-012 | Add npm installation instructions and basic library usage examples | |  |

### Implementation Phase 3: Package.json and Export Optimization

- GOAL-003: Optimize package metadata and exports for dual consumption patterns

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Update package.json description to reflect dual nature (template + library) | |  |
| TASK-014 | Add comprehensive keywords for npm discoverability (vscode, extension, toolkit, template, starter) | |  |
| TASK-015 | Add missing export for ./core to support `import {ExtensionController} from 'extend-vscode/core'` | |  |
| TASK-016 | Validate all existing exports work correctly for library consumption | |  |
| TASK-017 | Add proper npm package metadata (homepage, repository, bugs) for library users | |  |
| TASK-018 | Configure files array to include only necessary files for npm package | |  |

### Implementation Phase 4: Usage Examples and Guides

- GOAL-004: Create comprehensive usage examples for both template and library scenarios

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Create docs/examples/template-project/ with complete starter example | |  |
| TASK-020 | Create docs/examples/library-integration/ with existing extension integration examples | |  |
| TASK-021 | Add TypeScript code examples for common library usage patterns | |  |
| TASK-022 | Create migration guide for converting template usage to library usage | |  |
| TASK-023 | Add troubleshooting section for common issues in both scenarios | |  |
| TASK-024 | Create decision flowchart for choosing between template and library approach | |  |

### Implementation Phase 5: Badges, Metrics, and Discoverability

- GOAL-005: Implement comprehensive badges and improve project discoverability

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Add npm version and weekly downloads badges to README.md | |  |
| TASK-026 | Add VS Code marketplace badges (installs, rating) when extension is published | |  |
| TASK-027 | Add GitHub repository badges (stars, forks, issues) for community metrics | |  |
| TASK-028 | Configure npm package keywords for optimal search discoverability | |  |
| TASK-029 | Add social media cards and repository topics for GitHub discoverability | |  |
| TASK-030 | Create package.json funding field if applicable for project sustainability | |  |

## 3. Alternatives

- **ALT-001**: Separate repositories for template and library - Rejected due to maintenance overhead and code duplication
- **ALT-002**: Single README with minimal dual-purpose mention - Rejected as it would confuse users about use cases
- **ALT-003**: Library-only approach without template functionality - Rejected as template provides valuable starting point
- **ALT-004**: Template-only approach without npm publishing - Rejected as library utilities provide value to existing projects

## 4. Dependencies

- **DEP-001**: shields.io badge service for dynamic npm and marketplace metrics
- **DEP-002**: npm registry for package publishing and discoverability
- **DEP-003**: VS Code marketplace for extension metrics (when published)
- **DEP-004**: GitHub repository features for topics, social preview, and community metrics
- **DEP-005**: Markdown rendering compatibility across GitHub, npm, and VS Code
- **DEP-006**: TypeScript documentation tools for API reference generation
- **DEP-007**: Existing package.json export structure compatibility
- **DEP-008**: vscode-ext-gen tool for maintaining generated metadata

## 5. Files

- **FILE-001**: README.md - Complete refactor with dual-purpose presentation and usage examples
- **FILE-002**: CONTRIBUTING.md - New contributor guidelines for template and library development
- **FILE-003**: docs/template-usage.md - Comprehensive guide for using as starter template
- **FILE-004**: docs/library-usage.md - Complete guide for npm package consumption
- **FILE-005**: docs/architecture.md - Technical architecture documentation
- **FILE-006**: docs/examples/ - Directory with practical usage examples for both scenarios
- **FILE-007**: package.json - Updated metadata, keywords, and export structure
- **FILE-008**: docs/migration.md - Guide for migrating between template and library usage

## 6. Testing

- **TEST-001**: Validate all documented import examples work correctly
- **TEST-002**: Test npm package installation and import scenarios
- **TEST-003**: Verify template cloning and setup process works as documented
- **TEST-004**: Test granular imports (ExtensionController, commands, etc.) in isolated environment
- **TEST-005**: Validate documentation links and references are accurate
- **TEST-006**: Test package.json exports structure with Node.js resolution
- **TEST-007**: Verify badges display correctly and link to appropriate resources
- **TEST-008**: Test documentation rendering across GitHub, npm, and VS Code

## 7. Risks & Assumptions

- **RISK-001**: Complex dual-purpose documentation may confuse new users
- **RISK-002**: npm package size may become too large with template files included
- **RISK-003**: Export structure changes could break existing library consumers
- **RISK-004**: Template updates may not align with library stability requirements
- **ASSUMPTION-001**: Users will clearly understand the distinction between template and library usage
- **ASSUMPTION-002**: Current export structure adequately supports granular imports
- **ASSUMPTION-003**: npm package name 'extend-vscode' is available and appropriate
- **ASSUMPTION-004**: VS Code marketplace publishing will happen to enable marketplace badges

## 8. Related Specifications / Further Reading

- [npm Package.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)
- [VS Code Extension Development Guide](https://code.visualstudio.com/api/get-started/your-first-extension)
- [shields.io Badge Service](https://shields.io/)
- [GitHub Repository Topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
