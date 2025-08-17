import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Status bar item options
 */
export interface StatusBarItemOptions {
  /** Text alignment in the status bar */
  alignment?: vscode.StatusBarAlignment;
  /** Priority among other status bar items */
  priority?: number;
  /** Command to execute when clicking the item */
  command?: string | vscode.Command;
  /** Initial text to display */
  text?: string;
  /** Initial tooltip to show on hover */
  tooltip?: string;
  /** Initial background color */
  backgroundColor?: vscode.ThemeColor;
  /** Initial color */
  color?: vscode.ThemeColor;
}

/**
 * Status bar item manager
 */
export class StatusBarItem {
  private readonly item: vscode.StatusBarItem;

  constructor(options: StatusBarItemOptions = {}) {
    this.item = vscode.window.createStatusBarItem(
      options.alignment ?? vscode.StatusBarAlignment.Left,
      options.priority,
    );

    if (typeof options.command === 'string' && options.command.length > 0) {
      this.item.command = options.command;
    }
    if (typeof options.text === 'string' && options.text.length > 0) {
      this.item.text = options.text;
    }
    if (typeof options.tooltip === 'string' && options.tooltip.length > 0) {
      this.item.tooltip = options.tooltip;
    }
    if (options.backgroundColor) {
      this.item.backgroundColor = options.backgroundColor;
    }
    if (options.color) {
      this.item.color = options.color;
    }
  }

  /**
   * Show the status bar item
   */
  show(): void {
    this.item.show();
  }

  /**
   * Hide the status bar item
   */
  hide(): void {
    this.item.hide();
  }

  /**
   * Dispose of the status bar item
   */
  dispose(): void {
    this.item.dispose();
  }

  /**
   * Set the text to show
   */
  setText(text: string): void {
    this.item.text = text;
  }

  /**
   * Set the tooltip to show on hover
   */
  setTooltip(tooltip: string): void {
    this.item.tooltip = tooltip;
  }

  /**
   * Set the command to execute when clicking
   */
  setCommand(command: string | vscode.Command): void {
    this.item.command = command;
  }

  /**
   * Set the background color
   */
  setBackgroundColor(color: vscode.ThemeColor): void {
    this.item.backgroundColor = color;
  }

  /**
   * Set the text color
   */
  setColor(color: vscode.ThemeColor): void {
    this.item.color = color;
  }
}

/**
 * Status bar manager that handles multiple status bar items
 */
export class StatusBarManager {
  private readonly items = new Map<string, StatusBarItem>();

  /**
   * Create a new status bar item
   */
  createItem(id: string, options: StatusBarItemOptions = {}): StatusBarItem {
    const item = new StatusBarItem(options);
    this.items.set(id, item);
    return item;
  }

  /**
   * Get a status bar item by ID
   */
  getItem(id: string): StatusBarItem | undefined {
    return this.items.get(id);
  }

  /**
   * Remove a status bar item
   */
  removeItem(id: string): void {
    const item = this.items.get(id);
    if (item) {
      item.dispose();
      this.items.delete(id);
    }
  }

  /**
   * Dispose of all status bar items
   */
  dispose(): void {
    for (const item of this.items.values()) {
      item.dispose();
    }
    this.items.clear();
  }
}

/**
 * Set up status bar for the extension
 */
export function setupStatusBar(
  context: vscode.ExtensionContext,
): StatusBarManager {
  try {
    const manager = new StatusBarManager();

    // Example status bar item
    const item = manager.createItem('extend-vscode.status', {
      text: '$(rocket) Extend VSCode',
      tooltip: 'Click to show commands',
      command: 'extend-vscode.showWebview',
      alignment: vscode.StatusBarAlignment.Right,
      priority: 100,
    });

    item.show();

    // Ensure items are disposed when the extension is deactivated
    context.subscriptions.push({
      dispose: () => manager.dispose(),
    });

    return manager;
  } catch (error) {
    logger.error('Failed to set up status bar:', error);
    throw error;
  }
}
