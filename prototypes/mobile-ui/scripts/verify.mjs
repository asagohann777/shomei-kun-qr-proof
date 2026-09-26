// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const base = process.env.MOCK_BASE_URL || 'http://127.0.0.1:4173';
await mkdir('artifacts', { recursive: true });
const results = [];
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const screenshotWarnings = [];
  let takingScreenshot = false;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const webkitScreenshotStyleWarning = name === 'webkit' && takingScreenshot && message.text() === "Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear in the style-src directive of the Content Security Policy.";
    (webkitScreenshotStyleWarning ? screenshotWarnings : errors).push(message.text());
  });
  const screenshot = async (path) => {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    takingScreenshot = true;
    try { await page.screenshot({ path, fullPage: true, animations: 'allow', caret: 'initial' }); }
    finally { takingScreenshot = false; }
  };
  const requests = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  const action = (id) => page.locator(`[data-action="${id}"]`);
  const goto = async (scenario = '') => {
    await page.goto(`${base}/${scenario ? `?scenario=${scenario}` : ''}`);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.locator('h1').waitFor();
  };
  const state = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('shomei.mobile-mock.v1')));
  const layout = async (label) => {
    await page.evaluate(() => scrollTo(0, 0));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} ${label}: horizontal overflow`);
    await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
    await screenshot(`artifacts/${name}-${label}.png`);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    assert(await page.evaluate(() => { const footer = document.querySelector('.bottom-actions'); return !footer || document.querySelector('.page').getBoundingClientRect().bottom <= footer.getBoundingClientRect().top; }), `${label}: actions overlap content`);
    await screenshot(`artifacts/${name}-${label}-bottom.png`);
    await page.evaluate(() => scrollTo(0, 0));
  };
  await goto();
  assert.equal(await action('scan').count(), 0);
  await action('open-camera').click();
  await layout('390-camera');
  assert.equal(await page.locator('.scan-sweep').evaluate((element) => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('.scan-status-ring').evaluate((element) => getComputedStyle(element).animationName), 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const scanTransform = await page.locator('.scan-sweep').evaluate((element) => getComputedStyle(element).transform);
  await page.waitForFunction((before) => getComputedStyle(document.querySelector('.scan-sweep')).transform !== before, scanTransform);
  await layout('390-camera-motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const control of ['photos', 'help', 'flash']) {
    await action(control).click();
    await page.locator('#help-dialog[open]').waitFor();
    await page.locator('#help-dialog form button').click();
  }
  await action('close-camera').click();
  await action('open-camera').click();
  await action('scan').click();
  await action('start-register').waitFor();
  assert.equal((await state()).card, 'unregistered');
  await goto('registered');
  await action('details').click();
  await page.locator('#details-dialog[open]').waitFor();
  await page.waitForFunction(() => document.querySelector('#details-dialog').innerText.includes('80002'));
  assert.match(await page.locator('#details-dialog').innerText(), /80002/);
  await page.locator('#details-dialog form button').click();
  assert.equal(await page.locator('#details-dialog').evaluate((dialog) => dialog.open), false);
  for (const width of [320, 390, 430, 1365]) {
    await page.setViewportSize({ width, height: width === 320 ? 720 : 844 });
    for (const scenario of ['', 'registered', 'unregistered', 'wrong-wallet', 'unknown', 'unavailable']) {
      await goto(scenario);
      await layout(`${width}-${scenario || 'scan'}`);
      if (!scenario) {
        await action('open-camera').click();
        await layout(`${width}-camera`);
        await action('close-camera').click();
      }
    }
  }
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await goto('registering');
    await layout(`${width}-registering`);
  }
  assert.equal((await state()).view, 'processing-preview');
  assert.equal((await state()).attempt, null);
  await page.reload();
  assert.equal((await state()).view, 'processing-preview');
  assert.equal(await page.locator('.indicator-orbit').evaluate((element) => getComputedStyle(element).animationName), 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const initialTransform = await page.locator('.indicator-orbit').evaluate((element) => getComputedStyle(element).transform);
  await page.waitForFunction((before) => getComputedStyle(document.querySelector('.indicator-orbit')).transform !== before, initialTransform);
  assert.equal(await page.locator('.registration-card').evaluate((element) => getComputedStyle(element).animationName), 'card-hover');
  await layout('430-registering-motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await action('home').click();
  assert.equal((await state()).view, 'scan');
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('unregistered');
  await action('start-register').click();
  assert(await action('confirm').isDisabled());
  await action('clear-nickname').click();
  assert.equal(await page.locator('#nickname').inputValue(), '');
  assert(await action('confirm').isDisabled());
  await page.locator('#nickname').fill('相談用 <テスト>');
  await action('prepare-wallet').click();
  await action('connect-sample').click();
  await layout('390-registration');
  await action('confirm').click();
  assert(await action('register-reviewed').isDisabled());
  await layout('390-review');
  await action('edit-review').click();
  assert.equal(await page.locator('#nickname').inputValue(), '相談用 <テスト>');
  await action('confirm').click();
  await page.locator('#consent').check();
  await action('register-reviewed').click();
  await layout('390-approval');
  await action('approve').click();
  const attempt = (await state()).attempt;
  await page.reload();
  await action('scenarios').click();
  await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('shomei.mobile-mock.v1')).view === 'success');
  assert(await page.locator('#scenarios-dialog').evaluate((dialog) => dialog.open));
  await page.locator('#scenarios-dialog form button').click();
  await page.locator('.result-page').waitFor();
  assert.equal((await state()).attempt, attempt);
  await layout('390-success');
  await action('details').click();
  await page.waitForFunction(() => document.querySelector('#details-dialog').innerText.includes('相談用 <テスト>'));
  assert.match(await page.locator('#details-dialog').innerText(), /相談用 <テスト>/);
  await page.locator('#details-dialog form button').click();
  assert.match(await page.locator('.record-table').innerText(), /相談用 <テスト>/);
  await page.reload();
  assert.match(await page.locator('.record-table').innerText(), /相談用 <テスト>/);
  assert.equal(await action('start-register').count(), 0);
  await action('scenarios').click();
  await action('language').click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.match(await page.locator('.record-table').innerText(), /相談用 <テスト>/);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await goto('registered');
    await layout(`${width}-english-owner`);
    await goto('wrong-chain');
    await layout(`${width}-english-register`);
    assert(await action('confirm').isDisabled());
    await action('prepare-wallet').click();
    await action('confirm').click();
    await layout(`${width}-english-review`);
    await page.reload();
    assert.equal((await state()).view, 'review');
    await page.locator('#consent').check();
    await action('register-reviewed').click();
    await action('reject').click();
    assert.equal((await state()).attempt, null);
  }
  await goto('unknown');
  const unknownAttempt = (await state()).attempt;
  assert.equal(await action('approve').count(), 0);
  await action('recheck').click();
  await page.locator('.result-page').waitFor();
  assert.equal((await state()).attempt, unknownAttempt);
  await goto('failed');
  await action('edit-again').click();
  assert.equal((await state()).view, 'register');
  await goto('evidence-pending');
  await action('refresh-evidence').click();
  assert.equal((await state()).card, 'registered');
  await goto('not-found');
  assert.equal(await action('start-register').count(), 0);
  await goto('unavailable');
  assert.equal(await action('start-register').count(), 0);
  await action('scenarios').click();
  await page.locator('[data-scenario="unregistered"]').click();
  assert.equal((await state()).card, 'unregistered');
  assert.equal(new URL(page.url()).searchParams.get('scenario'), 'unregistered');
  assert.deepEqual(errors, []);
  assert(requests.every((request) => request.method === 'GET' && new URL(request.url).origin === new URL(base).origin), 'Unexpected external request or mutation');
  for (const [browserLocale, expected] of [['en-US', 'en'], ['fr-FR', 'en'], ['ja-JP', 'ja']]) {
    const fresh = await browser.newContext({ locale: browserLocale });
    const freshPage = await fresh.newPage();
    await freshPage.goto(`${base}/?scenario=registered`);
    await freshPage.locator('h1').waitFor();
    assert.equal(await freshPage.locator('html').getAttribute('lang'), expected);
    assert.match(await freshPage.locator('.record-table').innerText(), /おじいちゃんコンビニ/);
    await fresh.close();
  }
  results.push({ browser: name, version: browser.version(), status: 'passed', requests: requests.length, consoleErrors: errors, playwrightScreenshotCspWarnings: screenshotWarnings.length });
  await browser.close();
}
const assetHashes = {};
for (const asset of ['index.html', 'app.js', 'messages.js', 'style.css', 'player.svg', 'card-qr.svg', 'favicon.svg', 'assets/home-background.jpg', 'assets/flow-background.jpg', 'assets/logo-ja.jpg', 'assets/qr-scan.jpg', 'assets/trading-card.jpg']) {
  const response = await fetch(`${base}/${asset}`);
  assert(response.ok, `${asset}: HTTP ${response.status}`);
  const served = Buffer.from(await response.arrayBuffer());
  assert(served.equals(await readFile(`dist/${asset}`)), `${asset}: served file differs from local build`);
  assetHashes[asset] = createHash('sha256').update(served).digest('hex');
}
await writeFile('artifacts/results.json', JSON.stringify({ base, verifiedAt: new Date().toISOString(), results, assetHashes }, null, 2));
console.log(JSON.stringify(results, null, 2));
