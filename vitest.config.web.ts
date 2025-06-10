import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'web',
    globals: true,
    environment: 'jsdom',
    include: ['test/web/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
    testTimeout: 10000,
    setupFiles: ['./test/web/setup.ts'],
    deps: {
      optimizer: {
        web: {
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
