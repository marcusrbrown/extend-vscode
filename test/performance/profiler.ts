import process from 'node:process';

export interface PerformanceMetrics {
  /** Time taken for the operation in milliseconds */
  duration: number;
  /** Memory usage before the operation in bytes */
  memoryBefore: number;
  /** Memory usage after the operation in bytes */
  memoryAfter: number;
  /** Memory delta (after - before) in bytes */
  memoryDelta: number;
  /** CPU usage percentage during the operation */
  cpuUsage?: number;
  /** Timestamp when the measurement was taken */
  timestamp: number;
  /** Additional metadata about the operation */
  metadata?: Record<string, unknown>;
}

export interface PerformanceBenchmark {
  /** Name of the benchmark */
  name: string;
  /** Performance metrics for this benchmark */
  metrics: PerformanceMetrics;
  /** Threshold configuration for pass/fail determination */
  thresholds?: PerformanceThresholds;
}

export interface PerformanceThresholds {
  /** Maximum allowed duration in milliseconds */
  maxDuration?: number;
  /** Maximum allowed memory increase in bytes */
  maxMemoryDelta?: number;
  /** Maximum allowed CPU usage percentage */
  maxCpuUsage?: number;
}

export interface PerformanceReport {
  /** Test run metadata */
  runId: string;
  /** When the test run started */
  startTime: number;
  /** When the test run ended */
  endTime: number;
  /** Platform information */
  platform: {
    os: string;
    arch: string;
    nodeVersion: string;
    vsCodeVersion: string;
  };
  /** All benchmarks from this run */
  benchmarks: PerformanceBenchmark[];
  /** Summary statistics */
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
    averageDuration: number;
  };
}

export interface PerformanceProfilerOptions {
  /** Whether to collect memory usage metrics */
  collectMemoryMetrics?: boolean;
  /** Whether to collect CPU usage metrics */
  collectCpuMetrics?: boolean;
  /** Sample interval for CPU monitoring in milliseconds */
  cpuSampleInterval?: number;
  /** Custom metadata to include in measurements */
  metadata?: Record<string, unknown>;
}

/**
 * Utility for measuring and reporting performance metrics
 */
export class PerformanceProfiler {
  private static instance: PerformanceProfiler | null = null;
  private measurements: PerformanceBenchmark[] = [];

  private constructor() {}

  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  /**
   * Measure the performance of a synchronous operation
   */
  async measureSync<T>(
    name: string,
    operation: () => T,
    options: PerformanceProfilerOptions = {},
  ): Promise<{result: T; benchmark: PerformanceBenchmark}> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    let cpuMonitor: NodeJS.Timeout | undefined;
    const cpuSamples: number[] = [];

    if (options.collectCpuMetrics) {
      cpuMonitor = setInterval(() => {
        cpuSamples.push(this.getCpuUsage());
      }, options.cpuSampleInterval ?? 100);
    }

    try {
      const result = operation();
      const endTime = performance.now();
      const memoryAfter = this.getMemoryUsage();

      if (cpuMonitor) {
        clearInterval(cpuMonitor);
      }

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
        cpuUsage:
          cpuSamples.length > 0
            ? cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length
            : undefined,
        timestamp: Date.now(),
        metadata: options.metadata,
      };

      const benchmark: PerformanceBenchmark = {
        name,
        metrics,
      };

