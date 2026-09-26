// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWalletPreparation, walletErrorCode } from '../src/wallet-preparation.js';

const target = 2017072401;
const account = { address: `0x${'1'.repeat(40)}`, chainId: 1 };
const flush = () => new Promise(resolve => setImmediate(resolve));
function fixture(options = {}) {
  let value = options.value ?? null;
  let added = false;
  let time = 0;
  let timer;
  const calls = [], states = [], logs = [];
  const wallet = {
    restore: async () => { calls.push('restore'); return options.restore ? options.restore() : value; },
    connect: async () => { calls.push('connect'); if (options.connect) value = await options.connect(); else value = account; return value; },
    switchChain: async () => { calls.push('switch'); if (options.switch) return options.switch(); if (!added) throw { data: { originalError: { rpcCode: 4902 } } }; value = { ...account, chainId: target }; return value; },
    addChain: async () => { calls.push('add'); if (options.add) await options.add(); added = true; if (options.addSwitches) value = { ...account, chainId: target }; return value; },
  };
  const setup = createWalletPreparation({ getWallet: async () => wallet, chainId: target, changed: state => states.push(state), log: item => logs.push(item), now: () => time, setTimer: (fn, delay) => { timer = { fn, at: time + delay }; return 1; }, clearTimer: () => { timer = undefined; } });
  return { setup, calls, states, logs, setValue: v => { value = v; }, advance(ms) { time += ms; if (timer && timer.at <= time) { const callback = timer.fn; timer = undefined; callback(); } } };
}

