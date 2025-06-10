import {beforeAll} from 'vitest';
import * as vscode from 'vscode';

beforeAll(() => {
  vscode.window.showInformationMessage('Starting all tests.');
});

// Import all test files
const testModules = Object.values(
  // @ts-expect-error - Vite's import.meta.glob is not recognized by TypeScript
  import.meta.glob('./**/*.test.ts', {eager: true}),
);

// Export test modules for test runner
export {testModules};
