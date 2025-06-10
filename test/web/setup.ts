import {vi} from 'vitest';
import {createMockVSCode} from '../__mocks__/vscode';

// Create a fresh mock for each test
const mockVscode = createMockVSCode();

// Mock the VS Code API
vi.mock('vscode', () => mockVscode);

// Mock browser-specific globals
const mockAcquireVsCodeApi = vi.fn(() => ({
  postMessage: vi.fn(),
  setState: vi.fn(),
  getState: vi.fn(),
}));

// Add to global scope
(globalThis as any).acquireVsCodeApi = mockAcquireVsCodeApi;

// Mock WebWorker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
}

(globalThis as any).Worker = MockWorker;

// Helper to reset all mocks between tests
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockAcquireVsCodeApi.mockClear();
  Object.values(mockVscode).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((fn) => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
          fn.mockReset();
        }
      });
    }
  });
};

export {mockAcquireVsCodeApi, mockVscode};
