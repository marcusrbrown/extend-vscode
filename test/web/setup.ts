import {vi} from 'vitest';
import {createMockVSCode} from '../__mocks__/vscode';

// Create a fresh mock for each test
const mockVscode = createMockVSCode();

// Note: vscode module resolution is handled by vitest config alias
// No need for vi.mock here since the alias points directly to the mock file

// Mock browser-specific globals
const mockAcquireVsCodeApi = vi.fn(() => ({
  postMessage: vi.fn(),
  setState: vi.fn(),
  getState: vi.fn(),
}));

// Add to global scope
if (typeof globalThis === 'object' && globalThis !== null) {
  (globalThis as Record<string, unknown>).acquireVsCodeApi =
    mockAcquireVsCodeApi;
}

// Mock WebWorker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
}

if (typeof globalThis === 'object' && globalThis !== null) {
  (globalThis as Record<string, unknown>).Worker = MockWorker;
}

// Helper to reset all mocks between tests
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockAcquireVsCodeApi.mockClear();
  // Reset specific mock functions that need individual reset
  Object.values(mockVscode).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      Object.values(value as Record<string, unknown>).forEach((fn) => {
        if (
          typeof fn === 'function' &&
          'mockReset' in fn &&
          typeof fn.mockReset === 'function'
        ) {
          (fn.mockReset as () => void)();
        }
      });
    }
  });
};

export {mockAcquireVsCodeApi, mockVscode};
