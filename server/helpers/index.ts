function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!isNaN(parsed)) return parsed;
  }
  return undefined;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object';
}

async function safeJson<T>(response: Response): Promise<T | null> {
  const ct = response.headers.get('content-type');
  if (!ct || !ct.includes('application/json')) {
    return null;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown): string | null {
  if (!isRecord(body)) return null;

  // common shapes: {message}, {error_description}, {errors:[{message}]}
  if (typeof body.message === 'string') return body.message;
  if (typeof body.error_description === 'string') return body.error_description;

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    if (isRecord(first) && typeof first.message === 'string')
      return first.message;
  }

  return null;
}

function requiredENV(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Environment variable ${varName} is required but not set.`);
  }
  return value;
}

function getStringField(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : null;
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function textResponse(
  body: string,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain', ...headers },
  });
}

export {
  asString,
  asNumber,
  getErrorMessage,
  requiredENV,
  getStringField,
  safeJson,
  isRecord,
  jsonResponse,
  textResponse,
};
