import type * as vscodeTypes from 'vscode';
import type {MockWebviewPanel} from '../../types/mock-vscode';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {HelloWebview} from '../../src/webview';
import {mockVscode, resetAllMocks} from '../setup';

describe('HelloWebview', () => {
  let context: vscodeTypes.ExtensionContext;
  let webview: HelloWebview;
  let panel: MockWebviewPanel;

  beforeEach(async () => {
    resetAllMocks();
    context =
      mockVscode.ExtensionContext() as unknown as vscodeTypes.ExtensionContext;

    // Create panel and capture handlers
    panel = mockVscode.window.createWebviewPanel() as MockWebviewPanel;
    vi.mocked(mockVscode.window.createWebviewPanel).mockReturnValue(panel);

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
    expect(mockVscode.window.createWebviewPanel).toHaveBeenCalledWith(
      'test.helloWebview',
      'Test Webview',

      mockVscode.ViewColumn.One,
      expect.objectContaining({
        enableScripts: true,
        retainContextWhenHidden: true,
      }),
    );
  });

  test('HTML content includes necessary elements and scripts', () => {
    expect(panel.webview.html).toContain('<title>Hello Webview</title>');

    expect(panel.webview.html).toContain(
      '<button id="sendMessage">Send Message</button>',
    );

    expect(panel.webview.html).toContain('acquireVsCodeApi()');
  });

  test('handles messages from webview', async () => {
    const onMessageMock = vi.fn();

    // Create a new webview with the message handler
    webview = new HelloWebview(context, {
      viewType: 'test.helloWebview',
      title: 'Test Webview',
      onMessage: onMessageMock,
    });

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the message handler from the new webview's registration
    const mockCalls = vi.mocked(panel.webview.onDidReceiveMessage).mock.calls;
    expect(mockCalls.length).toBeGreaterThan(1);
    const messageHandler = mockCalls[1]?.[0] as (message: any) => Promise<void>;

    // Simulate message from webview
    await messageHandler({type: 'hello'});

    expect(onMessageMock).toHaveBeenCalledWith({type: 'hello'});
  });

  test('handles disposal correctly', async () => {
    const onDisposeMock = vi.fn();

    // Create a new webview with the dispose handler
    webview = new HelloWebview(context, {
      viewType: 'test.helloWebview',
      title: 'Test Webview',
      onDispose: onDisposeMock,
    });

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the dispose handler from the new webview's registration
    const mockCalls = vi.mocked(panel.onDidDispose).mock.calls;
    expect(mockCalls.length).toBeGreaterThan(1);
    const disposeHandler = mockCalls[1]?.[0] as () => Promise<void>;

    // Simulate panel disposal
    await disposeHandler();

    expect(onDisposeMock).toHaveBeenCalled();

    expect(panel.dispose).toHaveBeenCalled();
  });
});
