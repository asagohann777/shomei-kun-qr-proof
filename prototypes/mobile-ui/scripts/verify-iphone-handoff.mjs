import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit, devices } from 'playwright';

const base = process.env.LIVE_UI_URL || 'http://127.0.0.1:4284';
const api = 'https://shomei-kun-integration.dptr.workers.dev';
const cardId = 'iphone-browser-fixture';
const chainId = 2017072401;
const address = `0x${'1'.repeat(40)}`;
const registry = { chainId, contractAddress: `0x${'2'.repeat(40)}`, issuer: `0x${'3'.repeat(40)}` };
const output = process.env.HANDOFF_ARTIFACTS || 'artifacts/iphone-handoff';
await mkdir(output, { recursive: true });
const results = [];
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], locale: 'ja-JP', reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [], requests = [];
    let screenshotActive = false;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !(name === 'webkit' && screenshotActive && /Refused to apply a stylesheet/.test(message.text()))) errors.push(message.text()); });
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.route(`${api}/api/v1/**`, async route => {
      assert.equal(route.request().method(), 'GET');
      const data = route.request().url().endsWith('/connection') ? { status: 'ready', registry, network: { chainId, name: 'Curvegrid Testnet', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.example.test'] }, latestBlock: { number: 1, hash: `0x${'a'.repeat(64)}` }, nicknameMaxUtf8Bytes: 96 } : { cardId, registry, playerName: '証明一郎', status: 'unregistered', owner: null, evidence: { status: 'none' } };
      await route.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ meta: { mode: 'live' }, data }) });
    });
    await page.addInitScript(({ api, cardId }) => sessionStorage.setItem(`shomei.wallet-draft:${api}:${cardId}`, JSON.stringify({ view: 'register', nickname: 'private draft', preparingWallet: true })), { api, cardId });
    await page.goto(`${base}/?cardId=${cardId}`);
    const link = page.locator('[data-metamask-browser]');
    await link.waitFor();
    assert.equal(await link.getAttribute('href'), `https://link.metamask.io/dapp/shomei-kun-integration.dptr.workers.dev/ui/?cardId=${cardId}`);
    assert.equal(await page.locator('#nickname').count(), 0);
    assert.equal(await page.locator('[data-action="prepare-wallet"]').count(), 0);
    let destination;
    await page.exposeFunction('captureDestination', value => { destination = value; });
    await page.evaluate(() => document.addEventListener('click', event => { const link = event.target.closest('[data-metamask-browser]'); if (link) { event.preventDefault(); window.captureDestination(link.href); } }));
    await link.click();
    assert.equal(destination, await link.getAttribute('href'));
    for (const locale of ['ja', 'en']) {
      if (await page.locator('html').getAttribute('lang') !== locale) {
        await page.locator('[data-action="scenarios"]').click();
        await page.locator('[data-action="language"]').click();
        await page.evaluate(() => document.querySelector('dialog[open]')?.close());
      }
      for (const width of [320, 390, 1365]) {
        await page.setViewportSize({ width, height: 844 });
        await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        screenshotActive = true;
        try { await page.screenshot({ path: `${output}/${name}-${locale}-${width}.png`, fullPage: true }); }
        finally { screenshotActive = false; }
      }
    }
    assert.equal(requests.some(r => /metamask-wallet-|connect-evm/.test(r.url) || r.method !== 'GET'), false);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', configurable: true });
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true });
    });
    await page.reload();
    await link.waitFor();
    await page.setViewportSize({ width: 820, height: 1180 });
    screenshotActive = true;
    try { await page.screenshot({ path: `${output}/${name}-ipad.png`, fullPage: true }); }
    finally { screenshotActive = false; }
    await page.addInitScript(({ address, chainId }) => {
      window.walletCalls = [];
      window.ethereum = { isMetaMask: true, on() {}, removeListener() {}, async request({ method }) {
        window.walletCalls.push(method);
        if (method === 'eth_accounts') return window.walletAllowed ? [address] : [];
        if (method === 'eth_requestAccounts') { window.walletAllowed = true; return [address]; }
        if (method === 'eth_chainId') return `0x${chainId.toString(16)}`;
        throw Error(`Unexpected request: ${method}`);
      } };
    }, { address, chainId });
    await page.goto(`${base}/?cardId=${cardId}`);
    await page.locator('#nickname').waitFor();
    assert.equal(await page.locator('[data-metamask-browser]').count(), 0);
    await page.locator('[data-action="prepare-wallet"]').click();
    await page.locator('.wallet-ready').waitFor();
    assert.equal(await page.evaluate(() => window.walletCalls.filter(x => x === 'eth_requestAccounts').length), 1);
    assert.deepEqual(errors, []);
    results.push({ browser: name, passed: true, externalIPhoneAndIPad: 'same-card link; no SDK connection; no nickname transfer', injectedMetaMask: 'connection approved without app handoff', realDevice: false, errors });
  } finally { await browser.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
