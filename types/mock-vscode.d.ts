import type {Mock} from 'vitest';
import type * as vscode from 'vscode';

// Mock interfaces that match VSCode API structure but use Mock types where appropriate
export interface MockWebview {
  html: string;
  onDidReceiveMessage: Mock;
  postMessage: Mock;
  asWebviewUri: Mock;
}

export interface MockWebviewPanel {
  webview: MockWebview;
  onDidDispose: Mock;
  dispose: Mock;
  reveal: Mock;
}

export interface MockWindow {
  showInformationMessage: Mock;
  showErrorMessage: Mock;
  showWarningMessage: Mock;
  createOutputChannel: Mock;
  createWebviewPanel: Mock;
  createStatusBarItem: Mock;
}

export interface MockExtensionContext {
  subscriptions: vscode.Disposable[];
  extensionPath: string;
  extension: {
    packageJSON: {
      version: string;
      name: string;
    };
  };
  globalState: {
    get: Mock;
    update: Mock;
  };
  workspaceState: {
    get: Mock;
    update: Mock;
  };
}

export interface MockVSCode {
  version: string;
  env: {
    machineId: string;
    appName: string;
    appRoot: string;
    language: string;
  };
  StatusBarAlignment: typeof vscode.StatusBarAlignment;
  ThemeColor: Mock;
  window: MockWindow;
  workspace: {
    getConfiguration: Mock;
    workspaceFolders: vscode.WorkspaceFolder[] | undefined;
    onDidChangeConfiguration: Mock;
    getWorkspaceFolder: Mock;
    workspaceFile: vscode.Uri | undefined;
  };
  commands: {
    registerCommand: Mock;
    executeCommand: Mock;
    registerTextEditorCommand: Mock;
  };
  languages: {
    registerCodeLensProvider: Mock;
    registerHoverProvider: Mock;
  };
  ExtensionContext: Mock;
  Uri: {
    file: Mock;
    parse: Mock;
  };
  Position: Mock;
  Range: Mock;
  RelativePattern: Mock;
  EventEmitter: Mock;
  ViewColumn: typeof vscode.ViewColumn;
}
