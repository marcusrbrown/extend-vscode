#!/usr/bin/env tsx

import type {PackageJson} from 'type-fest';

import {execSync} from 'node:child_process';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import process from 'node:process';

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validate package.json manifest for VS Code marketplace compliance
 */
export function validateManifest(): ValidationResult {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = join(projectRoot, 'package.json');

  try {
    const packageJsonText = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonText) as PackageJson;
    const errors: string[] = [];

    // Check basic required fields
    if (typeof packageJson.name !== 'string' || packageJson.name.length === 0) {
      errors.push('Missing or invalid name field');
    }
    if (
      typeof packageJson.version !== 'string' ||
      packageJson.version.length === 0
    ) {
      errors.push('Missing or invalid version field');
    }
    if (
      typeof packageJson.displayName !== 'string' ||
      packageJson.displayName.length === 0
    ) {
      errors.push('Missing or invalid displayName field');
    }
    if (
      typeof packageJson.description !== 'string' ||
      packageJson.description.length === 0
    ) {
      errors.push('Missing or invalid description field');
    }
    if (
      typeof packageJson.publisher !== 'string' ||
      packageJson.publisher.length === 0
    ) {
      errors.push('Missing or invalid publisher field');
    }

    // Check engines.vscode
    if (
      typeof packageJson.engines !== 'object' ||
      packageJson.engines === null
    ) {
      errors.push('Missing engines field');
    } else if (
      typeof packageJson.engines.vscode !== 'string' ||
      packageJson.engines.vscode.length === 0
    ) {
      errors.push('Missing engines.vscode field');
    }

    const success = errors.length === 0;
    const message = success
      ? 'Manifest validation passed'
      : `Manifest validation failed: ${errors.join(', ')}`;

    return {
      success,
      message,
      details: {
        errors,
        packageJson: {
          name: packageJson.name,
          version: packageJson.version,
          publisher: packageJson.publisher,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to read or parse package.json: ${String(error)}`,
      details: {error},
    };
  }
}

/**
 * Validate dual-target build outputs (Node and Web)
 */
export function validateDualTargetBuild(): ValidationResult {
  const projectRoot = resolve(process.cwd());
  const nodeOutDir = join(projectRoot, 'out/node');
  const webOutDir = join(projectRoot, 'out/web');

  const errors: string[] = [];

  // Check that both output directories exist
  if (!existsSync(nodeOutDir)) {
    errors.push('Node build output directory (out/node) does not exist');
  }
  if (!existsSync(webOutDir)) {
    errors.push('Web build output directory (out/web) does not exist');
  }

  // Check for main entry points
  const nodeEntry = join(nodeOutDir, 'extension.js');
  const webEntry = join(webOutDir, 'extension.js');

  if (!existsSync(nodeEntry)) {
    errors.push('Node extension entry point (out/node/extension.js) not found');
  }
  if (!existsSync(webEntry)) {
    errors.push('Web extension entry point (out/web/extension.js) not found');
  }

  const success = errors.length === 0;
  const message = success
    ? 'Dual-target build validation passed'
    : `Dual-target build validation failed: ${errors.join(', ')}`;

  return {
    success,
    message,
    details: {
      errors,
      paths: {
        nodeOutDir,
        webOutDir,
        nodeEntry,
        webEntry,
      },
    },
  };
}

/**
 * Validate bundle sizes
 */
export function validateBundleSize(): ValidationResult {
  const projectRoot = resolve(process.cwd());
  const nodeBundle = join(projectRoot, 'out/node');
  const webBundle = join(projectRoot, 'out/web');

  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const errors: string[] = [];

  try {
    if (existsSync(nodeBundle)) {
      const stats = statSync(nodeBundle);
      if (stats.isDirectory() && getDirectorySize(nodeBundle) > MAX_SIZE) {
        errors.push('Node bundle exceeds size limit');
      }
    }

    if (existsSync(webBundle)) {
      const stats = statSync(webBundle);
      if (stats.isDirectory() && getDirectorySize(webBundle) > MAX_SIZE) {
        errors.push('Web bundle exceeds size limit');
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Bundle size validation failed: ${String(error)}`,
      details: {error},
    };
  }

  const success = errors.length === 0;
  return {
    success,
    message: success ? 'Bundle size validation passed' : errors.join(', '),
  };
}

/**
 * Get directory size in bytes
 */
function getDirectorySize(dirPath: string): number {
  try {
    // Use -k for kilobytes on macOS (more compatible than -b)
    const output = execSync(`du -sk "${dirPath}"`, {encoding: 'utf8'});
    const sizeStr = String(output).split('\t')[0];
    const sizeInKB =
      typeof sizeStr === 'string' && sizeStr.length > 0
        ? Number.parseInt(sizeStr, 10)
        : 0;
    // Convert kilobytes to bytes
    return sizeInKB * 1024;
  } catch {
    return 0;
  }
}

/**
 * Run integration tests
 */
export function runIntegrationTests(): ValidationResult {
  try {
    execSync('pnpm test:integration', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    return {
      success: true,
      message: 'Integration tests passed successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: `Integration tests failed: ${String(error)}`,
      details: {error},
    };
  }
}

/**
 * Scan for vulnerabilities
 */
export function scanVulnerabilities(): ValidationResult {
  try {
    execSync('pnpm audit --audit-level moderate', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    return {
      success: true,
      message:
        'Vulnerability scan completed - no moderate or high vulnerabilities found',
    };
  } catch (error) {
    const errorOutput = String(error);

    if (
      errorOutput.includes('no vulnerabilities found') ||
      errorOutput.includes('found 0 vulnerabilities')
    ) {
      return {
        success: true,
        message: 'Vulnerability scan completed - no vulnerabilities found',
      };
    }

    return {
      success: false,
      message: `Vulnerability scan found issues: ${errorOutput}`,
      details: {error: errorOutput},
    };
  }
}

/**
 * Run all validations
 */
export async function runAllValidations(): Promise<ValidationResult[]> {
  const validations = [
    {name: 'validateManifest', fn: () => validateManifest()},
    {name: 'validateDualTargetBuild', fn: () => validateDualTargetBuild()},
    {name: 'validateBundleSize', fn: () => validateBundleSize()},
    {name: 'runIntegrationTests', fn: () => runIntegrationTests()},
    {name: 'scanVulnerabilities', fn: () => scanVulnerabilities()},
  ];

  const results: ValidationResult[] = [];

  for (const validation of validations) {
    try {
      const result = validation.fn();
      results.push(result);

      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.message}`);

      if (!result.success && validation.name !== 'scanVulnerabilities') {
        console.log(
          '❌ Critical validation failure, stopping validation process',
        );
        break;
      }
    } catch (error) {
      const errorResult: ValidationResult = {
        success: false,
        message: `Validation failed with error: ${String(error)}`,
        details: {error},
      };
      results.push(errorResult);
      console.log(`❌ ${errorResult.message}`);
      break;
    }
  }

  return results;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  // Handle specific validation arguments
  if (args.includes('--bundle-size-only')) {
    const result = validateBundleSize();
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    process.exit(result.success ? 0 : 1);
  }

  if (args.includes('--manifest-only')) {
    const result = validateManifest();
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    process.exit(result.success ? 0 : 1);
  }

  if (args.includes('--dual-target-only')) {
    const result = validateDualTargetBuild();
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    process.exit(result.success ? 0 : 1);
  }

  if (args.includes('--integration-only')) {
    const result = runIntegrationTests();
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    process.exit(result.success ? 0 : 1);
  }

  if (args.includes('--vulnerabilities-only')) {
    const result = scanVulnerabilities();
    console.log(`${result.success ? '✅' : '❌'} ${result.message}`);
    process.exit(result.success ? 0 : 1);
  }

  // Run all validations
  runAllValidations()
    .then((results) => {
      const allPassed = results.every((r) => r.success);
      const failedCount = results.filter((r) => !r.success).length;

      console.log(`\n${'='.repeat(50)}`);
      console.log(
        `Validation Summary: ${results.length} checks, ${failedCount} failed`,
      );
      console.log('='.repeat(50));

      if (allPassed) {
        console.log('🎉 All validations passed! Ready for publishing.');
        process.exit(0);
      } else {
        console.log(
          `❌ ${failedCount} validation(s) failed. Publishing blocked.`,
        );
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Validation process failed:', error);
      process.exit(1);
    });
}
