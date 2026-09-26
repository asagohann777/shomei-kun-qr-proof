import test from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import artifact from '../../../contracts/abi/OwnershipRegistry.json' with { type: 'json' };
import { createLiveRegistration } from '../src/live-registration.js';
const account = `0x${'1'.repeat(40)}`, address = `0x${'2'.repeat(40)}`, issuer = `0x${'3'.repeat(40)}`, hash = `0x${'a'.repeat(64)}`;
const chainId = 2017072401, id = 'test-card', nickname = 'おじいちゃんコンビニ';
const registry = { chainId, contractAddress: address, issuer };
const connection = { status: 'ready', network: { name: 'Curvegrid Testnet', chainId, nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.example.test/'] }, registry, latestBlock: { number: 1, hash }, nicknameMaxUtf8Bytes: 96 };
const iface = new Interface(artifact.abi);
function fixture(o = {}) {
 let card = o.card ?? { cardId: id, registry, playerName: '証明一郎', status: 'unregistered', owner: null, evidence: { status: 'none' } };
 let owner = { address: account, chainId }, sent = 0, prepared = 0, factories = 0, onChange;
 const values = o.values ?? new Map();
 const storage = o.storage ?? { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) };
 const change = next => { owner = next; onChange(next); };
 const wallet = { connect: async () => { onChange(owner); return owner; }, restore: async () => { onChange(owner); return owner; }, snapshot: async () => owner, switchChain: async () => {}, disconnect: async () => {}, dispose() {}, send: async () => { sent++; if(o.send) return o.send(); card = { ...card, status: 'registered', owner: { address: account, nickname }, evidence: { status: 'available', transactionHash: hash, blockNumber: 2 } }; return hash; } };
 const fetch = async (url, init) => {
  let data;
  if(url.endsWith('/connection')) data = connection;
  else if(url.endsWith('/prepare')) { prepared++; if(o.prepare) await o.prepare(change); const b = JSON.parse(init.body); data = { cardId: id, nickname: b.nickname, transaction: { chainId, from: account, to: address, value:'0', data: iface.encodeFunctionData('register', [id,b.nickname]) } }; if(o.mutate) data = o.mutate(data); }
  else if(url.includes('/transactions/')) { if(o.beforeTransaction) await o.beforeTransaction(); data = o.transaction ?? { cardId:id, transactionHash:hash, status:'confirmed', owner:{address:account,nickname}, blockNumber:2 }; }
  else { if (o.beforeCard) await o.beforeCard(); data = card; }
  return { ok:true, json:async () => ({meta:{mode:o.mode ?? 'live'},data:o.malformed ? {} : data}) };
 };
 const controller = createLiveRegistration({apiMode:'live',walletMode:o.walletMode ?? 'metamask',apiBaseUrl:'https://api.example.test'}, o.changed ?? (() => {}), {fetch,storage,locks:o.locks ?? {request:async (_k,_o,fn) => fn({})},walletFactory:async args => {factories++;onChange=args.onChange;return wallet;},setTimeout:o.setTimeout ?? (()=>0),clearTimeout(){},now:o.now});
 return {controller,values,change,setCard: value => { card = value; },counts:()=>({sent,prepared,factories})};
}
async function ready(f){await f.controller.open(id);await f.controller.connect();}
test('confirms authoritative ownership and persists hash',async()=>{const f=fixture();await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.kind,'confirmed');assert.equal(f.controller.getSnapshot().read.card.owner.nickname,nickname);assert.equal(JSON.parse([...f.values.values()][0]).hash,hash);assert.equal(f.counts().sent,1);});
test('live/mock stays read only',async()=>{const f=fixture({walletMode:'mock'});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().read.kind,'ready');assert.equal(f.controller.getSnapshot().canRegister,false);assert.deepEqual(f.counts(),{sent:0,prepared:0,factories:0});});
for(const [name,mutate] of Object.entries({from:p=>({...p,transaction:{...p.transaction,from:issuer}}),chain:p=>({...p,transaction:{...p.transaction,chainId:1}}),calldata:p=>({...p,transaction:{...p.transaction,data:iface.encodeFunctionData('register',['other',nickname])}}),nickname:p=>({...p,nickname:'altered'}),value:p=>({...p,transaction:{...p.transaction,value:'1'}})}))test(`rejects tampered ${name}`,async()=>{const f=fixture({mutate});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.kind,'failed');assert.equal(f.counts().sent,0);});
test('wrong chain never prepares',async()=>{const f=fixture();await ready(f);f.change({address:account,chainId:1});await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.errorCode,'CHAIN_MISMATCH');assert.equal(f.counts().prepared,0);});
test('account change during prepare invalidates send',async()=>{const f=fixture({prepare:async change=>change({address:issuer,chainId})});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.errorCode,'WALLET_CHANGED');assert.equal(f.counts().sent,0);});
test('duplicate clicks send once',async()=>{let release;const gate=new Promise(r=>{release=r;});const f=fixture({prepare:()=>gate});await ready(f);const sending=f.controller.register(nickname);await f.controller.register(nickname);release();await sending;assert.equal(f.counts().sent,1);});
test('storage error prevents send',async()=>{const f=fixture({storage:{getItem:()=>null,setItem(){throw Error('full');}}});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.errorCode,'STORAGE_UNAVAILABLE');assert.equal(f.counts().sent,0);});
test('no Web Locks prevents send',async()=>{const f=fixture({locks:{}});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.errorCode,'LOCKS_UNAVAILABLE');assert.equal(f.counts().sent,0);});
test('ambiguous send restores unknown and never resends',async()=>{const f=fixture({send:async()=>{throw Error('lost');}});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.kind,'unknown');const r=fixture({values:f.values});await ready(r);await r.controller.register(nickname);assert.equal(r.controller.getSnapshot().registration.kind,'unknown');assert.equal(r.counts().sent,0);});
test('pending hash resumes without resend',async()=>{const transaction={cardId:id,transactionHash:hash,status:'pending'};const f=fixture({transaction});await ready(f);await f.controller.register(nickname);const r=fixture({values:f.values,transaction});await ready(r);assert.equal(r.controller.getSnapshot().registration.hash,hash);assert.equal(r.controller.getSnapshot().registration.kind,'pending');assert.equal(r.counts().sent,0);});
test('4001 is rejected, not failed',async()=>{const f=fixture({send:async()=>{throw Object.assign(Error('no'),{code:4001});}});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.kind,'rejected');});
for(const o of [{malformed:true},{mode:'mock'}])test(`rejects upstream ${JSON.stringify(o)}`,async()=>{const f=fixture(o);await f.controller.open(id);assert.equal(f.controller.getSnapshot().read.kind,'unavailable');});
test('UTF8 limit before prepare',async()=>{const f=fixture();await ready(f);await f.controller.register('あ'.repeat(33));assert.equal(f.controller.getSnapshot().registration.errorCode,'INVALID_INPUT');assert.equal(f.counts().prepared,0);});
test('second tab rereads persisted pending attempt under lock',async()=>{const values=new Map();const transaction={cardId:id,transactionHash:hash,status:'pending'};const first=fixture({values,transaction});const second=fixture({values,transaction});await ready(first);await ready(second);await first.controller.register(nickname);await second.controller.register(nickname);assert.equal(first.counts().sent,1);assert.equal(second.counts().sent,0);assert.equal(second.controller.getSnapshot().registration.hash,hash);});
test('occupied tab lock rejects new signing request',async()=>{const f=fixture({locks:{request:async(_k,_o,fn)=>fn(null)}});await ready(f);await f.controller.register(nickname);assert.equal(f.controller.getSnapshot().registration.errorCode,'REGISTRATION_IN_PROGRESS');assert.equal(f.counts().sent,0);});
test('late hash persists original card without overwriting navigation',async()=>{let resolve;const wait=new Promise(r=>{resolve=r;});const f=fixture({send:()=>wait});await ready(f);const sending=f.controller.register(nickname);for(let i=0;i<10&&f.counts().sent===0;i++)await Promise.resolve();assert.equal(f.counts().sent,1);await f.controller.open(null);resolve(hash);await sending;assert.equal(f.controller.getSnapshot().read.kind,'not-found');assert.equal(f.controller.getSnapshot().registration.kind,'idle');assert.equal(JSON.parse([...f.values.values()][0]).hash,hash);});
test('connection controls do not overwrite uncertain registration',async()=>{const f=fixture({send:async()=>{throw Error('lost');}});await ready(f);await f.controller.register(nickname);await f.controller.connect();await f.controller.resumeSetup();assert.equal(f.controller.getSnapshot().registration.kind,'unknown');});
test('foreground recheck picks up hash persisted by another tab',async()=>{let resolve;const wait=new Promise(r=>{resolve=r;});const transaction={cardId:id,transactionHash:hash,status:'pending'};const first=fixture({send:()=>wait,transaction});await ready(first);const sending=first.controller.register(nickname);for(let i=0;i<10&&first.counts().sent===0;i++)await Promise.resolve();const second=fixture({values:first.values,transaction});await ready(second);assert.equal(second.controller.getSnapshot().registration.kind,'unknown');resolve(hash);await sending;await second.controller.recheck();assert.equal(second.controller.getSnapshot().registration.hash,hash);assert.equal(second.controller.getSnapshot().registration.kind,'pending');assert.equal(second.counts().sent,0);});
for (const savedStatus of ['confirmed', 'reverted']) {
  test(`restored ${savedStatus} waits for fresh API transaction and card evidence`, async () => {
    const seed = fixture();
    await ready(seed);
    await seed.controller.register(nickname);
    const [storageKey, raw] = [...seed.values.entries()][0];
    seed.values.set(storageKey, JSON.stringify({ ...JSON.parse(raw), status: savedStatus }));
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const snapshots = [];
    const resumed = fixture({ values: seed.values, walletMode: 'mock', beforeTransaction: () => gate, changed: value => snapshots.push(value) });
    const opening = resumed.controller.open(id);
    for (let i = 0; i < 10 && resumed.controller.getSnapshot().read.kind !== 'ready'; i++) await Promise.resolve();
    assert.equal(resumed.controller.getSnapshot().registration.kind, 'pending');
    assert.equal(snapshots.some(value => value.registration.kind === 'confirmed'), false);
    assert.equal(snapshots.some(value => value.registration.kind === 'reverted'), false);
    release();
    await opening;
    assert.equal(resumed.controller.getSnapshot().registration.kind, 'unknown');
    assert.equal(resumed.controller.getSnapshot().registration.errorCode, 'RECORD_MISMATCH');
    assert.deepEqual(resumed.counts(), { sent: 0, prepared: 0, factories: 0 });
  });
}
test('registered card opens as a public read without resuming saved registration', async () => {
  const seed = fixture();
  await ready(seed);
  await seed.controller.register(nickname);
  const resumed = fixture({ values: seed.values, walletMode: 'mock', card: seed.controller.getSnapshot().read.card });
  await resumed.controller.open(id);
  assert.equal(resumed.controller.getSnapshot().registration.kind, 'idle');
  assert.deepEqual(resumed.counts(), { sent: 0, prepared: 0, factories: 0 });
});
test('malformed durable attempt stays unknown and cannot resend', async () => {
  const seed = fixture();
  await ready(seed);
  await seed.controller.register(nickname);
  const [storageKey] = [...seed.values.keys()];
  seed.values.set(storageKey, '{broken');
  const resumed = fixture({ values: seed.values });
  await ready(resumed);
  await resumed.controller.register(nickname);
  assert.equal(resumed.controller.getSnapshot().registration.kind, 'unknown');
  assert.equal(resumed.controller.getSnapshot().registration.errorCode, 'INVALID_SAVED_ATTEMPT');
  assert.equal(resumed.counts().sent, 0);
});
for (const walletMode of ['mock', 'metamask']) {
  test(`unavailable storage permits public ${walletMode} reads but blocks signing`, async () => {
    const storage = { getItem() { throw Error('disabled'); }, setItem() { throw Error('disabled'); } };
    const f = fixture({ storage, walletMode });
    await f.controller.open(id);
    await f.controller.recheck();
    assert.equal(f.controller.getSnapshot().read.kind, 'ready');
    assert.equal(f.controller.getSnapshot().registration.kind, 'idle');
    await f.controller.connect();
    await f.controller.register(nickname);
    if (walletMode === 'metamask') {
      assert.equal(f.controller.getSnapshot().registration.errorCode, 'STORAGE_UNAVAILABLE');
    } else {
      assert.equal(f.controller.getSnapshot().registration.kind, 'idle');
    }
    assert.equal(f.counts().sent, 0);
    assert.equal(f.counts().prepared, 0);
  });
}
test('reopening a registered card discards an older registration check', async () => {
  const seed = fixture(); await ready(seed); await seed.controller.register(nickname);
  let releaseOld;
  const older = new Promise(resolve => { releaseOld = resolve; });
  let checks = 0;
  const f = fixture({ values: seed.values, walletMode: 'mock', beforeTransaction: () => { checks++; return older; } });
  const first = f.controller.open(id);
  for (let i = 0; i < 10 && checks === 0; i++) await Promise.resolve();
  assert.equal(checks, 1);
  f.setCard(seed.controller.getSnapshot().read.card);
  await f.controller.open(id);
  assert.equal(checks, 1);
  assert.equal(f.controller.getSnapshot().registration.kind, 'idle');
  releaseOld(); await first;
  assert.equal(f.controller.getSnapshot().registration.kind, 'idle');
  assert.equal(f.controller.getSnapshot().read.card.status, 'registered');
});

