import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Base telemetry event data
 */
export interface TelemetryEventData {
  [key: string]: unknown;
}

/**
 * Telemetry event with common properties
 */
export interface TelemetryEvent<
  T extends TelemetryEventData = TelemetryEventData,
> {
  /** Event name */
  name: string;
  /** Event properties */
  properties: T;
  /** Event measurements */
  measurements?: {[key: string]: number};
}

/**
 * Telemetry reporter interface
 */
export interface TelemetryReporter {
  /** Send a telemetry event */
  sendTelemetryEvent<T extends TelemetryEventData>(
    event: TelemetryEvent<T>,
  ): void;
  /** Flush pending data and dispose */
  dispose(): void | Promise<void>;
}

/**
 * Console telemetry reporter for development
 */
export class ConsoleTelemetryReporter implements TelemetryReporter {
  sendTelemetryEvent<T extends TelemetryEventData>(
    event: TelemetryEvent<T>,
  ): void {
    logger.debug('Telemetry event:', {
      name: event.name,
      properties: event.properties,
      measurements: event.measurements,
    });
  }

  dispose(): void {
    // Nothing to dispose
  }
}

/**
 * Telemetry manager that handles sending events
 */
export class TelemetryManager {
  private reporter: TelemetryReporter;
  private commonProperties: TelemetryEventData = {};

  constructor(reporter: TelemetryReporter) {
    this.reporter = reporter;
  }

  /**
   * Set common properties to include with all events
   */
  setCommonProperties(properties: TelemetryEventData): void {
    this.commonProperties = properties;
  }

  /**
   * Send a telemetry event
   */
  sendEvent<T extends TelemetryEventData>(
    name: string,
    properties: T,
    measurements?: {[key: string]: number},
  ): void {
    try {
      const event: TelemetryEvent<T> = {
        name,
        properties: {
          ...this.commonProperties,
          ...properties,
        },
      };

      if (measurements) {
        event.measurements = measurements;
      }

      this.reporter.sendTelemetryEvent(event);
    } catch (error) {
      logger.error('Error sending telemetry event:', error);
    }
  }

  /**
   * Dispose of the telemetry manager
   */
  async dispose(): Promise<void> {
    try {
      await this.reporter.dispose();
    } catch (error) {
      logger.error('Error disposing telemetry reporter:', error);
    }
  }
}

/**
 * Set up telemetry for the extension
 */
export function setupTelemetry(
  context: vscode.ExtensionContext,
): TelemetryManager {
  try {
    // Use console reporter for development
    const reporter = new ConsoleTelemetryReporter();
    const manager = new TelemetryManager(reporter);

    // Set common properties
    manager.setCommonProperties({
      extensionVersion: context.extension.packageJSON.version,
      vscodeVersion: vscode.version,
      machineId: vscode.env.machineId,
      sessionId: `${context.extension.id}_${Date.now()}`,
    });

    // Ensure telemetry is disposed when the extension is deactivated
    context.subscriptions.push({
      dispose: async () => {
        await manager.dispose();
      },
    });

    return manager;
  } catch (error) {
    logger.error('Failed to set up telemetry:', error);
    throw error;
  }
}
