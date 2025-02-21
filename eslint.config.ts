import {defineConfig} from '@bfra.me/eslint-config';

export default defineConfig({
  name: 'extend-vscode',
  ignores: ['out', '.vscode-test'],
  packageJson: true,
  typescript: {
    parserOptions: {
      project: ['./tsconfig.node.json'],
      projectService: false,
    },
    tsconfigPath: './tsconfig.json',
  },
  // vitest: true,
});
