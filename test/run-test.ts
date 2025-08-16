import * as path from 'node:path';
import * as process from 'node:process';
import {runTests} from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '..');

    // The path to the integration test runner
    const extensionTestsPath = path.resolve(
      __dirname,
      './integration/suite/index',
    );

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // Use Vitest for running tests
      launchArgs: [
        '--disable-extensions', // Disable all other extensions
        '--disable-gpu', // Disable GPU hardware acceleration
        '--disable-workspace-trust', // Disable workspace trust dialog
      ],
      // Pass environment variables to configure Vitest
      extensionTestsEnv: {
        NODE_ENV: 'test',
        VITEST: 'true',
      },
    });
  } catch (error) {
    console.error('Failed to run tests:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Failed to run tests:', error);
  process.exit(1);
});
