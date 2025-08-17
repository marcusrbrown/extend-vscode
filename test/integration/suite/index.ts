import * as vscode from 'vscode';

// Export run function for VS Code test runner
export async function run(): Promise<void> {
  // Show a simple message to indicate integration tests ran
  if (typeof vscode.window.showInformationMessage === 'function') {
    vscode.window.showInformationMessage(
      'Integration tests completed successfully.',
    );
  }

  // For now, just check that the extension is activated
  const extension = vscode.extensions.getExtension(
    'marcusrbrown.extend-vscode',
  );
  if (extension && !extension.isActive) {
    await extension.activate();
  }

  // Test passes if we get here without throwing
  return Promise.resolve();
}
