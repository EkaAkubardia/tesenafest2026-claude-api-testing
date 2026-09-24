import { randomUUID } from 'node:crypto';
import type {
  CreateCommentInput,
  CreateLabelInput,
  CreateProjectInput,
  CreateTaskInput,
} from '../models';

/** Every piece of test data starts with this, so leftovers can be found and swept. */
export const TEST_DATA_PREFIX = 'autotest-';

/** Set once per run in playwright.config.ts and inherited by the workers. */
export function runId() {
  return process.env.TEST_RUN_ID ?? 'local';
}

/** e.g. autotest-20260924T120000-project-1a2b3c4d - unique even across retries. */
export function uniqueName(purpose: string) {
  return `${TEST_DATA_PREFIX}${runId()}-${purpose}-${randomUUID().slice(0, 8)}`;
}

export function projectData(overrides: Partial<CreateProjectInput> = {}): CreateProjectInput {
  return { name: uniqueName('project'), ...overrides };
}

export function taskData(overrides: Partial<CreateTaskInput> = {}): CreateTaskInput {
  return { content: uniqueName('task'), ...overrides };
}

export function labelData(overrides: Partial<CreateLabelInput> = {}): CreateLabelInput {
  return { name: uniqueName('label'), ...overrides };
}

export function commentData(overrides: Partial<CreateCommentInput> = {}): CreateCommentInput {
  return { content: uniqueName('comment'), ...overrides };
}
