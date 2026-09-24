import { BaseClient } from './BaseClient';
import type { User } from '../models';

export class UserClient extends BaseClient {
  /**
   * The response contains the account's API token. It is removed here so it can't
   * end up in an assertion message, an attachment or a log.
   */
  async get(): Promise<User> {
    const { token: _token, ...user } = await this.send<User & { token?: string }>('GET', 'user');
    return user;
  }
}
