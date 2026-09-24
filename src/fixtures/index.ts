import { test as base } from '@playwright/test';
import { createApiContext, TodoistApi } from '../api/TodoistApi';
import { getToken } from '../config/env';
import { CleanupTracker } from '../data/cleanup';

interface Fixtures {
  /** Authenticated API. Everything created through it is deleted after the test, even on failure. */
  api: TodoistApi;
  /**
   * API with a custom token (`null` = no Authorization header) for negative tests.
   * Nothing created through it is tracked - it is expected to fail.
   */
  apiWithToken: (token: string | null) => Promise<TodoistApi>;
}

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const context = await createApiContext(playwright.request, getToken());
    const cleanup = new CleanupTracker();
    const api = new TodoistApi(context, cleanup.track);
    try {
      await use(api);
    } finally {
      try {
        await cleanup.run(api);
      } finally {
        await context.dispose();
      }
    }
  },

  apiWithToken: async ({ playwright }, use) => {
    const contexts: Awaited<ReturnType<typeof createApiContext>>[] = [];
    await use(async (token) => {
      const context = await createApiContext(playwright.request, token);
      contexts.push(context);
      return new TodoistApi(context);
    });
    await Promise.all(contexts.map((context) => context.dispose()));
  },
});

export { expect } from '@playwright/test';
