import {vi} from 'vitest';

// Create a more comprehensive VS Code mock
const createMockVSCode = () => ({
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
    createWebviewPanel: vi.fn(),
  },
  workspace: {
    getConfiguration: vi.fn(),
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
});

const vscode = createMockVSCode();

export {createMockVSCode, vscode as default};
