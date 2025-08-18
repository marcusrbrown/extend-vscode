import type {Page} from '@playwright/test';
import {test, VisualTestRunner} from './base';

test.describe('Tree View Visual Tests', () => {
  let runner: VisualTestRunner;

  test.beforeEach(async () => {
    runner = VisualTestRunner.getInstance();
  });

  test('explorer tree view default state', async ({page}: {page: Page}) => {
    // Create mock tree view
    const treeViewContent = `
      <div class="tree-view">
        <div style="font-weight: bold; padding: 4px 0; border-bottom: 1px solid #2d2d30;">EXPLORER</div>
        <div class="tree-item">📁 src</div>
        <div class="tree-item">📁 test</div>
        <div class="tree-item">📄 package.json</div>
        <div class="tree-item">📄 README.md</div>
        <div class="tree-item">📄 tsconfig.json</div>
      </div>
    `;

    await runner.createMockWebview(page, treeViewContent, 'Explorer Tree View');
    await runner.compareScreenshot(page, 'tree-view-explorer-default', {
      fullPage: false,
      threshold: 0.2,
    });
  });

  test('explorer tree view expanded', async ({page}: {page: Page}) => {
    // Create mock expanded tree view
    const treeViewContent = `
      <div class="tree-view">
        <div style="font-weight: bold; padding: 4px 0; border-bottom: 1px solid #2d2d30;">EXPLORER</div>
        <div class="tree-item">📂 src</div>
        <div class="tree-item" style="padding-left: 16px;">📄 extension.ts</div>
        <div class="tree-item" style="padding-left: 16px;">📄 index.ts</div>
        <div class="tree-item" style="padding-left: 16px;">📁 commands</div>
        <div class="tree-item" style="padding-left: 32px;">📄 index.ts</div>
        <div class="tree-item">📂 test</div>
        <div class="tree-item" style="padding-left: 16px;">📄 extension.test.ts</div>
        <div class="tree-item">📄 package.json</div>
        <div class="tree-item">📄 README.md</div>
      </div>
    `;

    await runner.createMockWebview(
      page,
      treeViewContent,
      'Explorer Tree Expanded',
    );
    await runner.compareScreenshot(page, 'tree-view-explorer-expanded', {
      fullPage: false,
      threshold: 0.2,
    });
  });

  test('search view tree', async ({page}: {page: Page}) => {
    // Create mock search view
    const treeViewContent = `
      <div class="tree-view">
        <div style="font-weight: bold; padding: 4px 0; border-bottom: 1px solid #2d2d30;">SEARCH</div>
        <div style="padding: 8px;">
          <input type="text" placeholder="Search" style="width: 100%; padding: 4px; background: #3c3c3c; border: 1px solid #464647; color: #cccccc;" value="extension">
        </div>
        <div style="font-size: 11px; color: #888; padding: 4px 8px;">3 results in 2 files</div>
        <div class="tree-item">📄 src/extension.ts</div>
        <div class="tree-item" style="padding-left: 16px; font-size: 11px; color: #888;">Line 1: export function activate...</div>
        <div class="tree-item" style="padding-left: 16px; font-size: 11px; color: #888;">Line 15: extension context...</div>
        <div class="tree-item">📄 package.json</div>
        <div class="tree-item" style="padding-left: 16px; font-size: 11px; color: #888;">Line 5: "name": "extension"</div>
      </div>
    `;

    await runner.createMockWebview(page, treeViewContent, 'Search Tree View');
    await runner.compareScreenshot(page, 'tree-view-search', {
      fullPage: false,
      threshold: 0.2,
    });
  });
});
