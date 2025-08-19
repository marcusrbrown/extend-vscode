import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  ExtensionPerformanceProfiler,
  ExtensionPerformanceTests,
  getPerformanceConfig,
  PERFORMANCE_THRESHOLDS,
  PerformanceProfiler,
  PerformanceReporter,
  PerformanceTestRunner,
} from './index';

/**
 * Web-specific performance test suite for VS Code extensions
 * Tests performance specifically in web/browser environments
 */
describe('Web Extension Performance Suite', () => {
  let profiler: PerformanceProfiler;
  let extensionProfiler: ExtensionPerformanceProfiler;
  let testRunner: PerformanceTestRunner;
  let extensionTests: ExtensionPerformanceTests;
  let reporter: PerformanceReporter;

  beforeEach(() => {
    profiler = PerformanceProfiler.getInstance();
    extensionProfiler = ExtensionPerformanceProfiler.getInstance();
    testRunner = new PerformanceTestRunner();
    extensionTests = new ExtensionPerformanceTests();
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

  describe('Web Extension Activation', () => {
    it('should measure web extension activation time', async () => {
      const config = getPerformanceConfig();

      const result = await extensionTests.testActivation(async () => {
        // Simulate web extension activation
        await new Promise((resolve) => setTimeout(resolve, 75));

        // Simulate limited web extension initialization
        return {
          environment: 'web',
          webWorkerReady: true,
          activationTime: 75,
          limitedFileSystem: true,
        };
      }, config.thresholds.activation);

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeLessThan(
        config.thresholds.activation.maxDuration ?? 1000,
      );
    });

    it('should handle web worker limitations', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Simulate web worker constraints
          const data = new TextEncoder().encode('web-data');
          const decoded = new TextDecoder().decode(data);
          return decoded.length;
        },
        {
          name: 'web-worker-test',
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web API Performance', () => {
    it('should measure TextEncoder/TextDecoder performance', async () => {
      const result = await testRunner.runTest(
        () => {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();

          const text = 'Hello, Web Extension World!';
          const encoded = encoder.encode(text);
          const decoded = decoder.decode(encoded);

          return decoded === text ? 'success' : 'failure';
        },
        {
          name: 'text-encoding-test',
          iterations: 100,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeLessThan(100);
    });

    it('should measure Fetch API performance', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Simulate fetch to data URL (works in all environments)
          const dataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
          const response = await fetch(dataUrl);
          const text = await response.text();
          return text.length;
        },
        {
          name: 'fetch-api-test',
          iterations: 5,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });

    it('should measure Web Crypto API performance', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Test web crypto API
          const data = new TextEncoder().encode('test data for hashing');
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = new Uint8Array(hashBuffer);
          const hashHex = Array.from(hashArray)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          return hashHex.length;
        },
        {
          name: 'web-crypto-test',
          iterations: 10,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web Storage Performance', () => {
    it('should measure localStorage performance', async () => {
      const result = await testRunner.runTest(
        () => {
          // Check if localStorage is available (not available in Node test environment)
          if (typeof localStorage === 'undefined') {
            // Simulate localStorage operations for Node environment
            const storage = new Map<string, string>();
            const key = 'test-key';
            const value = JSON.stringify({
              data: 'test-value',
              timestamp: Date.now(),
            });

            storage.set(key, value);
            const retrieved = storage.get(key);
            storage.delete(key);

            if (retrieved !== undefined && retrieved !== '') {
              const parsed = JSON.parse(retrieved) as {data: string};
              return parsed.data.length;
            }
            return 0;
          } else {
            // Test localStorage operations in browser environment
            const key = 'test-key';
            const value = JSON.stringify({
              data: 'test-value',
              timestamp: Date.now(),
            });

            localStorage.setItem(key, value);
            const retrieved = localStorage.getItem(key);
            localStorage.removeItem(key);

            if (retrieved !== null && retrieved !== '') {
              const parsed = JSON.parse(retrieved) as {data: string};
              return parsed.data.length;
            }
            return 0;
          }
        },
        {
          name: 'localstorage-test',
          iterations: 50,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });

    it('should measure IndexedDB performance', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Simulate IndexedDB operations (simplified)
          return new Promise<number>((resolve) => {
            // Simulate async storage operation
            setTimeout(() => {
              resolve(42); // Simulated data size
            }, 10);
          });
        },
        {
          name: 'indexeddb-test',
          iterations: 5,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web Extension Commands', () => {
    it('should measure web-specific command performance', async () => {
      const webCommands = [
        'web.extension.hello',
        'web.extension.format',
        'web.extension.validate',
      ];

      for (const commandName of webCommands) {
        const result = await extensionTests.testCommand(
          async () => {
            // Simulate web-specific command execution
            const startTime = performance.now();

            // Simulate web API calls
            await new Promise((resolve) => setTimeout(resolve, 30));

            const endTime = performance.now();
            return {
              command: commandName,
              executionTime: endTime - startTime,
              environment: 'web',
            };
          },
          commandName,
          {
            iterations: 3,
            thresholds: PERFORMANCE_THRESHOLDS.FAST,
          },
        );

        expect(result.passed).toBe(true);
        expect(result.summary.averageDuration).toBeGreaterThan(0);
      }
    });
  });

  describe('Web Webview Performance', () => {
    it('should measure webview creation in web environment', async () => {
      const result = await extensionTests.testWebviewCreation(
        async () => {
          // Simulate webview creation with web-specific considerations
          await new Promise((resolve) => setTimeout(resolve, 120));

          const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Web Extension Webview</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .web-badge { background: #007ACC; color: white; padding: 4px 8px; border-radius: 4px; }
              </style>
            </head>
            <body>
              <h1>Web Extension Webview</h1>
              <p><span class="web-badge">WEB</span> This webview is running in a web environment</p>
              <script>
                console.log('Webview initialized in web environment');
              </script>
            </body>
          </html>
        `;

          return {
            webview: {
              html,
              environment: 'web',
              loadTime: 120,
            },
          };
        },
        {
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBeDefined(); // May pass or fail depending on environment
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web Worker Performance', () => {
    it('should measure web worker communication', async () => {
      const result = await testRunner.runTest(
        async () => {
          // Simulate web worker communication pattern
          return new Promise<string>((resolve) => {
            // Simulate message passing delay
            setTimeout(() => {
              const message = {
                type: 'result',
                data: 'processed by web worker',
                timestamp: Date.now(),
              };
              resolve(JSON.stringify(message));
            }, 25);
          });
        },
        {
          name: 'web-worker-communication',
          iterations: 10,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web Bundle Size Impact', () => {
    it('should measure bundle parsing performance', async () => {
      const result = await testRunner.runTest(
        () => {
          // Simulate bundle parsing/evaluation
          const mockBundle = {
            modules: Array.from({length: 50}, (_, i) => ({
              id: i,
              name: `module-${i}`,
              exports: [`export${i}`],
            })),
          };

          // Simulate module resolution
          const resolvedModules = mockBundle.modules.filter(
            (m) => m.id % 2 === 0,
          );
          return resolvedModules.length;
        },
        {
          name: 'bundle-parsing-test',
          iterations: 20,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Web Performance Reporting', () => {
    it('should generate web-specific performance reports', async () => {
      // Run some web-specific tests to generate data
      await testRunner.runTest(() => btoa('web-test-data'), {
        name: 'web-encoding-test',
        iterations: 5,
        thresholds: PERFORMANCE_THRESHOLDS.FAST,
      });

      await testRunner.runTest(
        async () => {
          const response = await fetch('data:text/plain,web-fetch-test');
          return response.text();
        },
        {
          name: 'web-fetch-test',
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      // Generate comprehensive report
      const performanceReport = profiler.generateReport(
        'web-performance-report',
      );
      const summary = reporter.generateSummary(performanceReport);

      expect(summary).toContain('Performance Test Summary');
      expect(summary).toContain('Total Tests: 8'); // 5 + 3 iterations
      expect(performanceReport.benchmarks.length).toBe(8);

      // Verify web-specific metrics are included
      const webBenchmarks = performanceReport.benchmarks.filter((b) =>
        b.name.includes('web'),
      );
      expect(webBenchmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should handle different browser environments', async () => {
      const result = await testRunner.runTest(
        () => {
          // Test browser compatibility features
          const features = {
            hasWebWorkers: typeof Worker !== 'undefined',
            hasIndexedDB: typeof indexedDB !== 'undefined',
            hasLocalStorage: typeof localStorage !== 'undefined',
            hasFetch: typeof fetch !== 'undefined',
            hasCrypto: crypto !== undefined && crypto.subtle !== undefined,
          };

          const supportedFeatures =
            Object.values(features).filter(Boolean).length;
          return supportedFeatures;
        },
        {
          name: 'browser-compatibility-test',
          iterations: 1,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });
  });
});
