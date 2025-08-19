import {
  PerformanceProfiler,
  type PerformanceBenchmark,
  type PerformanceThresholds,
} from './profiler';

export interface PerformanceTestConfig {
  /** Name of the test */
  name: string;
  /** Number of iterations to run */
  iterations?: number;
  /** Performance thresholds */
  thresholds?: PerformanceThresholds;
  /** Whether to collect CPU metrics */
  collectCpuMetrics?: boolean;
  /** Whether to collect memory metrics */
  collectMemoryMetrics?: boolean;
  /** Setup function to run before each iteration */
  setup?: () => Promise<void> | void;
  /** Cleanup function to run after each iteration */
  cleanup?: () => Promise<void> | void;
}

export interface PerformanceTestResult {
  /** Test configuration */
  config: PerformanceTestConfig;
  /** All benchmark results */
  benchmarks: PerformanceBenchmark[];
  /** Statistical summary */
  summary: {
    /** Average duration across all iterations */
    averageDuration: number;
    /** Minimum duration */
    minDuration: number;
    /** Maximum duration */
    maxDuration: number;
    /** Standard deviation */
    standardDeviation: number;
    /** Number of iterations that passed thresholds */
    passedIterations: number;
    /** Number of iterations that failed thresholds */
    failedIterations: number;
    /** Average memory delta */
    averageMemoryDelta: number;
    /** Average CPU usage */
    averageCpuUsage?: number;
  };
  /** Whether the test passed overall */
  passed: boolean;
}

/**
 * Utilities for running performance tests
 */
export class PerformanceTestRunner {
  private readonly profiler: PerformanceProfiler;

  constructor() {
    this.profiler = PerformanceProfiler.getInstance();
  }

  /**
   * Run a performance test with multiple iterations
   */
  async runTest<T>(
    testFn: () => Promise<T> | T,
    config: PerformanceTestConfig,
  ): Promise<PerformanceTestResult> {
    const iterations = config.iterations ?? 1;
    const benchmarks: PerformanceBenchmark[] = [];
    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      // Setup
      if (config.setup) {
        await config.setup();
      }

      try {
        // Run the test
        const {result, benchmark} = await this.profiler.measureAsync(
          `${config.name}-iteration-${i + 1}`,
          async () => testFn(),
          {
            collectCpuMetrics: config.collectCpuMetrics,
            collectMemoryMetrics: config.collectMemoryMetrics,
            metadata: {iteration: i + 1, totalIterations: iterations},
          },
        );

        // Apply thresholds
        if (config.thresholds) {
          benchmark.thresholds = config.thresholds;
        }

        benchmarks.push(benchmark);
        results.push(result);
      } catch (error) {
        // Handle test errors gracefully - create a failed benchmark
        const errorBenchmark: PerformanceBenchmark = {
          name: `${config.name}-iteration-${i + 1}`,
          metrics: {
            duration: 0,
            memoryBefore: 0,
            memoryAfter: 0,
            memoryDelta: 0,
            cpuUsage: 0,
            timestamp: Date.now(),
            metadata: {
              iteration: i + 1,
              totalIterations: iterations,
              error: error instanceof Error ? error.message : String(error),
            },
          },
          thresholds: config.thresholds,
        };

        benchmarks.push(errorBenchmark);
        console.warn(`Performance test iteration ${i + 1} failed:`, error);
      } finally {
        // Cleanup
        if (config.cleanup) {
          await config.cleanup();
        }
      }
    }

    // Calculate summary statistics
    const durations = benchmarks.map((b) => b.metrics.duration);
    const memoryDeltas = benchmarks.map((b) => b.metrics.memoryDelta);
    const cpuUsages = benchmarks
      .map((b) => b.metrics.cpuUsage)
      .filter((cpu): cpu is number => cpu !== undefined);

    const averageDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Calculate standard deviation
    const variance =
      durations.reduce((sum, d) => sum + (d - averageDuration) ** 2, 0) /
      durations.length;
    const standardDeviation = Math.sqrt(variance);

    const averageMemoryDelta =
      memoryDeltas.reduce((sum, m) => sum + m, 0) / memoryDeltas.length;
    const averageCpuUsage =
      cpuUsages.length > 0
        ? cpuUsages.reduce((sum, c) => sum + c, 0) / cpuUsages.length
        : undefined;

