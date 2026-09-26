// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnsSearch } from '../src/ens-search.js';
const page = { name: 'test.eth', address: '0x123', snapshot: { hash: 'hash' }, cards: [{ cardId: 'one' }], nextCursor: 'next', complete: false };
test('search retains partial results, deduplicates pages and distinguishes complete empty', async () => {
  const calls = [];
  const search = createEnsSearch({ ensCards: async (name, cursor) => { calls.push([name, cursor]); return cursor ? { ...page, cards: [{cardId:'one'}, {cardId:'two'}], nextCursor:null, complete:true } : page; } }, () => {});
  await search.search('test.eth');
  assert.equal(search.snapshot().result.complete, false);
  await search.search('test.eth', true);
  assert.deepEqual(search.snapshot().result.cards.map(c => c.cardId), ['one','two']);
  assert.deepEqual(calls, [['test.eth', undefined], ['test.eth', 'next']]);
});
test('name changes invalidate old results and leaving the page ignores stale responses', async () => {
  let finish;
  let api = async () => page;
  const search = createEnsSearch({ensCards: (...args) => api(...args)}, () => {});
  await search.search('test.eth');
  api = async () => { throw Object.assign(new Error(), {code:'ENS_ADDRESS_CHANGED'}); };
  await search.search('test.eth', true);
  assert.equal(search.snapshot().result, null);
  assert.equal(search.snapshot().error, 'ENS_ADDRESS_CHANGED');
  api = () => new Promise(resolve => { finish = resolve; });
  const pending = search.search('other.eth');
  search.cancel(); finish(page); await pending;
  assert.equal(search.snapshot().result, null);
});
