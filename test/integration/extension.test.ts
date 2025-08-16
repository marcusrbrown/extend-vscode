import type * as vscodeTypes from 'vscode';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {commands} from '../../src/commands';
import {mockVscode, resetAllMocks} from '../setup';

describe('Extension Integration Test Suite', () => {
  const mockVscodeObj = mockVscode;
  const commandsObj = (mockVscodeObj.commands ?? {}) as Record<string, unknown>;
  let context: vscodeTypes.ExtensionContext;
  let commandHandler: unknown;

  beforeEach(async () => {
    resetAllMocks();
    if (typeof mockVscodeObj.ExtensionContext === 'function') {
      context = (
        mockVscodeObj.ExtensionContext as () => vscodeTypes.ExtensionContext
      )();
    }

    // Setup command registration mock to capture the handler
    if (typeof commandsObj.registerCommand === 'function') {
      (
        commandsObj.registerCommand as ReturnType<typeof vi.fn>
      ).mockImplementation(
        (command: string, handler: (...args: unknown[]) => unknown) => {
          if (command === commands.webHello.command) {
            commandHandler = handler;
          }
          return {dispose: vi.fn()};
        },
      );
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Extension activates and registers commands', async () => {
    const extension = await import('../../src/extension');
    await extension.activate(context);

    // Verify the webHello command is registered
    let registerCommandCalls: unknown;
    if (
      typeof commandsObj.registerCommand === 'function' &&
      'mock' in commandsObj.registerCommand
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      registerCommandCalls = (commandsObj.registerCommand as any).mock.calls;
    }
    let webHelloCall: unknown;
    if (Array.isArray(registerCommandCalls)) {
      webHelloCall = registerCommandCalls.find(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (call: any) => call[0] === commands.webHello.command,
      );
    }

    expect(webHelloCall).toBeDefined();
    if (Array.isArray(webHelloCall)) {
      expect(webHelloCall[0]).toBe(commands.webHello.command);
      expect(webHelloCall[1]).toBeInstanceOf(Function);
    }
  });

  test('Web Hello command shows information message', async () => {
    const extension = await import('../../src/extension');
    await extension.activate(context);

    // Execute the command handler
    if (typeof commandHandler === 'function') {
      await (commandHandler as (...args: unknown[]) => unknown)();
    }

    const windowObj = (mockVscodeObj.window ?? {}) as unknown as Record<
      string,
      unknown
    >;
    if (typeof windowObj.showInformationMessage === 'function') {
      expect(windowObj.showInformationMessage).toHaveBeenCalledWith(
        'Hello from Web Extension!',
      );
    }
  });
});
