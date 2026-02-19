import type {PlaywrightTestConfig} from '@playwright/test';
import path from 'node:path';
import process from 'node:process';
import {devices} from '@playwright/test';

/**
 * Playwright configuration for VS Code extension visual regression testing
 * @see https://playwright.dev/docs/test-configuration
 */
const config: PlaywrightTestConfig = {
  // Test directory
  testDir: './test/visual',

  // Global timeout for each test
  timeout: 60 * 1000, // 60 seconds

  // Global timeout for each assertion
  expect: {
    // Screenshot comparison timeout
    timeout: 10 * 1000, // 10 seconds
  },

  // Run tests in files in parallel
  fullyParallel: false, // VS Code instances can conflict

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: Boolean(process.env.CI),

  // Retry on CI only
  retries: process.env.CI === 'true' ? 2 : 0,

  // Limit workers on CI to prevent resource conflicts
  workers: process.env.CI === 'true' ? 1 : 2,

  // Reporter to use
  reporter: [
    ['html', {outputFolder: 'test-results/visual-html'}],
    ['junit', {outputFile: 'test-results/visual-junit.xml'}],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL - will be set during test execution
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Capture video on failure
    video: 'retain-on-failure',

    // Browser context options
    viewport: {width: 1280, height: 720},

    // Ignore HTTPS errors (for localhost development)
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],

  // Global setup and teardown
  globalSetup: path.resolve(__dirname, 'test/visual/setup/global-setup.ts'),
  globalTeardown: path.resolve(
    __dirname,
    'test/visual/setup/global-teardown.ts',
  ),

  // Output directory for test artifacts
  outputDir: 'test-results/visual-artifacts',

  // Test patterns
  testMatch: '**/*.spec.ts',

  // Metadata
  metadata: {
    'test-type': 'visual-regression',
    extension: 'extend-vscode',
  },
};

export default config;
