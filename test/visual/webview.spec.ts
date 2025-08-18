import type {Page} from '@playwright/test';
import {test, VisualTestRunner} from './base';

test.describe('Webview Visual Tests', () => {
  let runner: VisualTestRunner;

  test.beforeEach(async () => {
    runner = VisualTestRunner.getInstance();
  });

  test('command palette webview', async ({page}: {page: Page}) => {
    // Create mock command palette
    const commandPaletteContent = `
      <div class="command-palette">
        <input class="command-input" placeholder="Type a command" value=">ext">
        <div class="command-list">
          <div class="command-item" style="background-color: #094771;">
            <div style="font-weight: bold;">Extensions: Install Extensions</div>
            <div style="font-size: 11px; color: #888;">Install or enable an extension</div>
          </div>
          <div class="command-item">
            <div style="font-weight: bold;">Extensions: Show Installed Extensions</div>
            <div style="font-size: 11px; color: #888;">Show installed extensions</div>
          </div>
          <div class="command-item">
            <div style="font-weight: bold;">Extensions: Disable All Installed Extensions</div>
            <div style="font-size: 11px; color: #888;">Disable all installed extensions</div>
          </div>
        </div>
      </div>
    `;

    await runner.createMockWebview(
      page,
      commandPaletteContent,
      'Command Palette',
    );
    await runner.compareScreenshot(page, 'webview-command-palette', {
      threshold: 0.2,
    });
  });

  test('quick open webview', async ({page}: {page: Page}) => {
    // Create mock quick open
    const quickOpenContent = `
      <div class="command-palette">
        <input class="command-input" placeholder="Go to File" value="ext">
        <div class="command-list">
          <div class="command-item" style="background-color: #094771;">
            <div style="font-weight: bold;">src/extension.ts</div>
            <div style="font-size: 11px; color: #888;">src/</div>
          </div>
          <div class="command-item">
            <div style="font-weight: bold;">test/extension.test.ts</div>
            <div style="font-size: 11px; color: #888;">test/</div>
          </div>
          <div class="command-item">
            <div style="font-weight: bold;">extend-vscode-0.1.0.vsix</div>
            <div style="font-size: 11px; color: #888;">./</div>
          </div>
        </div>
      </div>
    `;

    await runner.createMockWebview(page, quickOpenContent, 'Quick Open');
    await runner.compareScreenshot(page, 'webview-quick-open', {
      threshold: 0.2,
    });
  });

  test('settings webview', async ({page}: {page: Page}) => {
    // Create mock settings page
    const settingsContent = `
      <div style="padding: 20px; max-width: 800px;">
        <h1 style="font-size: 20px; margin-bottom: 20px; color: #cccccc;">Settings</h1>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: bold; margin-bottom: 4px;">Editor: Font Size</label>
          <input type="number" value="14" style="padding: 4px; background: #3c3c3c; border: 1px solid #464647; color: #cccccc; width: 100px;">
          <div style="font-size: 11px; color: #888; margin-top: 4px;">Controls the font size in pixels.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: bold; margin-bottom: 4px;">
            <input type="checkbox" checked style="margin-right: 8px;"> Editor: Word Wrap
          </label>
          <div style="font-size: 11px; color: #888;">Controls how lines should wrap.</div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: bold; margin-bottom: 4px;">Workbench: Color Theme</label>
          <select style="padding: 4px; background: #3c3c3c; border: 1px solid #464647; color: #cccccc; width: 200px;">
            <option>Dark+ (default dark)</option>
            <option>Light+ (default light)</option>
            <option>High Contrast</option>
          </select>
        </div>
      </div>
    `;

    await runner.createMockWebview(page, settingsContent, 'Settings');
    await runner.compareScreenshot(page, 'webview-settings', {
      threshold: 0.2,
    });
  });
});
