import type {Page} from '@playwright/test';
import {test, VisualTestRunner} from './base';

test.describe('Status Bar Visual Tests', () => {
  let runner: VisualTestRunner;

  test.beforeEach(async () => {
    runner = VisualTestRunner.getInstance();
  });

  test('status bar default state', async ({page}: {page: Page}) => {
    // Create mock status bar
    const statusBarContent = `
      <div class="status-bar">
        <span>TypeScript</span>
        <span style="margin-left: auto;">Ln 1, Col 1</span>
        <span style="margin-left: 8px;">Spaces: 2</span>
        <span style="margin-left: 8px;">UTF-8</span>
      </div>
    `;

    await runner.createMockWebview(page, statusBarContent, 'Status Bar');
    await runner.compareScreenshot(page, 'status-bar-default', {
      threshold: 0.2,
    });
  });

  test('status bar with active file', async ({page}: {page: Page}) => {
    // Create mock status bar with active file
    const statusBarContent = `
      <div class="status-bar">
        <span>JavaScript</span>
        <span style="margin-left: 8px;">✓ sample.js</span>
        <span style="margin-left: auto;">Ln 15, Col 23</span>
        <span style="margin-left: 8px;">Spaces: 2</span>
        <span style="margin-left: 8px;">UTF-8</span>
      </div>
    `;

    await runner.createMockWebview(page, statusBarContent, 'Status Bar Active');
    await runner.compareScreenshot(page, 'status-bar-active-file', {
      threshold: 0.2,
    });
  });

  test('status bar language mode', async ({page}: {page: Page}) => {
    // Create mock status bar with language picker
    const statusBarContent = `
      <div class="status-bar">
        <span style="background-color: rgba(255, 255, 255, 0.1); padding: 2px 4px;">TypeScript ▼</span>
        <span style="margin-left: auto;">Ln 1, Col 1</span>
        <span style="margin-left: 8px;">Spaces: 2</span>
      </div>
      <div style="position: absolute; top: -200px; left: 8px; background: #252526; border: 1px solid #464647; padding: 8px; min-width: 200px;">
        <div style="padding: 4px; background: #094771;">TypeScript</div>
        <div style="padding: 4px;">JavaScript</div>
        <div style="padding: 4px;">JSON</div>
        <div style="padding: 4px;">Plain Text</div>
      </div>
    `;

    await runner.createMockWebview(
      page,
      statusBarContent,
      'Status Bar Language Picker',
    );
    await runner.compareScreenshot(page, 'status-bar-language-picker', {
      threshold: 0.2,
    });
  });
});
