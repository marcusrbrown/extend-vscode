#!/usr/bin/env tsx

import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import process from 'node:process';

export interface RollbackOptions {
  marketplace?: boolean;
  npm?: boolean;
  openvsix?: boolean;
  tag?: string;
  version?: string;
}

export interface RollbackResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Get the current package version from package.json
 */
function getCurrentVersion(): string {
  const projectRoot = resolve(process.cwd());
  const packageJsonPath = join(projectRoot, 'package.json');

  try {
    const packageJsonText = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonText) as {version?: string};
    return packageJson.version ?? '0.0.0';
  } catch (error) {
    throw new Error(
      `Failed to read version from package.json: ${String(error)}`,
    );
  }
}

/**
 * Rollback npm package publication
 */
export function rollbackNpmPackage(version: string): RollbackResult {
  try {
    console.log(`Rolling back npm package version ${version}...`);

    // Unpublish the specific version
    execSync(`npm unpublish extend-vscode@${version}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    return {
      success: true,
      message: `Successfully rolled back npm package version ${version}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to rollback npm package: ${String(error)}`,
      details: {error},
    };
  }
}

/**
 * Create GitHub release rollback (mark as draft/prerelease)
 */
export function rollbackGitHubRelease(tag: string): RollbackResult {
  try {
    console.log(`Rolling back GitHub release ${tag}...`);

    // Mark the release as draft using GitHub CLI
    execSync(`gh release edit ${tag} --draft`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    return {
      success: true,
      message: `Successfully marked GitHub release ${tag} as draft`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to rollback GitHub release: ${String(error)}`,
      details: {error},
    };
  }
}

/**
 * Log rollback instructions for manual intervention
 */
export function logManualRollbackInstructions(
  options: RollbackOptions,
): RollbackResult {
  console.log('📋 Manual Rollback Instructions:');
  console.log('================================');

  if (options.marketplace) {
    console.log('\n🏪 VS Code Marketplace:');
    console.log('1. Go to https://marketplace.visualstudio.com/manage');
    console.log('2. Find your extension "extend-vscode"');
    console.log('3. Click "More actions" > "Unpublish" or "Update"');
    console.log('4. Follow the marketplace guidelines for unpublishing');
  }

  if (options.openvsix) {
    console.log('\n🌐 OpenVSIX Registry:');
    console.log(
      '1. Contact OpenVSIX maintainers to remove the published version',
    );
    console.log('2. There is no automated way to unpublish from OpenVSIX');
    console.log('3. Consider publishing a patch version with fixes instead');
  }

  if (
    options.npm &&
    typeof options.version === 'string' &&
    options.version.length > 0
  ) {
    console.log(`\n📦 npm Package (if automated rollback failed):`);
    console.log(`1. Run: npm unpublish extend-vscode@${options.version}`);
    console.log('2. Note: npm unpublish has a 72-hour window restriction');
    console.log('3. Consider publishing a patch version instead');
  }

  if (typeof options.tag === 'string' && options.tag.length > 0) {
    console.log(`\n🏷️ Git Tag (if needed):`);
    console.log(`1. Delete local tag: git tag -d ${options.tag}`);
    console.log(
      `2. Delete remote tag: git push origin --delete ${options.tag}`,
    );
    console.log('3. Update CHANGELOG.md to reflect the rollback');
  }

  console.log('\n⚠️ Important Notes:');
  console.log('- Some platforms have restrictions on unpublishing');
  console.log('- Consider publishing a hotfix version instead of unpublishing');
  console.log('- Update documentation and notify users of any issues');
  console.log('- Review and fix the root cause before republishing');

  return {
    success: true,
    message: 'Manual rollback instructions logged',
  };
}

/**
 * Execute automated rollback for supported platforms
 */
export function executeRollback(options: RollbackOptions): RollbackResult[] {
  const results: RollbackResult[] = [];
  const version = options.version ?? getCurrentVersion();
  const tag = options.tag ?? `v${version}`;

  console.log(`🔄 Starting rollback for version ${version}...`);

  // Rollback npm if requested and possible
  if (options.npm) {
    const npmResult = rollbackNpmPackage(version);
    results.push(npmResult);
  }

  // Rollback GitHub release if requested
  if (typeof options.tag === 'string' && options.tag.length > 0) {
    const githubResult = rollbackGitHubRelease(tag);
    results.push(githubResult);
  }

  // Log manual instructions for platforms that require manual intervention
  if (options.marketplace || options.openvsix) {
    const manualResult = logManualRollbackInstructions(options);
    results.push(manualResult);
  }

  return results;
}

/**
 * Emergency rollback - attempt to rollback all platforms
 */
export function emergencyRollback(): RollbackResult[] {
  console.log('🚨 EMERGENCY ROLLBACK INITIATED');
  console.log('Attempting to rollback all publishing targets...\n');

  const version = getCurrentVersion();

  return executeRollback({
    marketplace: true,
    npm: true,
    openvsix: true,
    tag: `v${version}`,
    version,
  });
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--emergency')) {
    const results = emergencyRollback();
    const failedCount = results.filter((r) => !r.success).length;

    console.log(
      `\n📊 Rollback Summary: ${results.length} operations, ${failedCount} failed`,
    );

    if (failedCount === 0) {
      console.log('✅ Emergency rollback completed successfully');
      process.exit(0);
    } else {
      console.log(
        '⚠️ Some rollback operations failed - check manual instructions above',
      );
      process.exit(1);
    }
  }

  // Parse individual options
  const options: RollbackOptions = {
    marketplace: args.includes('--marketplace'),
    npm: args.includes('--npm'),
    openvsix: args.includes('--openvsix'),
    version: args.find((arg) => arg.startsWith('--version='))?.split('=')[1],
    tag: args.find((arg) => arg.startsWith('--tag='))?.split('=')[1],
  };

  if (
    Object.values(options).every(
      (v) => v === false || v === undefined || v === '',
    )
  ) {
    console.log('Usage: tsx scripts/rollback.ts [options]');
    console.log('');
    console.log('Options:');
    console.log(
      '  --emergency                 Emergency rollback all platforms',
    );
    console.log(
      '  --marketplace              Rollback VS Code Marketplace (manual)',
    );
    console.log('  --npm                      Rollback npm package');
    console.log('  --openvsix                 Rollback OpenVSIX (manual)');
    console.log('  --version=VERSION          Specify version to rollback');
    console.log('  --tag=TAG                  Specify git tag to rollback');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/rollback.ts --emergency');
    console.log('  tsx scripts/rollback.ts --npm --version=1.0.1');
    console.log('  tsx scripts/rollback.ts --marketplace --openvsix');
    process.exit(1);
  }

  const results = executeRollback(options);
  const failedCount = results.filter((r) => !r.success).length;

  console.log(
    `\n📊 Rollback Summary: ${results.length} operations, ${failedCount} failed`,
  );

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.message}`);
  }

  if (failedCount === 0) {
    console.log('\n🎉 Rollback completed successfully');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some rollback operations failed');
    process.exit(1);
  }
}
