export function hasMetaMaskProvider(ethereum = globalThis.window?.ethereum) {
  return Boolean(ethereum?.isMetaMask || ethereum?.providers?.some(provider => provider.isMetaMask));
}

export function useMetaMaskBrowser(config, userAgent = globalThis.navigator?.userAgent ?? '', ethereum = globalThis.window?.ethereum, maxTouchPoints = globalThis.navigator?.maxTouchPoints ?? 0) {
  const appleMobile = /iPhone|iPod|iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  return config.apiMode === 'live' && config.walletMode === 'metamask' && appleMobile && !hasMetaMaskProvider(ethereum);
}

export function metaMaskBrowserLink(publicUrl, cardId) {
  const url = new URL(publicUrl);
  url.search = cardId ? new URLSearchParams({ cardId }).toString() : '';
  url.hash = '';
  return `https://link.metamask.io/dapp/${url.href.replace(/^https?:\/\//, '')}`;
}
