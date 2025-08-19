import type {PerformanceBenchmark, PerformanceReport} from './profiler';
import {promises as fs} from 'node:fs';
import path from 'node:path';

export interface HistoricalData {
  /** Timestamp when the data was recorded */
  timestamp: number;
  /** Git commit hash (if available) */
  commitHash?: string;
  /** VS Code version */
  vsCodeVersion?: string;
  /** Extension version */
  extensionVersion?: string;
  /** Platform information */
  platform: {
    os: string;
    arch: string;
    nodeVersion: string;
  };
  /** Performance benchmarks */
  benchmarks: PerformanceBenchmark[];
}

export interface RegressionAnalysis {
  /** Benchmark being analyzed */
  benchmarkName: string;
  /** Current performance metrics */
  current: {
    duration: number;
    memoryDelta: number;
    cpuUsage?: number;
  };
  /** Historical baseline (average of previous runs) */
  baseline: {
    duration: number;
    memoryDelta: number;
    cpuUsage?: number;
    sampleCount: number;
  };
  /** Regression analysis results */
  regression: {
    /** Whether a regression was detected */
    detected: boolean;
    /** Duration regression percentage (positive means slower) */
    durationRegression: number;
    /** Memory regression percentage (positive means more memory) */
    memoryRegression: number;
    /** CPU regression percentage (positive means more CPU) */
    cpuRegression?: number;
    /** Severity level */
    severity: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  };
}

export interface RegressionReport {
  /** When the analysis was performed */
  analysisTimestamp: number;
  /** Total benchmarks analyzed */
  totalBenchmarks: number;
  /** Number of benchmarks with regressions */
  regressionsDetected: number;
  /** Individual regression analyses */
  analyses: RegressionAnalysis[];
  /** Overall assessment */
  overall: {
    /** Whether any regressions were detected */
    hasRegressions: boolean;
    /** Worst severity level found */
    worstSeverity: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
    /** Summary message */
    summary: string;
  };
}

export interface RegressionDetectorConfig {
  /** Directory to store historical data */
  historyDir: string;
  /** Maximum number of historical runs to keep */
  maxHistoryCount: number;
  /** Regression threshold percentages */
  thresholds: {
    /** Duration regression thresholds */
    duration: {
      minor: number; // 5%
      moderate: number; // 15%
      major: number; // 30%
      critical: number; // 50%
    };
    /** Memory regression thresholds */
    memory: {
      minor: number; // 10%
      moderate: number; // 25%
      major: number; // 50%
      critical: number; // 100%
    };
    /** CPU regression thresholds */
    cpu: {
      minor: number; // 10%
      moderate: number; // 20%
      major: number; // 40%
      critical: number; // 60%
    };
  };
  /** Minimum number of historical samples required for analysis */
  minSamples: number;
}

export class PerformanceRegressionDetector {
  private readonly config: RegressionDetectorConfig;

  constructor(config?: Partial<RegressionDetectorConfig>) {
    this.config = {
      historyDir: './test-results/performance/history',
      maxHistoryCount: 50,
      thresholds: {
        duration: {
          minor: 5,
          moderate: 15,
          major: 30,
          critical: 50,
        },
        memory: {
          minor: 10,
          moderate: 25,
          major: 50,
          critical: 100,
        },
        cpu: {
          minor: 10,
          moderate: 20,
          major: 40,
          critical: 60,
        },
      },
      minSamples: 3,
      ...config,
    };
  }

  /**
   * Store performance data for historical comparison
   */
  async storeHistoricalData(report: PerformanceReport): Promise<void> {
    await this.ensureHistoryDir();

    const historicalData: HistoricalData = {
      timestamp: Date.now(),
      commitHash: await this.getGitCommitHash(),
      vsCodeVersion: report.platform.vsCodeVersion,
      extensionVersion: 'unknown', // Should be populated from extension context
      platform: {
        os: report.platform.os,
        arch: report.platform.arch,
        nodeVersion: report.platform.nodeVersion,
      },
      benchmarks: report.benchmarks,
    };

    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(this.config.historyDir, filename);

    await fs.writeFile(filepath, JSON.stringify(historicalData, null, 2));

    // Clean up old data if we exceed maxHistoryCount
    await this.cleanupOldData();
  }

