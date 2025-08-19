import type * as vscode from 'vscode';
import process from 'node:process';
import {
  PerformanceProfiler,
  type PerformanceBenchmark,
  type PerformanceThresholds,
} from './profiler';

export interface ExtensionActivationMetrics {
  /** Time from activation event to extension ready */
  activationTime: number;
  /** Memory usage after activation */
  memoryUsage: number;
  /** Number of commands registered */
  commandsRegistered: number;
  /** Number of disposables created */
  disposablesCreated: number;
  /** VS Code version */
  vsCodeVersion: string;
  /** Extension version */
  extensionVersion: string;
}

export interface CommandExecutionMetrics {
  /** Command identifier */
  commandId: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Memory delta during execution */
  memoryDelta: number;
  /** Whether the command succeeded */
  success: boolean;
  /** Error message if command failed */
  error?: string;
  /** Additional command-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Specialized performance profiler for VS Code extensions
 */
export class ExtensionPerformanceProfiler {
  private static instance: ExtensionPerformanceProfiler | null = null;
  private readonly profiler: PerformanceProfiler;
  private extensionContext?: vscode.ExtensionContext;
  private activationMetrics?: ExtensionActivationMetrics;
  private commandMetrics: CommandExecutionMetrics[] = [];

  private constructor() {
    this.profiler = PerformanceProfiler.getInstance();
  }

  static getInstance(): ExtensionPerformanceProfiler {
    if (!ExtensionPerformanceProfiler.instance) {
      ExtensionPerformanceProfiler.instance =
        new ExtensionPerformanceProfiler();
    }
    return ExtensionPerformanceProfiler.instance;
  }

  /**
   * Initialize the profiler with extension context
   */
  initialize(context: vscode.ExtensionContext): void {
    this.extensionContext = context;
  }

  /**
   * Measure extension activation performance
   */
  async measureActivation<T>(
    activationFn: () => Promise<T>,
    thresholds?: PerformanceThresholds,
  ): Promise<{result: T; metrics: ExtensionActivationMetrics}> {
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage().heapUsed;

    // Track disposables created during activation
    const disposablesBefore = this.extensionContext?.subscriptions.length ?? 0;

    const result = await activationFn();
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;
    const disposablesAfter = this.extensionContext?.subscriptions.length ?? 0;

    const metrics: ExtensionActivationMetrics = {
      activationTime: endTime - startTime,
      memoryUsage: memoryAfter,
      commandsRegistered: 0, // Will be populated by command registration tracking
      disposablesCreated: disposablesAfter - disposablesBefore,
      vsCodeVersion: 'unknown', // Will be set externally due to import type limitation
      extensionVersion:
        (this.extensionContext?.extension.packageJSON as {version?: string})
          ?.version ?? 'unknown',
    };

    this.activationMetrics = metrics;

    // Create benchmark for the profiler
    const benchmark: PerformanceBenchmark = {
      name: 'extension-activation',
      metrics: {
        duration: metrics.activationTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
        timestamp: Date.now(),
        metadata: {
          vsCodeVersion: metrics.vsCodeVersion,
          extensionVersion: metrics.extensionVersion,
          disposablesCreated: metrics.disposablesCreated,
        },
      },
      thresholds,
    };

    this.profiler.getMeasurements().push(benchmark);

    return {result, metrics};
  }

  /**
   * Measure command execution performance
   */
  async measureCommand<T>(
    commandId: string,
    commandFn: () => Promise<T>,
    thresholds?: PerformanceThresholds,
  ): Promise<{result: T; metrics: CommandExecutionMetrics}> {
    const {result, benchmark} = await this.profiler.measureAsync(
      `command-${commandId}`,
      commandFn,
      {metadata: {commandId}},
    );

    const commandMetrics: CommandExecutionMetrics = {
      commandId,
      executionTime: benchmark.metrics.duration,
      memoryDelta: benchmark.metrics.memoryDelta,
      success: true,
      metadata: benchmark.metrics.metadata,
    };

    this.commandMetrics.push(commandMetrics);

    // Update benchmark with thresholds if provided
    if (thresholds) {
      benchmark.thresholds = thresholds;
    }

    return {result, metrics: commandMetrics};
  }

