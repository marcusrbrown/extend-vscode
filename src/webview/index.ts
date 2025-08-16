import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Base message type for webview communication
 */
export interface WebviewMessage {
  type: string;
  [key: string]: unknown;
}

/**
 * Options for creating a webview panel
 */
export interface WebviewPanelOptions<TMessage extends WebviewMessage> {
  /** Unique identifier for the webview type */
  viewType: string;
  /** Title shown in the webview panel */
  title: string;
  /** Initial column to show the webview in */
  column?: vscode.ViewColumn;
  /** Options for configuring the webview */
  options?: vscode.WebviewOptions & vscode.WebviewPanelOptions;
  /** Handler for messages received from the webview */
  onMessage?: (message: TMessage) => void | Promise<void>;
  /** Handler called when the webview is disposed */
  onDispose?: () => void | Promise<void>;
}

/**
 * Base class for creating webview panels with TypeScript support
 */
export abstract class WebviewPanel<
  TMessage extends WebviewMessage = WebviewMessage,
> {
  protected panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  constructor(
    protected readonly context: vscode.ExtensionContext,
    protected readonly options: WebviewPanelOptions<TMessage>,
  ) {
    this.panel = this.createWebviewPanel();
    this.initialize();
  }

  /**
   * Reveal the webview panel
   */
  reveal(column?: vscode.ViewColumn): void {
    this.panel.reveal(column);
  }

  /**
   * Dispose of the webview panel
   */
  dispose(): void {
    this.panel.dispose();
    this.disposables.forEach((d) => {
      d.dispose();
    });
    this.disposables = [];
  }

  /**
   * Get the webview's HTML content
   */
  protected abstract getHtmlContent(): string;

  /**
   * Post a message to the webview
   */
  protected postMessage(message: unknown): Thenable<boolean> {
    return this.panel.webview.postMessage(message);
  }

  private createWebviewPanel(): vscode.WebviewPanel {
    const defaultOptions: vscode.WebviewOptions & vscode.WebviewPanelOptions = {
      enableScripts: true,
      retainContextWhenHidden: true,
    };

    return vscode.window.createWebviewPanel(
      this.options.viewType,
      this.options.title,
      this.options.column ?? vscode.ViewColumn.One,
      {...defaultOptions, ...this.options.options},
    );
  }

  private initialize(): void {
    // Set initial HTML content
    this.panel.webview.html = this.getHtmlContent();

    // Handle messages and disposal
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage(async (message: TMessage) => {
        try {
          await this.options.onMessage?.(message);
        } catch (error) {
          logger.error('Error handling webview message:', error);
        }
      }),
      this.panel.onDidDispose(async () => {
        try {
          await this.options.onDispose?.();
        } catch (error) {
          logger.error('Error handling webview disposal:', error);
        }
        this.dispose();
      }),
    );
  }
}

/**
 * Example webview implementation
 */
export class HelloWebview extends WebviewPanel<WebviewMessage> {
  protected getHtmlContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello Webview</title>
      </head>
      <body>
        <h1>Hello from Webview!</h1>
        <button id="sendMessage">Send Message</button>

        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('sendMessage').addEventListener('click', () => {
            vscode.postMessage({ type: 'hello' });
          });
        </script>
      </body>
      </html>
    `;
  }
}

/**
 * Set up webview provider for the extension
 */
export function setupWebviewProvider(context: vscode.ExtensionContext): void {
  // Example command to show webview
  const disposable = vscode.commands.registerCommand(
    'extend-vscode.showWebview',
    () => {
      const webview = new HelloWebview(context, {
        viewType: 'extend-vscode.helloWebview',
        title: 'Hello Webview',
        onMessage: async (message) => {
          if (message.type === 'hello') {
            await vscode.window.showInformationMessage(
              'Received hello from webview!',
            );
          }
        },
      });
      return webview;
    },
  );

  context.subscriptions.push(disposable);
}
