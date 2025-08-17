---
goal: Comprehensive Publishing Workflow Infrastructure for VS Code Marketplace, OpenVSIX, and npm
version: 1.0
date_created: 2025-08-16
last_updated: 2025-08-17
owner: Marcus R. Brown
status: 'Planned'
tags: [infrastructure, publishing, automation, ci/cd, marketplace, npm]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan establishes a comprehensive publishing workflow infrastructure that automates publishing to VS Code Marketplace, OpenVSIX, and npm with proper versioning, authentication, and release automation. The plan respects the existing dual Node/Web architecture while implementing industry best practices for VS Code extension publishing.

## 1. Requirements & Constraints

- **REQ-001**: Automated publishing to VS Code Marketplace using VSCE_TOKEN
- **REQ-002**: Automated publishing to OpenVSIX registry using OVSX_TOKEN
- **REQ-003**: Automated publishing to npm registry using NPM_TOKEN
- **REQ-004**: Semantic versioning with automated changelog generation
- **REQ-005**: Pre-release validation (lint, test, build) before publishing
- **REQ-006**: Platform-specific packaging for Node and Web targets
- **REQ-007**: Proper artifact handling respecting existing tsup configuration
- **SEC-001**: Secure token management through GitHub secrets
- **SEC-002**: Token validation before publishing attempts
- **CON-001**: Maintain existing dual Node/Web architecture from tsup.config.ts
- **CON-002**: Preserve existing build outputs in out/node and out/web
- **CON-003**: Maintain current export structure for npm consumption
- **GUD-001**: Follow VS Code extension publishing best practices
- **GUD-002**: Implement proper npm package structure for library consumption
- **PAT-001**: Use GitHub Actions workflow for automation
- **PAT-002**: Implement fail-fast validation with early exit on errors

## 2. Implementation Steps

### Implementation Phase 1: GitHub Workflow Infrastructure

- GOAL-001: Create automated GitHub Actions workflow for publishing pipeline

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `.github/workflows/publish.yaml` with trigger conditions (tags, manual dispatch) | |  |
| TASK-002 | Implement secret validation step to check VSCE_TOKEN, OVSX_TOKEN, NPM_TOKEN availability | |  |
| TASK-003 | Add Node.js and pnpm setup with caching for optimal performance | |  |
| TASK-004 | Implement pre-release validation jobs (lint, test, build) with fail-fast behavior | |  |
| TASK-005 | Add semantic version validation and changelog generation step | |  |
| TASK-006 | Configure artifact collection and retention for debugging failed releases | |  |

### Implementation Phase 2: Package.json Publishing Scripts

- GOAL-002: Implement comprehensive package.json scripts for all publishing targets

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Add `vsce:package` script for VS Code extension packaging with validation | |  |
| TASK-008 | Add `vsce:publish` script with pre-publish build and validation hooks | |  |
| TASK-009 | Add `ovsx:publish` script for OpenVSIX with proper authentication handling | |  |
| TASK-010 | Add `npm:publish` script with dual Node/Web build validation | |  |
| TASK-011 | Add `publish:all` script that orchestrates all publishing targets safely | |  |
| TASK-012 | Add `publish:dry-run` script for testing publishing process without actual publishing | |  |

### Implementation Phase 3: Extension Manifest Optimization

- GOAL-003: Optimize package.json for proper VS Code extension and npm library publishing

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Add proper `files` array to include only necessary files for VS Code extension | |  |
| TASK-014 | Configure `extensionPack` and `extensionDependencies` if needed for template usage | |  |
| TASK-015 | Optimize npm `files` array for library consumption (out/, types/, package.json) | |  |
| TASK-016 | Validate and enhance `exports` structure for granular module imports | |  |
| TASK-017 | Add proper `types` field configuration for TypeScript consumers | |  |
| TASK-018 | Configure `repository`, `bugs`, and `homepage` fields for marketplace display | |  |

### Implementation Phase 4: Versioning and Changelog Automation

