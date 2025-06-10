// Export feature modules
export * from './commands';

export * from './configuration';
// Export core utilities
export * from './core/ExtensionController';
export * from './statusBar';
export * from './tasks';
export * from './telemetry';
export * from './treeView';
// Export utilities
export * from './utils/logger';

export * from './webview';

// Re-export commonly used VS Code types
export type {
  Command,
  ConfigurationTarget,
  Disposable,
  ExtensionContext,
  ProcessExecution,
  ShellExecution,
  StatusBarAlignment,
  StatusBarItem,
  Task,
  TaskDefinition,
  TaskScope,
  ThemeColor,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  WebviewOptions,
  WebviewPanel,
} from 'vscode';
