import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Base tree item data that can be extended by implementations
 */
export interface TreeItemData {
  /** Unique identifier for the item */
  id: string;
  /** Label shown in the tree */
  label: string;
  /** Optional description shown next to the label */
  description?: string;
  /** Optional tooltip shown on hover */
  tooltip?: string;
  /** Optional command to execute when clicking the item */
  command?: vscode.Command;
  /** Optional context value for when clause contexts */
  contextValue?: string;
}

/**
 * Base tree data provider that can be extended for custom tree views
 */
export abstract class TreeDataProvider<T extends TreeItemData>
  implements vscode.TreeDataProvider<T>
{
  readonly onDidChangeTreeData: vscode.Event<T | undefined>;
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    T | undefined
  >();

  constructor() {
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  /**
   * Get the tree item for the given element
   */
  getTreeItem(element: T): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.label,
      this.getCollapsibleState(element),
    );

    if (
      typeof element.description === 'string' &&
      element.description.length > 0
    ) {
      treeItem.description = element.description;
    }
    if (typeof element.tooltip === 'string' && element.tooltip.length > 0) {
      treeItem.tooltip = element.tooltip;
    }
    if (element.command) {
      treeItem.command = element.command;
    }
    if (
      typeof element.contextValue === 'string' &&
      element.contextValue.length > 0
    ) {
      treeItem.contextValue = element.contextValue;
    }

    return treeItem;
  }

  /**
   * Get the children of the given element
   */
  abstract getChildren(element?: T): Thenable<T[]>;

  /**
   * Get the parent of the given element
   */
  getParent?(_element: T): vscode.ProviderResult<T> {
    return undefined;
  }

  /**
   * Refresh the tree view
   */
  refresh(element?: T): void {
    this._onDidChangeTreeData.fire(element);
  }

  /**
   * Get the collapsible state for the given element
   */
  protected getCollapsibleState(_element: T): vscode.TreeItemCollapsibleState {
    return vscode.TreeItemCollapsibleState.None;
  }
}

/**
 * Example tree item implementation
 */
export interface ExampleTreeItem extends TreeItemData {
  /** Whether the item has children */
  hasChildren?: boolean;
}

/**
 * Example tree data provider implementation
 */
export class ExampleTreeProvider extends TreeDataProvider<ExampleTreeItem> {
  private readonly items: ExampleTreeItem[] = [
    {
      id: '1',
      label: 'Parent',
      hasChildren: true,
    },
    {
      id: '1.1',
      label: 'Child 1',
      description: 'First child',
      command: {
        command: 'extend-vscode.showMessage',
        title: 'Show Message',
        arguments: ['Clicked Child 1'],
      },
    },
    {
      id: '1.2',
      label: 'Child 2',
      description: 'Second child',
      contextValue: 'child',
    },
  ];

  async getChildren(element?: ExampleTreeItem): Promise<ExampleTreeItem[]> {
    if (!element) {
      return this.items.filter((item) => !item.id.includes('.'));
    }
    return this.items.filter((item) => item.id.startsWith(`${element.id}.`));
  }

  protected override getCollapsibleState(
    element: ExampleTreeItem,
  ): vscode.TreeItemCollapsibleState {
    return element.hasChildren
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.None;
  }
}

/**
 * Set up tree view provider for the extension
 */
export function setupTreeView(context: vscode.ExtensionContext): void {
  try {
    const treeDataProvider = new ExampleTreeProvider();
    const treeView = vscode.window.createTreeView('extend-vscode.exampleTree', {
      treeDataProvider,
    });

    // Register refresh command
    const refreshCommand = vscode.commands.registerCommand(
      'extend-vscode.refreshTree',
      () => treeDataProvider.refresh(),
    );

    // Register message command
    const messageCommand = vscode.commands.registerCommand(
      'extend-vscode.showMessage',
      async (message: string) => {
        await vscode.window.showInformationMessage(message);
      },
    );

    context.subscriptions.push(treeView, refreshCommand, messageCommand);
  } catch (error) {
    logger.error('Failed to set up tree view:', error);
  }
}
