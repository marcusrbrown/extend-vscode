import {vi} from 'vitest';

const mockVscode = {
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      clear: vi.fn(),
      show: vi.fn(),
    })),
  },
  workspace: {
    getConfiguration: vi.fn(),
    workspaceFolders: [],
    onDidChangeConfiguration: vi.fn(),
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
  ExtensionContext: vi.fn(),
};

vi.mock('vscode', () => mockVscode);

export {mockVscode};
