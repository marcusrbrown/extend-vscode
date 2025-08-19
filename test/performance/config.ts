import type {PerformanceThresholds} from './profiler';
import process from 'node:process';

/**
 * Performance configuration for VS Code extension testing
 */
export interface PerformanceConfig {
  /** Global performance thresholds */
  thresholds: {
    /** Extension activation thresholds */
    activation: PerformanceThresholds;
    /** Command execution thresholds */
    commands: PerformanceThresholds;
    /** File loading thresholds */
    fileLoad: PerformanceThresholds;
    /** Webview creation thresholds */
    webview: PerformanceThresholds;
  };
  /** Test execution settings */
  execution: {
    /** Default number of iterations for performance tests */
    defaultIterations: number;
    /** Whether to collect CPU metrics by default */
    collectCpuMetrics: boolean;
    /** Whether to collect memory metrics by default */
    collectMemoryMetrics: boolean;
    /** CPU sampling interval in milliseconds */
    cpuSampleInterval: number;
  };
  /** Reporting settings */
  reporting: {
    /** Directory to save performance reports */
    outputDir: string;
    /** Whether to generate detailed reports */
    detailed: boolean;
    /** Whether to generate charts */
    charts: boolean;
    /** Historical comparison settings */
    historical: {
      /** Whether to compare with previous runs */
      enabled: boolean;
      /** Number of previous runs to compare against */
      compareCount: number;
      /** Regression detection threshold percentage */
      regressionThreshold: number;
    };
  };
}

/**
 * Default performance configuration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  thresholds: {
    activation: {
      maxDuration: 2000, // 2 seconds for extension activation
      maxMemoryDelta: 50 * 1024 * 1024, // 50MB
      maxCpuUsage: 80, // 80%
    },
    commands: {
      maxDuration: 500, // 500ms for command execution
      maxMemoryDelta: 10 * 1024 * 1024, // 10MB
      maxCpuUsage: 70, // 70%
    },
    fileLoad: {
      maxDuration: 1000, // 1 second for file loading
      maxMemoryDelta: 20 * 1024 * 1024, // 20MB
      maxCpuUsage: 60, // 60%
    },
    webview: {
      maxDuration: 1500, // 1.5 seconds for webview creation
      maxMemoryDelta: 30 * 1024 * 1024, // 30MB
      maxCpuUsage: 75, // 75%
    },
  },
  execution: {
    defaultIterations: 5,
    collectCpuMetrics: true,
    collectMemoryMetrics: true,
    cpuSampleInterval: 100, // 100ms
  },
  reporting: {
    outputDir: './test-results/performance',
    detailed: true,
    charts: false, // Disabled by default, can be enabled when chart library is added
    historical: {
      enabled: true,
      compareCount: 5,
      regressionThreshold: 10, // 10% threshold for regression detection
    },
  },
};

/**
 * Configuration for different environments
 */
export const ENVIRONMENT_CONFIGS = {
  CI: {
    ...DEFAULT_PERFORMANCE_CONFIG,
    thresholds: {
      // Very relaxed thresholds for CI environment
      activation: {
        maxDuration: 10000, // 10s - very lenient for slow CI environments
        maxMemoryDelta: 100 * 1024 * 1024, // 100MB
        maxCpuUsage: 95,
      },
      commands: {
        maxDuration: 5000, // 5s - very lenient for slow CI environments
        maxMemoryDelta: 50 * 1024 * 1024, // 50MB
        maxCpuUsage: 90,
      },
      fileLoad: {
        maxDuration: 5000, // 5s
        maxMemoryDelta: 50 * 1024 * 1024, // 50MB
        maxCpuUsage: 85,
      },
      webview: {
        maxDuration: 10000, // 10s - webview creation can be slow
        maxMemoryDelta: 100 * 1024 * 1024, // 100MB
        maxCpuUsage: 95,
      },
    },
    execution: {
      ...DEFAULT_PERFORMANCE_CONFIG.execution,
      defaultIterations: 3, // Fewer iterations in CI for speed
    },
  },
  DEV: {
    ...DEFAULT_PERFORMANCE_CONFIG,
    thresholds: {
      // Stricter thresholds for development
      activation: {
        maxDuration: 1500,
        maxMemoryDelta: 40 * 1024 * 1024,
        maxCpuUsage: 70,
      },
      commands: {
        maxDuration: 300,
        maxMemoryDelta: 8 * 1024 * 1024,
        maxCpuUsage: 60,
      },
      fileLoad: {
        maxDuration: 800,
        maxMemoryDelta: 15 * 1024 * 1024,
        maxCpuUsage: 50,
      },
      webview: {
        maxDuration: 1200,
        maxMemoryDelta: 25 * 1024 * 1024,
        maxCpuUsage: 65,
      },
    },
    execution: {
      ...DEFAULT_PERFORMANCE_CONFIG.execution,
      defaultIterations: 10, // More iterations for detailed analysis
    },
  },
} as const;

/**
 * Get performance configuration for the current environment
 */
export function getPerformanceConfig(): PerformanceConfig {
  const isCi = Boolean(process.env.CI) || Boolean(process.env.NODE_ENV);
  return isCi ? ENVIRONMENT_CONFIGS.CI : ENVIRONMENT_CONFIGS.DEV;
}
