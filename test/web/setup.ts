import type {Mock} from 'vitest';
import {vi} from 'vitest';
import {createMockVSCode} from '../__mocks__/vscode';

interface VsCodeApi {
  postMessage: Mock;
  setState: Mock;
  getState: Mock;
}

interface MockWorkerInterface {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: Mock;
  terminate: Mock;
}

const mockVscode = createMockVSCode();

const mockAcquireVsCodeApi: Mock<() => VsCodeApi> = vi.fn(() => ({
  postMessage: vi.fn(),
  setState: vi.fn(),
  getState: vi.fn(),
}));

function createMockWorker(): MockWorkerInterface {
  return {
    onmessage: null,
    postMessage: vi.fn(),
    terminate: vi.fn(),
  };
}

const MockWorker = vi.fn(createMockWorker);

(globalThis as Record<string, unknown>).acquireVsCodeApi = mockAcquireVsCodeApi;
(globalThis as Record<string, unknown>).Worker = MockWorker;

function isMockFunction(fn: unknown): fn is {mockReset: () => void} {
  return (
    typeof fn === 'function' &&
    'mockReset' in fn &&
    typeof fn.mockReset === 'function'
  );
}

export function resetAllMocks(): void {
  vi.clearAllMocks();

  for (const value of Object.values(mockVscode)) {
    if (typeof value === 'object' && value != null) {
      for (const fn of Object.values(value as Record<string, unknown>)) {
        if (isMockFunction(fn)) {
          fn.mockReset();
        }
      }
    }
  }
}

export {mockAcquireVsCodeApi, mockVscode};
