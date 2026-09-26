import { CardResponse, ConnectionResponse, PrepareResponse, TransactionResponse, ErrorResponse } from '../../../apps/web/src/generated/validators.js';

export class LiveError extends Error {
  constructor(code) { super(code); this.code = code; }
}

export function createLiveApi(baseUrl, fetcher) {
  const base = baseUrl.replace(/\/$/, '');
  async function request(path, validator, body) {
    let response;
    try {
      response = await fetcher(`${base}/api/v1${path}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(20000),
      });
    } catch { throw new LiveError('UPSTREAM_UNAVAILABLE'); }
    let json;
    try { json = await response.json(); } catch { throw new LiveError('INVALID_RESPONSE'); }
    if (json?.meta?.mode !== 'live') throw new LiveError('CONNECTION_MISMATCH');
    if (!response.ok) throw new LiveError(ErrorResponse(json) ? json.error.code : 'INVALID_RESPONSE');
    if (!validator(json)) throw new LiveError('INVALID_RESPONSE');
    return json.data;
  }
  const path = id => `/cards/${encodeURIComponent(id)}`;
  return {
    connection: () => request('/connection', ConnectionResponse),
    card: id => request(path(id), CardResponse),
    prepare: (id, input) => request(`${path(id)}/registration/prepare`, PrepareResponse, input),
    transaction: (id, hash) => request(`${path(id)}/transactions/${hash}`, TransactionResponse),
  };
}
