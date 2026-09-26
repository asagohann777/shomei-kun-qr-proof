// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import artifact from '../abi/OwnershipRegistry.json';
import { MultiBaas } from '../cli/multibaas';
const contract = '0x1111111111111111111111111111111111111111';
const config = { baseUrl: 'https://example.test/api/v0', apiKey: 'DO_NOT_PRINT', label: 'registry', version: '1' };

test('Library reuse verifies ABI and bytecode, refuses changed version contents', async () => {
  const original = globalThis.fetch;
  const requests: string[] = [];
  let changed = false;
  globalThis.fetch = async (url, init) => {
    requests.push(`${init?.method} ${url}`);
    const result = String(url).endsWith('/versions') ? { versions: ['1'] } : String(url).endsWith('/contracts') ? [{ label: 'registry', version: '1' }] : { rawAbi: JSON.stringify(artifact.abi), bin: changed ? 'abcd' : artifact.bytecode };
    return Response.json({ status: 200, result });
  };
  try {
    const api = new MultiBaas(config);
    await api.ensureLibrary();
    assert.equal(requests.length, 3);
    assert.ok(requests.every(item => item.startsWith('GET')));
    changed = true;
    await assert.rejects(() => api.ensureLibrary(), /differs/);
  } finally { globalThis.fetch = original; }
});
test('link retries read existing link and preserve original indexing start block', async () => {
  const original = globalThis.fetch;
  let linked = false;
  const posts: unknown[] = [];
  globalThis.fetch = async (url, init) => {
    let result: unknown;
    if (init?.method === 'POST') { posts.push(JSON.parse(String(init.body))); linked = true; result = {}; }
    else if (String(url).endsWith('/addresses')) result = [{ address: contract }];
    else if (String(url).endsWith('/status')) result = { startBlockNumber: 7 };
    else result = { contracts: linked ? [{ label: 'registry', version: '1' }] : [] };
    return Response.json({ status: 200, result });
  };
  try {
    const api = new MultiBaas(config);
    await api.link(contract, 7);
    await api.link(contract, 7);
    assert.deepEqual(posts, [{ label: 'registry', version: '1', startingBlock: '7' }]);
    await assert.rejects(() => api.link(contract, 8), /start block differs/);
  } finally { globalThis.fetch = original; }
});
test('MultiBaas errors never include secret, upstream body, or silently accept submitted tx', async () => {
  const original = globalThis.fetch;
  try {
    const api = new MultiBaas(config);
    for (const status of [401, 403, 404, 429, 500]) {
      globalThis.fetch = async () => new Response('DO_NOT_PRINT', { status });
      await assert.rejects(() => api.chainId(), (error: unknown) => error instanceof Error && !error.message.includes('DO_NOT_PRINT') && error.message.includes(String(status)));
    }
    globalThis.fetch = async () => Response.json({ status: 200, result: { submitted: true, tx: { from: contract, to: contract, data: new Interface(artifact.abi).encodeFunctionData('issue', ['one', contract]), value: '0' } } });
    await assert.rejects(() => api.prepareIssue(contract, contract, 'one', contract));
  } finally { globalThis.fetch = original; }
});
test('card reads reject unknown tuple shape and inconsistent registration state', async () => {
  const original = globalThis.fetch;
  try {
    const api = new MultiBaas(config);
    for (const output of [[false, contract, false, '0x0000000000000000000000000000000000000000', ''], [true, contract, true, contract, ''], [false, contract], [true, contract, false, contract, '']]) {
      globalThis.fetch = async () => Response.json({ status: 200, result: { output } });
      await assert.rejects(() => api.getCard(contract, 'one'));
    }
    globalThis.fetch = async () => Response.json({ status: 200, result: { output: [true, contract, true, contract, 'Alice'] } });
    assert.deepEqual(await api.getCard(contract, 'one'), { exists: true, allowedWallet: contract, registered: true, owner: contract, nickname: 'Alice' });
  } finally { globalThis.fetch = original; }
});

test('Library creation sends 0x-prefixed bytecode required by the real API', async () => {
  const original = globalThis.fetch;
  let created = false;
  globalThis.fetch = async (_url, init) => {
    if (init?.method !== 'POST') return Response.json({ status: 200, result: [] });
    const body = JSON.parse(String(init.body));
    assert.equal(body.bin, artifact.bytecode);
    assert.match(body.bin, /^0x[0-9a-f]+$/);
    assert.deepEqual(JSON.parse(body.rawAbi), artifact.abi);
    created = true;
    return Response.json({ status: 200, result: {} });
  };
  try { await new MultiBaas(config).ensureLibrary(); assert.equal(created, true); }
  finally { globalThis.fetch = original; }
});
