import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit, devices } from 'playwright';

const target = process.env.SDK_UI_URL || 'https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=mobile-ui-20260926-manual';
const output = process.env.SDK_ARTIFACTS || 'artifacts/metamask-sdk';
const relayOrigin = 'wss://mm-sdk-relay.api.cx.metamask.io';
const results = [];
await mkdir(output, { recursive: true });

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], locale: 'ja-JP' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    const observed = { relayOrigin: null, universalLinkOrigin: null, universalLinkPath: null, registrationRequests: 0 };
    page.on('pageerror', error => errors.push(error.message.replace(/https?:\/\/\S+/g, '[URL]')));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text().replace(/https?:\/\/\S+/g, '[URL]'));
    });
    page.on('request', request => {
      if (new URL(request.url()).pathname.endsWith('/registration/prepare')) observed.registrationRequests++;
    });
    page.on('websocket', socket => {
      const origin = new URL(socket.url()).origin;
      if (origin === relayOrigin) observed.relayOrigin = origin;
    });
    await page.exposeFunction('observeMetaMaskLaunch', ({ origin, path }) => {
      observed.universalLinkOrigin = origin;
      observed.universalLinkPath = path;
    });
    await page.addInitScript(() => {
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const url = new URL(this.href);
        if (url.origin === 'https://metamask.app.link') {
          window.observeMetaMaskLaunch({ origin: url.origin, path: url.pathname });
          return;
        }
        return originalClick.call(this);
      };
    });
    if (process.env.SDK_PROXY_API) await page.route(`${process.env.SDK_PROXY_API}/api/v1/**`, async route => {
      assert.equal(route.request().method(), 'GET');
      const response = await fetch(route.request().url());
      await route.fulfill({ status: response.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: await response.text() });
    });
    await page.goto(target);
    assert.equal(await page.evaluate(() => Boolean(window.ethereum)), false, 'SDK smoke must not use an injected wallet');
    try { await page.locator('[data-action="start-register"]').click(); }
    catch (error) {
      const pageText = (await page.locator('body').innerText()).replace(/https?:\/\/\S+/g, '[URL]');
      throw new Error(JSON.stringify({ browser: name, pageText, errors }), { cause: error });
    }
    await page.locator('[data-action="prepare-wallet"]').click();
    const deadline = Date.now() + 20000;
    while ((!observed.relayOrigin || !observed.universalLinkOrigin) && Date.now() < deadline && errors.length === 0) await page.waitForTimeout(100);
    assert.deepEqual(errors, [], `${name}: SDK browser errors`);
    assert.equal(observed.universalLinkOrigin, 'https://metamask.app.link', `${name}: SDK did not initiate mobile launch`);
    assert.equal(observed.universalLinkPath, '/connect/mwp', `${name}: expected mobile session request`);
    assert.equal(observed.relayOrigin, relayOrigin, `${name}: SDK did not open the relay`);
    assert.equal(observed.registrationRequests, 0, 'connection smoke must not prepare transactions');
    results.push({ browser: name, ...observed, errors, injectedWallet: false, deviceReturnTested: false });
    await context.close();
  } finally { await browser.close(); }
}
const result = { target: new URL(target).origin + new URL(target).pathname, purpose: 'SDK mobile launch and relay initiation; wallet navigation suppressed before leaving browser', results };
await writeFile(`${output}/results.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
