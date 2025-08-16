import {beforeAll} from 'vitest';
import * as vscode from 'vscode';

beforeAll(() => {
  if (typeof vscode.window.showInformationMessage === 'function') {
    vscode.window.showInformationMessage('Starting integration tests.');
  }
});

// Import all integration test files using proper typing
const globResult = import.meta.glob<Record<string, unknown>>('./**/*.test.ts', {
  eager: true,
});

// Consume the glob result to ensure test files are loaded
Object.values(globResult);

// Export run function for VS Code test runner
export async function run(): Promise<void> {
  // This function is called by the test runner to execute integration tests
  return Promise.resolve();
}
