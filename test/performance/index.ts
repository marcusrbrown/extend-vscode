export {
  DEFAULT_PERFORMANCE_CONFIG,
  ENVIRONMENT_CONFIGS,
  getPerformanceConfig,
  type PerformanceConfig,
} from './config';

export {
  ExtensionPerformanceProfiler,
  type CommandExecutionMetrics,
  type ExtensionActivationMetrics,
} from './extension-profiler';

export {
  PerformanceMeasurementSession,
  PerformanceProfiler,
  type PerformanceBenchmark,
  type PerformanceMetrics,
  type PerformanceProfilerOptions,
  type PerformanceReport,
  type PerformanceThresholds,
} from './profiler';

export {
  PerformanceRegressionDetector,
  type HistoricalData,
  type RegressionAnalysis,
  type RegressionDetectorConfig,
  type RegressionReport,
} from './regression-detector';

export {
  PerformanceReporter,
  type AlertData,
  type ReportConfig,
  type ReportData,
} from './reporter';

export {
  ExtensionPerformanceTests,
  PERFORMANCE_THRESHOLDS,
  PerformanceTestRunner,
  type PerformanceTestConfig,
  type PerformanceTestResult,
} from './test-utils';
