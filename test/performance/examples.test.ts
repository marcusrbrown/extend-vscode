import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  ExtensionPerformanceTests,
  PERFORMANCE_THRESHOLDS,
  PerformanceTestRunner,
  type PerformanceTestConfig,
} from './index';

describe('Performance Testing Examples', () => {
  let testRunner: PerformanceTestRunner;
  let extensionTests: ExtensionPerformanceTests;

  beforeEach(() => {
    testRunner = new PerformanceTestRunner();
    extensionTests = new ExtensionPerformanceTests();
  });

  afterEach(() => {
    // Clean up any test artifacts
  });

  describe('Basic Performance Tests', () => {
    it('should measure simple synchronous operation', async () => {
      const config: PerformanceTestConfig = {
        name: 'simple-operation',
        iterations: 5,
        thresholds: PERFORMANCE_THRESHOLDS.FAST,
      };

      const result = await testRunner.runTest(() => {
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait for 10ms
        }
        return 'completed';
      }, config);

      expect(result.passed).toBe(true);
      expect(result.benchmarks).toHaveLength(5);
      expect(result.summary.averageDuration).toBeGreaterThan(0);
    });

    it('should measure asynchronous operation', async () => {
      const config: PerformanceTestConfig = {
        name: 'async-operation',
        iterations: 3,
        thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
      };

      const result = await testRunner.runTest(async () => {
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'async-completed';
      }, config);

      expect(result.passed).toBe(true);
      expect(result.benchmarks).toHaveLength(3);
      expect(result.summary.averageDuration).toBeGreaterThan(40);
    });

    it('should detect performance regression', async () => {
      const fastConfig: PerformanceTestConfig = {
        name: 'fast-operation',
        iterations: 3,
        thresholds: {maxDuration: 100},
      };

      const slowConfig: PerformanceTestConfig = {
        name: 'slow-operation',
        iterations: 3,
        thresholds: {maxDuration: 50}, // Stricter threshold
      };

      const fastResult = await testRunner.runTest(() => {
        // Fast operation
        return 'fast';
      }, fastConfig);

      const slowResult = await testRunner.runTest(() => {
        // Slow operation
        const start = Date.now();
        while (Date.now() - start < 60) {
          // Busy wait for 60ms
        }
        return 'slow';
      }, slowConfig);

      expect(fastResult.passed).toBe(true);
      expect(slowResult.passed).toBe(false); // Should fail threshold
    });
  });

  describe('Memory Performance Tests', () => {
    it('should measure memory usage', async () => {
      const config: PerformanceTestConfig = {
        name: 'memory-test',
        iterations: 2,
        collectMemoryMetrics: true,
        thresholds: {
          maxDuration: 1000,
          maxMemoryDelta: 10 * 1024 * 1024, // 10MB
        },
      };

      const result = await testRunner.runTest(() => {
        // Allocate some memory
        const largeArray = Array.from({length: 100000}).fill('test');
        return largeArray.length;
      }, config);

      expect(result.passed).toBe(true);
      expect(result.summary.averageMemoryDelta).toBeGreaterThan(0);
    });
  });

  describe('Extension Performance Tests', () => {
    it('should test activation performance', async () => {
      const result = await extensionTests.testActivation(async () => {
        // Simulate extension activation
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {commands: ['test.command'], disposables: []};
      }, PERFORMANCE_THRESHOLDS.MEDIUM);

      expect(result.passed).toBeDefined(); // May pass or fail depending on environment
      expect(result.summary.averageDuration).toBeGreaterThan(90);
    });

    it('should test command execution performance', async () => {
      const result = await extensionTests.testCommand(
        async () => {
          // Simulate command execution
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'command-result';
        },
        'test.command',
        {
          iterations: 5,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.benchmarks).toHaveLength(5);
    });

    it('should test file loading performance', async () => {
      const result = await extensionTests.testFileLoad(
        async () => {
          // Simulate file loading
          const content = 'x'.repeat(10000);
          await new Promise((resolve) => setTimeout(resolve, 20));
          return content;
        },
        'test-file.txt',
        {
          iterations: 3,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(result.passed).toBe(true);
      expect(result.summary.averageDuration).toBeGreaterThan(15);
    });

    it('should test webview creation performance', async () => {
      const result = await extensionTests.testWebviewCreation(
        async () => {
          // Simulate webview creation
          await new Promise((resolve) => setTimeout(resolve, 200));
          return {webview: 'created', panel: 'active'};
        },
        {
          iterations: 2,
          thresholds: PERFORMANCE_THRESHOLDS.MEDIUM,
        },
      );

      expect(result.passed).toBeDefined(); // May pass or fail depending on environment
      expect(result.summary.averageDuration).toBeGreaterThan(190);
    });
  });

  describe('Performance Comparison Tests', () => {
    it('should compare two implementations', async () => {
      const comparison = await testRunner.compareImplementations(
        () => {
          // Implementation 1: Array.map
          const arr = Array.from<number>({length: 1000}).fill(0);
          return arr.map((x) => x + 1);
        },
        () => {
          // Implementation 2: for loop
          const arr = Array.from<number>({length: 1000}).fill(0);
          const result = [];
          for (const element of arr) {
            result.push(element + 1);
          }
          return result;
        },
        {
          name1: 'array-map',
          name2: 'for-loop',
          iterations: 10,
          thresholds: PERFORMANCE_THRESHOLDS.FAST,
        },
      );

      expect(comparison.result1.passed).toBe(true);
      expect(comparison.result2.passed).toBe(true);
      expect(comparison.comparison.winner).toMatch(/implementation[12]|tie/);
    });
  });

  describe('Test Suite Execution', () => {
    it('should run multiple tests as a suite', async () => {
      const tests = [
        {
          testFn: async () => Promise.resolve('test1'),
          config: {
            name: 'suite-test-1',
            iterations: 2,
            thresholds: PERFORMANCE_THRESHOLDS.FAST,
          },
        },
        {
          testFn: async () => Promise.resolve('test2'),
          config: {
            name: 'suite-test-2',
            iterations: 2,
            thresholds: PERFORMANCE_THRESHOLDS.FAST,
          },
        },
      ];

      const suiteResult = await testRunner.runTestSuite(tests);

      expect(suiteResult.summary.totalTests).toBe(2);
      expect(suiteResult.summary.passedTests).toBe(2);
      expect(suiteResult.summary.failedTests).toBe(0);
      expect(suiteResult.summary.totalIterations).toBe(4);
    });
  });
});
