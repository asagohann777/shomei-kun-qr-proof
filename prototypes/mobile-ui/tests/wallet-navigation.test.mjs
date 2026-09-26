// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { useMetaMaskBrowser, metaMaskBrowserLink } from '../src/wallet-navigation.js';

const config = { apiMode: 'live', walletMode: 'metamask' };
test('external iPhone and iPad browsers use in-app navigation, injected MetaMask stays on the page', () => {
  assert.equal(useMetaMaskBrowser(config, 'Mozilla iPhone Safari', null), true);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla iPhone CriOS', null), true);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla iPhone Safari', { isMetaMask: true }), false);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla iPhone Safari', { providers: [{ isMetaMask: true }] }), false);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla Android', null), false);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla iPad Safari', null), true);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla Macintosh Safari', null, 5), true);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla Macintosh Safari', { isMetaMask: true }, 5), false);
  assert.equal(useMetaMaskBrowser(config, 'Mozilla Macintosh Safari', null, 0), false);
  assert.equal(useMetaMaskBrowser({ ...config, apiMode: 'mock' }, 'iPhone', null), false);
  assert.equal(useMetaMaskBrowser({ ...config, walletMode: 'mock' }, 'iPhone', null), false);
});
test('in-app link carries only the current card, without drafts or session parameters', () => {
  assert.equal(metaMaskBrowserLink('https://demo.example/ui/?nickname=private#session', 'card-001'), 'metamask://dapp/demo.example/ui/?cardId=card-001');
});
