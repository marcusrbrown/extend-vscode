import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Global teardown for visual regression tests
 * This runs once after all tests
 */
async function globalTeardown(): Promise<void> {
  // Clean up test data
  const testDataDir = path.resolve(__dirname, '..', '..', '..', 'test-data');

  try {
    // Only clean up temporary data, keep generated screenshots for review
    const userDataDir = path.join(testDataDir, 'user-data');
    await fs.rm(userDataDir, {recursive: true, force: true});

    // Clean up test workspace but preserve it if tests failed
    const workspaceDir = path.join(testDataDir, 'test-workspace');
    await fs.rm(workspaceDir, {recursive: true, force: true});
  } catch (error) {
    console.warn('⚠️  Warning: Could not clean up test data:', error);
  }
}

export default globalTeardown;
