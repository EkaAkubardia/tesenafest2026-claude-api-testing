import { BaseClient } from './BaseClient';
import type { CreateTaskInput, Task, TaskFilter, UpdateTaskInput } from '../models';

export class TasksClient extends BaseClient {
  async create(input: CreateTaskInput) {
    return this.created('task', await this.send<Task>('POST', 'tasks', { data: input }));
  }

  /** For negative tests: returns the raw response instead of failing on an error status. */
  createRaw(input: unknown) {
    return this.sendRaw('POST', 'tasks', { data: input });
  }

  get(id: string) {
    return this.send<Task>('GET', `tasks/${encodeURIComponent(id)}`);
  }

  update(id: string, input: UpdateTaskInput) {
    return this.send<Task>('POST', `tasks/${encodeURIComponent(id)}`, { data: input });
  }

  delete(id: string) {
    return this.send<undefined>('DELETE', `tasks/${encodeURIComponent(id)}`);
  }

  /** Ticks the task off. A recurring task moves to its next due date instead. */
  close(id: string) {
    return this.send<undefined>('POST', `tasks/${encodeURIComponent(id)}/close`);
  }

  reopen(id: string) {
    return this.send<undefined>('POST', `tasks/${encodeURIComponent(id)}/reopen`);
  }

  /** Open (not completed) tasks, all pages. */
  list(filter: TaskFilter = {}) {
    return this.sendAllPages<Task>('tasks', { ...filter });
  }
}
