import type * as vscodeTypes from 'vscode';
import type {MockWebviewPanel} from '../../types/mock-vscode';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import * as vscode from 'vscode';
import {HelloWebview} from '../../src/webview';
import {resetAllMocks} from './setup';

describe('HelloWebview', () => {
  let context: vscodeTypes.ExtensionContext;
  let webview: HelloWebview;
  let panel: MockWebviewPanel;

  beforeEach(async () => {
    resetAllMocks();

    // Mock the ExtensionContext creation
    const mockExtensionContext = vi.fn(() => ({
      subscriptions: [],
      extensionPath: '/fake/path',
      extension: {
        packageJSON: {
          version: '1.0.0',
          name: 'extend-vscode',
        },
      },
      globalState: {
        get: vi.fn(),
        update: vi.fn(),
      },
      workspaceState: {
        get: vi.fn(),
        update: vi.fn(),
      },
    }));

    context = mockExtensionContext() as unknown as vscodeTypes.ExtensionContext;

    // Create a mock panel that will be returned by createWebviewPanel
    panel = {
      webview: {
        html: '',
        onDidReceiveMessage: vi.fn(() => ({
          dispose: vi.fn(),
        })),
        postMessage: vi.fn(),
        asWebviewUri: vi.fn(),
      },
      onDidDispose: vi.fn(() => ({
        dispose: vi.fn(),
      })),
      dispose: vi.fn(),
      reveal: vi.fn(),
      viewType: 'test.helloWebview',
      title: 'Test Webview',
      options: {},
      viewColumn: vscode.ViewColumn.One,
      active: true,
      visible: true,
    } as MockWebviewPanel;

    // Set up the mock to return our panel
    vi.mocked(vscode.window.createWebviewPanel).mockReturnValue(
      panel as unknown as vscodeTypes.WebviewPanel,
    );

    // Initialize webview
    webview = new HelloWebview(context, {
      viewType: 'test.helloWebview',
      title: 'Test Webview',
    });

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  afterEach(() => {
    if (webview !== null && webview !== undefined) {
      webview.dispose();
    }
    vi.clearAllMocks();
  });

  test('creates webview panel with correct options', () => {
    expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
      'test.helloWebview',
      'Test Webview',
      vscode.ViewColumn.One,
      expect.objectContaining({
        enableScripts: true,
        retainContextWhenHidden: true,
      }),
    );
  });

  test('HTML content includes necessary elements and scripts', () => {
    expect(panel.webview.html).toContain('<title>Hello Webview</title>');

    expect(panel.webview.html).toContain('<h1>Hello from Webview!</h1>');

    expect(panel.webview.html).toContain('const vscode = acquireVsCodeApi();');
  });

  test('handles messages from webview', () => {
    // Verify that the message handler was set up
    expect(panel.webview.onDidReceiveMessage).toHaveBeenCalled();

    // Get the message handler from the new webview's registration
    const mockCalls = vi.mocked(panel.webview.onDidReceiveMessage).mock.calls;
    expect(mockCalls.length).toBeGreaterThan(0);
    const messageHandler = mockCalls[0]?.[0] as (message: any) => Promise<void>;

    expect(messageHandler).toBeDefined();
  });

  test('handles disposal correctly', () => {
    // Verify that the dispose handler was set up
    expect(panel.onDidDispose).toHaveBeenCalled();

    // Get the dispose handler from the new webview's registration
    const mockCalls = vi.mocked(panel.onDidDispose).mock.calls;
    expect(mockCalls.length).toBeGreaterThan(0);
    const disposeHandler = mockCalls[0]?.[0] as () => Promise<void>;

    expect(disposeHandler).toBeDefined();

    // Test manual disposal
    webview.dispose();
    expect(panel.dispose).toHaveBeenCalled();
  });
});
