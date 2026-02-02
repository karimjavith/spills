import pino from 'pino';
import { context, trace } from '@opentelemetry/api';
import { getContext } from './context.js';

export const baseLogger = pino({
  mixin: () => {
    const span = trace.getSpan(context.active());
    if (!span) return {};
    const spanContext = span.spanContext();
    return {
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    };
  },
});

export function log() {
  // Pull request context if present and attach to every log line
  const ctx = getContext();
  return ctx.reqId ? baseLogger.child({ reqId: ctx.reqId }) : baseLogger;
}
