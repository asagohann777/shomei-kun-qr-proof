// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const base = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';
const output = '../../docs/submission/2026-09-26/screenshots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'en-US', isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
const captures = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const action = id => page.locator(`[data-action="${id}"]`);
async function capture(name, description) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  await page.evaluate(() => scrollTo(0, 0));
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  captures.push({ file: `${name}.png`, description, heading: await page.locator('h1').innerText(), mode: 'mock API, mock wallet, mock camera' });
}
try {
  await page.goto(base);
  await page.locator('h1').waitFor();
  await capture('01-home-en', 'Home and QR scan entry');
  await action('open-camera').click();
  await capture('02-qr-scan-en', 'Simulated QR scanning interface');
  await action('scan').click();
  await action('start-register').waitFor();
  await capture('03-unregistered-card-en', 'Unregistered sample card');
  await action('start-register').click();
  await page.locator('#nickname').fill('Grandpa Convenience');
  await action('prepare-wallet').click();
  await action('connect-sample').click();
  await capture('04-owner-information-en', 'Owner information with a simulated wallet');
  await action('confirm').click();
  await page.locator('#consent').check();
  await capture('05-review-en', 'Review and consent before registration');
  await action('register-reviewed').click();
  await capture('06-wallet-approval-en', 'Simulated approval, not MetaMask UI');
  await action('approve').click();
  await page.locator('.result-page').waitFor();
  await capture('08-registration-complete-en', 'Simulated registration completion, not an on-chain receipt');
  await action('details').click();
  await page.locator('#details-dialog[open]').waitFor();
  await page.screenshot({ path: `${output}/09-record-details-en.png`, fullPage: true });
  captures.push({ file: '09-record-details-en.png', description: 'Simulated record details', mode: 'mock' });
  await page.goto(`${base}/?scenario=registering`);
  await page.locator('.indicator-orbit').waitFor();
  await capture('07-registration-progress-en', 'Stable processing preview, not a pending transaction');
  assert.deepEqual(errors, []);
  captures.sort((a, b) => a.file.localeCompare(b.file));
  await writeFile(`${output}/capture.json`, JSON.stringify({ capturedAt: new Date().toISOString(), workingTreeDirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()), commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), base, browser: `Chromium ${browser.version()}`, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, fullPage: true, locale: 'en-US', errors, captures }, null, 2) + '\n');
  console.log(JSON.stringify({ output, screenshots: captures.length, errors }));
} finally {
  await browser.close();
}
