import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.LIVE_UI_URL || 'http://127.0.0.1:4274';
const mockBase = process.env.MOCK_BASE_URL || 'http://127.0.0.1:4273';
const api = 'https://shomei-kun-integration.dptr.workers.dev';
const output = process.env.WALLET_ARTIFACTS || 'artifacts/wallet-preparation';
const cardId = 'wallet-browser-fixture';
const address = `0x${'1'.repeat(40)}`, contractAddress = `0x${'2'.repeat(40)}`, issuer = `0x${'3'.repeat(40)}`, hash = `0x${'a'.repeat(64)}`;
const chainId = 2017072401;
const registry = { chainId, contractAddress, issuer };
const network = { name: 'Curvegrid Testnet', chainId, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.example.test/'] };
await mkdir(output, { recursive: true });
const results = [];
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [], requests = [], screenshotWarnings = [];
    let screenshotActive = false;
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const text = message.text();
      if (name === 'webkit' && screenshotActive && /Refused to apply a stylesheet/.test(text)) screenshotWarnings.push({ type: 'playwright-screenshot-csp', source: message.location().url, screenshotActive });
      else errors.push(text.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, '[QR image]'));
    });
    page.on('request', request => requests.push({ method: request.method(), url: request.url() }));
    await page.addInitScript(({ address, chainId }) => {
      let accounts = JSON.parse(sessionStorage.getItem('test.accounts') || '[]');
      let chain = sessionStorage.getItem('test.chain') || '0x1';
      let added = false;
      const handlers = new Map();
      window.calls = [];
      window.pendingApproval = null;
      window.setHidden = hidden => { Object.defineProperty(document, 'hidden', { configurable: true, value: hidden }); document.dispatchEvent(new Event('visibilitychange')); };
      const approve = (step, effect) => new Promise((resolve, reject) => {
        window.pendingApproval = step;
        window.answer = allowed => {
          window.pendingApproval = null;
          if (!allowed) { reject({ data: { originalError: { rpcCode: 4001 } } }); return; }
          const result = effect();
          sessionStorage.setItem('test.accounts', JSON.stringify(accounts));
          sessionStorage.setItem('test.chain', chain);
          resolve(result);
        };
      });
      window.ethereum = {
        isMetaMask: true,
        on(event, callback) { if (!handlers.has(event)) handlers.set(event, new Set()); handlers.get(event).add(callback); },
        removeListener(event, callback) { handlers.get(event)?.delete(callback); },
        async request({ method }) {
          window.calls.push(method);
          if (method === 'eth_accounts') return accounts;
          if (method === 'eth_chainId') return chain;
          if (method === 'eth_requestAccounts') return approve('connect', () => { accounts = [address]; return accounts; });
          if (method === 'wallet_switchEthereumChain') {
            if (!added) throw { data: { originalError: { rpcCode: 4902 } } };
            return approve('switch', () => { chain = `0x${chainId.toString(16)}`; return null; });
          }
          if (method === 'wallet_addEthereumChain') return approve('add', () => { added = true; return null; });
          throw Error(`Unexpected wallet request: ${method}`);
        },
      };
    }, { address, chainId });
    await page.route(`${api}/api/v1/**`, async route => {
      assert.equal(route.request().method(), 'GET', 'preparation must not call registration API');
      const data = route.request().url().endsWith('/connection') ? { status: 'ready', network, registry, latestBlock: { number: 10, hash }, nicknameMaxUtf8Bytes: 96 } : { cardId, registry, playerName: '証明一郎', status: 'unregistered', owner: null, evidence: { status: 'none' } };
      await route.fulfill({ contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ meta: { mode: 'live' }, data }) });
    });
    const action = id => page.locator(`[data-action="${id}"]`);
    const screenshot = async label => {
      if (process.env.WALLET_SKIP_SCREENSHOTS) return;
      await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflow`);
      screenshotActive = true;
      try { await page.screenshot({ path: `${output}/${name}-${label}.png`, fullPage: true, animations: 'allow', caret: 'initial' }); }
      finally { screenshotActive = false; }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      assert(await page.evaluate(() => { const footer = document.querySelector('.bottom-actions'); return !footer || document.querySelector('.page').getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1; }), `${label} footer overlap`);
    };
    await page.goto(`${base}/?cardId=${cardId}`);
    await action('start-register').click();
    await page.locator('#nickname').fill('おじいちゃんコンビニ');
    assert.deepEqual(await page.evaluate(() => window.calls), []);
    for (const locale of ['ja', 'en']) {
      if (locale === 'en') { await action('scenarios').click(); await action('language').click(); await page.locator('#scenarios-dialog form button').click(); }
      for (const width of [320, 390, 1365]) { await page.setViewportSize({ width, height: 844 }); await screenshot(`${locale}-${width}-before`); }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await action('scenarios').click(); await action('language').click(); await page.locator('#scenarios-dialog form button').click();
    await action('wallet-help').click();
    assert.match(await page.locator('#wallet-help-dialog a').getAttribute('href'), /link\.metamask\.io\/dapp\/.*wallet-browser-fixture/);
    await page.locator('.network-settings summary').click();
    assert.match(await page.locator('.network-settings').innerText(), /2017072401/);
    await screenshot('390-help');
    await page.locator('#wallet-help-dialog form button').click();
    await page.evaluate(() => { window.originalNickname = document.querySelector('#nickname'); window.originalCard = document.querySelector('.trading-card'); });
    await action('prepare-wallet').click();
    await page.waitForFunction(() => window.pendingApproval === 'connect');
    assert(await action('confirm').isDisabled());
    await screenshot('390-connect');
    await page.evaluate(() => { window.setHidden(true); window.answer(true); });
    await page.waitForTimeout(30);
    assert.equal(await page.evaluate(() => window.calls.includes('wallet_switchEthereumChain')), false);
    await page.evaluate(() => window.setHidden(false));
    await action('prepare-wallet').waitFor();
    await action('prepare-wallet').click();
    await page.waitForFunction(() => window.pendingApproval === 'add');
    await screenshot('390-add');
    await page.evaluate(() => { window.setHidden(true); window.answer(true); });
    await page.waitForTimeout(30); await page.evaluate(() => window.setHidden(false));
    await action('prepare-wallet').waitFor();
    await action('prepare-wallet').click();
    await page.waitForFunction(() => window.pendingApproval === 'switch');
    await screenshot('390-switch');
    await page.evaluate(() => { window.setHidden(true); window.answer(true); });
    await page.waitForTimeout(30); await page.evaluate(() => window.setHidden(false));
    await page.waitForFunction(() => !document.querySelector('[data-action="confirm"]').disabled);
    assert(await page.evaluate(() => window.originalNickname === document.querySelector('#nickname') && window.originalCard === document.querySelector('.trading-card')), 'preparation must preserve card and nickname DOM');
    await screenshot('390-ready');
    assert.equal(await page.locator('#nickname').inputValue(), 'おじいちゃんコンビニ');
    const before = await page.evaluate(() => window.calls);
    assert.equal(before.filter(method => method === 'eth_requestAccounts').length, 1);
    assert.equal(before.filter(method => method === 'wallet_addEthereumChain').length, 1);
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('[data-action="confirm"]')?.disabled && document.querySelector('#nickname'));
    assert.equal(await page.locator('#nickname').inputValue(), 'おじいちゃんコンビニ');
    assert.equal(await page.evaluate(() => window.calls.includes('eth_requestAccounts')), false);
    await page.evaluate(() => sessionStorage.clear()); await page.reload();
    await action('start-register').click(); await action('prepare-wallet').click();
    await page.waitForFunction(() => window.pendingApproval === 'connect');
    await page.evaluate(() => window.answer(false));
    await page.waitForFunction(() => document.querySelector('#wallet-preparation').textContent.includes('許可されませんでした'));
    assert.equal(await page.locator('#nickname').count(), 1, 'declining connection must keep registration form');
    await screenshot('390-rejected');
    assert.equal(requests.some(r => r.method !== 'GET'), false);
    assert.deepEqual(errors, []);
    for (const scenario of (process.env.WALLET_SKIP_MOCK ? [] : ['wallet-connect', 'wallet-add', 'wallet-switch', 'wallet-paused', 'wallet-rejected', 'wallet-ready'])) {
      await page.goto(`${mockBase}/?scenario=${scenario}`); await page.locator('#wallet-preparation').waitFor();
      await screenshot(`mock-${scenario}`);
    }
    results.push({ browser: name, passed: true, actualMetaMask: false, realDevice: false, errors, screenshotWarnings, approvalRequests: before.filter(method => method.startsWith('wallet_') || method === 'eth_requestAccounts') });
    await context.close();
  } finally { await browser.close(); }
}
await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
