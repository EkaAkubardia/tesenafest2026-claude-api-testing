import { BaseClient } from './BaseClient';
import type { CreateLabelInput, Label } from '../models';

export class LabelsClient extends BaseClient {
  async create(input: CreateLabelInput) {
    return this.created('label', await this.send<Label>('POST', 'labels', { data: input }));
  }

  get(id: string) {
    return this.send<Label>('GET', `labels/${encodeURIComponent(id)}`);
  }

  delete(id: string) {
    return this.send<undefined>('DELETE', `labels/${encodeURIComponent(id)}`);
  }

  /** Personal labels, all pages. */
  list() {
    return this.sendAllPages<Label>('labels');
  }
}