  /**
   * Measure command execution performance with error handling
   */
  async measureCommandSafe<T>(
    commandId: string,
    commandFn: () => Promise<T>,
    thresholds?: PerformanceThresholds,
  ): Promise<{result?: T; metrics: CommandExecutionMetrics}> {
    try {
      const {result, metrics} = await this.measureCommand(
        commandId,
        commandFn,
        thresholds,
      );
      return {result, metrics};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const failedMetrics: CommandExecutionMetrics = {
        commandId,
        executionTime: 0,
        memoryDelta: 0,
        success: false,
        error: errorMessage,
      };

      this.commandMetrics.push(failedMetrics);
      return {metrics: failedMetrics};
    }
  }

  /**
   * Create a command wrapper that automatically measures performance
   */
  wrapCommand<T extends unknown[]>(
    commandId: string,
    commandFn: (...args: T) => Promise<unknown>,
    thresholds?: PerformanceThresholds,
  ): (...args: T) => Promise<unknown> {
    return async (...args: T) => {
      const {result} = await this.measureCommand(
        commandId,
        async () => commandFn(...args),
        thresholds,
      );
      return result;
    };
  }

  /**
   * Get activation metrics
   */
  getActivationMetrics(): ExtensionActivationMetrics | undefined {
    return this.activationMetrics;
  }

  /**
   * Get command execution metrics
   */
  getCommandMetrics(): CommandExecutionMetrics[] {
    return [...this.commandMetrics];
  }

  /**
   * Get metrics for a specific command
   */
  getCommandMetricsById(commandId: string): CommandExecutionMetrics[] {
    return this.commandMetrics.filter((m) => m.commandId === commandId);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.profiler.clearMeasurements();
    this.commandMetrics = [];
    this.activationMetrics = undefined;
  }

  /**
   * Generate a comprehensive extension performance report
   */
  generateExtensionReport(): {
    activation?: ExtensionActivationMetrics;
    commands: {
      total: number;
      successful: number;
      failed: number;
      averageExecutionTime: number;
      commandBreakdown: Record<
        string,
        {
          executions: number;
          averageTime: number;
          successRate: number;
        }
      >;
    };
    overall: {
      totalBenchmarks: number;
      passedThresholds: number;
      failedThresholds: number;
    };
  } {
    const report = this.profiler.generateReport(
      `extension-report-${Date.now()}`,
    );

    // Analyze command metrics
    const commandBreakdown: Record<
      string,
      {
        executions: number;
        averageTime: number;
        successRate: number;
      }
    > = {};

    for (const metric of this.commandMetrics) {
      if (!commandBreakdown[metric.commandId]) {
        commandBreakdown[metric.commandId] = {
          executions: 0,
          averageTime: 0,
          successRate: 0,
        };
      }

      const breakdown = commandBreakdown[metric.commandId];
      if (breakdown) {
        breakdown.executions++;
        breakdown.averageTime =
          (breakdown.averageTime * (breakdown.executions - 1) +
            metric.executionTime) /
          breakdown.executions;
      }
    }

    // Calculate success rates
    for (const [commandId, breakdown] of Object.entries(commandBreakdown)) {
      const commandMetrics = this.commandMetrics.filter(
        (m) => m.commandId === commandId,
      );
      const successfulExecutions = commandMetrics.filter(
        (m) => m.success,
      ).length;
      breakdown.successRate = successfulExecutions / commandMetrics.length;
    }

    const successfulCommands = this.commandMetrics.filter(
      (m) => m.success,
    ).length;
    const averageExecutionTime =
      this.commandMetrics.length > 0
        ? this.commandMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
          this.commandMetrics.length
        : 0;

    return {
      activation: this.activationMetrics,
      commands: {
        total: this.commandMetrics.length,
        successful: successfulCommands,
        failed: this.commandMetrics.length - successfulCommands,
        averageExecutionTime,
        commandBreakdown,
      },
      overall: {
        totalBenchmarks: report.summary.totalTests,
        passedThresholds: report.summary.passedTests,
        failedThresholds: report.summary.failedTests,
      },
    };
  }
}