  /**
   * Analyze current performance against historical data
   */
  async analyzeRegression(
    currentBenchmarks: PerformanceBenchmark[],
  ): Promise<RegressionReport> {
    const historicalData = await this.loadHistoricalData();
    const analyses: RegressionAnalysis[] = [];

    for (const currentBenchmark of currentBenchmarks) {
      const historicalBenchmarks = this.getHistoricalBenchmarks(
        historicalData,
        currentBenchmark.name,
      );

      if (historicalBenchmarks.length < this.config.minSamples) {
        continue; // Skip analysis if insufficient historical data
      }

      const analysis = this.performRegressionAnalysis(
        currentBenchmark,
        historicalBenchmarks,
      );
      analyses.push(analysis);
    }

    const regressionsDetected = analyses.filter(
      (a) => a.regression.detected,
    ).length;
    const worstSeverity = this.getWorstSeverity(analyses);

    return {
      analysisTimestamp: Date.now(),
      totalBenchmarks: analyses.length,
      regressionsDetected,
      analyses,
      overall: {
        hasRegressions: regressionsDetected > 0,
        worstSeverity,
        summary: this.generateSummary(
          analyses.length,
          regressionsDetected,
          worstSeverity,
        ),
      },
    };
  }

  /**
   * Get historical performance trends
   */
  async getPerformanceTrends(
    benchmarkName: string,
    count = 10,
  ): Promise<{
    timestamps: number[];
    durations: number[];
    memoryDeltas: number[];
    cpuUsages: (number | undefined)[];
  }> {
    const historicalData = await this.loadHistoricalData();
    const relevantData = historicalData
      .flatMap((data) =>
        data.benchmarks
          .filter((b) => b.name === benchmarkName)
          .map((b) => ({
            timestamp: data.timestamp,
            duration: b.metrics.duration,
            memoryDelta: b.metrics.memoryDelta,
            cpuUsage: b.metrics.cpuUsage,
          })),
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-count);

    return {
      timestamps: relevantData.map((d) => d.timestamp),
      durations: relevantData.map((d) => d.duration),
      memoryDeltas: relevantData.map((d) => d.memoryDelta),
      cpuUsages: relevantData.map((d) => d.cpuUsage),
    };
  }

  private async ensureHistoryDir(): Promise<void> {
    try {
      await fs.mkdir(this.config.historyDir, {recursive: true});
    } catch {
      // Directory might already exist
    }
  }