      this.measurements.push(benchmark);
      return {result, benchmark};
    } catch (error) {
      if (cpuMonitor) {
        clearInterval(cpuMonitor);
      }
      throw error;
    }
  }

  /**
   * Measure the performance of an asynchronous operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    options: PerformanceProfilerOptions = {},
  ): Promise<{result: T; benchmark: PerformanceBenchmark}> {
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();

    let cpuMonitor: NodeJS.Timeout | undefined;
    const cpuSamples: number[] = [];

    if (options.collectCpuMetrics) {
      cpuMonitor = setInterval(() => {
        cpuSamples.push(this.getCpuUsage());
      }, options.cpuSampleInterval ?? 100);
    }

    try {
      const result = await operation();
      const endTime = performance.now();
      const memoryAfter = this.getMemoryUsage();

      if (cpuMonitor) {
        clearInterval(cpuMonitor);
      }

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter - memoryBefore,
        cpuUsage:
          cpuSamples.length > 0
            ? cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length
            : undefined,
        timestamp: Date.now(),
        metadata: options.metadata,
      };

      const benchmark: PerformanceBenchmark = {
        name,
        metrics,
      };

      this.measurements.push(benchmark);
      return {result, benchmark};
    } catch (error) {
      if (cpuMonitor) {
        clearInterval(cpuMonitor);
      }
      throw error;
    }
  }

  /**
   * Start a manual performance measurement session
   */
  startMeasurement(name: string): PerformanceMeasurementSession {
    return new PerformanceMeasurementSession(name, this);
  }

  /**
   * Get all recorded measurements
   */
  getMeasurements(): PerformanceBenchmark[] {
    return [...this.measurements];
  }

  /**
   * Clear all recorded measurements
   */
  clearMeasurements(): void {
    this.measurements = [];
  }

  /**
   * Generate a performance report
   */
  generateReport(runId = `run-${Date.now()}`): PerformanceReport {
    const startTime =
      this.measurements.length > 0
        ? Math.min(...this.measurements.map((m) => m.metrics.timestamp))
        : Date.now();
    const endTime =
      this.measurements.length > 0
        ? Math.max(...this.measurements.map((m) => m.metrics.timestamp))
        : Date.now();

    const summary = {
      totalTests: this.measurements.length,
      passedTests: this.measurements.filter((m) => this.isWithinThresholds(m))
        .length,
      failedTests: this.measurements.filter((m) => !this.isWithinThresholds(m))
        .length,
      totalDuration: this.measurements.reduce(
        (sum, m) => sum + m.metrics.duration,
        0,
      ),
      averageDuration:
        this.measurements.length > 0
          ? this.measurements.reduce((sum, m) => sum + m.metrics.duration, 0) /
            this.measurements.length
          : 0,
    };

    return {
      runId,
      startTime,
      endTime,
      platform: {
        os: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        vsCodeVersion: 'unknown', // Will be populated from extension context
      },
      benchmarks: [...this.measurements],
      summary,
    };
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private getCpuUsage(): number {
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000; // Convert microseconds to milliseconds
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
 * Manual measurement session for more complex scenarios
 */
export class PerformanceMeasurementSession {
  private readonly startTime: number;
  private readonly memoryBefore: number;
  private readonly cpuMonitor?: NodeJS.Timeout;
  private readonly cpuSamples: number[] = [];

  constructor(
    private readonly name: string,
    _profiler: PerformanceProfiler,
    private readonly options: PerformanceProfilerOptions = {},
  ) {
    this.startTime = performance.now();
    this.memoryBefore = this.getMemoryUsage();

    if (options.collectCpuMetrics) {
      this.cpuMonitor = setInterval(() => {
        this.cpuSamples.push(this.getCpuUsage());
      }, options.cpuSampleInterval ?? 100);
    }
  }

  /**
   * End the measurement session and return the benchmark
   */
  end(): PerformanceBenchmark {
    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    if (this.cpuMonitor) {
      clearInterval(this.cpuMonitor);
    }

    const metrics: PerformanceMetrics = {
      duration: endTime - this.startTime,
      memoryBefore: this.memoryBefore,
      memoryAfter,
      memoryDelta: memoryAfter - this.memoryBefore,
      cpuUsage:
        this.cpuSamples.length > 0
          ? this.cpuSamples.reduce((a, b) => a + b, 0) / this.cpuSamples.length
          : undefined,
      timestamp: Date.now(),
      metadata: this.options.metadata,
    };

    const benchmark: PerformanceBenchmark = {
      name: this.name,
      metrics,
    };

    return benchmark;
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private getCpuUsage(): number {
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000;
  }
}
