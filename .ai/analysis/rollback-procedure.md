# Rollback Procedure for Kebab-Case Conversion

**Created**: 2025-08-16
**Purpose**: Emergency rollback procedure for kebab-case file naming conversion

## Backup Information

### Backup Branch
- **Branch Name**: `backup/pre-kebab-case-conversion`
- **Created**: 2025-08-16
- **Base Commit**: c58cdfa
- **Purpose**: Restore point before any file renaming

### Verification Commands
```bash
# Verify backup branch exists
git branch -a | grep backup/pre-kebab-case-conversion

# Check backup branch commit
git log backup/pre-kebab-case-conversion --oneline -1

# Compare current state with backup
git diff backup/pre-kebab-case-conversion
```

## Emergency Rollback Procedure

### Immediate Rollback (Full Reset)

**Use Case**: Complete conversion failure, need immediate restore

```bash
# 1. Save any valuable work in progress
git stash push -m "WIP: saving work before rollback"

# 2. Reset to backup branch
git reset --hard backup/pre-kebab-case-conversion

# 3. Force update working directory
git clean -fd

# 4. Verify restore completed
git status
npm run type-check
npm test
```

### Selective Rollback (Partial Reset)

**Use Case**: Some files converted correctly, others need rollback

```bash
# 1. Identify problematic files
git diff backup/pre-kebab-case-conversion --name-only

# 2. Restore specific files
git checkout backup/pre-kebab-case-conversion -- src/core/ExtensionController.ts
git checkout backup/pre-kebab-case-conversion -- src/statusBar/
git checkout backup/pre-kebab-case-conversion -- src/treeView/

# 3. Restore import statements
git checkout backup/pre-kebab-case-conversion -- src/extension.ts
git checkout backup/pre-kebab-case-conversion -- src/index.ts
```

### File-by-File Rollback

**Use Case**: Targeted rollback of specific components

#### Rollback ExtensionController
```bash
# Remove new file
rm -f src/core/extension-controller.ts

# Restore original file
git checkout backup/pre-kebab-case-conversion -- src/core/ExtensionController.ts

# Restore imports
git checkout backup/pre-kebab-case-conversion -- src/extension.ts src/index.ts
```

#### Rollback statusBar Directory
```bash
# Remove new directory
rm -rf src/status-bar/

# Restore original directory
git checkout backup/pre-kebab-case-conversion -- src/statusBar/

# Restore imports
git checkout backup/pre-kebab-case-conversion -- src/extension.ts src/index.ts
```

#### Rollback treeView Directory
```bash
# Remove new directory
rm -rf src/tree-view/

# Restore original directory
git checkout backup/pre-kebab-case-conversion -- src/treeView/

# Restore imports
git checkout backup/pre-kebab-case-conversion -- src/extension.ts src/index.ts
```

## Post-Rollback Validation

### Mandatory Validation Steps

```bash
# 1. Verify file structure is restored
ls -la src/core/          # Should contain ExtensionController.ts
ls -la src/statusBar/     # Should exist with index.ts
ls -la src/treeView/      # Should exist with index.ts

# 2. Verify imports resolve
npm run type-check

# 3. Verify tests pass
npm test

# 4. Verify builds work
npm run build

# 5. Verify VS Code extension loads
# (Manual test in development environment)
```

### Quality Gate Validation

```bash
# Run full quality pipeline
npm run lint
npm run type-check
npm test
npm run build
npm run format:check
```

## Common Rollback Scenarios

### Scenario 1: Import Resolution Failures

**Symptoms**: TypeScript compilation errors, "Cannot resolve module" errors

**Solution**:
```bash
# Restore import files
git checkout backup/pre-kebab-case-conversion -- src/extension.ts src/index.ts

# Verify resolution
npm run type-check
```

### Scenario 2: Test Failures

**Symptoms**: Test suite fails after conversion

**Solution**:
```bash
# Check if test files need rollback
git diff backup/pre-kebab-case-conversion test/

# Restore test files if modified
git checkout backup/pre-kebab-case-conversion -- test/

# Re-run tests
npm test
```

### Scenario 3: Build System Failures

**Symptoms**: tsup build fails, missing entry points

**Solution**:
```bash
# Check build configuration
git diff backup/pre-kebab-case-conversion tsup.config.ts package.json

# Restore if modified
git checkout backup/pre-kebab-case-conversion -- tsup.config.ts package.json
```

### Scenario 4: Generated File Issues

**Symptoms**: vscode-ext-gen tool fails, meta.ts errors

**Solution**:
```bash
# Regenerate meta.ts with original file structure
npm run generate:meta

# If still failing, restore generated files
git checkout backup/pre-kebab-case-conversion -- src/generated/
```

## Prevention Checklist

### Before Starting Conversion
- [ ] Backup branch created
- [ ] All changes committed
- [ ] Quality gates passing
- [ ] No pending work in progress

### During Conversion
- [ ] Test after each major change
- [ ] Commit working states incrementally
- [ ] Monitor for import resolution errors
- [ ] Validate build system compatibility

### Emergency Contacts
- No external dependencies
- All rollback procedures are self-contained
- Git operations only require local repository

## Recovery Time Estimates

| Rollback Type | Estimated Time | Risk Level |
|---------------|----------------|------------|
| Full Reset | 2-5 minutes | Low |
| Selective Reset | 5-10 minutes | Medium |
| File-by-File | 10-15 minutes | Medium |
| Manual Import Fix | 15-30 minutes | High |

## Success Criteria for Rollback

### Must Pass All
- [ ] TypeScript compilation succeeds (0 errors)
- [ ] All tests pass (100% success rate)
- [ ] Build process completes successfully
- [ ] Extension loads in VS Code development environment
- [ ] No git status warnings or untracked files
- [ ] Package exports work correctly
