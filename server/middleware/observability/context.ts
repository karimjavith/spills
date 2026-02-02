import { AsyncLocalStorage } from 'node:async_hooks';

export const als = new AsyncLocalStorage<RequestContext>();

export type RequestContext = {
  reqId?: string;
};

let current: RequestContext = {};

export function getContext(): RequestContext {
  return als.getStore() ?? current;
}

export function runWithContext<T>(
  ctx: RequestContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  const prev = als.getStore() ?? current;
  current = ctx;
  try {
    return fn();
  } finally {
    current = prev;
  }
}
