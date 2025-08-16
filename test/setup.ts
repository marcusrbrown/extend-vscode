import type {MockVSCode} from '../types/mock-vscode';
import {vi} from 'vitest';
import {createMockVSCode} from './__mocks__/vscode';

// Create a fresh mock for each test
const mockVscode: MockVSCode = createMockVSCode();

// Mock the VS Code module
vi.mock('vscode', () => mockVscode);

// Helper to reset all mocks between tests
export const resetAllMocks = () => {
  vi.clearAllMocks();
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

export {mockVscode};
