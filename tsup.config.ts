import {polyfillNode} from 'esbuild-plugin-polyfill-node';
import {defineConfig, type Options} from 'tsup';

export default defineConfig(async (options: Options): Promise<Options[]> => {
  const node: Options = {
    ...options,
    name: 'node',
    entry: ['src/extension.ts'],
    outDir: 'out/node',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    clean: true,
    define: {
      'process.env.PLATFORM': 'node',
    },
    treeshake: {
      preset: 'smallest',
      moduleSideEffects: 'no-external',
    },
    external: ['vscode'],
    onSuccess:
      options.env?.LAUNCH !== undefined && options.env.LAUNCH !== ''
        ? `code --extensionDevelopmentPath=${__dirname} --disable-extensions`
        : undefined,
  };

  const web: Options = {
    ...options,
    name: 'web',
    entry: ['src/extension.ts'],
    outDir: 'out/web',
    clean: true,
    define: {
      'process.env.PLATFORM': 'web',
    },
    treeshake: {
      preset: 'smallest',
      moduleSideEffects: 'no-external',
    },
    external: ['vscode'],
    esbuildPlugins: [
      polyfillNode({
        polyfills: {},
      }),
    ],
    onSuccess:
      options.env?.LAUNCH !== undefined && options.env.LAUNCH !== ''
        ? `vscode-test-web --extensionDevelopmentPath=${__dirname} --browserType=chromium --port=3000`
        : undefined,
  };

  const library: Options = {
    ...options,
    name: 'library',
    entry: {
      index: 'src/index.ts',
      'commands/index': 'src/commands/index.ts',
      'configuration/index': 'src/configuration/index.ts',
      'webview/index': 'src/webview/index.ts',
      'tree-view/index': 'src/tree-view/index.ts',
      'tasks/index': 'src/tasks/index.ts',
      'status-bar/index': 'src/status-bar/index.ts',
      'telemetry/index': 'src/telemetry/index.ts',
      'utils/index': 'src/utils/index.ts',
    },
    outDir: 'out/node',
    platform: 'node',
    target: 'node18',
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    external: ['vscode'],
    clean: false, // Don't clean since extension already cleaned
  };

  if (!options.platform) {
    return [node, web, library];
  } else if (options.platform === 'node') {
    return [node, library];
  } else if (options.platform === 'browser') {
    return [web];
  } else {
    throw new Error(`Invalid platform: ${options.platform}`);
  }
});
