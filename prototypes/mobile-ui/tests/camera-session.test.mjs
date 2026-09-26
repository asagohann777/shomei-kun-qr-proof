import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCameraSession, parseCardQr } from '../src/camera-session.js';
const config = { apiMode: 'mock', publicUrl: 'https://ui.example/ui/', apiBaseUrl: 'https://api.example' };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

test('QR URLs only allow published UI/API format and mock legacy sample', () => {
  for (const id of ['TC-001', '_card', '-card', 'a'.repeat(64)]) {
    assert.deepEqual(parseCardQr(`https://ui.example/ui/?cardId=${id}`, config), { kind: 'card', id });
    assert.deepEqual(parseCardQr(`https://api.example/api/v1/cards/${id}`, config), { kind: 'card', id });
  }
  assert.deepEqual(parseCardQr('https://ui.example/ui/?scenario=registered', config), { kind: 'sample' });
  assert.equal(parseCardQr('https://ui.example/ui/?scenario=registered', { ...config, apiMode: 'live' }), null);
  for (const value of ['TC-001', 'javascript:alert(1)', 'https://other.example/ui/?cardId=x', 'https://ui.example/?cardId=x', 'https://u:p@ui.example/ui/?cardId=x', 'https://ui.example/ui/?cardId=x#x', 'https://ui.example/ui/?cardId=x&cardId=y', 'https://ui.example/ui/?cardId=x&scenario=registered', 'https://ui.example/ui/?cardId=', `https://ui.example/ui/?cardId=${'a'.repeat(65)}`, 'https://api.example/api/v1/cards/x/transactions', 'https://api.example/api/v1/cards/x?q=1']) assert.equal(parseCardQr(value, config), null, value);
});
function setup(overrides = {}) {
  const decoded = [], videos = [], sessions = [], changes = [];
  const controller = createCameraSession({
    createVideo: () => { const video = { srcObject: null }; videos.push(video); return video; },
    scannerFactory: (video, callback) => {
      const session = { callback, destroyed: false, start: async () => { session.track = { stopped: false, stop() { this.stopped = true; } }; video.srcObject = { getTracks: () => [session.track] }; }, hasFlash: async () => true, destroy() { this.destroyed = true; }, toggleFlash: async () => {}, isFlashOn: () => true };
      sessions.push(session); return session;
    },
    imageEngine: async () => ({ terminate() {} }), scanImage: async () => ({ data: 'https://ui.example/ui/?cardId=photo' }),
    parse: value => parseCardQr(value, config), changed: s => changes.push(s), detected: value => decoded.push(value), ...overrides,
  });
  return { controller, decoded, videos, sessions, changes };
}
test('success is accepted once and stops stream immediately', async () => {
  const { controller, sessions, decoded } = setup();
  await controller.start(); const session = sessions[0];
  session.callback({ data: 'https://ui.example/ui/?cardId=one' });
  session.callback({ data: 'https://ui.example/ui/?cardId=two' });
  assert.deepEqual(decoded, [{ kind: 'card', id: 'one' }]);
  assert.equal(session.track.stopped, true); assert.equal(session.destroyed, true);
  assert.equal(controller.snapshot().kind, 'stopped');
});
test('close, pause and reopen isolate late camera sessions', async () => {
  const pending = [], sessions = [];
  const { controller, decoded } = setup({ scannerFactory(video, callback) {
    const gate = deferred(); pending.push(gate);
    const session = { video, callback, destroyed: false, destroy() { this.destroyed = true; }, hasFlash: async () => false, async start() { await gate.promise; if (this.destroyed) return; video.srcObject = { getTracks: () => [] }; } }; sessions.push(session); return session;
  } });
  const first = controller.start(); controller.pause();
  const second = controller.start(); pending[1].resolve(); await second;
  assert.notEqual(sessions[0].video, sessions[1].video);
  pending[0].resolve(); await first;
  sessions[0].callback({ data: 'https://ui.example/ui/?cardId=stale' });
  assert.equal(controller.snapshot().kind, 'scanning'); assert.equal(decoded.length, 0);
  controller.stop(); assert.equal(sessions[1].destroyed, true);
});
test('construction and permission errors are retryable without mock success', async () => {
  for (const factory of [() => { throw Error('constructor'); }, () => ({ start: async () => { throw Error('denied'); }, destroy() {} })]) {
    const { controller, decoded } = setup({ scannerFactory: factory }); await controller.start();
    assert.deepEqual(controller.snapshot(), { kind: 'error', error: 'cameraError' }); assert.equal(decoded.length, 0);
    await controller.photo({}); assert.deepEqual(decoded, [{ kind: 'card', id: 'photo' }]);
  }
});
test('photo cancel does nothing, navigation invalidates late decoding and terminates worker', async () => {
  const gate = deferred(); let terminated = 0;
  const { controller, decoded } = setup({ imageEngine: async () => ({ terminate() { terminated++; } }), scanImage: () => gate.promise });
  await controller.photo(undefined); assert.equal(controller.snapshot().kind, 'stopped');
  const work = controller.photo({}); await Promise.resolve(); controller.stop(); gate.resolve({ data: 'https://ui.example/ui/?cardId=late' }); await work;
  assert.equal(decoded.length, 0); assert.equal(terminated, 1);
});
test('invalid video QR remains available for next scan; invalid photo exposes retry', async () => {
  const { controller, sessions, decoded } = setup({ scanImage: async () => ({ data: 'untrusted' }) });
  await controller.start(); sessions[0].callback({ data: 'untrusted' }); assert.equal(controller.snapshot().kind, 'scanning');
  await controller.toggleLight(); assert.equal(controller.snapshot().light, true);
  await controller.photo({}); assert.deepEqual(controller.snapshot(), { kind: 'error', error: 'invalidQr' }); assert.equal(decoded.length, 0);
});
test('terminal decoder failure invalidates late success and suppresses repeated unsupported notices', async () => {
  let fail, scan;
  const { controller, decoded, changes } = setup({ scannerFactory(video, callback, failure) { fail = failure; scan = callback; return { start: async () => {}, hasFlash: async () => false, destroy() {} }; } });
  await controller.start(); scan({ data: 'unsupported' }); const count = changes.length;
  scan({ data: 'unsupported' }); assert.equal(changes.length, count);
  fail(Error('worker failed')); scan({ data: 'https://ui.example/ui/?cardId=late' });
  assert.equal(controller.snapshot().kind, 'error'); assert.equal(decoded.length, 0);
});