    // Count passed/failed iterations
    const passedIterations = benchmarks.filter((b) =>
      this.isWithinThresholds(b),
    ).length;
    const failedIterations = benchmarks.length - passedIterations;

    const summary = {
      averageDuration,
      minDuration,
      maxDuration,
      standardDeviation,
      passedIterations,
      failedIterations,
      averageMemoryDelta,
      averageCpuUsage,
    };

    // Test passes if all iterations pass thresholds (or no thresholds specified)
    const passed = !config.thresholds || failedIterations === 0;

    return {
      config,
      benchmarks,
      summary,
      passed,
    };
  }

  /**
   * Run multiple performance tests as a suite
   */
  async runTestSuite(
    tests: {
      testFn: () => Promise<unknown> | unknown;
      config: PerformanceTestConfig;
    }[],
  ): Promise<{
    results: PerformanceTestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      totalIterations: number;
      averageDuration: number;
    };
  }> {
    const results: PerformanceTestResult[] = [];

    for (const {testFn, config} of tests) {
      const result = await this.runTest(testFn, config);
      results.push(result);
    }

    // Calculate suite summary
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalIterations = results.reduce(
      (sum, r) => sum + r.benchmarks.length,
      0,
    );
    const averageDuration =
      results.reduce((sum, r) => sum + r.summary.averageDuration, 0) /
      totalTests;

    return {
      results,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        totalIterations,
        averageDuration,
      },
    };
  }

  /**
   * Compare performance between two implementations
   */
  async compareImplementations<T>(
    implementation1: () => Promise<T> | T,
    implementation2: () => Promise<T> | T,
    config: Omit<PerformanceTestConfig, 'name'> & {
      name1: string;
      name2: string;
    },
  ): Promise<{
    result1: PerformanceTestResult;
    result2: PerformanceTestResult;
    comparison: {
      durationImprovement: number; // Positive means implementation2 is faster
      memoryImprovement: number; // Positive means implementation2 uses less memory
      winner: 'implementation1' | 'implementation2' | 'tie';
    };
  }> {
    const config1: PerformanceTestConfig = {...config, name: config.name1};
    const config2: PerformanceTestConfig = {...config, name: config.name2};

    const result1 = await this.runTest(implementation1, config1);
    const result2 = await this.runTest(implementation2, config2);

    const durationImprovement =
      ((result1.summary.averageDuration - result2.summary.averageDuration) /
        result1.summary.averageDuration) *
      100;

    const memoryImprovement =
      ((result1.summary.averageMemoryDelta -
        result2.summary.averageMemoryDelta) /
        Math.abs(result1.summary.averageMemoryDelta)) *
      100;

    let winner: 'implementation1' | 'implementation2' | 'tie';
    const threshold = 5; // 5% threshold for declaring a winner

    if (Math.abs(durationImprovement) < threshold) {
      winner = 'tie';
    } else {
      winner = durationImprovement > 0 ? 'implementation2' : 'implementation1';
    }

    return {
      result1,
      result2,
      comparison: {
        durationImprovement,
        memoryImprovement,
        winner,
      },
    };
  }

  /**
   * Generate a detailed performance report
   */
  generateDetailedReport(result: PerformanceTestResult): string {
    const {config, summary, passed} = result;

    let report = `Performance Test Report: ${config.name}\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `Status: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `Iterations: ${result.benchmarks.length}\n\n`;

    report += 'Duration Statistics:\n';
    report += `  Average: ${summary.averageDuration.toFixed(2)}ms\n`;
    report += `  Min: ${summary.minDuration.toFixed(2)}ms\n`;
    report += `  Max: ${summary.maxDuration.toFixed(2)}ms\n`;
    report += `  Std Dev: ${summary.standardDeviation.toFixed(2)}ms\n\n`;

    report += 'Memory Statistics:\n';
    report += `  Average Delta: ${(summary.averageMemoryDelta / 1024 / 1024).toFixed(2)}MB\n\n`;

    if (summary.averageCpuUsage !== undefined) {
      report += 'CPU Statistics:\n';
      report += `  Average Usage: ${summary.averageCpuUsage.toFixed(2)}%\n\n`;
    }

    if (config.thresholds) {
      report += 'Threshold Analysis:\n';
      report += `  Passed: ${summary.passedIterations}/${result.benchmarks.length}\n`;
      report += `  Failed: ${summary.failedIterations}/${result.benchmarks.length}\n\n`;

      if (typeof config.thresholds.maxDuration === 'number') {
        report += `  Duration Threshold: ${config.thresholds.maxDuration}ms\n`;
      }
      if (typeof config.thresholds.maxMemoryDelta === 'number') {
        report += `  Memory Threshold: ${(config.thresholds.maxMemoryDelta / 1024 / 1024).toFixed(2)}MB\n`;
      }
      if (typeof config.thresholds.maxCpuUsage === 'number') {
        report += `  CPU Threshold: ${config.thresholds.maxCpuUsage}%\n`;
      }
    }

    return report;
  }

  private isWithinThresholds(benchmark: PerformanceBenchmark): boolean {
    const {thresholds} = benchmark;
    if (!thresholds) return true;

    const {metrics} = benchmark;

    if (
      typeof thresholds.maxDuration === 'number' &&
      metrics.duration > thresholds.maxDuration
    ) {
      return false;
    }

    if (
      typeof thresholds.maxMemoryDelta === 'number' &&
      metrics.memoryDelta > thresholds.maxMemoryDelta
    ) {
      return false;
    }

    if (
      typeof thresholds.maxCpuUsage === 'number' &&
      typeof metrics.cpuUsage === 'number' &&
      metrics.cpuUsage > thresholds.maxCpuUsage
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Common performance test scenarios for VS Code extensions
 */
export class ExtensionPerformanceTests {
  private readonly testRunner: PerformanceTestRunner;

  constructor() {
    this.testRunner = new PerformanceTestRunner();
  }

  /**
   * Test extension activation performance
   */
  async testActivation(
    activationFn: () => Promise<unknown>,
    thresholds?: PerformanceThresholds,
  ): Promise<PerformanceTestResult> {
    return this.testRunner.runTest(activationFn, {
      name: 'extension-activation',
      iterations: 1,
      thresholds,
      collectCpuMetrics: true,
      collectMemoryMetrics: true,
    });
  }

  /**
   * Test command execution performance
   */
  async testCommand(
    commandFn: () => Promise<unknown>,
    commandName: string,
    options: {
      iterations?: number;
      thresholds?: PerformanceThresholds;
    } = {},
  ): Promise<PerformanceTestResult> {
    return this.testRunner.runTest(commandFn, {
      name: `command-${commandName}`,
      iterations: options.iterations ?? 10,
      thresholds: options.thresholds,
      collectCpuMetrics: true,
      collectMemoryMetrics: true,
    });
  }

  /**
   * Test file loading performance
   */
  async testFileLoad(
    loadFn: () => Promise<unknown>,
    fileName: string,
    options: {
      iterations?: number;
      thresholds?: PerformanceThresholds;
    } = {},
  ): Promise<PerformanceTestResult> {
    return this.testRunner.runTest(loadFn, {
      name: `file-load-${fileName}`,
      iterations: options.iterations ?? 5,
      thresholds: options.thresholds,
      collectMemoryMetrics: true,
    });
  }

  /**
   * Test webview creation performance
   */
  async testWebviewCreation(
    createWebviewFn: () => Promise<unknown>,
    options: {
      iterations?: number;
      thresholds?: PerformanceThresholds;
    } = {},
  ): Promise<PerformanceTestResult> {
    return this.testRunner.runTest(createWebviewFn, {
      name: 'webview-creation',
      iterations: options.iterations ?? 3,
      thresholds: options.thresholds,
      collectCpuMetrics: true,
      collectMemoryMetrics: true,
    });
  }
}

// Export commonly used threshold presets
export const PERFORMANCE_THRESHOLDS = {
  FAST: {
    maxDuration: 3000, // 3s - very lenient for CI environments
    maxMemoryDelta: 20 * 1024 * 1024, // 20MB
    maxCpuUsage: 80, // 80%
  },
  MEDIUM: {
    maxDuration: 5000, // 5s
    maxMemoryDelta: 50 * 1024 * 1024, // 50MB
    maxCpuUsage: 85, // 85%
  },
  SLOW: {
    maxDuration: 10000, // 10s - very lenient for slow CI environments
    maxMemoryDelta: 150 * 1024 * 1024, // 150MB
    maxCpuUsage: 95, // 95%
  },
} as const;
