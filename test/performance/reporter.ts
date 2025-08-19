import type {PerformanceBenchmark, PerformanceReport} from './profiler';
import type {RegressionReport} from './regression-detector';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export interface ReportConfig {
  /** Output directory for reports */
  outputDir: string;
  /** Report format options */
  format: {
    /** Generate HTML report */
    html: boolean;
    /** Generate JSON report */
    json: boolean;
    /** Generate CSV report */
    csv: boolean;
    /** Generate markdown summary */
    markdown: boolean;
  };
  /** Chart generation options */
  charts: {
    /** Enable chart generation */
    enabled: boolean;
    /** Chart types to generate */
    types: ('duration' | 'memory' | 'cpu')[];
    /** Chart output format */
    format: 'svg' | 'png' | 'ascii';
  };
  /** Threshold alert configuration */
  alerts: {
    /** Enable threshold alerts */
    enabled: boolean;
    /** Alert channels */
    channels: ('console' | 'file' | 'webhook')[];
    /** Webhook URL for alerts */
    webhookUrl?: string;
  };
}

export interface ReportData {
  /** Performance report */
  performance: PerformanceReport;
  /** Regression analysis */
  regression?: RegressionReport;
  /** Generated at timestamp */
  generatedAt: number;
  /** Report metadata */
  metadata: {
    reportId: string;
    environment: string;
    version: string;
  };
}

export interface AlertData {
  /** Alert type */
  type: 'threshold' | 'regression';
  /** Alert severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Alert message */
  message: string;
  /** Benchmark name that triggered the alert */
  benchmarkName: string;
  /** Additional context */
  context: Record<string, unknown>;
}

/**
 * Performance report generator with charts and alerts
 */
export class PerformanceReporter {
  private readonly config: ReportConfig;

  constructor(config?: Partial<ReportConfig>) {
    this.config = {
      outputDir: './test-results/performance/reports',
      format: {
        html: true,
        json: true,
        csv: false,
        markdown: true,
      },
      charts: {
        enabled: false, // Disabled by default until chart library is added
        types: ['duration', 'memory', 'cpu'],
        format: 'ascii',
      },
      alerts: {
        enabled: true,
        channels: ['console'],
      },
      ...config,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport(
    performanceReport: PerformanceReport,
    regressionReport?: RegressionReport,
  ): Promise<string> {
    await this.ensureOutputDir();

    const reportData: ReportData = {
      performance: performanceReport,
      regression: regressionReport,
      generatedAt: Date.now(),
      metadata: {
        reportId: `report-${Date.now()}`,
        environment: process.env.NODE_ENV ?? 'development',
        version: '1.0.0',
      },
    };

    const reportId = reportData.metadata.reportId;
    const promises: Promise<void>[] = [];

    // Generate different report formats
    if (this.config.format.json) {
      promises.push(this.generateJsonReport(reportData, reportId));
    }

    if (this.config.format.html) {
      promises.push(this.generateHtmlReport(reportData, reportId));
    }

    if (this.config.format.markdown) {
      promises.push(this.generateMarkdownReport(reportData, reportId));
    }

    if (this.config.format.csv) {
      promises.push(this.generateCsvReport(reportData, reportId));
    }

    // Generate charts if enabled
    if (this.config.charts.enabled) {
      promises.push(this.generateCharts(reportData, reportId));
    }

    // Process alerts
    const alerts = this.processAlerts(reportData);
    if (alerts.length > 0) {
      promises.push(this.sendAlerts(alerts));
    }

    await Promise.all(promises);

    return path.join(this.config.outputDir, `${reportId}.html`);
  }

  /**
   * Generate performance summary
   */
  generateSummary(
    performanceReport: PerformanceReport,
    regressionReport?: RegressionReport,
  ): string {
    const {summary} = performanceReport;
    let report = `Performance Test Summary\n`;
    report += `========================\n\n`;

    report += `Total Tests: ${summary.totalTests}\n`;
    report += `Passed: ${summary.passedTests}\n`;
    report += `Failed: ${summary.failedTests}\n`;
    report += `Average Duration: ${summary.averageDuration.toFixed(2)}ms\n`;
    report += `Total Duration: ${summary.totalDuration.toFixed(2)}ms\n\n`;

    // Add regression summary
    if (regressionReport) {
      report += `Regression Analysis\n`;
      report += `==================\n\n`;
      report += `${regressionReport.overall.summary}\n\n`;

      if (regressionReport.overall.hasRegressions) {
        report += `Regression Details:\n`;
        for (const analysis of regressionReport.analyses.filter(
          (a) => a.regression.detected,
        )) {
          report += `  • ${analysis.benchmarkName}: ${analysis.regression.severity} regression\n`;
          report += `    Duration: ${analysis.regression.durationRegression.toFixed(1)}% slower\n`;
          report += `    Memory: ${analysis.regression.memoryRegression.toFixed(1)}% more\n`;
          if (typeof analysis.regression.cpuRegression === 'number') {
            report += `    CPU: ${analysis.regression.cpuRegression.toFixed(1)}% more\n`;
          }
          report += '\n';
        }
      }
    }

    return report;
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDir, {recursive: true});
    } catch {
      // Directory might already exist
    }
  }

