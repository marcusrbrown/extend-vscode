/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    'next-major',
    {name: 'beta', prerelease: true},
    {name: 'alpha', prerelease: true},
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          {type: 'docs', scope: 'README', release: 'patch'},
          {type: 'refactor', release: 'patch'},
          {type: 'style', release: 'patch'},
          {type: 'build', release: 'patch'},
          {type: 'ci', release: 'patch'},
          {type: 'test', release: 'patch'},
          {scope: 'no-release', release: false},
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            {type: 'feat', section: '✨ Features'},
            {type: 'fix', section: '🐛 Bug Fixes'},
            {type: 'perf', section: '⚡ Performance Improvements'},
            {type: 'revert', section: '⏪ Reverts'},
            {type: 'docs', section: '📚 Documentation', hidden: false},
            {type: 'style', section: '💎 Styles', hidden: false},
            {type: 'refactor', section: '📦 Code Refactoring', hidden: false},
            {type: 'test', section: '🚨 Tests', hidden: false},
            {type: 'build', section: '🛠 Build System', hidden: false},
            {type: 'ci', section: '⚙️ Continuous Integration', hidden: false},
          ],
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: 'dist',
      },
    ],
    [
      'semantic-release-vsce',
      {
        packageVsix: true,
        packagePath: '.',
        vsixDir: 'dist',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'dist/*.vsix',
            label: 'VS Code Extension Package',
          },
          {
            path: 'dist/*.tgz',
            label: 'npm Package',
          },
        ],
        successComment: false,
        failComment: false,
        failTitle: false,
        releasedLabels: ['released'],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
