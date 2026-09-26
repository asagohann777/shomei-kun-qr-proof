import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createMetaMaskWallet } from '../src/metamask-wallet.js';

const address = '0x1111111111111111111111111111111111111111';
const other = '0x2222222222222222222222222222222222222222';
const hash = `0x${'ab'.repeat(32)}`;
const network = { chainId: 2017072401, name: 'Curvegrid Testnet', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.example.test'] };
const chain = `0x${network.chainId.toString(16)}`;
const transaction = { chainId: network.chainId, from: address, to: other, data: '0x12345678', value: '0', gas: '0xffffff' };
const expected = { address, chainId: network.chainId };

function fakeProvider() {
  const provider = new EventEmitter();
  provider.accounts = [address];
  provider.chain = chain;
  provider.requests = [];
  provider.request = async (request) => {
    provider.requests.push(request);
    if (provider.respond) {
      const result = await provider.respond(request);
      if (result !== undefined) return result;
    }
    switch (request.method) {
      case 'eth_requestAccounts':
      case 'eth_accounts': return provider.accounts;
      case 'eth_chainId': return provider.chain;
      case 'wallet_switchEthereumChain': provider.chain = request.params[0].chainId; return null;
      case 'wallet_addEthereumChain': return null;
      case 'eth_sendTransaction': return hash;
      default: throw new Error(`Unexpected ${request.method}`);
    }
  };
  return provider;
}

async function setup(options = {}) {
  const provider = fakeProvider();
  const changes = [];
  const wallet = await createMetaMaskWallet({ network, dappUrl: 'https://ui.example.test/?cardId=one', onChange: (value) => changes.push(value), injectedProvider: () => provider, ...options });
  return { wallet, provider, changes };
}

test('creation and disconnected snapshot do not request permissions or initialize SDK', async () => {
  let initialized = false;
  const { wallet, provider } = await setup({ createClient: async () => { initialized = true; } });
  assert.equal(await wallet.snapshot(), null);
  assert.equal(initialized, false);
  assert.deepEqual(provider.requests, []);
  wallet.dispose();
});

test('connect reads actual address and chain, with listeners installed before permission', async () => {
  const { wallet, provider } = await setup();
  provider.chain = '0x1';
  provider.respond = async ({ method }) => {
    if (method === 'eth_requestAccounts') assert.equal(provider.listenerCount('accountsChanged'), 1);
  };
  assert.deepEqual(await wallet.connect(), { address, chainId: 1 });
  assert.equal(provider.requests[0].method, 'eth_requestAccounts');
  wallet.dispose();
  assert.equal(provider.listenerCount('accountsChanged'), 0);
  assert.equal(provider.listenerCount('chainChanged'), 0);
  assert.equal(provider.listenerCount('disconnect'), 0);
});

test('SDK is lazy, custom RPC is supplied, analytics are disabled, mobile sessions connect', async () => {
  const provider = fakeProvider();
  let options;
  let connection;
  let disconnected = false;
  const wallet = await createMetaMaskWallet({ network, dappUrl: 'https://ui.example.test/?cardId=one', injectedProvider: () => null, createClient: async (value) => {
    options = value;
    return { getProvider: () => provider, connect: async (value) => { connection = value; }, disconnect: async () => { disconnected = true; } };
  } });
  assert.equal(options, undefined);
  assert.deepEqual(await wallet.connect(), expected);
  assert.deepEqual(options.api.supportedNetworks, { [chain]: 'https://rpc.example.test' });
  assert.deepEqual(options.analytics, { enabled: false });
  assert.deepEqual(options.ui, { headless: true });
  assert.deepEqual(options.mobile, { useDeeplink: false });
  assert.deepEqual(connection, { chainIds: [chain] });
  assert.equal(options.dapp.url, 'https://ui.example.test/?cardId=one');
  await wallet.disconnect();
  assert.equal(disconnected, true);
  assert.equal(await wallet.snapshot(), null);
  wallet.dispose();
});

test('send rechecks current wallet, emits only approved transaction fields and preserves hash', async () => {
  const { wallet, provider } = await setup();
  await wallet.connect();
  assert.equal(await wallet.send(transaction, expected), hash);
  assert.deepEqual(provider.requests.at(-1), { method: 'eth_sendTransaction', params: [{ from: address, to: other, data: '0x12345678', chainId: chain, value: '0x0' }] });
  provider.accounts = [other];
  await assert.rejects(wallet.send(transaction, expected), { code: 'WALLET_CHANGED' });
  assert.equal(provider.requests.filter(({ method }) => method === 'eth_sendTransaction').length, 1);
  wallet.dispose();
});

test('chain change without event also stops submission; invalid or mock transaction never sends', async () => {
  const { wallet, provider } = await setup();
  await wallet.connect();
  provider.chain = '0x1';
  await assert.rejects(wallet.send(transaction, expected), { code: 'WALLET_CHANGED' });
  for (const patch of [{ value: '1' }, { data: '0x' }, { from: other }, { chainId: 1 }, { to: 'invalid' }]) {
    await assert.rejects(wallet.send({ ...transaction, ...patch }, expected), { code: 'INVALID_TRANSACTION' });
  }
  assert.equal(provider.requests.some(({ method }) => method === 'eth_sendTransaction'), false);
  wallet.dispose();
});

test('events invalidate state and refresh account/chain; disconnect reports null', async () => {
  const { wallet, provider, changes } = await setup();
  await wallet.connect();
  provider.accounts = [other];
  provider.emit('accountsChanged', [other]);
  assert.equal(changes.at(-1), null);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(changes.at(-1), { address: other, chainId: network.chainId });
  provider.chain = '0x1';
  provider.emit('chainChanged', '0x1');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(changes.at(-1), { address: other, chainId: 1 });
  provider.emit('disconnect', { code: 4900 });
  assert.equal(changes.at(-1), null);
  assert.equal(await wallet.snapshot(), null);
  wallet.dispose();
});

test('wallet change while fresh snapshot is pending cannot send', async () => {
  const { wallet, provider } = await setup();
  await wallet.connect();
  const releases = [];
  provider.respond = ({ method }) => method === 'eth_chainId' ? new Promise((resolve) => { releases.push(resolve); }) : undefined;
  const sending = wallet.send(transaction, expected);
  provider.accounts = [other];
  provider.emit('accountsChanged', [other]);
  for (const release of releases) release(chain);
  await assert.rejects(sending, { code: 'WALLET_CHANGED' });
  assert.equal(provider.requests.some(({ method }) => method === 'eth_sendTransaction'), false);
  wallet.dispose();
});

test('4001 is preserved with no retry and repeated send while pending is rejected', async () => {
  const { wallet, provider } = await setup();
  await wallet.connect();
  const rejection = Object.assign(new Error('User rejected'), { code: 4001 });
  provider.respond = async ({ method }) => { if (method === 'eth_sendTransaction') throw rejection; };
  await assert.rejects(wallet.send(transaction, expected), (error) => error === rejection);
  assert.equal(provider.requests.filter(({ method }) => method === 'eth_sendTransaction').length, 1);
  let complete;
  provider.respond = ({ method }) => method === 'eth_sendTransaction' ? new Promise((resolve) => { complete = resolve; }) : undefined;
  const sending = wallet.send(transaction, expected);
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(wallet.send(transaction, expected), { code: 'WALLET_REQUEST_PENDING' });
  provider.accounts = [other];
  provider.emit('accountsChanged', [other]);
  complete(hash);
  assert.equal(await sending, hash);
  wallet.dispose();
});

test('add chain happens only on 4902 and then checks actual switched network', async () => {
  const { wallet, provider } = await setup();
  await wallet.connect();
  let switches = 0;
  provider.respond = async ({ method }) => {
    if (method === 'wallet_switchEthereumChain' && switches++ === 0) throw Object.assign(new Error('Unknown chain'), { code: 4902 });
  };
  assert.deepEqual(await wallet.switchChain(), expected);
  assert.equal(provider.requests.filter(({ method }) => method === 'wallet_addEthereumChain').length, 1);
  provider.respond = async ({ method }) => { if (method === 'wallet_switchEthereumChain') throw Object.assign(new Error('Rejected'), { code: 4001 }); };
  await assert.rejects(wallet.switchChain(), { code: 4001 });
  assert.equal(provider.requests.filter(({ method }) => method === 'wallet_addEthereumChain').length, 1);
  wallet.dispose();
});

test('explicit disconnect prevents pending connect from restoring a session', async () => {
  const { wallet, provider } = await setup();
  let release;
  provider.respond = ({ method }) => method === 'eth_requestAccounts' ? new Promise((resolve) => { release = resolve; }) : undefined;
  const connecting = wallet.connect();
  await new Promise((resolve) => setImmediate(resolve));
  await wallet.disconnect();
  release([address]);
  await assert.rejects(connecting, { code: 'WALLET_CHANGED' });
  assert.equal(await wallet.snapshot(), null);
  wallet.dispose();
});

test('connection rejection retains wallet error code and can be retried explicitly', async () => {
  const { wallet, provider } = await setup();
  provider.respond = async ({ method }) => { if (method === 'eth_requestAccounts') throw Object.assign(new Error('Rejected'), { code: 4001 }); };
  await assert.rejects(wallet.connect(), { code: 4001 });
  assert.equal(await wallet.snapshot(), null);
  provider.respond = undefined;
  assert.deepEqual(await wallet.connect(), expected);
  assert.equal(provider.listenerCount('accountsChanged'), 1);
  wallet.dispose();
});
