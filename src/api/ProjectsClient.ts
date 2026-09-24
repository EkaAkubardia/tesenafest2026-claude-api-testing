import { BaseClient } from './BaseClient';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../models';

export class ProjectsClient extends BaseClient {
  async create(input: CreateProjectInput) {
    return this.created('project', await this.send<Project>('POST', 'projects', { data: input }));
  }

  /** For negative tests: returns the raw response instead of failing on an error status. */
  createRaw(input: unknown) {
    return this.sendRaw('POST', 'projects', { data: input });
  }

  get(id: string) {
    return this.send<Project>('GET', `projects/${encodeURIComponent(id)}`);
  }

  update(id: string, input: UpdateProjectInput) {
    return this.send<Project>('POST', `projects/${encodeURIComponent(id)}`, { data: input });
  }

  /** Also deletes the project's tasks. */
  delete(id: string) {
    return this.send<undefined>('DELETE', `projects/${encodeURIComponent(id)}`);
  }

  list() {
    return this.sendAllPages<Project>('projects');
  }
}