const registered = { cardId: id, registry, playerName: '証明一郎', status: 'registered', owner: { address: account, nickname }, evidence: { status: 'pending' } };
function clock() {
  let time = 0, callback, delay;
  return { now: () => time, setTimeout: (fn, ms) => { callback = fn; delay = ms; }, async tick(ms) { time += ms; callback = null; }, delay: () => delay };
}
test('initial registration waits for indexed evidence and finishes when it arrives', async () => {
  const c = clock(), f = fixture({ ...c, send: async () => hash });
  await ready(f); f.setCard(registered);
  await f.controller.register(nickname);
  assert.equal(f.controller.getSnapshot().registration.kind, 'pending');
  await c.tick(59000); await f.controller.recheck();
  assert.equal(f.controller.getSnapshot().registration.kind, 'pending');
  assert.equal(c.delay(), 1000);
  f.setCard({ ...registered, evidence: { status: 'available', transactionHash: hash, blockNumber: 2 } });
  await c.tick(500); await f.controller.recheck();
  assert.equal(f.controller.getSnapshot().registration.kind, 'confirmed');
  assert.equal(f.counts().sent, 1);
});
test('at 60 seconds a verified registration can finish with evidence still pending', async () => {
  const c = clock(), f = fixture({ ...c, send: async () => hash });
  await ready(f); f.setCard(registered); await f.controller.register(nickname);
  await c.tick(60000); await f.controller.recheck();
  assert.equal(f.controller.getSnapshot().registration.kind, 'confirmed');
  assert.equal(f.controller.getSnapshot().read.card.evidence.status, 'pending');
  assert.equal(f.counts().sent, 1);
});
test('at 60 seconds an unconfirmed transaction remains unknown without resend', async () => {
  const c = clock(), f = fixture({ ...c, transaction: { cardId: id, transactionHash: hash, status: 'pending' } });
  await ready(f); await f.controller.register(nickname);
  await c.tick(59000); await f.controller.recheck();
  assert.equal(f.controller.getSnapshot().registration.kind, 'pending');
  await c.tick(1000); await f.controller.recheck();
  assert.equal(f.controller.getSnapshot().registration.kind, 'unknown');
  assert.equal(f.controller.getSnapshot().registration.errorCode, 'CONFIRMATION_TIMEOUT');
  await f.controller.register(nickname); assert.equal(f.counts().sent, 1);
});
test('refresh preserves registration and owner, deduplicates reads, and recovers from failure', async () => {
  let gate, fail = false, reads = 0;
  const f = fixture({ card: registered, beforeCard: async () => { reads++; if (gate) await gate; if (fail) throw Error('offline'); } });
  await f.controller.open(id);
  let release; gate = new Promise(resolve => { release = resolve; });
  const refreshing = f.controller.refresh(); await f.controller.refresh();
  assert.equal(reads, 2);
  assert.equal(f.controller.getSnapshot().refresh.kind, 'checking');
  assert.equal(f.controller.getSnapshot().registration.kind, 'idle');
  assert.deepEqual(f.controller.getSnapshot().read.card, registered);
  fail = true; release(); await refreshing;
  assert.equal(f.controller.getSnapshot().refresh.kind, 'failed');
  assert.deepEqual(f.controller.getSnapshot().read.card, registered);
  gate = null; fail = false;
  f.setCard({ ...registered, evidence: { status: 'available', transactionHash: hash, blockNumber: 2 } });
  await f.controller.refresh();
  assert.equal(f.controller.getSnapshot().refresh.kind, 'idle');
  assert.equal(f.controller.getSnapshot().read.card.evidence.status, 'available');
  assert.equal(f.counts().prepared, 0); assert.equal(f.counts().sent, 0);
});
test('late refresh cannot overwrite navigation', async () => {
  let gate, release;
  const f = fixture({ card: registered, beforeCard: async () => { if (gate) await gate; } });
  await f.controller.open(id);
  gate = new Promise(resolve => { release = resolve; });
  const refreshing = f.controller.refresh(); await f.controller.open(null);
  release(); await refreshing;
  assert.equal(f.controller.getSnapshot().read.kind, 'not-found');
  assert.equal(f.controller.getSnapshot().refresh.kind, 'idle');
});

for (const evidence of [{ status: 'pending' }, { status: 'available', transactionHash: hash, blockNumber: 2 }]) {
  test(`registered ${evidence.status} card ignores saved attempt on open and foreground`, async () => {
    const seed = fixture(); await ready(seed); await seed.controller.register(nickname);
    let transactionReads = 0;
    const snapshots = [];
    const resumed = fixture({ values: seed.values, card: { ...registered, evidence }, changed: value => snapshots.push(value), beforeTransaction: () => { transactionReads++; } });
    await resumed.controller.open(id); await resumed.controller.recheck();
    assert.equal(resumed.controller.getSnapshot().registration.kind, 'idle');
    assert.equal(resumed.controller.getSnapshot().read.card.status, 'registered');
    assert.equal(snapshots.some(value => value.registration.kind === 'pending'), false);
    assert.equal(transactionReads, 0);
    assert.equal(resumed.counts().sent, 0);
  });
}
