import {test as base, expect, type Page} from '@playwright/test';

export interface VisualTestFixtures {
  mockWebviewUrl: string;
  extensionId: string;
}

export class VisualTestRunner {
  private static instance: VisualTestRunner | null = null;

  static getInstance(): VisualTestRunner {
    if (!VisualTestRunner.instance) {
      VisualTestRunner.instance = new VisualTestRunner();
    }
    return VisualTestRunner.instance;
  }

  /**
   * Take a screenshot and compare it with the baseline
   */
  async compareScreenshot(
    page: Page,
    name: string,
    options?: {
      threshold?: number;
      maxDiffPixels?: number;
      fullPage?: boolean;
    },
  ): Promise<void> {
    const screenshotOptions = {
      fullPage: options?.fullPage ?? true,
      threshold: options?.threshold ?? 0.1,
      maxDiffPixels: options?.maxDiffPixels ?? 100,
    };

    await expect(page).toHaveScreenshot(`${name}.png`, screenshotOptions);
  }

  /**
   * Create a mock webview page with VS Code styling
   */
  async createMockWebview(
    page: Page,
    content: string,
    title = 'Extension Webview',
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* VS Code webview styling */
        body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            background-color: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 22px;
            background-color: var(--vscode-statusBar-background, #007acc);
            color: var(--vscode-statusBar-foreground, #ffffff);
            display: flex;
            align-items: center;
            padding: 0 8px;
            font-size: 12px;
        }
        
        .tree-view {
            background-color: var(--vscode-sideBar-background, #252526);
            border-right: 1px solid var(--vscode-sideBar-border, #2d2d30);
            padding: 8px;
        }
        
        .tree-item {
            padding: 2px 8px;
            margin: 1px 0;
            cursor: pointer;
        }
        
        .tree-item:hover {
            background-color: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        
        .command-palette {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            width: 500px;
            background-color: var(--vscode-quickInput-background, #252526);
            border: 1px solid var(--vscode-quickInput-border, #464647);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .command-input {
            width: 100%;
            padding: 8px;
            background-color: transparent;
            border: none;
            color: var(--vscode-quickInput-foreground, #cccccc);
            font-size: 14px;
        }
        
        .command-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .command-item {
            padding: 8px;
            border-bottom: 1px solid var(--vscode-quickInput-border, #464647);
        }
        
        .command-item:hover {
            background-color: var(--vscode-list-hoverBackground, #2a2d2e);
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    await page.setContent(html);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(page: Page, selector: string): Promise<void> {
    await page.waitForSelector(selector, {state: 'visible'});
    await page.waitForTimeout(100); // Small delay for stability
  }
}

// Mock webview URL fixture
const mockWebviewUrlFixture = async (
  // eslint-disable-next-line no-empty-pattern
  {},
  use: (url: string) => Promise<void>,
) => {
  // Use a data URL for testing
  await use('data:text/html,<h1>Mock Webview</h1>');
};

// Extension ID fixture
const extensionIdFixture = async (
  // eslint-disable-next-line no-empty-pattern
  {},
  use: (id: string) => Promise<void>,
) => {
  await use('marcusrbrown.extend-vscode');
};

// Export the test with fixtures
export const test = base.extend<VisualTestFixtures>({
  mockWebviewUrl: mockWebviewUrlFixture,
  extensionId: extensionIdFixture,
});

export {expect} from '@playwright/test';
