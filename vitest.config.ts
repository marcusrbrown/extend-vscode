import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
    testTimeout: 10000,
    setupFiles: ['./test/setup.ts'],
    deps: {
      optimizer: {
        web: {
          exclude: ['vscode'],
        },
        ssr: {
          exclude: ['vscode'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'out/**',
        '**/*.d.ts',
        'test/**',
        '**/__mocks__/**',
      ],
    },
  },
});