  private async generateJsonReport(
    reportData: ReportData,
    reportId: string,
  ): Promise<void> {
    const filePath = path.join(this.config.outputDir, `${reportId}.json`);
    await fs.writeFile(filePath, JSON.stringify(reportData, null, 2));
  }

  private async generateHtmlReport(
    reportData: ReportData,
    reportId: string,
  ): Promise<void> {
    const html = this.generateHtmlContent(reportData);
    const filePath = path.join(this.config.outputDir, `${reportId}.html`);
    await fs.writeFile(filePath, html);
  }

  private generateHtmlContent(reportData: ReportData): string {
    const {performance, regression} = reportData;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${reportData.metadata.reportId}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #007ACC; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-label { font-weight: bold; color: #666; }
        .metric-value { font-size: 1.2em; color: #007ACC; }
        .benchmark { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .benchmark-name { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .regression { background: #fff3cd; border-color: #ffc107; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .alert-critical { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Report</h1>
        <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p>Report ID: ${reportData.metadata.reportId}</p>
        <p>Environment: ${reportData.metadata.environment}</p>
    </div>

    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">
            <div class="metric-label">Total Tests</div>
            <div class="metric-value">${performance.summary.totalTests}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Passed</div>
            <div class="metric-value">${performance.summary.passedTests}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Failed</div>
            <div class="metric-value">${performance.summary.failedTests}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Average Duration</div>
            <div class="metric-value">${performance.summary.averageDuration.toFixed(2)}ms</div>
        </div>
    </div>

    ${regression ? this.generateRegressionHtml(regression) : ''}

    <h2>Benchmark Results</h2>
    ${performance.benchmarks.map((benchmark) => this.generateBenchmarkHtml(benchmark)).join('')}

    <h2>Detailed Results</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Benchmark</th>
                <th>Duration (ms)</th>
                <th>Memory Delta (MB)</th>
                <th>CPU Usage (%)</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${performance.benchmarks
              .map(
                (benchmark) => `
                <tr>
                    <td>${benchmark.name}</td>
                    <td>${benchmark.metrics.duration.toFixed(2)}</td>
                    <td>${(benchmark.metrics.memoryDelta / 1024 / 1024).toFixed(2)}</td>
                    <td>${benchmark.metrics.cpuUsage?.toFixed(2) ?? 'N/A'}</td>
                    <td>${this.isWithinThresholds(benchmark) ? '✅ Passed' : '❌ Failed'}</td>
                </tr>
            `,
              )
              .join('')}
        </tbody>
    </table>
</body>
</html>`;
  }

  private generateRegressionHtml(regression: RegressionReport): string {
    const severityClass =
      regression.overall.worstSeverity === 'critical'
        ? 'alert-critical'
        : regression.overall.worstSeverity === 'major' ||
            regression.overall.worstSeverity === 'moderate'
          ? 'alert-warning'
          : 'alert-info';

    return `
    <div class="alert ${severityClass}">
        <h2>Regression Analysis</h2>
        <p>${regression.overall.summary}</p>
    </div>

    ${
      regression.overall.hasRegressions
        ? `
    <h3>Regression Details</h3>
    ${regression.analyses
      .filter((a) => a.regression.detected)
      .map(
        (analysis) => `
        <div class="benchmark regression">
            <div class="benchmark-name">${analysis.benchmarkName}</div>
            <p><strong>Severity:</strong> ${analysis.regression.severity}</p>
            <p><strong>Duration Regression:</strong> ${analysis.regression.durationRegression.toFixed(1)}%</p>
            <p><strong>Memory Regression:</strong> ${analysis.regression.memoryRegression.toFixed(1)}%</p>
            ${typeof analysis.regression.cpuRegression === 'number' ? `<p><strong>CPU Regression:</strong> ${analysis.regression.cpuRegression.toFixed(1)}%</p>` : ''}
        </div>
    `,
      )
      .join('')}
    `
        : ''
    }`;
  }

  private generateBenchmarkHtml(benchmark: PerformanceBenchmark): string {
    const passed = this.isWithinThresholds(benchmark);
    const statusClass = passed ? 'passed' : 'failed';

    return `
    <div class="benchmark ${statusClass}">
        <div class="benchmark-name">${benchmark.name}</div>
        <p><strong>Duration:</strong> ${benchmark.metrics.duration.toFixed(2)}ms</p>
        <p><strong>Memory Delta:</strong> ${(benchmark.metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB</p>
        ${typeof benchmark.metrics.cpuUsage === 'number' ? `<p><strong>CPU Usage:</strong> ${benchmark.metrics.cpuUsage.toFixed(2)}%</p>` : ''}
        <p><strong>Status:</strong> ${passed ? '✅ Passed' : '❌ Failed'}</p>
    </div>`;
  }

  private async generateMarkdownReport(
    reportData: ReportData,
    reportId: string,
  ): Promise<void> {
    const markdown = this.generateMarkdownContent(reportData);
    const filePath = path.join(this.config.outputDir, `${reportId}.md`);
    await fs.writeFile(filePath, markdown);
  }

  private generateMarkdownContent(reportData: ReportData): string {
    const {performance, regression} = reportData;

    let content = `# Performance Report\n\n`;
    content += `**Generated:** ${new Date(reportData.generatedAt).toLocaleString()}\n`;
    content += `**Report ID:** ${reportData.metadata.reportId}\n`;
    content += `**Environment:** ${reportData.metadata.environment}\n\n`;

    content += `## Summary\n\n`;
    content += `- **Total Tests:** ${performance.summary.totalTests}\n`;
    content += `- **Passed:** ${performance.summary.passedTests}\n`;
    content += `- **Failed:** ${performance.summary.failedTests}\n`;
    content += `- **Average Duration:** ${performance.summary.averageDuration.toFixed(2)}ms\n\n`;

    if (regression) {
      content += `## Regression Analysis\n\n`;
      content += `${regression.overall.summary}\n\n`;

      if (regression.overall.hasRegressions) {
        content += `### Regression Details\n\n`;
        for (const analysis of regression.analyses.filter(
          (a) => a.regression.detected,
        )) {
          content += `#### ${analysis.benchmarkName}\n`;
          content += `- **Severity:** ${analysis.regression.severity}\n`;
          content += `- **Duration Regression:** ${analysis.regression.durationRegression.toFixed(1)}%\n`;
          content += `- **Memory Regression:** ${analysis.regression.memoryRegression.toFixed(1)}%\n`;
          if (analysis.regression.cpuRegression != null) {
            content += `- **CPU Regression:** ${analysis.regression.cpuRegression.toFixed(1)}%\n`;
          }
          content += '\n';
        }
      }
    }

    content += `## Benchmark Results\n\n`;
    content += `| Benchmark | Duration (ms) | Memory (MB) | CPU (%) | Status |\n`;
    content += `|-----------|---------------|-------------|---------|--------|\n`;

    for (const benchmark of performance.benchmarks) {
      const passed = this.isWithinThresholds(benchmark);
      content += `| ${benchmark.name} | ${benchmark.metrics.duration.toFixed(2)} | ${(benchmark.metrics.memoryDelta / 1024 / 1024).toFixed(2)} | ${benchmark.metrics.cpuUsage?.toFixed(2) ?? 'N/A'} | ${passed ? '✅' : '❌'} |\n`;
    }

    return content;
  }

  private async generateCsvReport(
    reportData: ReportData,
    reportId: string,
  ): Promise<void> {
    const {performance} = reportData;

    let csv =
      'Benchmark,Duration (ms),Memory Delta (MB),CPU Usage (%),Status\n';

    for (const benchmark of performance.benchmarks) {
      const passed = this.isWithinThresholds(benchmark);
      csv += `"${benchmark.name}",${benchmark.metrics.duration},${benchmark.metrics.memoryDelta / 1024 / 1024},${benchmark.metrics.cpuUsage ?? ''},${passed ? 'Passed' : 'Failed'}\n`;
    }

    const filePath = path.join(this.config.outputDir, `${reportId}.csv`);
    await fs.writeFile(filePath, csv);
  }

  private async generateCharts(
    _reportData: ReportData,
    _reportId: string,
  ): Promise<void> {
    // Chart generation would be implemented here when a chart library is added
    // For now, this is a placeholder
  }

  private processAlerts(reportData: ReportData): AlertData[] {
    const alerts: AlertData[] = [];

    // Check for threshold violations
    for (const benchmark of reportData.performance.benchmarks) {
      if (!this.isWithinThresholds(benchmark)) {
        alerts.push({
          type: 'threshold',
          severity: this.getAlertSeverity(benchmark),
          message: `Benchmark "${benchmark.name}" exceeded performance thresholds`,
          benchmarkName: benchmark.name,
          context: {
            duration: benchmark.metrics.duration,
            memoryDelta: benchmark.metrics.memoryDelta,
            thresholds: benchmark.thresholds,
          },
        });
      }
    }

    // Check for regressions
    if (reportData.regression?.overall.hasRegressions) {
      for (const analysis of reportData.regression.analyses.filter(
        (a) => a.regression.detected,
      )) {
        alerts.push({
          type: 'regression',
          severity: this.mapRegressionSeverity(analysis.regression.severity),
          message: `Performance regression detected in "${analysis.benchmarkName}"`,
          benchmarkName: analysis.benchmarkName,
          context: {
            durationRegression: analysis.regression.durationRegression,
            memoryRegression: analysis.regression.memoryRegression,
            cpuRegression: analysis.regression.cpuRegression,
          },
        });
      }
    }

    return alerts;
  }

  private async sendAlerts(alerts: AlertData[]): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of this.config.alerts.channels) {
      switch (channel) {
        case 'console':
          promises.push(this.sendConsoleAlerts(alerts));
          break;
        case 'file':
          promises.push(this.sendFileAlerts(alerts));
          break;
        case 'webhook':
          if (this.config.alerts.webhookUrl != null) {
            promises.push(this.sendWebhookAlerts(alerts));
          }
          break;
      }
    }

    await Promise.all(promises);
  }

  private async sendConsoleAlerts(alerts: AlertData[]): Promise<void> {
    for (const alert of alerts) {
      const emoji =
        alert.severity === 'critical'
          ? '🚨'
          : alert.severity === 'high'
            ? '⚠️'
            : alert.severity === 'medium'
              ? '🟡'
              : 'ℹ️';

      console.warn(
        `${emoji} ${alert.type.toUpperCase()} ALERT: ${alert.message}`,
      );
    }
  }

  private async sendFileAlerts(alerts: AlertData[]): Promise<void> {
    const alertsFile = path.join(this.config.outputDir, 'alerts.json');
    await fs.writeFile(alertsFile, JSON.stringify(alerts, null, 2));
  }

  private async sendWebhookAlerts(_alerts: AlertData[]): Promise<void> {
    // Webhook implementation would go here
    // This is a placeholder for webhook integration
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

  private getAlertSeverity(
    benchmark: PerformanceBenchmark,
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!benchmark.thresholds) return 'low';

    const {metrics, thresholds} = benchmark;

    // Simple severity calculation based on how much thresholds are exceeded
    const durationExcess =
      typeof thresholds.maxDuration === 'number'
        ? ((metrics.duration - thresholds.maxDuration) /
            thresholds.maxDuration) *
          100
        : 0;
    const memoryExcess =
      typeof thresholds.maxMemoryDelta === 'number'
        ? ((metrics.memoryDelta - thresholds.maxMemoryDelta) /
            thresholds.maxMemoryDelta) *
          100
        : 0;

    const maxExcess = Math.max(durationExcess, memoryExcess);

    if (maxExcess > 100) return 'critical';
    if (maxExcess > 50) return 'high';
    if (maxExcess > 20) return 'medium';
    return 'low';
  }

  private mapRegressionSeverity(
    severity: 'none' | 'minor' | 'moderate' | 'major' | 'critical',
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'major':
        return 'high';
      case 'moderate':
        return 'medium';
      case 'minor':
        return 'low';
      case 'none':
      default:
        return 'low';
    }
  }
}