- GOAL-004: Implement semantic versioning with automated changelog generation

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Install and configure semantic-release or alternative versioning tool | |  |
| TASK-020 | Create changelog template and automation for release notes | |  |
| TASK-021 | Implement version bumping strategy (major, minor, patch) based on commit messages | |  |
| TASK-022 | Add Git tag creation and push automation for releases | |  |
| TASK-023 | Configure release notes generation from commit history and pull requests | |  |
| TASK-024 | Add version validation to prevent duplicate or invalid version publishing | |  |

### Implementation Phase 5: Quality Gates and Validation

- GOAL-005: Implement comprehensive pre-release validation and quality gates

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Add bundle size validation to prevent oversized extensions | |  |
| TASK-026 | Implement integration test execution before publishing | |  |
| TASK-027 | Add dependency vulnerability scanning in publishing pipeline | |  |
| TASK-028 | Configure Node and Web build validation for dual-target support | |  |
| TASK-029 | Add manifest validation to ensure VS Code marketplace compliance | |  |
| TASK-030 | Implement rollback strategy for failed publications | |  |

## 3. Alternatives

- **ALT-001**: Manual publishing process - Rejected due to error-prone nature and lack of automation
- **ALT-002**: Single marketplace publishing - Rejected as it limits distribution and adoption
- **ALT-003**: Separate repositories for extension and library - Rejected as it complicates maintenance
- **ALT-004**: Using different CI/CD platforms (GitLab CI, Azure DevOps) - Rejected due to GitHub integration benefits

## 4. Dependencies

- **DEP-001**: GitHub Actions workflow environment with proper permissions
- **DEP-002**: VS Code Extension Manager (vsce) for marketplace publishing
- **DEP-003**: OpenVSIX CLI (ovsx) for OpenVSIX registry publishing
- **DEP-004**: npm CLI for package registry publishing
- **DEP-005**: Semantic versioning tool (semantic-release or conventional-changelog)
- **DEP-006**: tsx for executing TypeScript utility scripts in publishing pipeline
- **DEP-007**: VSCE_TOKEN secret configured in GitHub repository settings
- **DEP-008**: OVSX_TOKEN secret configured in GitHub repository settings
- **DEP-009**: NPM_TOKEN secret configured in GitHub repository settings

## 5. Files

- **FILE-001**: `.github/workflows/publish.yaml` - Main publishing workflow with multi-target automation
- **FILE-002**: `package.json` - Enhanced with publishing scripts and proper metadata configuration
- **FILE-003**: `.vscodeignore` - Extension packaging exclusion rules for marketplace
- **FILE-004**: `.npmignore` - npm publishing exclusion rules for library consumption
- **FILE-005**: `CHANGELOG.md` - Automated changelog generation and version history
- **FILE-006**: `scripts/publish-utils.ts` - TypeScript utility functions for publishing process validation
- **FILE-007**: `scripts/validate-tokens.ts` - TypeScript token validation and authentication checking
- **FILE-008**: `release.config.mjs` - Semantic release configuration for automated versioning

## 6. Testing

- **TEST-001**: Validate GitHub workflow syntax and job dependencies
- **TEST-002**: Test publishing scripts in dry-run mode without actual publishing
- **TEST-003**: Validate extension packaging with proper file inclusion/exclusion
- **TEST-004**: Test npm package structure and import paths for library consumers
- **TEST-005**: Verify semantic versioning and changelog generation accuracy
- **TEST-006**: Test TypeScript utility script execution via tsx and error handling for missing credentials
- **TEST-007**: Validate dual Node/Web build artifacts in publishing pipeline
- **TEST-008**: Integration test of complete publishing workflow in staging environment

## 7. Risks & Assumptions

- **RISK-001**: Token rotation or expiration could break automated publishing
- **RISK-002**: Marketplace policy changes could require workflow updates
- **RISK-003**: npm package name conflicts could prevent library publishing
- **RISK-004**: Large bundle sizes could be rejected by marketplace
- **ASSUMPTION-001**: GitHub repository has necessary permissions for Actions workflows
- **ASSUMPTION-002**: Current tsup build configuration produces valid publishable artifacts
- **ASSUMPTION-003**: Extension follows VS Code marketplace guidelines and policies
- **ASSUMPTION-004**: npm package name 'extend-vscode' is available and owned by publisher

## 8. Related Specifications / Further Reading

- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [OpenVSIX Registry Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [npm Publishing Documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Semantic Versioning Specification](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
