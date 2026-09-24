import type { APIRequest, APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import type { CreatedHook } from './BaseClient';
import { CommentsClient } from './CommentsClient';
import { LabelsClient } from './LabelsClient';
import { ProjectsClient } from './ProjectsClient';
import { TasksClient } from './TasksClient';
import { UserClient } from './UserClient';

/**
 * Creates a request context for the configured environment.
 * `token: null` sends no Authorization header at all (negative tests).
 */
export function createApiContext(request: APIRequest, token: string | null) {
  return request.newContext({
    baseURL: env.baseUrl,
    extraHTTPHeaders: token === null ? {} : { Authorization: `Bearer ${token}` },
  });
}

/** One entry point to all resource clients, sharing one request context. */
export class TodoistApi {
  readonly projects: ProjectsClient;
  readonly tasks: TasksClient;
  readonly labels: LabelsClient;
  readonly comments: CommentsClient;
  readonly user: UserClient;

  constructor(request: APIRequestContext, onCreated?: CreatedHook) {
    this.projects = new ProjectsClient(request, onCreated);
    this.tasks = new TasksClient(request, onCreated);
    this.labels = new LabelsClient(request, onCreated);
    this.comments = new CommentsClient(request, onCreated);
    this.user = new UserClient(request, onCreated);
  }
}
