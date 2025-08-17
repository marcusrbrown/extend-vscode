// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type * as vscode from 'vscode';
import {commands, registerCommands} from './commands';
import {setupConfiguration} from './configuration';
import {ExtensionController} from './core/extension-controller';
import {setupStatusBar} from './status-bar';
import {setupTaskProvider} from './tasks';
import {setupTelemetry} from './telemetry';
import {setupTreeView} from './tree-view';
import {logger} from './utils/logger';
import {setupWebviewProvider} from './webview';

let controller: ExtensionController | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  try {
    controller = new ExtensionController();
    await controller.initialize(context);

    // Register core functionality
    await Promise.all([
      registerCommands(context, commands.webHello),
      setupWebviewProvider(context),
      setupConfiguration(context),
      setupTelemetry(context),
      setupStatusBar(context),
      setupTreeView(context),
      setupTaskProvider(context),
    ]);

    logger.info('Extension successfully activated');
  } catch (error) {
    logger.error('Failed to activate extension', error);
    throw error;
  }
}

// This method is called when your extension is deactivated
export async function deactivate() {
  try {
    await controller?.dispose();
    logger.info('Extension successfully deactivated');
  } catch (error) {
    logger.error('Error during extension deactivation', error);
    throw error;
  }
}
