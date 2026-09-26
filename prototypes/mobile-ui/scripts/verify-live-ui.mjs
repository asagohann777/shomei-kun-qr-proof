import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { Interface } from 'ethers';
import artifact from '../../../contracts/abi/OwnershipRegistry.json' with { type: 'json' };
import { CardResponse, ConnectionResponse, PrepareResponse, TransactionResponse, ErrorResponse } from '../../../apps/web/src/generated/validators.js';

const base = process.env.LIVE_UI_URL || 'http://127.0.0.1:4174';
const readonlyBase = process.env.LIVE_READONLY_UI_URL;
const api = process.env.LIVE_API_ORIGIN || 'https://shomei-kun-integration.dptr.workers.dev';
const output = process.env.LIVE_UI_ARTIFACTS || 'artifacts/live-ui';
const account = `0x${'1'.repeat(40)}`, contract = `0x${'2'.repeat(40)}`, issuer = `0x${'3'.repeat(40)}`, hash = `0x${'a'.repeat(64)}`;
const chainId = 2017072401, cardId = 'browser-fixture-001', nickname = 'おじいちゃんコンビニ';
const registry = { chainId, contractAddress: contract, issuer };
const connection = { status: 'ready', network: { name: 'Curvegrid Testnet', chainId, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.example.test/'] }, registry, latestBlock: { number: 10, hash }, nicknameMaxUtf8Bytes: 96 };
const iface = new Interface(artifact.abi);
const results = [];
await mkdir(output, { recursive: true });

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors = [], screenshotWarnings = [], walletCalls = [], requests = [], assertions = [];
    let screenshotActive = false, phase = 'unregistered', failRead = false, txReads = 0;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const text = message.text();
      if (name === 'webkit' && screenshotActive && /Refused to apply a stylesheet/.test(text)) screenshotWarnings.push(text);
      else if (!/Failed to load resource.*503|server responded with a status of 503/.test(text)) errors.push(text);
    });
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.exposeFunction('recordWalletMethod', method => walletCalls.push(method));
    await page.addInitScript(({ account, chainId, hash }) => {
      const listeners = new Map();
      window.ethereum = {
        isMetaMask: true,
        on(event, callback) { const set = listeners.get(event) || new Set(); set.add(callback); listeners.set(event, set); },
        removeListener(event, callback) { listeners.get(event)?.delete(callback); },
        async request({ method }) {
          await window.recordWalletMethod(method);
          if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [account];
          if (method === 'eth_chainId') return `0x${chainId.toString(16)}`;
          if (method === 'eth_sendTransaction') return new Promise(resolve => { this.approve = () => resolve(hash); });
          throw new Error(`Unexpected wallet method: ${method}`);
        },
      };
    }, { account, chainId, hash });
    await page.route(`${api}/api/v1/**`, async route => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
      let data, validate, status = 200;
      if (failRead) {
        const body = { meta: { mode: 'live' }, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Fixture unavailable' } };
        assert(ErrorResponse(body), JSON.stringify(ErrorResponse.errors));
        return route.fulfill({ status: 503, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
      }
      if (path === '/api/v1/connection') { data = connection; validate = ConnectionResponse; }
      else if (path === `/api/v1/cards/${cardId}/registration/prepare`) {
        const input = route.request().postDataJSON();
        assert.deepEqual(input, { walletAddress: account, chainId, nickname });
        data = { cardId, nickname, transaction: { chainId, from: account, to: contract, value: '0', data: iface.encodeFunctionData('register', [cardId, nickname]) } };
        validate = PrepareResponse;
      } else if (path === `/api/v1/cards/${cardId}/transactions/${hash}`) {
        txReads++;
        data = phase === 'confirmed' ? { cardId, transactionHash: hash, status: 'confirmed', owner: { address: account, nickname }, blockNumber: 11 } : { cardId, transactionHash: hash, status: 'pending' };
        validate = TransactionResponse;
      } else if (path === `/api/v1/cards/${cardId}`) {
        data = { cardId, registry, playerName: '証明一郎', ...(phase === 'confirmed' ? { status: 'registered', owner: { address: account, nickname }, evidence: { status: 'available', transactionHash: hash, blockNumber: 11 } } : { status: 'unregistered', owner: null, evidence: { status: 'none' } }) };
        validate = CardResponse;
      } else throw new Error(`Unexpected API request ${path}`);
      const body = { meta: { mode: 'live' }, data };
      assert(validate(body), `${path}: ${JSON.stringify(validate.errors)}`);
      await route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
    });
    const action = id => page.locator(`[data-action="${id}"]`);
    const layout = async label => {
      await page.evaluate(() => scrollTo(0, 0));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}/${label}: horizontal overflow`);
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert(await page.evaluate(() => { const header = document.querySelector('.app-header'), content = document.querySelector('main'); return !header || !content || header.getBoundingClientRect().bottom <= content.getBoundingClientRect().top; }), `${name}/${label}: header overlaps content`);
      screenshotActive = true;
      try { await page.screenshot({ path: `${output}/${name}-${label}.png`, fullPage: true, animations: 'allow', caret: 'initial' }); }
      finally { screenshotActive = false; }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      assert(await page.evaluate(() => { const footer = document.querySelector('.bottom-actions'), content = document.querySelector('.page'); return !footer || !content || content.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1; }), `${name}/${label}: footer overlaps content`);
      await page.evaluate(() => scrollTo(0, 0));
    };
    await page.goto(`${base}/?cardId=${cardId}`);
    await action('start-register').waitFor();
    assert.deepEqual(walletCalls, []);
    assertions.push('public read requires no wallet');
    await layout('390-unregistered');
    await action('start-register').click();
    await page.locator('#nickname').fill(nickname);
    await action('connect').click();
    await action('confirm').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('[data-action="confirm"]').disabled);
    await action('confirm').click();
    await page.locator('#consent').check();
    await layout('390-review');
    await action('register-reviewed').click();
    await page.waitForFunction(() => typeof window.ethereum.approve === 'function');
    assert.equal(walletCalls.filter(method => method === 'eth_sendTransaction').length, 1);
    assert.equal(await action('approve').count(), 0, 'live approval cannot offer simulated approve');
    await layout('390-wallet-approval');
    await page.evaluate(() => window.ethereum.approve());
    await page.locator('.processing-page').waitFor();
    await page.waitForFunction(() => Object.keys(localStorage).some(key => (localStorage.getItem(key) || '').includes('0x' + 'a'.repeat(64))));
    await layout('390-pending');
    await page.waitForTimeout(2600);
    assert.equal(await page.locator('.result-page').count(), 0, 'mock completion timer must not confirm live transactions');
    const beforeReload = txReads;
    const resumedTransaction = page.waitForResponse(response => response.url().includes(`/transactions/${hash}`));
    await page.reload();
    await page.locator('.processing-page').waitFor();
    await resumedTransaction;
    assert(txReads > beforeReload);
    assert.equal(walletCalls.filter(method => method === 'eth_sendTransaction').length, 1);
    assertions.push('approval and pending use injected provider result; reload checks same hash without resend');
    phase = 'confirmed';
    await page.reload();
    await page.locator('.result-page').waitFor();
    assert.match(await page.locator('.record-table').innerText(), /おじいちゃんコンビニ/);
    assert.equal(await action('start-register').count(), 0);
    await action('details').click();
    await page.locator('#details-dialog[open]').waitFor();
    await page.waitForFunction(() => document.querySelector('#details-dialog').innerText.includes('2017072401'));
    assert.match(await page.locator('#details-dialog').innerText(), /2017072401/);
    assert.match(await page.locator('#details-dialog').innerText(), new RegExp(hash));
    await page.locator('#details-dialog form button').click();
    for (const width of [390, 320, 1365]) {
      await page.setViewportSize({ width, height: width === 320 ? 720 : 844 });
      await layout(`${width}-confirmed`);
    }
    await page.reload();
    await page.locator('.result-page').waitFor();
    assert.equal(walletCalls.filter(method => method === 'eth_sendTransaction').length, 1);
    assertions.push('confirmed ownership and evidence survive fresh API read at 390, 320 and desktop');
    await page.evaluate(() => localStorage.clear());
    failRead = true;
    await page.reload();
    await action('retry-read').waitFor();
    assert.equal(await page.locator('.result-page').count(), 0);
    assert.equal(await action('start-register').count(), 0);
    await layout('1365-unavailable');
    failRead = false;
    await action('retry-read').click();
    await page.locator('.result-page').waitFor();
    assertions.push('503 remains unavailable; explicit retry recovers');
    let readonly = 'not run; set LIVE_READONLY_UI_URL to a live/mock build';
    if (readonlyBase) {
      phase = 'unregistered';
      const before = walletCalls.length;
      await page.goto(`${readonlyBase}/?cardId=${cardId}`);
      await page.waitForFunction(() => document.body.innerText.includes('browser-fixture-001'));
      assert.equal(await action('start-register').count(), 0);
      assert.equal(await action('connect').count(), 0);
      assert.equal(walletCalls.length, before);
      readonly = 'live/mock reads API fixture and offers no registration or wallet';
      await layout('1365-readonly');
    }
    const external = requests.filter(request => !request.url.startsWith(base) && !(readonlyBase && request.url.startsWith(readonlyBase)) && !request.url.startsWith(api) && !request.url.startsWith('data:'));
    assert.deepEqual(external, [], 'unexpected external request (including wallet SDK relay in injected/read-only mode)');
    assert.deepEqual(errors, [], `${name}: browser errors`);
    results.push({ browser: name, assertions, readonly, screenshots: output, screenshotWarnings, walletSends: walletCalls.filter(method => method === 'eth_sendTransaction').length, errors });
    await context.close();
  } finally { await browser.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify({ base, readonlyBase, api, fixtureOnly: true, results }, null, 2));
console.log(JSON.stringify({ fixtureOnly: true, results }, null, 2));
