import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Command handler function type
 */
export type CommandHandler = (...args: any[]) => any;

/**
 * Command registration options
 */
export interface CommandRegistration {
  /** Command identifier */
  command: string;
  /** Command handler function */
  handler: CommandHandler;
  /** Optional command title for the command palette */
  title?: string;
  /** Optional command category for grouping in the command palette */
  category?: string;
}

/**
 * Register multiple commands with error handling and logging
 */
export async function registerCommands(
  context: vscode.ExtensionContext,
  ...commands: CommandRegistration[]
): Promise<void> {
  for (const {command, handler, title, category} of commands) {
    try {
      const disposable = vscode.commands.registerCommand(
        command,
        async (...args) => {
          try {
            await handler(...args);
          } catch (error) {
            logger.error(`Error executing command ${command}:`, error);
            throw error;
          }
        },
      );

      context.subscriptions.push(disposable);
      logger.debug(`Registered command: ${command}`);

      // Register command metadata if title is provided
      if (title) {
        const commandTitle = category ? `${category}: ${title}` : title;
        await vscode.commands.executeCommand(
          'setContext',
          `${command}.title`,
          commandTitle,
        );
      }
    } catch (error) {
      logger.error(`Failed to register command ${command}:`, error);
      throw error;
    }
  }
}

/**
 * Create a command registration object
 */
export function createCommand(
  command: string,
  handler: CommandHandler,
  options: {title?: string; category?: string} = {},
): CommandRegistration {
  return {
    command,
    handler,
    ...options,
  };
}

/**
 * Example command registrations
 */
export const commands = {
  webHello: createCommand(
    'extend-vscode.webHello',
    () => vscode.window.showInformationMessage('Hello from Web Extension!'),
    {title: 'Hello from Web Extension', category: 'Extend VSCode'},
  ),
};
