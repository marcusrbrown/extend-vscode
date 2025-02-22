import {defineConfig} from '@bfra.me/eslint-config';

export default defineConfig(
  {
    name: 'extend-vscode',
    ignores: ['out', '.vscode-test'],
    packageJson: true,
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    // vitest: true,
  },
  {files: ['**/*.config.ts'], rules: {'dot-notation': 'off'}},
);
