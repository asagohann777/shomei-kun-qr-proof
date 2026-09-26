import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import hre from 'hardhat';
import { BrowserProvider, Contract, ContractFactory, Interface, ZeroAddress, keccak256, toUtf8Bytes } from 'ethers';
import artifact from '../abi/OwnershipRegistry.json';

let keepAlive: NodeJS.Timeout;
before(() => { keepAlive = setInterval(() => {}, 1000); });
after(() => { clearInterval(keepAlive); });

const abi = new Interface(artifact.abi);
async function setup() {
  await hre.network.provider.send('hardhat_reset');
  const provider = new BrowserProvider(hre.network.provider, undefined, { cacheTimeout: -1 });
  const issuer = await provider.getSigner(0), owner = await provider.getSigner(1), other = await provider.getSigner(2);
  const deployment = await new ContractFactory(abi, artifact.bytecode, issuer).deploy(await issuer.getAddress());
  await deployment.waitForDeployment();
  return { provider, issuer, owner, other, registry: new Contract(await deployment.getAddress(), abi, issuer) };
}
async function rejects(fn: () => Promise<unknown>, name: string) {
  await assert.rejects(fn, (error: unknown) => {
    const text = String(error);
    return text.includes(name) || text.includes(abi.getError(name)!.selector);
  });
}
test('issuer, card state, event, nickname and immutable registration', async () => {
  const { registry, owner, other } = await setup();
  assert.deepEqual(Array.from(await registry.getFunction('getCard')('unknown')), [false, ZeroAddress, false, ZeroAddress, '']);
  assert.equal(await registry.getFunction('schemaVersion')(), 1n);
  await (await registry.getFunction('issue')('card_01', owner.address)).wait();
  assert.deepEqual(Array.from(await registry.getFunction('getCard')('card_01')), [true, owner.address, false, ZeroAddress, '']);
  await rejects(() => registry.connect(other).getFunction('register')('card_01', 'no'), 'WalletNotAllowed');
  const tx = await registry.connect(owner).getFunction('register')('card_01', 'おじいちゃんコンビニ');
  const receipt = await tx.wait();
  const event = abi.parseLog(receipt.logs[0]);
  assert.equal(event?.name, 'CardRegistered');
  assert.equal(event?.args.cardKey, keccak256(toUtf8Bytes('card_01')));
  assert.equal(event?.args.nickname, 'おじいちゃんコンビニ');
  assert.deepEqual(Array.from(await registry.getFunction('getCard')('card_01')), [true, owner.address, true, owner.address, 'おじいちゃんコンビニ']);
  await rejects(() => registry.connect(owner).getFunction('register')('card_01', 'overwrite'), 'AlreadyRegistered');
  await rejects(() => registry.getFunction('issue')('card_01', other.address), 'CardAlreadyIssued');
});
test('issuer authority, zero addresses, card ID boundaries and unissued registration', async () => {
  const { registry, owner, issuer } = await setup();
  await rejects(() => new ContractFactory(abi, artifact.bytecode, issuer).deploy(ZeroAddress), 'InvalidWallet');
  await rejects(() => registry.connect(owner).getFunction('issue')('ok', owner.address), 'UnauthorizedIssuer');
  await (await registry.getFunction('issue')('open', ZeroAddress)).wait();
  await (await registry.connect(owner).getFunction('register')('open', 'any wallet')).wait();
  assert.equal((await registry.getFunction('getCard')('open')).owner, owner.address);
  for (const id of ['', 'x'.repeat(65), 'a b', '証明', 'a.b', 'a/b']) await rejects(() => registry.getFunction('issue')(id, owner.address), 'InvalidCardId');
  for (const id of ['a', 'x'.repeat(64), 'AZaz09_-']) await (await registry.getFunction('issue')(id, owner.address)).wait();
  await rejects(() => registry.connect(owner).getFunction('register')('missing', 'name'), 'CardNotFound');
});
test('UTF8 nickname limits and concurrent registration preserve first owner', async () => {
  const { registry, owner } = await setup();
  for (const [id, nickname] of [['one', 'a'], ['max', 'あ'.repeat(32)]]) {
    await (await registry.getFunction('issue')(id, owner.address)).wait();
    await (await registry.connect(owner).getFunction('register')(id, nickname)).wait();
  }
  await (await registry.getFunction('issue')('race', owner.address)).wait();
  for (const nickname of ['', 'x'.repeat(97), 'あ'.repeat(33)]) await rejects(() => registry.connect(owner).getFunction('register')('race', nickname), 'InvalidNicknameLength');
  await hre.network.provider.send('evm_setAutomine', [false]);
  try {
    const nonce = await owner.getNonce();
    const first = await registry.connect(owner).getFunction('register')('race', 'first', { nonce, gasLimit: 200000 });
    const second = await registry.connect(owner).getFunction('register')('race', 'second', { nonce: nonce + 1, gasLimit: 200000 });
    await hre.network.provider.send('evm_mine');
    assert.equal((await first.wait())?.status, 1);
    await assert.rejects(() => second.wait());
    assert.equal((await registry.getFunction('getCard')('race')).nickname, 'first');
  } finally { await hre.network.provider.send('evm_setAutomine', [true]); }
});

test('open card accepts different wallets and the first registration wins', async () => {
  const { registry, owner, other } = await setup();
  await (await registry.getFunction('issue')('open-first', ZeroAddress)).wait();
  await (await registry.connect(other).getFunction('register')('open-first', 'first')).wait();
  await rejects(() => registry.connect(owner).getFunction('register')('open-first', 'second'), 'AlreadyRegistered');
  assert.equal((await registry.getFunction('getCard')('open-first')).owner, other.address);
  await (await registry.getFunction('issue')('open-next', ZeroAddress)).wait();
  await (await registry.connect(owner).getFunction('register')('open-next', 'next')).wait();
  assert.equal((await registry.getFunction('getCard')('open-next')).owner, owner.address);
});
