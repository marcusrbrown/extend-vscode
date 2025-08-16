import type {MockVSCode} from '../../types/mock-vscode';
import {vi} from 'vitest';

// Create a more comprehensive VS Code mock with proper typing
const createMockVSCode = (): MockVSCode => ({
  version: '1.85.0',
  env: {
    machineId: 'test-machine-id',
    appName: 'VS Code',
    appRoot: '/test/app/root',
    language: 'en',
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  ThemeColor: vi.fn((id: string) => ({id})),
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      clear: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
    createWebviewPanel: vi.fn(() => ({
      webview: {
        html: '',
        onDidReceiveMessage: vi.fn(() => ({
          dispose: vi.fn(),
        })),
        postMessage: vi.fn(),
        asWebviewUri: vi.fn(),
      },
      onDidDispose: vi.fn(() => ({
        dispose: vi.fn(),
      })),
      dispose: vi.fn(),
      reveal: vi.fn(),
    })),
    createStatusBarItem: vi.fn((alignment?: number, priority?: number) => ({
      text: '',
      tooltip: '',
      command: undefined,
      color: undefined,
      backgroundColor: undefined,
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
      alignment,
      priority,
    })),
  },
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
      update: vi.fn(),
      has: vi.fn(),
    })),
    workspaceFolders: [],
    onDidChangeConfiguration: vi.fn(),
    getWorkspaceFolder: vi.fn(),
    workspaceFile: undefined,
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
    registerTextEditorCommand: vi.fn(),
  },
  languages: {
    registerCodeLensProvider: vi.fn(),
    registerHoverProvider: vi.fn(),
  },
  ExtensionContext: vi.fn(() => ({
    subscriptions: [],
    extensionPath: '/fake/path',
    extension: {
      packageJSON: {
        version: '1.0.0',
        name: 'extend-vscode',
      },
    },
    globalState: {
      get: vi.fn(),
      update: vi.fn(),
    },
    workspaceState: {
      get: vi.fn(),
      update: vi.fn(),
    },
  })),
  Uri: {
    file: vi.fn((f: string) => ({fsPath: f})),
    parse: vi.fn(),
  },
  Position: vi.fn(),
  Range: vi.fn(),
  RelativePattern: vi.fn(),
  EventEmitter: vi.fn(),
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Active: -1,
    Beside: -2,
  } as const,
});

const vscode = createMockVSCode();

export {createMockVSCode, vscode as default};
