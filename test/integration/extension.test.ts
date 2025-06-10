import type * as vscodeTypes from 'vscode';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {commands} from '../../src/commands';
import {mockVscode, resetAllMocks} from '../setup';

describe('Extension Integration Test Suite', () => {
  let context: vscodeTypes.ExtensionContext;
  let commandHandler: (...args: any[]) => any;

  beforeEach(async () => {
    resetAllMocks();
    context =
      mockVscode.ExtensionContext() as unknown as vscodeTypes.ExtensionContext;

    // Setup command registration mock to capture the handler
    vi.mocked(mockVscode.commands.registerCommand).mockImplementation(
      (command, handler) => {
        if (command === commands.webHello.command) {
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
    const extension = await import('../../src/extension');
    await extension.activate(context);

    // Verify the webHello command is registered
    const registerCommandCalls = vi.mocked(mockVscode.commands.registerCommand)
      .mock.calls;
    const webHelloCall = registerCommandCalls.find(
      (call) => call[0] === commands.webHello.command,
    );

    expect(webHelloCall).toBeDefined();
    expect(webHelloCall?.[0]).toBe(commands.webHello.command);
    expect(webHelloCall?.[1]).toBeInstanceOf(Function);
  });

  test('Web Hello command shows information message', async () => {
    const extension = await import('../../src/extension');
    await extension.activate(context);

    // Execute the command handler
    await commandHandler?.();

    expect(mockVscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Hello from Web Extension!',
    );
  });
});
