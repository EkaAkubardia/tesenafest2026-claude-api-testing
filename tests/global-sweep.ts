import { request } from '@playwright/test';
import { createApiContext, TodoistApi } from '../src/api/TodoistApi';
import { getToken } from '../src/config/env';
import { sweepTestData } from '../src/data/cleanup';

/** Removes test data left behind by earlier runs (e.g. a crashed teardown). */
export default async function sweep() {
  const context = await createApiContext(request, getToken());
  try {
    const removed = await sweepTestData(new TodoistApi(context));
    const total = removed.projects + removed.tasks + removed.labels;
    if (total) console.log(`Swept leftover test data: ${JSON.stringify(removed)}`);
  } finally {
    await context.dispose();
  }
}
