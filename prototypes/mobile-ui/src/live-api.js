import { CardResponse, ConnectionResponse, PrepareResponse, TransactionResponse, ErrorResponse } from '../../../apps/web/src/generated/validators.js';

const failures = [];
export function diagnostics() { return structuredClone(failures); }
export function recordFailure(fields) {
  const entry = { time: new Date().toISOString(), ...fields };
  failures.push(entry);
  if (failures.length > 20) failures.shift();
  console.error('shomei_failure', entry);
}

export class LiveError extends Error {
  constructor(code) { super(code); this.code = code; }
}

export function createLiveApi(baseUrl, fetcher) {
  const base = baseUrl.replace(/\/$/, '');
  async function request(path, validator, body, timeout = 20000) {
    let response;
    const fail = code => {
      const rawId = response?.headers?.get('X-Request-ID');
      const requestId = /^[a-f0-9-]{36}$/i.test(rawId ?? '') ? rawId : null;
      recordFailure({ operation: path.endsWith('/prepare') ? 'prepareRegistration' : path.includes('/transactions/') ? 'getRegistrationTransaction' : path === '/connection' ? 'getConnection' : 'getCard', code, status: response?.status ?? null, requestId });
      return new LiveError(code);
    };
    try {
      response = await fetcher(`${base}/api/v1${path}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(timeout),
      });
    } catch { throw fail('UPSTREAM_UNAVAILABLE'); }
    let json;
    try { json = await response.json(); } catch { throw fail('INVALID_RESPONSE'); }
    if (json?.meta?.mode !== 'live') throw fail('CONNECTION_MISMATCH');
    if (!response.ok) throw fail(ErrorResponse(json) ? json.error.code : 'INVALID_RESPONSE');
    if (!validator(json)) throw fail('INVALID_RESPONSE');
    return json.data;
  }
  const path = id => `/cards/${encodeURIComponent(id)}`;
  return {
    connection: () => request('/connection', ConnectionResponse),
    card: (id, timeout) => request(path(id), CardResponse, undefined, timeout),
    prepare: (id, input) => request(`${path(id)}/registration/prepare`, PrepareResponse, input),
    transaction: (id, hash, timeout) => request(`${path(id)}/transactions/${hash}`, TransactionResponse, undefined, timeout),
  };
}
