import * as vscode from 'vscode';

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Whether to include timestamps in log messages */
  timestamps?: boolean;
  /** Output channel name */
  channelName?: string;
}

/**
 * Default logger options
 */
const DEFAULT_OPTIONS: Required<LoggerOptions> = {
  minLevel: 'info',
  timestamps: true,
  channelName: 'Extend VSCode',
};

/**
 * Logger class that provides consistent logging across the extension
 */
class Logger {
  private readonly outputChannel: vscode.OutputChannel;
  private readonly options: Required<LoggerOptions>;

  constructor(options: LoggerOptions = {}) {
    this.options = {...DEFAULT_OPTIONS, ...options};
    this.outputChannel = vscode.window.createOutputChannel(
      this.options.channelName,
    );
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string | Error, ...args: unknown[]): void {
    if (message instanceof Error) {
      this.log('error', message.message, ...args);
      if (typeof message.stack === 'string' && message.stack.length > 0) {
        this.log('error', message.stack);
      }
    } else {
      this.log('error', message, ...args);
    }
  }

  /**
   * Show the output channel
   */
  show(): void {
    this.outputChannel.show();
  }

  /**
   * Dispose of the logger resources
   */
  dispose(): void {
    this.outputChannel.dispose();
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = this.options.timestamps
      ? `[${new Date().toISOString()}] `
      : '';
    const prefix = `${timestamp}[${level.toUpperCase()}] `;

    let logMessage = `${prefix}${message}`;
    if (args.length > 0) {
      logMessage += ` ${args.map((arg) => this.formatArg(arg)).join(' ')}`;
    }

    this.outputChannel.appendLine(logMessage);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(this.options.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  private formatArg(arg: unknown): string {
    if (arg === null) {
      return 'null';
    }
    if (arg === undefined) {
      return 'undefined';
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return '[Object]';
      }
    }
    return String(arg);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();
