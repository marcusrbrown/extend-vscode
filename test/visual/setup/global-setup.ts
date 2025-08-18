import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * Global setup for visual regression tests
 * This runs once before all tests
 */
async function globalSetup(): Promise<void> {
  process.stdout.write('🎭 Setting up visual regression tests...\n');

  // Create necessary directories
  const testDataDir = path.resolve(__dirname, '..', '..', '..', 'test-data');
  const userDataDir = path.join(testDataDir, 'user-data');
  const extensionsDir = path.join(testDataDir, 'extensions');
  const workspaceDir = path.join(testDataDir, 'test-workspace');

  try {
    await fs.mkdir(testDataDir, {recursive: true});
    await fs.mkdir(userDataDir, {recursive: true});
    await fs.mkdir(extensionsDir, {recursive: true});
    await fs.mkdir(workspaceDir, {recursive: true});

    process.stdout.write('✅ Test directories created successfully\n');
  } catch (error) {
    process.stderr.write(
      `⚠️  Warning: Could not create test directories: ${String(error)}\n`,
    );
  }

  // Clean up any existing test data
  try {
    await fs.rm(userDataDir, {recursive: true, force: true});
    await fs.rm(path.join(testDataDir, 'test-workspace'), {
      recursive: true,
      force: true,
    });
    await fs.mkdir(userDataDir, {recursive: true});
    await fs.mkdir(workspaceDir, {recursive: true});

    process.stdout.write('✅ Test data cleaned up\n');
  } catch (error) {
    process.stderr.write(
      `⚠️  Warning: Could not clean test data: ${String(error)}\n`,
    );
  }

  process.stdout.write('🎭 Visual regression test setup complete\n');
}

export default globalSetup;
