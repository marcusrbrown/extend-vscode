import type * as vscodeTypes from 'vscode';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {mockVscode, resetAllMocks} from '../setup';

// Using dynamic import to avoid direct dependency on extension
const getExtension = async () => {
  return await import('../../src/extension');
};

describe('Extension Integration Test Suite', () => {
  let commandHandler: (...args: any[]) => any;

  beforeEach(() => {
    // Reset all mocks before each test
    resetAllMocks();

    // Setup command registration mock to capture the handler
    vi.mocked(mockVscode.commands.registerCommand).mockImplementation(
      (command, handler) => {
        if (command === 'extend-vscode.webHello') {
          commandHandler = handler;
        }
        return {dispose: vi.fn()};
      },
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Extension activates and registers commands', async () => {
    const context =
      mockVscode.ExtensionContext() as unknown as vscodeTypes.ExtensionContext;
    const extension = await getExtension();

    extension.activate(context);

    expect(mockVscode.commands.registerCommand).toHaveBeenCalledWith(
      'extend-vscode.webHello',
      expect.any(Function),
    );
  });

  test('Web Hello command shows information message', async () => {
    const context =
      mockVscode.ExtensionContext() as unknown as vscodeTypes.ExtensionContext;
    const extension = await getExtension();

    extension.activate(context);

    // Execute the command handler
    await commandHandler?.();

    expect(mockVscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Hello from Web Extension!',
    );
  });
});
