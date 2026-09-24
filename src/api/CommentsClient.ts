import { BaseClient } from './BaseClient';
import type { Comment, CreateCommentInput } from '../models';

export class CommentsClient extends BaseClient {
  async create(input: CreateCommentInput) {
    return this.created('comment', await this.send<Comment>('POST', 'comments', { data: input }));
  }

  get(id: string) {
    return this.send<Comment>('GET', `comments/${encodeURIComponent(id)}`);
  }

  delete(id: string) {
    return this.send<undefined>('DELETE', `comments/${encodeURIComponent(id)}`);
  }

  listForTask(taskId: string) {
    return this.sendAllPages<Comment>('comments', { task_id: taskId });
  }
}
