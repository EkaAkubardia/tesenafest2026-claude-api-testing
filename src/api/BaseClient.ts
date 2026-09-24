import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Page } from '../models';

type Method = 'GET' | 'POST' | 'DELETE';
type Params = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  data?: unknown;
  params?: Params;
}

export type ResourceKind = 'project' | 'task' | 'label' | 'comment';

/** Called after every successful create, so the fixture can clean up. */
export type CreatedHook = (kind: ResourceKind, id: string) => void;

const MAX_ATTEMPTS = 3;
const MAX_RETRY_WAIT_MS = 30_000;

/** Carries status and response body - never request headers, so the token can't leak. */
export class ApiError extends Error {
  constructor(
    readonly method: Method,
    readonly path: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${method} ${path} failed with ${status}: ${body.slice(0, 500)}`);
    this.name = 'ApiError';
  }
}

export abstract class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    private readonly onCreated?: CreatedHook,
  ) {}

  /** Sends a request and returns the raw response - for tests that assert on status codes. */
  protected async sendRaw(method: Method, path: string, options: RequestOptions = {}) {
    for (let attempt = 1; ; attempt++) {
      const response = await this.request.fetch(path, {
        method,
        params: stripUndefined(options.params),
        data: options.data,
      });
      if (response.status() !== 429 || attempt === MAX_ATTEMPTS) return response;
      await sleep(retryDelayMs(response, attempt));
    }
  }

  /** Sends a request, fails with ApiError on a non-2xx status and returns the parsed body. */
  protected async send<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.sendRaw(method, path, options);
    const text = await response.text();
    if (!response.ok()) throw new ApiError(method, path, response.status(), text);
    return (text ? JSON.parse(text) : undefined) as T;
  }

  /** Follows next_cursor until every page is loaded. */
  protected async sendAllPages<T>(path: string, params: Params = {}): Promise<T[]> {
    const items: T[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.send<Page<T>>('GET', path, {
        params: { ...params, limit: 200, cursor },
      });
      items.push(...page.results);
      cursor = page.next_cursor ?? undefined;
    } while (cursor);
    return items;
  }

  protected created<T extends { id: string }>(kind: ResourceKind, resource: T): T {
    this.onCreated?.(kind, resource.id);
    return resource;
  }
}

function stripUndefined(params?: Params) {
  if (!params) return undefined;
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] => entry[1] !== undefined,
  );
  return Object.fromEntries(entries);
}

function retryDelayMs(response: APIResponse, attempt: number) {
  const retryAfter = Number(response.headers()['retry-after']);
  const ms = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 2000;
  return Math.min(ms, MAX_RETRY_WAIT_MS);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
