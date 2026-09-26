import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import QRCode from 'qrcode';
import { chromium, webkit } from 'playwright';
const temp = await mkdtemp(join(tmpdir(), 'shomei-camera-'));
let folder = 'mock';
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = join(temp, folder, pathname === '/' ? 'index.html' : pathname);
    for (const line of (await readFile(join(temp, folder, '_headers'), 'utf8')).split('\n')) { const match = /^  ([\w-]+): (.+)$/.exec(line); if (match) res.setHeader(match[1], match[2]); }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' }[extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const qrUrl = `${base}/?cardId=camera-test-001`;
const png = await QRCode.toBuffer(qrUrl, { width: 600, margin: 4 });
const pngPath = join(temp, 'qr.png'); await writeFile(pngPath, png);
const blank = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="white"/></svg>');
const videoPath = join(temp, 'qr.y4m');
execFileSync('ffmpeg', ['-loglevel', 'error', '-loop', '1', '-i', pngPath, '-t', '3', '-vf', 'scale=360:360,pad=960:720:(ow-iw)/2:(oh-ih)/2:white', '-pix_fmt', 'yuv420p', '-r', '10', videoPath]);
for (const mode of ['mock', 'live', 'api-live']) {
  execFileSync(process.execPath, ['scripts/build.mjs', '--integration'], { env: { ...process.env, UI_CAMERA_MODE: mode === 'mock' ? 'mock' : 'live', UI_API_MODE: mode === 'api-live' ? 'live' : 'mock', UI_API_BASE_URL: 'https://camera-api.example', UI_WALLET_MODE: 'mock', UI_PUBLIC_URL: base }, stdio: 'inherit' });
  await cp('dist-integration', join(temp, mode), { recursive: true });
  await build({ stdin: { contents: "export { default as QrScanner } from 'qr-scanner';", resolveDir: process.cwd() }, bundle: true, splitting: true, format: 'esm', platform: 'browser', outdir: join(temp, mode, 'decoder'), write: true });
}
const results = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ja-JP', reducedMotion: 'reduce' });
      await context.addInitScript(() => {
        localStorage.setItem('shomei.mobile-mock.locale', 'ja');
        window.cameraRequests = 0;
        delete window.BarcodeDetector;
        Object.defineProperty(Object.getPrototypeOf(navigator.mediaDevices), 'getUserMedia', { value: async () => { window.cameraRequests++; throw new DOMException('Denied', 'NotAllowedError'); }, configurable: true });
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      const action = id => page.locator(`[data-action="${id}"]`);
      folder = 'mock'; await page.goto(base); await action('open-camera').click(); await action('scan').click(); await action('start-register').waitFor();
      assert.equal(await page.evaluate(() => window.cameraRequests), 0);
      folder = 'live'; await page.evaluate(() => sessionStorage.clear()); await page.goto(base);
      await action('open-camera').click(); await page.locator('.scan-status').filter({ hasText: 'カメラを開けません' }).waitFor();
      assert.equal(await action('scan').count(), 0); assert.equal(await action('flash').count(), 0);
      for (const [width, language] of [[320, 'ja'], [390, 'en']]) {
        await page.setViewportSize({ width, height: 844 });
        if (language === 'en') { await action('scenarios').click(); await action('language').click(); await page.locator('#scenarios-dialog form button').click(); await page.locator('#scenarios-dialog').waitFor({ state: 'hidden' }); }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert(await page.evaluate(() => document.querySelector('.page').getBoundingClientRect().bottom <= document.querySelector('.bottom-actions').getBoundingClientRect().top));
        await mkdir('artifacts', { recursive: true }); await page.screenshot({ path: `artifacts/camera-${name}-${width}-${language}.png`, fullPage: true });
      }
      await page.locator('#camera-photo').setInputFiles({ name: 'blank.svg', mimeType: 'image/svg+xml', buffer: blank });
      await page.locator('.scan-status').filter({ hasText: 'No QR code found' }).waitFor();
      await page.locator('#camera-photo').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: png });
      await action('start-register').waitFor(); assert.match(await page.locator('.card-summary').innerText(), /camera-test-001/);
      await page.waitForFunction(() => document.querySelector('.card-qr')?.src.startsWith('data:image/png'));
      const actualQr = await page.evaluate(async () => { const { QrScanner } = await import('/decoder/stdin.js'); return (await QrScanner.scanImage(document.querySelector('.card-qr').src, { returnDetailedScanResult: true })).data; });
      assert.equal(actualQr, qrUrl);
      await action('start-register').click(); await page.reload(); await page.locator('#nickname').waitFor();
      await action('home').click(); assert.equal(new URL(page.url()).search, '');
      assert.deepEqual(errors, []);
      results.push(`${name}: mock requests zero; denied camera/photo recovery; worker QR decode; displayed/generated identity; reload; ja/en 320/390`);
      await context.close();
    } finally { await browser.close(); }
  }
  folder = 'api-live';
  const apiBrowser = await chromium.launch({ headless: true });
  try {
    const page = await apiBrowser.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(Object.getPrototypeOf(navigator.mediaDevices), 'getUserMedia', { value: async () => { throw new DOMException('Denied', 'NotAllowedError'); }, configurable: true });
    });
    let releaseImport;
    const importGate = new Promise(resolve => { releaseImport = resolve; });
    await page.route('**/live-registration-*.js', async route => { await importGate; await route.continue(); });
    const requestedIds = [];
    await page.route('https://camera-api.example/api/v1/**', async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.startsWith('/api/v1/cards/')) requestedIds.push(path.slice('/api/v1/cards/'.length));
      await route.fulfill({ status: 503, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ meta: { mode: 'live' }, error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Test fixture' } }) });
    });
    await page.goto(base);
    await page.locator('[data-action="open-camera"]').click();
    await page.locator('#camera-video').waitFor();
    releaseImport();
    await page.waitForResponse('**/live-registration-*.js');
    assert.equal(await page.locator('#camera-video').count(), 1);
    await page.locator('#camera-photo').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: png });
    await page.locator('[data-action="retry-read"]').waitFor();
    assert.deepEqual(requestedIds, ['camera-test-001']);
    assert.equal(new URL(page.url()).searchParams.get('cardId'), 'camera-test-001');
    results.push('chromium API live: delayed initialization preserves camera; decoded ID reaches card API; unavailable response stays an error');
  } finally { await apiBrowser.close(); }
  folder = 'live';
  const blankVideoPath = join(temp, 'blank.y4m');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=white:s=640x480:r=10', '-t', '2', '-pix_fmt', 'yuv420p', blankVideoPath]);
  const lifecycleBrowser = await chromium.launch({ headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${blankVideoPath}`] });
  try {
    const page = await lifecycleBrowser.newPage();
    await page.goto(base); await page.locator('[data-action="open-camera"]').click();
    await page.waitForFunction(() => document.querySelector('#camera-video')?.srcObject?.active);
    await page.evaluate(() => { window.startedVideo = document.querySelector('#camera-video'); window.startedTracks = window.startedVideo.srcObject.getTracks(); });
    await page.locator('[data-action="scenarios"]').click(); await page.locator('[data-action="language"]').click();
    await page.locator('#scenarios-dialog form button').click();
    assert(await page.evaluate(() => document.querySelector('#camera-video') === window.startedVideo && window.startedTracks.every(track => track.readyState === 'live')));
    await page.waitForFunction(() => !document.querySelector('#camera-video').paused);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert(await page.evaluate(() => window.startedTracks.every(track => track.readyState === 'ended')));
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.locator('[data-action="resume-camera"]').count(), 1);
    await page.locator('[data-action="resume-camera"]').click();
    await page.waitForFunction(() => document.querySelector('#camera-video')?.srcObject?.active);
    await page.evaluate(() => { window.resumedTracks = document.querySelector('#camera-video').srcObject.getTracks(); });
    await page.locator('[data-action="close-camera"]').click();
    assert(await page.evaluate(() => window.resumedTracks.every(track => track.readyState === 'ended')));
    results.push('chromium: language keeps video/stream; background stops tracks; explicit resume; close stops resumed tracks');
  } finally { await lifecycleBrowser.close(); }
  const browser = await chromium.launch({ headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${videoPath}`] });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      delete window.BarcodeDetector;
      window.cameraTracks = [];
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async constraints => { const stream = await original(constraints); window.cameraTracks.push(...stream.getTracks()); return stream; };
    });
    await page.goto(base); await page.locator('[data-action="open-camera"]').click();
    await page.locator('[data-action="start-register"]').waitFor({ timeout: 20000 });
    assert.match(await page.locator('.card-summary').innerText(), /camera-test-001/);
    assert(await page.evaluate(() => window.cameraTracks.length > 0 && window.cameraTracks.every(track => track.readyState === 'ended')));
    results.push('chromium: actual video QR decode via generated Y4M input; automatic transition; all tracks ended');
  } finally { await browser.close(); }
  await mkdir('artifacts', { recursive: true }); await writeFile('artifacts/camera-verification.json', JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally { await new Promise(resolve => server.close(resolve)); await rm(temp, { recursive: true, force: true }); }
