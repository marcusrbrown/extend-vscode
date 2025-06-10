import {beforeAll} from 'vitest';
import * as vscode from 'vscode';

beforeAll(() => {
  vscode.window.showInformationMessage('Starting integration tests.');
});

// Import all integration test files
/*const integrationTests = */ Object.values(
  // @ts-expect-error - Vite's import.meta.glob is not recognized by TypeScript
  import.meta.glob('./**/*.test.ts', {eager: true}),
);

// Export run function for VS Code test runner
export async function run(): Promise<void> {
  // This function is called by the test runner to execute integration tests
  return Promise.resolve();
}
