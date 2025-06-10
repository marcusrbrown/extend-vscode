import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Configuration change event handler type
 */
export type ConfigurationChangeHandler<T = unknown> = (
  newValue: T,
  oldValue: T | undefined,
) => void | Promise<void>;

/**
 * Configuration section options
 */
export interface ConfigurationSectionOptions<T> {
  /** Default value if not set */
  defaultValue?: T;
  /** Validation function */
  validate?: (value: T) => boolean;
  /** Handler called when the configuration changes */
  onChange?: ConfigurationChangeHandler<T>;
}

/**
 * Configuration section that manages a specific configuration value
 */
export class ConfigurationSection<T> {
  private currentValue?: T;
  private disposable?: vscode.Disposable;
  private readonly section: string;
  private readonly options: ConfigurationSectionOptions<T>;

  constructor(section: string, options: ConfigurationSectionOptions<T> = {}) {
    this.section = section;
    this.options = options;
  }

  /**
   * Get the current value
   */
  getValue(): T {
    const config = vscode.workspace.getConfiguration();
    const value = config.get<T>(this.section);
    return value ?? (this.options.defaultValue as T);
  }

  /**
   * Set the value
   */
  async setValue(
    value: T,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global,
  ): Promise<void> {
    if (this.options.validate && !this.options.validate(value)) {
      throw new Error(`Invalid value for configuration ${this.section}`);
    }

    const config = vscode.workspace.getConfiguration();
    await config.update(this.section, value, target);
  }

  /**
   * Start watching for configuration changes
   */
  watch(): vscode.Disposable {
    if (this.disposable) {
      return this.disposable;
    }

    this.currentValue = this.getValue();

    this.disposable = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.section)) {
        const newValue = this.getValue();
        const oldValue = this.currentValue;
        this.currentValue = newValue;

        if (this.options.onChange) {
          try {
            Promise.resolve(this.options.onChange(newValue, oldValue)).catch(
              (error) => {
                logger.error(
                  `Error in configuration change handler for ${this.section}:`,
                  error,
                );
              },
            );
          } catch (error) {
            logger.error(
              `Error in configuration change handler for ${this.section}:`,
              error,
            );
          }
        }
      }
    });

    return this.disposable;
  }
}

/**
 * Configuration manager that handles multiple configuration sections
 */
export class ConfigurationManager {
  private sections = new Map<string, ConfigurationSection<any>>();

  /**
   * Create a new configuration section
   */
  createSection<T>(
    section: string,
    options: ConfigurationSectionOptions<T> = {},
  ): ConfigurationSection<T> {
    const configSection = new ConfigurationSection<T>(section, options);
    this.sections.set(section, configSection);
    return configSection;
  }

  /**
   * Get a configuration section
   */
  getSection<T>(section: string): ConfigurationSection<T> | undefined {
    return this.sections.get(section);
  }

  /**
   * Watch all sections for changes
   */
  watchAll(): vscode.Disposable[] {
    return Array.from(this.sections.values()).map((section) => section.watch());
  }
}

/**
 * Set up configuration for the extension
 */
export async function setupConfiguration(
  context: vscode.ExtensionContext,
): Promise<ConfigurationManager> {
  const manager = new ConfigurationManager();

  // Example configuration section
  manager.createSection<'debug' | 'info' | 'warn' | 'error'>(
    'extend-vscode.logLevel',
    {
      defaultValue: 'info',
      validate: (value) => ['debug', 'info', 'warn', 'error'].includes(value),
      onChange: (newValue) => {
        logger.info(`Log level changed to ${newValue}`);
      },
    },
  );

  // Watch for configuration changes
  const disposables = manager.watchAll();
  context.subscriptions.push(...disposables);

  return manager;
}
