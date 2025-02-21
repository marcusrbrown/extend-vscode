import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
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
  },
});