  private async getGitCommitHash(): Promise<string | undefined> {
    try {
      const {execSync} = await import('node:child_process');
      const hash = execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim();
      return hash;
    } catch {
      return undefined;
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.historyDir);
      const performanceFiles = files
        .filter((f) => f.startsWith('performance-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (performanceFiles.length > this.config.maxHistoryCount) {
        const filesToDelete = performanceFiles.slice(
          this.config.maxHistoryCount,
        );
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.config.historyDir, file));
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  private async loadHistoricalData(): Promise<HistoricalData[]> {
    try {
      const files = await fs.readdir(this.config.historyDir);
      const performanceFiles = files.filter(
        (f) => f.startsWith('performance-') && f.endsWith('.json'),
      );

      const data: HistoricalData[] = [];
      for (const file of performanceFiles) {
        try {
          const content = await fs.readFile(
            path.join(this.config.historyDir, file),
            'utf8',
          );
          const historicalData = JSON.parse(content) as HistoricalData;
          data.push(historicalData);
        } catch {
          // Skip invalid files
        }
      }

      return data.sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return [];
    }
  }

  private getHistoricalBenchmarks(
    historicalData: HistoricalData[],
    benchmarkName: string,
  ): PerformanceBenchmark[] {
    return historicalData.flatMap((data) =>
      data.benchmarks.filter((b) => b.name === benchmarkName),
    );
  }

  private performRegressionAnalysis(
    current: PerformanceBenchmark,
    historical: PerformanceBenchmark[],
  ): RegressionAnalysis {
    const historicalDurations = historical.map((b) => b.metrics.duration);
    const historicalMemoryDeltas = historical.map((b) => b.metrics.memoryDelta);
    const historicalCpuUsages = historical
      .map((b) => b.metrics.cpuUsage)
      .filter((cpu): cpu is number => cpu !== undefined);

    const baseline = {
      duration: this.calculateAverage(historicalDurations),
      memoryDelta: this.calculateAverage(historicalMemoryDeltas),
      cpuUsage:
        historicalCpuUsages.length > 0
          ? this.calculateAverage(historicalCpuUsages)
          : undefined,
      sampleCount: historical.length,
    };

    const durationRegression =
      ((current.metrics.duration - baseline.duration) / baseline.duration) *
      100;
    const memoryRegression =
      ((current.metrics.memoryDelta - baseline.memoryDelta) /
        Math.abs(baseline.memoryDelta || 1)) *
      100;
    const cpuRegression =
      typeof baseline.cpuUsage === 'number' &&
      typeof current.metrics.cpuUsage === 'number'
        ? ((current.metrics.cpuUsage - baseline.cpuUsage) / baseline.cpuUsage) *
          100
        : undefined;

    const severity = this.calculateSeverity(
      durationRegression,
      memoryRegression,
      cpuRegression,
    );
    const detected = severity !== 'none';

    return {
      benchmarkName: current.name,
      current: {
        duration: current.metrics.duration,
        memoryDelta: current.metrics.memoryDelta,
        cpuUsage: current.metrics.cpuUsage,
      },
      baseline,
      regression: {
        detected,
        durationRegression,
        memoryRegression,
        cpuRegression,
        severity,
      },
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateSeverity(
    durationRegression: number,
    memoryRegression: number,
    cpuRegression?: number,
  ): 'none' | 'minor' | 'moderate' | 'major' | 'critical' {
    const {thresholds} = this.config;

    const maxRegression = Math.max(
      durationRegression,
      memoryRegression,
      cpuRegression ?? 0,
    );

    if (
      maxRegression >= thresholds.duration.critical ||
      memoryRegression >= thresholds.memory.critical ||
      (typeof cpuRegression === 'number' &&
        cpuRegression >= thresholds.cpu.critical)
    ) {
      return 'critical';
    }

    if (
      maxRegression >= thresholds.duration.major ||
      memoryRegression >= thresholds.memory.major ||
      (typeof cpuRegression === 'number' &&
        cpuRegression >= thresholds.cpu.major)
    ) {
      return 'major';
    }

    if (
      maxRegression >= thresholds.duration.moderate ||
      memoryRegression >= thresholds.memory.moderate ||
      (typeof cpuRegression === 'number' &&
        cpuRegression >= thresholds.cpu.moderate)
    ) {
      return 'moderate';
    }

    if (
      maxRegression >= thresholds.duration.minor ||
      memoryRegression >= thresholds.memory.minor ||
      (typeof cpuRegression === 'number' &&
        cpuRegression >= thresholds.cpu.minor)
    ) {
      return 'minor';
    }

    return 'none';
  }

  private getWorstSeverity(
    analyses: RegressionAnalysis[],
  ): 'none' | 'minor' | 'moderate' | 'major' | 'critical' {
    const severityOrder = ['none', 'minor', 'moderate', 'major', 'critical'];
    const severities = analyses.map((a) => a.regression.severity);

    for (let i = severityOrder.length - 1; i >= 0; i--) {
      if (
        severities.includes(
          severityOrder[i] as
            | 'none'
            | 'minor'
            | 'moderate'
            | 'major'
            | 'critical',
        )
      ) {
        return severityOrder[i] as
          | 'none'
          | 'minor'
          | 'moderate'
          | 'major'
          | 'critical';
      }
    }

    return 'none';
  }

  private generateSummary(
    totalBenchmarks: number,
    regressionsDetected: number,
    worstSeverity: 'none' | 'minor' | 'moderate' | 'major' | 'critical',
  ): string {
    if (regressionsDetected === 0) {
      return `✅ No performance regressions detected in ${totalBenchmarks} benchmarks`;
    }

    const severityEmojis = {
      minor: '⚠️',
      moderate: '🟡',
      major: '🟠',
      critical: '🔴',
      none: '✅',
    };

    const emoji = severityEmojis[worstSeverity];
    return `${emoji} ${regressionsDetected}/${totalBenchmarks} benchmarks show ${worstSeverity} performance regression`;
  }
}
