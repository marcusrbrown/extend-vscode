import {polyfillNode} from 'esbuild-plugin-polyfill-node';
import {defineConfig, type Options} from 'tsup';

export default defineConfig(async (options: Options): Promise<Options[]> => {
  // @ts-expect-error - onSuccess doesn't accept undefined
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
    onSuccess: options.env?.['LAUNCH']
      ? `code --extensionDevelopmentPath=${__dirname} --disable-extensions`
      : undefined,
  };

  // @ts-expect-error - onSuccess doesn't accept undefined
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
    onSuccess: options.env?.['LAUNCH']
      ? `vscode-test-web --extensionDevelopmentPath=${__dirname} --browserType=chromium --port=3000`
      : undefined,
  };

  if (!options.platform) {
    return [node, web];
  } else if (options.platform === 'node') {
    return [node];
  } else if (options.platform === 'browser') {
    return [web];
  } else {
    throw new Error(`Invalid platform: ${options.platform}`);
  }
});
