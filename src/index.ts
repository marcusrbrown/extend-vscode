// Export feature modules
export * from './commands';

export * from './configuration';
// Export core utilities
export * from './core/extension-controller';
export * from './status-bar';
export * from './tasks';
export * from './telemetry';
export * from './tree-view';
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
