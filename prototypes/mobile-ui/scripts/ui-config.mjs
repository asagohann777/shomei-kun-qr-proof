export function uiConfig(env) {
  const cameraMode = env.UI_CAMERA_MODE ?? 'mock';
  if (!['mock', 'live'].includes(cameraMode)) throw new Error('Invalid UI_CAMERA_MODE');
  const apiMode = env.UI_API_MODE ?? 'mock';
  const walletMode = env.UI_WALLET_MODE ?? 'mock';
  if (!['mock', 'live'].includes(apiMode) || !['mock', 'metamask'].includes(walletMode)) throw new Error('Invalid UI_API_MODE or UI_WALLET_MODE');
  if (apiMode === 'mock' && walletMode !== 'mock') throw new Error('Mock API cannot use a real wallet');
  const url = (value, name) => {
    const parsed = new URL(value);
    if ((parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) || parsed.username || parsed.password || parsed.hash || parsed.search) throw new Error(`Invalid ${name}`);
    return parsed;
  };
  const publicUrl = url(env.UI_PUBLIC_URL ?? env.MOCK_PUBLIC_URL ?? 'https://shomei-kun-ui-mock.dptr.workers.dev', 'UI_PUBLIC_URL').href;
  const cardId = env.UI_SAMPLE_CARD_ID ?? 'connectivity-20260926-001';
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(cardId)) throw new Error('Invalid UI_SAMPLE_CARD_ID');
  let apiBaseUrl;
  if (env.UI_API_BASE_URL) {
    const api = url(env.UI_API_BASE_URL, 'UI_API_BASE_URL');
    if (api.pathname !== '/') throw new Error('UI_API_BASE_URL must be an origin');
    apiBaseUrl = api.origin;
  }
  if (apiMode === 'mock') return { apiMode, walletMode, cameraMode, publicUrl, cardId, ...(apiBaseUrl ? { apiBaseUrl } : {}) };
  if (!apiBaseUrl) throw new Error('UI_API_BASE_URL is required for live API');
  let rpcOrigin;
  if (walletMode === 'metamask') {
    if (!env.UI_RPC_ORIGIN) throw new Error('UI_RPC_ORIGIN is required for wallet CSP');
    const rpc = url(env.UI_RPC_ORIGIN, 'UI_RPC_ORIGIN');
    if (rpc.pathname !== '/') throw new Error('UI_RPC_ORIGIN must be an origin');
    rpcOrigin = rpc.origin;
  }
  return { apiMode, walletMode, cameraMode, apiBaseUrl, publicUrl, cardId, ...(rpcOrigin ? { rpcOrigin } : {}) };
}
