import type * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Core controller class that manages the extension's lifecycle and provides
 * centralized state management and cleanup.
 */
export class ExtensionController {
  private context: vscode.ExtensionContext | undefined;
  private disposables: vscode.Disposable[] = [];

  /**
   * Initialize the controller with the extension context
   */
  async initialize(context: vscode.ExtensionContext): Promise<void> {
    this.context = context;
    logger.info('Initializing extension controller');
  }

  /**
   * Register a disposable that will be cleaned up when the extension is deactivated
   */
  registerDisposable(disposable: vscode.Disposable): void {
    this.disposables.push(disposable);
    this.context?.subscriptions.push(disposable);
  }

  /**
   * Get the extension's global state storage
   */
  getGlobalState(): vscode.Memento {
    if (!this.context) {
      throw new Error('Extension context not initialized');
    }
    return this.context.globalState;
  }

  /**
   * Get the extension's workspace state storage
   */
  getWorkspaceState(): vscode.Memento {
    if (!this.context) {
      throw new Error('Extension context not initialized');
    }
    return this.context.workspaceState;
  }

  /**
   * Get the extension's context
   */
  getContext(): vscode.ExtensionContext {
    if (!this.context) {
      throw new Error('Extension context not initialized');
    }
    return this.context;
  }

  /**
   * Clean up resources when the extension is deactivated
   */
  async dispose(): Promise<void> {
    logger.info('Disposing extension controller');

    for (const disposable of this.disposables) {
      try {
        disposable.dispose();
      } catch (error) {
        logger.error('Error disposing resource', error);
      }
    }

    this.disposables = [];
    this.context = undefined;
  }
}