test('unknown chain is added then switched without registration or signing', async () => {
  const f = fixture(); await f.setup.prepare();
  assert.deepEqual(f.calls, ['restore', 'connect', 'switch', 'add', 'switch']);
  assert.equal(f.setup.getSnapshot().kind, 'ready');
  assert.deepEqual(f.states.filter(s => s.kind === 'pending').map(s => s.step), ['check', 'connect', 'switch', 'add', 'switch']);
});
test('already prepared session needs no approval and add that switches avoids a second switch', async () => {
  const ready = fixture({ value: { ...account, chainId: target } }); await ready.setup.prepare();
  assert.deepEqual(ready.calls, ['restore']);
  const f = fixture({ addSwitches: true }); await f.setup.prepare();
  assert.deepEqual(f.calls, ['restore', 'connect', 'switch', 'add']);
});
test('MetaMask handoff pauses next approval even when response arrives after return', async () => {
  let release;
  const f = fixture({ connect: () => new Promise(resolve => { release = resolve; }) });
  const operation = f.setup.prepare(); await flush();
  f.setup.setVisible(false); f.advance(90000);
  assert.equal(f.setup.getSnapshot().slow, false);
  f.setup.setVisible(true); await f.setup.resume();
  release(account); await operation;
  assert.deepEqual(f.calls, ['restore', 'connect', 'restore']);
  assert.deepEqual(f.setup.getSnapshot(), { kind: 'paused', step: 'switch' });
  await f.setup.prepare(); assert.equal(f.setup.getSnapshot().kind, 'ready');
});
test('hidden approval of missing chain pauses before adding and retains the add step', async () => {
  let reject;
  const f = fixture({ value: account, switch: () => new Promise((_resolve, fail) => { reject = fail; }) });
  const operation = f.setup.prepare(); await flush(); f.setup.setVisible(false);
  reject({ rpcCode: 4902 }); await operation;
  assert.deepEqual(f.setup.getSnapshot(), { kind: 'paused', step: 'add' });
  assert.deepEqual(f.calls, ['restore', 'switch']);
  f.setup.setVisible(true); await f.setup.resume();
  assert.deepEqual(f.setup.getSnapshot(), { kind: 'paused', step: 'add' });
});
test('foreground timeout does not cancel, duplicate, or discard a later approval', async () => {
  let release;
  const f = fixture({ connect: () => new Promise(resolve => { release = resolve; }) });
  const operation = f.setup.prepare(); await flush(); f.advance(30000);
  f.setup.setVisible(false); f.advance(120000); f.setup.setVisible(true); f.advance(29999);
  assert.equal(f.setup.getSnapshot().slow, false); f.advance(1);
  assert.equal(f.setup.getSnapshot().slow, true);
  await f.setup.prepare(); await Promise.all([f.setup.resume(), f.setup.resume()]);
  assert.equal(f.calls.filter(c => c === 'connect').length, 1);
  release({ ...account, chainId: target }); await operation;
  assert.equal(f.setup.getSnapshot().kind, 'ready');
});
for (const stage of ['connect', 'switch', 'add']) test(`rejection at ${stage} remains a preparation error`, async () => {
  const f = fixture({ [stage]: async () => { throw { data: { originalError: { code: 4001 } } }; } });
  await f.setup.prepare();
  assert.equal(f.setup.getSnapshot().kind, 'rejected');
  assert.equal(f.setup.getSnapshot().step, stage);
  assert.equal(f.setup.getSnapshot().errorCode, 4001);
});
test('external pending request stays blocked until actual ready state is observed', async () => {
  const f = fixture({ connect: async () => { throw { rpcCode: -32002 }; } });
  await f.setup.prepare(); assert.equal(f.setup.getSnapshot().kind, 'blocked');
  await f.setup.resume(); assert.equal(f.setup.getSnapshot().kind, 'blocked');
  f.setValue({ ...account, chainId: target }); await f.setup.resume();
  assert.equal(f.setup.getSnapshot().kind, 'ready');
});
test('reload restores permission without automatically launching another approval', async () => {
  const f = fixture({ value: account }); await f.setup.resume();
  assert.deepEqual(f.calls, ['restore']);
  assert.deepEqual(f.setup.getSnapshot(), { kind: 'paused', step: 'switch' });
});
test('dispose prevents late response from changing the page', async () => {
  let release;
  const f = fixture({ connect: () => new Promise(resolve => { release = resolve; }) });
  const operation = f.setup.prepare(); await flush(); f.setup.dispose();
  const count = f.states.length; release(account); await operation;
  assert.equal(f.states.length, count); assert.deepEqual(f.calls, ['restore', 'connect']);
});
test('account/network events invalidate readiness and error parsing handles cycles', async () => {
  const f = fixture({ value: { ...account, chainId: target } }); await f.setup.resume();
  f.setup.walletChanged(account); assert.equal(f.setup.getSnapshot().kind, 'paused');
  f.setup.walletChanged(null); assert.equal(f.setup.getSnapshot().step, 'connect');
  const error = {}; error.cause = error;
  assert.equal(walletErrorCode(error), 'WALLET_UNAVAILABLE');
  assert.equal(walletErrorCode({ code: -32603, data: { originalError: { code: '4902' } } }), 4902);
});

test('a stale foreground read cannot replace a connection that completed later', async () => {
  let connectResult, restoreResult, reads = 0;
  const f = fixture({ connect: () => new Promise(resolve => { connectResult = resolve; }), restore: () => ++reads === 1 ? null : new Promise(resolve => { restoreResult = resolve; }) });
  const preparing = f.setup.prepare(); await flush();
  const resuming = f.setup.resume(); await flush();
  connectResult({ ...account, chainId: target }); await preparing;
  restoreResult(account); await resuming;
  assert.equal(f.setup.getSnapshot().kind, 'ready');
  assert.equal(f.calls.filter(call => call === 'connect').length, 1);
});


test('failure of an old foreground read does not replace a newer ready state', async () => {
  let connectResult, rejectRestore, reads = 0;
  const f = fixture({ connect: () => new Promise(resolve => { connectResult = resolve; }), restore: () => ++reads === 1 ? null : new Promise((_resolve, reject) => { rejectRestore = reject; }) });
  const preparing = f.setup.prepare(); await flush();
  const resuming = f.setup.resume(); await flush();
  connectResult({ ...account, chainId: target }); await preparing;
  rejectRestore({ code: 'WALLET_CHANGED' }); await resuming;
  assert.equal(f.setup.getSnapshot().kind, 'ready');
});
