import { ApiError, type ResourceKind } from '../api/BaseClient';
import type { TodoistApi } from '../api/TodoistApi';
import { TEST_DATA_PREFIX } from './factories';

/** Remembers what a test created and deletes it afterwards, newest first. */
export class CleanupTracker {
  private readonly created: { kind: ResourceKind; id: string }[] = [];

  readonly track = (kind: ResourceKind, id: string) => {
    this.created.push({ kind, id });
  };

  /** Tries every deletion; "already gone" (404) is fine, other failures are reported together. */
  async run(api: TodoistApi) {
    const failures: string[] = [];
    for (const { kind, id } of this.created.reverse()) {
      try {
        await deleteResource(api, kind, id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) continue;
        failures.push(`${kind} ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    this.created.length = 0;
    if (failures.length) throw new Error(`Cleanup failed:\n${failures.join('\n')}`);
  }
}

function deleteResource(api: TodoistApi, kind: ResourceKind, id: string) {
  switch (kind) {
    case 'project':
      return api.projects.delete(id);
    case 'task':
      return api.tasks.delete(id);
    case 'label':
      return api.labels.delete(id);
    case 'comment':
      return api.comments.delete(id);
  }
}

/**
 * Deletes every leftover with the test data prefix, from any run.
 * Safe because all runs are serialized (1 worker, one CI concurrency group).
 */
export async function sweepTestData(api: TodoistApi) {
  const isTestData = (name: string) => name.startsWith(TEST_DATA_PREFIX);
  const counts = { projects: 0, tasks: 0, labels: 0 };

  const deletedProjects = new Set<string>();
  for (const project of await api.projects.list()) {
    if (!isTestData(project.name)) continue;
    await api.projects.delete(project.id);
    deletedProjects.add(project.id);
    counts.projects++;
  }
  // Tasks created outside a test project, e.g. in the Inbox. Tasks of deleted
  // projects are already gone, even if the task list still shows them.
  for (const task of await api.tasks.list()) {
    if (!isTestData(task.content) || deletedProjects.has(task.project_id)) continue;
    if (await deletedUnlessMissing(api.tasks.delete(task.id))) counts.tasks++;
  }
  for (const label of await api.labels.list()) {
    if (!isTestData(label.name)) continue;
    await api.labels.delete(label.id);
    counts.labels++;
  }
  return counts;
}

/** true if deleted, false if it was already gone (404). */
async function deletedUnlessMissing(promise: Promise<unknown>) {
  try {
    await promise;
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return false;
    throw error;
  }
}
