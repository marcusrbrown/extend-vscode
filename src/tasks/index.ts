import * as vscode from 'vscode';
import {logger} from '../utils/logger';

/**
 * Base task definition that can be extended by implementations
 */
export interface BaseTaskDefinition extends vscode.TaskDefinition {
  /** Task type identifier */
  type: string;
  /** Task name */
  name: string;
  /** Optional task group */
  group?: string;
}

/**
 * Base task provider that can be extended for custom task types
 */
export abstract class TaskProvider<T extends BaseTaskDefinition>
  implements vscode.TaskProvider
{
  protected readonly type: string;
  private readonly tasks = new Map<string, vscode.Task>();

  constructor(type: string) {
    this.type = type;
  }

  /**
   * Provide tasks for the workspace
   */
  async provideTasks(): Promise<vscode.Task[]> {
    try {
      const definitions = await this.getTaskDefinitions();
      return definitions.map((definition) => this.createTask(definition));
    } catch (error) {
      logger.error('Error providing tasks:', error);
      return [];
    }
  }

  /**
   * Resolve a task instance
   */
  resolveTask(task: vscode.Task): vscode.Task | undefined {
    const definition = task.definition as T;
    if (definition.type === this.type) {
      return this.createTask(definition);
    }
    return undefined;
  }

  /**
   * Get task definitions
   */
  protected abstract getTaskDefinitions(): Promise<T[]>;

  /**
   * Create a task from a definition
   */
  protected createTask(definition: T): vscode.Task {
    const taskKey = this.getTaskKey(definition);
    let task = this.tasks.get(taskKey);

    if (!task) {
      const execution = this.createTaskExecution(definition);
      task = new vscode.Task(
        definition,
        vscode.TaskScope.Workspace,
        definition.name,
        this.type,
        execution,
      );

      const taskGroup =
        typeof definition.group === 'string' && definition.group.length > 0
          ? this.getTaskGroup(definition.group)
          : undefined;
      if (taskGroup) {
        task.group = taskGroup;
      }

      this.tasks.set(taskKey, task);
    }

    return task;
  }

  /**
   * Create task execution details
   */
  protected abstract createTaskExecution(
    definition: T,
  ): vscode.ProcessExecution | vscode.ShellExecution;

  /**
   * Get a unique key for the task
   */
  protected getTaskKey(definition: T): string {
    return `${definition.type}:${definition.name}`;
  }

  /**
   * Get the task group for a group identifier
   */
  protected getTaskGroup(group: string): vscode.TaskGroup | undefined {
    switch (group.toLowerCase()) {
      case 'build':
        return vscode.TaskGroup.Build;
      case 'test':
        return vscode.TaskGroup.Test;
      case 'clean':
        return vscode.TaskGroup.Clean;
      default:
        return undefined;
    }
  }
}

/**
 * Example task definition
 */
export interface ExampleTaskDefinition extends BaseTaskDefinition {
  /** Command to execute */
  command: string;
  /** Optional command arguments */
  args?: string[];
}

/**
 * Example task provider implementation
 */
export class ExampleTaskProvider extends TaskProvider<ExampleTaskDefinition> {
  constructor() {
    super('extend-vscode');
  }

  protected async getTaskDefinitions(): Promise<ExampleTaskDefinition[]> {
    return [
      {
        type: this.type,
        name: 'Example Task',
        command: 'echo',
        args: ['Hello from task!'],
        group: 'test',
      },
    ];
  }

  protected createTaskExecution(
    definition: ExampleTaskDefinition,
  ): vscode.ShellExecution {
    return new vscode.ShellExecution(definition.command, definition.args ?? []);
  }
}

/**
 * Set up task provider for the extension
 */
export function setupTaskProvider(context: vscode.ExtensionContext): void {
  try {
    const taskProvider = new ExampleTaskProvider();
    const disposable = vscode.tasks.registerTaskProvider(
      'extend-vscode',
      taskProvider,
    );
    context.subscriptions.push(disposable);
  } catch (error) {
    logger.error('Failed to set up task provider:', error);
  }
}
