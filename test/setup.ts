import {vi} from 'vitest';
import {createMockVSCode} from './__mocks__/vscode';

// Create a fresh mock for each test
const mockVscode = createMockVSCode();

// Mock the VS Code module
vi.mock('vscode', () => mockVscode);

// Helper to reset all mocks between tests
export const resetAllMocks = () => {
  vi.clearAllMocks();
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

export {mockVscode};
