import {beforeAll} from 'vitest';
import * as vscode from 'vscode';

beforeAll(() => {
  if (typeof vscode.window.showInformationMessage === 'function') {
    vscode.window.showInformationMessage('Starting all tests.');
  }
});

// Import all test files using proper typing
const globResult = import.meta.glob<Record<string, unknown>>('./**/*.test.ts', {
  eager: true,
});

const TEST_MODULES = Object.values(globResult);

// Export test modules for test runner
export {TEST_MODULES as testModules};
