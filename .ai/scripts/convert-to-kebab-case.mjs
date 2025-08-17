#!/usr/bin/env node

/**
 * Kebab-Case Conversion Script (Node.js)
 * Purpose: Automated file renaming and import statement updates
 * Created: 2025-08-16
 */

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../..');

// Configuration
const config = {
  dryRun: process.env.DRY_RUN !== 'false',
  verbose: process.env.VERBOSE === 'true',
  backupBranch: 'backup/pre-kebab-case-conversion',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Logging utilities
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Utility functions
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: config.verbose ? 'inherit' : 'pipe',
      ...options,
    });
    return result;
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function fileExists(filePath) {
  return existsSync(resolve(projectRoot, filePath));
}

// Validation functions
function validateGitStatus() {
  try {
    execCommand('git diff-index --quiet HEAD --');
    log.success('Git status is clean');
    return true;
  } catch {
    log.error('Working directory has uncommitted changes. Please commit or stash changes first.');
    return false;
  }
}

function validateBackupBranch() {
  try {
    execCommand(`git show-ref --verify --quiet refs/heads/${config.backupBranch}`);
    log.success(`Backup branch '${config.backupBranch}' exists`);
    return true;
  } catch {
    log.error(`Backup branch '${config.backupBranch}' does not exist. Please create it first.`);
    return false;
  }
}

function validateQualityGates() {
  log.info('Running pre-conversion quality gates...');

  const commands = [
    {name: 'lint', cmd: 'npm run lint'},
    {name: 'type-check', cmd: 'npm run type-check'},
    {name: 'test', cmd: 'npm test'},
    {name: 'build', cmd: 'npm run build'},
  ];

  for (const {name, cmd} of commands) {
    try {
      execCommand(cmd);
      log.success(`${name} passed`);
    } catch (error) {
      log.error(`${name} failed. Please fix ${name} errors first.`);
      log.error(error.message);
      return false;
    }
  }

  return true;
}

// File operation functions
function renameWithGit(fromPath, toPath) {
  if (config.dryRun) {
    log.info(`[DRY RUN] Would rename: ${fromPath} → ${toPath}`);
    return true;
  }

  if (!fileExists(fromPath)) {
    log.warning(`Source does not exist: ${fromPath}`);
    return false;
  }

  try {
    // Create target directory if needed
    const targetDir = dirname(resolve(projectRoot, toPath));
    mkdirSync(targetDir, {recursive: true});

    // Use git mv to preserve history
    execCommand(`git mv "${fromPath}" "${toPath}"`);
    log.success(`Renamed: ${fromPath} → ${toPath}`);
    return true;
  } catch (error) {
    log.error(`Failed to rename: ${fromPath} → ${toPath}`);
    log.error(error.message);
    return false;
  }
}

function updateFileImports(filePath) {
  if (!fileExists(filePath)) {
    log.warning(`File does not exist for import updates: ${filePath}`);
    return false;
  }

  const fullPath = resolve(projectRoot, filePath);
  const content = readFileSync(fullPath, 'utf8');

  // Define import replacement patterns
  const replacements = [
    // ExtensionController imports
    {
      pattern: /from\s+['"]\.\/core\/ExtensionController['"]/g,
      replacement: "from './core/extension-controller'",
    },
    {
      pattern: /from\s+['"]\.\.\/core\/ExtensionController['"]/g,
      replacement: "from '../core/extension-controller'",
    },
    // statusBar imports
    {
      pattern: /from\s+['"]\.\/statusBar['"]/g,
      replacement: "from './status-bar'",
    },
    {
      pattern: /from\s+['"]\.\.\/statusBar['"]/g,
      replacement: "from '../status-bar'",
    },
    // treeView imports
    {
      pattern: /from\s+['"]\.\/treeView['"]/g,
      replacement: "from './tree-view'",
    },
    {
      pattern: /from\s+['"]\.\.\/treeView['"]/g,
      replacement: "from '../tree-view'",
    },
  ];

  let updatedContent = content;
  let changesMade = false;

  for (const {pattern, replacement} of replacements) {
    const beforeReplace = updatedContent;
    updatedContent = updatedContent.replace(pattern, replacement);

    if (beforeReplace !== updatedContent) {
      changesMade = true;
      if (config.verbose) {
        log.info(`Applied replacement in ${filePath}: ${pattern} → ${replacement}`);
      }
    }
  }

  if (config.dryRun) {
    if (changesMade) {
      log.info(`[DRY RUN] Would update imports in: ${filePath}`);
    }
    return true;
  }

  if (changesMade) {
    writeFileSync(fullPath, updatedContent, 'utf8');
    log.success(`Updated imports in: ${filePath}`);
  } else {
    if (config.verbose) {
      log.info(`No import changes needed in: ${filePath}`);
    }
  }

  return true;
}

// Main conversion functions
function convertExtensionController() {
  log.info('Converting ExtensionController.ts...');
  return renameWithGit('src/core/ExtensionController.ts', 'src/core/extension-controller.ts');
}

function convertStatusBar() {
  log.info('Converting statusBar directory...');
  return renameWithGit('src/statusBar', 'src/status-bar');
}

function convertTreeView() {
  log.info('Converting treeView directory...');
  return renameWithGit('src/treeView', 'src/tree-view');
}

function updateImportStatements() {
  log.info('Updating import statements...');

  const filesToUpdate = [
    'src/extension.ts',
    'src/index.ts',
  ];

  let allSuccessful = true;
  for (const file of filesToUpdate) {
    if (!updateFileImports(file)) {
      allSuccessful = false;
    }
  }

  return allSuccessful;
}

function runPostConversionValidation() {
  if (config.dryRun) {
    log.info('[DRY RUN] Would run post-conversion validation');
    return true;
  }

  log.info('Running post-conversion validation...');

  const validationCommands = [
    {name: 'type-check', cmd: 'npm run type-check'},
    {name: 'test', cmd: 'npm test'},
    {name: 'build', cmd: 'npm run build'},
    {name: 'lint', cmd: 'npm run lint'},
  ];

  for (const {name, cmd} of validationCommands) {
    try {
      execCommand(cmd);
      log.success(`Post-conversion ${name} passed`);
    } catch (error) {
      log.error(`Post-conversion ${name} failed`);
      log.error(error.message);
      return false;
    }
  }

  return true;
}

// Main execution
async function main() {
  log.info('Starting kebab-case conversion script (Node.js)...');

  if (config.dryRun) {
    log.warning('Running in DRY RUN mode. No changes will be made.');
    log.info('Set DRY_RUN=false to execute actual changes.');
  }

  // Pre-conversion validation
  if (!validateGitStatus()) process.exit(1);
  if (!validateBackupBranch()) process.exit(1);
  if (!validateQualityGates()) process.exit(1);

  // Perform conversions
  let success = true;
  success = convertExtensionController() && success;
  success = convertStatusBar() && success;
  success = convertTreeView() && success;
  success = updateImportStatements() && success;

  if (!success) {
    log.error('Some conversion steps failed. Please check the output above.');
    process.exit(1);
  }

  // Post-conversion validation
  if (!runPostConversionValidation()) {
    log.error('Post-conversion validation failed. Please check the output above.');
    process.exit(1);
  }

  if (config.dryRun) {
    log.info('Dry run completed successfully!');
    log.info('Run with DRY_RUN=false to execute actual conversion.');
  } else {
    log.success('Kebab-case conversion completed successfully!');
    log.info('Please review changes and run final validation before committing.');
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error(`Script failed: ${error.message}`);
    process.exit(1);
  });
}
