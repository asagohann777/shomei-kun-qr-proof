import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, webkit } from 'playwright';
import QRCode from 'qrcode';

const base = process.env.CAMERA_PUBLIC_URL || 'https://shomei-kun-integration.dptr.workers.dev/ui/';
const id = 'camera-public-fixture';
const target = new URL(base); target.searchParams.set('cardId', id);
const temp = await mkdtemp(join(tmpdir(), 'shomei-public-camera-'));
const output = 'artifacts/camera-public';
await mkdir(output, { recursive: true });
const png = await QRCode.toBuffer(target.href, { width: 600, margin: 4 });
const pngPath = join(temp, 'qr.png'), videoPath = join(temp, 'qr.y4m');
const results = [];
try {
  await writeFile(pngPath, png);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-loop', '1', '-i', pngPath, '-t', '3', '-vf', 'scale=360:360,pad=960:720:(ow-iw)/2:(oh-ih)/2:white', '-pix_fmt', 'yuv420p', '-r', '10', videoPath]);
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(name === 'chromium' ? { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoPath}`] } : {});
    try {
      const page = await browser.newPage({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const errors = [], ids = [], writes = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (request.method() !== 'GET') writes.push(request.method()); });
      await page.addInitScript(({ deny }) => {
        delete window.BarcodeDetector;
        window.cameraTracks = [];
        window.cameraRequests = 0;
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        Object.defineProperty(Object.getPrototypeOf(navigator.mediaDevices), 'getUserMedia', { configurable: true, value: async constraints => {
          window.cameraRequests++;
          if (deny) throw new DOMException('Denied', 'NotAllowedError');
          const stream = await original(constraints);
          window.cameraTracks.push(...stream.getTracks());
          return stream;
        } });
      }, { deny: name === 'webkit' });
      await page.route('**/api/v1/**', async route => {
        assert.equal(route.request().method(), 'GET');
        const path = new URL(route.request().url()).pathname;
        if (path.startsWith('/api/v1/cards/')) ids.push(path.slice('/api/v1/cards/'.length));
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ meta: { mode: 'live' }, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Camera test fixture' } }) });
      });
      const response = await page.goto(base);
      assert.match(response.headers()['permissions-policy'], /camera=\(self\)/);
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
      await page.locator('[data-action="open-camera"]').click();
      if (name === 'webkit') {
        await page.waitForFunction(() => window.cameraRequests > 0);
        await page.locator('#camera-photo').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: png });
      }
      await page.locator('[data-action="retry-read"]').waitFor({ timeout: 20000 });
      assert.deepEqual(ids, [id]);
      assert.equal(new URL(page.url()).searchParams.get('cardId'), id);
      if (name === 'chromium') assert(await page.evaluate(() => window.cameraTracks.length > 0 && window.cameraTracks.every(track => track.readyState === 'ended')));
      assert.deepEqual(writes, []);
      assert.deepEqual(errors, []);
      results.push({ browser: name, passed: true, mode: name === 'chromium' ? 'video QR decoded; tracks stopped' : 'permission denied; photo QR decoded', apiCardId: id, registrationRequests: 0, realDevice: false });
    } finally { await browser.close(); }
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
} finally { await rm(temp, { recursive: true, force: true }); }
