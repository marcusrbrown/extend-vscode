#!/bin/bash

# Kebab-Case Conversion Script
# Purpose: Automated file renaming and import statement updates
# Created: 2025-08-16

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
DRY_RUN=${DRY_RUN:-true}
BACKUP_BRANCH="backup/pre-kebab-case-conversion"
VERBOSE=${VERBOSE:-false}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
validate_git_status() {
    if ! git diff-index --quiet HEAD --; then
        log_error "Working directory has uncommitted changes. Please commit or stash changes first."
        exit 1
    fi
    log_success "Git status is clean"
}

validate_backup_branch() {
    if ! git show-ref --verify --quiet "refs/heads/${BACKUP_BRANCH}"; then
        log_error "Backup branch '${BACKUP_BRANCH}' does not exist. Please create it first."
        exit 1
    fi
    log_success "Backup branch '${BACKUP_BRANCH}' exists"
}

validate_quality_gates() {
    log_info "Running pre-conversion quality gates..."

    if ! npm run lint; then
        log_error "Linting failed. Please fix linting errors first."
        exit 1
    fi
    log_success "Linting passed"

    if ! npm run type-check; then
        log_error "Type check failed. Please fix TypeScript errors first."
        exit 1
    fi
    log_success "Type check passed"

    if ! npm test; then
        log_error "Tests failed. Please fix test failures first."
        exit 1
    fi
    log_success "Tests passed"

    if ! npm run build; then
        log_error "Build failed. Please fix build errors first."
        exit 1
    fi
    log_success "Build passed"
}

# File operation functions
rename_file() {
    local from_path="$1"
    local to_path="$2"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would rename: $from_path → $to_path"
        return 0
    fi

    if [[ ! -f "$from_path" ]]; then
        log_warning "Source file does not exist: $from_path"
        return 1
    fi

    # Create target directory if it doesn't exist
    local target_dir
    target_dir=$(dirname "$to_path")
    mkdir -p "$target_dir"

    # Use git mv to preserve history
    if git mv "$from_path" "$to_path"; then
        log_success "Renamed: $from_path → $to_path"
        return 0
    else
        log_error "Failed to rename: $from_path → $to_path"
        return 1
    fi
}

rename_directory() {
    local from_dir="$1"
    local to_dir="$2"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would rename directory: $from_dir → $to_dir"
        return 0
    fi

    if [[ ! -d "$from_dir" ]]; then
        log_warning "Source directory does not exist: $from_dir"
        return 1
    fi

    # Create parent directory if it doesn't exist
    local parent_dir
    parent_dir=$(dirname "$to_dir")
    mkdir -p "$parent_dir"

    # Use git mv to preserve history
    if git mv "$from_dir" "$to_dir"; then
        log_success "Renamed directory: $from_dir → $to_dir"
        return 0
    else
        log_error "Failed to rename directory: $from_dir → $to_dir"
        return 1
    fi
}

update_imports() {
    local file_path="$1"

    if [[ ! -f "$file_path" ]]; then
        log_warning "File does not exist for import updates: $file_path"
        return 1
    fi

    local temp_file
    temp_file=$(mktemp)
    local changes_made=false

    # Read file and apply replacements
    while IFS= read -r line; do
        local original_line="$line"

        # Update ExtensionController imports
        line=$(echo "$line" | sed -E "s|from ['\"]\\./core/ExtensionController['\"]|from './core/extension-controller'|g")
        line=$(echo "$line" | sed -E "s|from ['\"]\\.\\.\/core/ExtensionController['\"]|from '../core/extension-controller'|g")

        # Update statusBar imports
        line=$(echo "$line" | sed -E "s|from ['\"]\\./statusBar['\"]|from './status-bar'|g")
        line=$(echo "$line" | sed -E "s|from ['\"]\\.\\.\/statusBar['\"]|from '../status-bar'|g")

        # Update treeView imports
        line=$(echo "$line" | sed -E "s|from ['\"]\\./treeView['\"]|from './tree-view'|g")
        line=$(echo "$line" | sed -E "s|from ['\"]\\.\\.\/treeView['\"]|from '../tree-view'|g")

        if [[ "$line" != "$original_line" ]]; then
            changes_made=true
            if [[ "$VERBOSE" == "true" ]]; then
                log_info "Updated import in $file_path:"
                log_info "  Old: $original_line"
                log_info "  New: $line"
            fi
        fi

        echo "$line" >> "$temp_file"
    done < "$file_path"

    # Apply changes if not dry run
    if [[ "$DRY_RUN" == "true" ]]; then
        if [[ "$changes_made" == "true" ]]; then
            log_info "[DRY RUN] Would update imports in: $file_path"
        fi
    else
        if [[ "$changes_made" == "true" ]]; then
            mv "$temp_file" "$file_path"
            log_success "Updated imports in: $file_path"
        else
            rm "$temp_file"
        fi
    fi

    rm -f "$temp_file"
}

# Main conversion functions
convert_extension_controller() {
    log_info "Converting ExtensionController.ts..."
    rename_file "src/core/ExtensionController.ts" "src/core/extension-controller.ts"
}

convert_status_bar() {
    log_info "Converting statusBar directory..."
    rename_directory "src/statusBar" "src/status-bar"
}

convert_tree_view() {
    log_info "Converting treeView directory..."
    rename_directory "src/treeView" "src/tree-view"
}

update_import_statements() {
    log_info "Updating import statements..."

    # Files that need import updates
    local files=(
        "src/extension.ts"
        "src/index.ts"
    )

    for file in "${files[@]}"; do
        update_imports "$file"
    done
}

run_post_conversion_validation() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would run post-conversion validation"
        return 0
    fi

    log_info "Running post-conversion validation..."

    # Type check
    if ! npm run type-check; then
        log_error "Post-conversion type check failed"
        return 1
    fi
    log_success "Type check passed"

    # Tests
    if ! npm test; then
        log_error "Post-conversion tests failed"
        return 1
    fi
    log_success "Tests passed"

    # Build
    if ! npm run build; then
        log_error "Post-conversion build failed"
        return 1
    fi
    log_success "Build passed"

    # Lint
    if ! npm run lint; then
        log_error "Post-conversion lint failed"
        return 1
    fi
    log_success "Lint passed"
}

# Main execution
main() {
    log_info "Starting kebab-case conversion script..."

    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "Running in DRY RUN mode. No changes will be made."
        log_info "Set DRY_RUN=false to execute actual changes."
    fi

    # Pre-conversion validation
    validate_git_status
    validate_backup_branch
    validate_quality_gates

    # Perform conversions
    convert_extension_controller
    convert_status_bar
    convert_tree_view
    update_import_statements

    # Post-conversion validation
    run_post_conversion_validation

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Dry run completed successfully!"
        log_info "Run with DRY_RUN=false to execute actual conversion."
    else
        log_success "Kebab-case conversion completed successfully!"
        log_info "Please review changes and run final validation before committing."
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
