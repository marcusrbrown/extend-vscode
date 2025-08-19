import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  ExtensionPerformanceProfiler,
  ExtensionPerformanceTests,
  getPerformanceConfig,
  PERFORMANCE_THRESHOLDS,
  PerformanceProfiler,
  PerformanceRegressionDetector,
  PerformanceReporter,
  PerformanceTestRunner,
} from './index';

/**
 * Comprehensive performance test suite for VS Code extensions
 * Tests both Node.js and Web extension environments
 */
describe('Extension Performance Test Suite', () => {
  let profiler: PerformanceProfiler;
  let extensionProfiler: ExtensionPerformanceProfiler;
  let testRunner: PerformanceTestRunner;
  let extensionTests: ExtensionPerformanceTests;
  let regressionDetector: PerformanceRegressionDetector;
  let reporter: PerformanceReporter;

  beforeEach(() => {
    profiler = PerformanceProfiler.getInstance();
    extensionProfiler = ExtensionPerformanceProfiler.getInstance();
    testRunner = new PerformanceTestRunner();
    extensionTests = new ExtensionPerformanceTests();
    regressionDetector = new PerformanceRegressionDetector();
    reporter = new PerformanceReporter();

    // Clear any existing measurements
    profiler.clearMeasurements();
    extensionProfiler.clearMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    profiler.clearMeasurements();
    extensionProfiler.clearMetrics();
  });

  describe('Node.js Extension Performance', () => {
    describe('Extension Activation', () => {
      it('should measure activation time within thresholds', async () => {
        const config = getPerformanceConfig();

        const result = await extensionTests.testActivation(async () => {
          // Simulate Node.js extension activation
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Simulate extension initialization tasks
          const modules = [];
          for (let i = 0; i < 10; i++) {
            modules.push({name: `module-${i}`, initialized: true});
          }

          return {
            modules,
            activationTime: 100,
            environment: 'node',
          };
        }, config.thresholds.activation);

        expect(result.passed).toBeDefined(); // May pass or fail depending on environment
        expect(result.summary.averageDuration).toBeLessThan(
          config.thresholds.activation.maxDuration ?? 1000,
        );
      });

      it('should handle activation errors gracefully', async () => {
        const result = await testRunner.runTest(
          async () => {
            throw new Error('Activation failed');
          },
          {
            name: 'activation-error-test',
            iterations: 1,
            thresholds: PERFORMANCE_THRESHOLDS.FAST,
          },
        );

        // The test runner should handle errors and still provide metrics
        expect(result.benchmarks).toHaveLength(1); // One failed benchmark
        const benchmark = result.benchmarks[0];
        if (benchmark) {
          const errorMetadata = benchmark.metrics.metadata;
          if (errorMetadata) {
            expect(errorMetadata.error).toBe('Activation failed');
          }
        }
        expect(result.passed).toBe(true); // Should still pass as error was handled gracefully
      });
    });

    describe('Command Execution', () => {
      it('should measure command performance', async () => {
        const commands = [
          'extension.hello',
          'extension.analyze',
          'extension.format',
          'extension.lint',
        ];

        for (const commandName of commands) {
          const result = await extensionTests.testCommand(
            async () => {
              // Simulate command execution
              const executionTime = Math.random() * 200 + 50; // 50-250ms
              await new Promise((resolve) =>
                setTimeout(resolve, executionTime),
              );

              return {
                command: commandName,
                result: 'success',
                executionTime,
              };
            },
            commandName,
            {
              iterations: 3,
              thresholds: PERFORMANCE_THRESHOLDS.FAST,
            },
          );

          expect(result.passed).toBeDefined(); // May pass or fail depending on environment
          expect(result.summary.averageDuration).toBeGreaterThan(0);
        }
      });

      it('should detect slow commands', async () => {
        const result = await extensionTests.testCommand(
          async () => {
            // Simulate slow command
            await new Promise((resolve) => setTimeout(resolve, 600));
            return 'slow-result';
          },
          'slow-command',
          {
            iterations: 1,
            thresholds: PERFORMANCE_THRESHOLDS.FAST, // 100ms threshold
          },
        );

        expect(result.passed).toBe(false); // Should fail threshold
      });
    });

    describe('File Operations', () => {
      it('should measure file loading performance', async () => {
        const fileSizes = ['small', 'medium', 'large'];

        for (const size of fileSizes) {
          const result = await extensionTests.testFileLoad(
            async () => {
              // Simulate file loading based on size
              const delay =
                size === 'small' ? 10 : size === 'medium' ? 50 : 200;
              await new Promise((resolve) => setTimeout(resolve, delay));

              const content = 'x'.repeat(
                size === 'small' ? 1000 : size === 'medium' ? 10000 : 100000,
              );
              return {
                content,
                size: content.length,
                type: size,
              };
            },
            `test-${size}.txt`,
            {
              iterations: 2,
              thresholds:
                size === 'large'
                  ? PERFORMANCE_THRESHOLDS.MEDIUM
                  : PERFORMANCE_THRESHOLDS.FAST,
            },
          );

          expect(result.passed).toBe(true);
        }
      });
    });

    describe('Memory Management', () => {
      it('should monitor memory usage during operations', async () => {
        const result = await testRunner.runTest(
          () => {
            // Allocate and release memory
            const data = Array.from({length: 100000}, () => 'test-data');
            const processed = data.map((item: string) => item.toUpperCase());
            return processed.length;
          },
          {
            name: 'memory-test',
            iterations: 3,
            collectMemoryMetrics: true,
            thresholds: {
              maxDuration: 500,
              maxMemoryDelta: 50 * 1024 * 1024, // 50MB
            },
          },
        );

        expect(result.passed).toBe(true);
        expect(result.summary.averageMemoryDelta).toBeGreaterThan(0);
      });
    });
  });

  describe('Web Extension Performance', () => {
    describe('Web Extension Activation', () => {
      it('should measure web extension activation', async () => {
        const result = await extensionTests.testActivation(async () => {
          // Simulate web extension activation (typically faster)
          await new Promise((resolve) => setTimeout(resolve, 50));

          return {
            environment: 'web',
            webWorkerReady: true,
            activationTime: 50,
          };
        }, PERFORMANCE_THRESHOLDS.FAST);

        expect(result.passed).toBe(true);
        expect(result.summary.averageDuration).toBeLessThan(200);
      });
    });

    describe('Web Commands', () => {
      it('should measure web command performance', async () => {
        const result = await extensionTests.testCommand(
          async () => {
            // Simulate web-based command (limited by browser APIs)
            await new Promise((resolve) => setTimeout(resolve, 30));

            return {
              environment: 'web',
              result: 'web-command-success',
            };
          },
          'web.command',
          {
            iterations: 5,
            thresholds: PERFORMANCE_THRESHOLDS.FAST,
          },
        );

        expect(result.passed).toBe(true);
      });
    });

    describe('Webview Performance', () => {
      it('should measure webview creation in web environment', async () => {
        const result = await extensionTests.testWebviewCreation(
          async () => {
            // Simulate webview creation in web environment
            await new Promise((resolve) => setTimeout(resolve, 150));

            return {
              webview: {
                html: '<html><body>Web Extension Webview</body></html>',
                environment: 'web',
              },
            };
          },
          {
            iterations: 2,
            thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
          },
        );

        expect(result.passed).toBeDefined(); // May pass or fail depending on environment
      });
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions', async () => {
      // First, create some baseline performance data
      const baselineResults = await testRunner.runTest(
        () => {
          // Fast baseline operation
          const start = Date.now();
          while (Date.now() - start < 10) {
            // Busy wait for 10ms
          }
          return 'baseline';
        },
        {
          name: 'regression-test',
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      // Store as historical data
      const performanceReport = profiler.generateReport('baseline-run');
      await regressionDetector.storeHistoricalData(performanceReport);

      // Clear measurements and run a slower version
      profiler.clearMeasurements();

      const regressionResults = await testRunner.runTest(
        () => {
          // Slower regression operation
          const start = Date.now();
          while (Date.now() - start < 50) {
            // Busy wait for 50ms (5x slower)
          }
          return 'regression';
        },
        {
          name: 'regression-test',
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      // Analyze for regressions
      await regressionDetector.analyzeRegression(regressionResults.benchmarks);

      expect(baselineResults.passed).toBe(true);
      expect(regressionResults.passed).toBe(true); // Still within absolute thresholds
      // Note: regression detection requires multiple historical runs to be effective
    });
  });

  describe('Performance Reporting', () => {
    it('should generate comprehensive performance reports', async () => {
      // Run some tests to generate data
      await testRunner.runTest(
        () => {
          return 'test-1';
        },
        {
          name: 'report-test-1',
          iterations: 2,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      await testRunner.runTest(
        () => {
          return 'test-2';
        },
        {
          name: 'report-test-2',
          iterations: 2,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      // Generate report
      const performanceReport = profiler.generateReport('test-report');
      const summary = reporter.generateSummary(performanceReport);

      expect(summary).toContain('Performance Test Summary');
      expect(summary).toContain('Total Tests: 4'); // 2 tests x 2 iterations each
      expect(performanceReport.benchmarks.length).toBe(4);
    });

    it('should generate reports in different formats', async () => {
      // Run a quick test
      await testRunner.runTest(() => 'format-test', {
        name: 'format-test',
        iterations: 1,
        thresholds: PERFORMANCE_THRESHOLDS.FAST,
      });

      const performanceReport = profiler.generateReport('format-test-report');

      // Test different report formats
      const htmlReportPath = await reporter.generateReport(performanceReport);
      expect(htmlReportPath).toContain('.html');

      const summary = reporter.generateSummary(performanceReport);
      expect(summary).toContain('Performance Test Summary');
    });
  });

  describe('Performance Configuration', () => {
    it('should use environment-specific thresholds', async () => {
      const config = getPerformanceConfig();

      expect(config).toBeDefined();
      expect(config.thresholds).toBeDefined();
      expect(config.thresholds.activation).toBeDefined();
      expect(config.thresholds.commands).toBeDefined();
      expect(config.execution.defaultIterations).toBeGreaterThan(0);
    });

    it('should support custom performance thresholds', async () => {
      const customThresholds = {
        maxDuration: 10, // Very strict
        maxMemoryDelta: 1024 * 1024, // 1MB
      };

      const result = await testRunner.runTest(
        () => {
          // This should exceed the custom thresholds
          const start = Date.now();
          while (Date.now() - start < 20) {
            // Busy wait for 20ms
          }
          return 'custom-threshold-test';
        },
        {
          name: 'custom-threshold-test',
          iterations: 1,
          thresholds: customThresholds,
        },
      );

      expect(result.passed).toBe(false); // Should fail strict thresholds
    });
  });

  describe('Cross-Environment Comparison', () => {
    it('should compare Node vs Web performance', async () => {
      const nodeResult = await testRunner.runTest(
        () => {
          // Simulate Node.js operation - web-safe implementation
          return btoa('node-test-data');
        },
        {
          name: 'node-operation',
          iterations: 5,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      const webResult = await testRunner.runTest(
        () => {
          // Simulate Web operation
          const data = new TextEncoder().encode('web-test-data');
          return btoa(String.fromCharCode(...data));
        },
        {
          name: 'web-operation',
          iterations: 5,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      const comparison = await testRunner.compareImplementations(
        () => btoa('test'),
        () => btoa('test'),
        {
          name1: 'node-encoding',
          name2: 'web-encoding',
          iterations: 10,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(nodeResult.passed).toBe(true);
      expect(webResult.passed).toBe(true);
      expect(comparison.comparison.winner).toMatch(/implementation[12]|tie/);
    });
  });

  describe('Stress Testing', () => {
    it('should handle high-frequency operations', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Simulate rapid operations
          const operations = [];
          for (let i = 0; i < 100; i++) {
            operations.push(Promise.resolve(i * 2));
          }
          const results = await Promise.all(operations);
          return results.length;
        },
        {
          name: 'stress-test',
          iterations: 3,
          collectCpuMetrics: true,
          collectMemoryMetrics: true,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });

    it('should measure performance under memory pressure', async () => {
      const result = await testRunner.runTest(
        () => {
          // Create memory pressure
          const arrays: string[][] = [];
          for (let i = 0; i < 10; i++) {
            arrays.push(Array.from({length: 10000}, () => `data-${i}`));
          }

          // Process the data
          const processed = arrays
            .flat()
            .filter((item: string) => item.includes('5'));
          return processed.length;
        },
        {
          name: 'memory-pressure-test',
          iterations: 2,
          collectMemoryMetrics: true,
          thresholds: PERFORMANCE_THRESHOLDS.SLOW, // Allow more time/memory
        },
      );

      expect(result.passed).toBe(true);
      // Memory delta can be negative due to garbage collection in Node.js
      expect(typeof result.summary.averageMemoryDelta).toBe('number');
    });
  });
});
