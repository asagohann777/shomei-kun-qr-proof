import { Interface } from 'ethers';
import artifact from '../../../contracts/abi/OwnershipRegistry.json' with { type: 'json' };
import { CardId, Address, TransactionHash } from '../../../apps/web/src/generated/validators.js';
import { createLiveApi, LiveError } from './live-api.js';

const contract = new Interface(artifact.abi);
const same = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
const busy = new Set(['preparing', 'approval', 'pending', 'unknown']);
const code = error => typeof error?.code === 'string' ? error.code : 'UPSTREAM_UNAVAILABLE';
const validNickname = value => typeof value === 'string' && value.isWellFormed() && new TextEncoder().encode(value).length > 0 && new TextEncoder().encode(value).length <= 96;

export function createLiveRegistration(config, changed, dependencies = {}) {
  if (config.apiMode !== 'live' || !['mock', 'metamask'].includes(config.walletMode)) throw new LiveError('INVALID_CONFIG');
  const api = createLiveApi(config.apiBaseUrl, dependencies.fetch ?? globalThis.fetch.bind(globalThis));
  let storage = dependencies.storage;
  if (!storage) { try { storage = globalThis.localStorage; } catch { /* Submission reports unavailable storage. */ } }
  const locks = dependencies.locks ?? globalThis.navigator?.locks;
  const setTimer = dependencies.setTimeout ?? globalThis.setTimeout;
  const clearTimer = dependencies.clearTimeout ?? globalThis.clearTimeout;
  const walletFactory = dependencies.walletFactory ?? (async options => (await import('./metamask-wallet.js')).createMetaMaskWallet(options));
  let state = { read: { kind: 'loading' }, wallet: { kind: 'disconnected' }, registration: { kind: 'idle' }, walletRevision: 0, canRegister: false };
  let wallet, cardId, generation = 0, disposed = false, timer, attempt, polls = 0, checking = null, submitting = false;
  const snapshot = () => structuredClone(state);
  function emit() {
    state.canRegister = config.walletMode === 'metamask' && state.read.kind === 'ready' && state.read.card.status === 'unregistered' && state.wallet.kind === 'connected' && state.wallet.chainId === state.read.connection.registry.chainId && !busy.has(state.registration.kind) && !submitting;
    if (!disposed) changed(snapshot());
  }
  function registration(next) { state.registration = next; emit(); }
  function setWallet(value) {
    const next = value ? { kind: 'connected', address: value.address, chainId: value.chainId } : { kind: 'disconnected' };
    if (JSON.stringify(next) !== JSON.stringify(state.wallet)) state.walletRevision++;
    state.wallet = next; emit();
  }
  function identity(card, connection) {
    if (connection.status !== 'ready' || card.cardId !== cardId || connection.network.chainId !== connection.registry.chainId || card.registry.chainId !== connection.registry.chainId || !same(card.registry.contractAddress, connection.registry.contractAddress) || !same(card.registry.issuer, connection.registry.issuer)) throw new LiveError('CONNECTION_MISMATCH');
    return { api: config.apiBaseUrl.replace(/\/$/, ''), chainId: card.registry.chainId, contract: card.registry.contractAddress.toLowerCase(), cardId: card.cardId };
  }
  const key = a => `shomei.live.v1:${encodeURIComponent(a.api)}:${a.chainId}:${a.contract}:${encodeURIComponent(a.cardId)}`;
  function save(a) { try { storage.setItem(key(a), JSON.stringify(a)); } catch { throw new LiveError('STORAGE_UNAVAILABLE'); } }
  function load(id) {
    let raw;
    try { raw = storage.getItem(key(id)); } catch { throw new LiveError('STORAGE_UNAVAILABLE'); }
    if (!raw) return null;
    let saved;
    try { saved = JSON.parse(raw); } catch { throw new LiveError('INVALID_SAVED_ATTEMPT'); }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved) || saved.version !== 1 || Object.keys(id).some(k => saved[k] !== id[k]) || !Address(saved.account) || !validNickname(saved.nickname) || (saved.hash !== null && !TransactionHash(saved.hash)) || !['approval', 'pending', 'unknown', 'confirmed', 'reverted', 'rejected'].includes(saved.status)) throw new LiveError('INVALID_SAVED_ATTEMPT');
    return saved;
  }
  function restore(saved) {
    attempt = saved;
    if (!saved) state.registration = { kind: 'idle' };
    else if (saved.hash) state.registration = { kind: 'pending', hash: saved.hash };
    else state.registration = { kind: saved.status === 'rejected' ? 'idle' : 'unknown' };
  }
  async function open(id) {
    const current = ++generation; cardId = id; attempt = null; polls = 0; clearTimer(timer);
    state.read = { kind: 'loading' }; state.registration = { kind: 'idle' }; emit();
    if (!CardId(id)) { state.read = { kind: 'not-found' }; emit(); return; }
    try {
      const [connection, card] = await Promise.all([api.connection(), api.card(id)]);
      if (current !== generation || disposed) return;
      const context = identity(card, connection);
      state.read = { kind: 'ready', card, connection };
      try { restore(load(context)); } catch (error) {
        if (code(error) !== 'STORAGE_UNAVAILABLE') registration({ kind: 'unknown', errorCode: code(error) });
      }
      emit();
      if (attempt?.hash) await recheck();
    } catch (error) {
      if (current !== generation || disposed) return;
      state.read = { kind: code(error) === 'CARD_NOT_FOUND' ? 'not-found' : 'unavailable', errorCode: code(error) }; emit();
    }
  }
  async function connect() {
    if (config.walletMode !== 'metamask' || state.read.kind !== 'ready' || state.wallet.kind === 'connecting' || busy.has(state.registration.kind)) return;
    state.wallet = { kind: 'connecting' }; emit();
    try {
      wallet ??= await walletFactory({ network: state.read.connection.network, dappUrl: globalThis.location?.href ?? 'https://localhost/', onChange: setWallet });
      setWallet(await wallet.connect());
    } catch (error) { setWallet(null); registration({ kind: error?.code === 4001 ? 'rejected' : 'failed', errorCode: code(error) }); }
  }
  async function switchChain() {
    if (!wallet || state.read.kind !== 'ready' || busy.has(state.registration.kind)) return;
    try { await wallet.switchChain(); setWallet(await wallet.snapshot()); }
    catch (error) { registration({ kind: error?.code === 4001 ? 'rejected' : 'failed', errorCode: code(error) }); }
  }
  async function register(nickname) {
    if (submitting || busy.has(state.registration.kind) || config.walletMode !== 'metamask') return;
    if (!validNickname(nickname)) { registration({ kind: 'failed', errorCode: 'INVALID_INPUT' }); return; }
    if (!wallet || state.read.kind !== 'ready' || state.read.card.status !== 'unregistered') return;
    if (!locks?.request) { registration({ kind: 'failed', errorCode: 'LOCKS_UNAVAILABLE' }); return; }
    const current = generation, context = identity(state.read.card, state.read.connection);
    submitting = true; registration({ kind: 'preparing' });
    try {
      await locks.request(key(context), { ifAvailable: true }, async lock => {
        if (!lock) throw new LiveError('REGISTRATION_IN_PROGRESS');
        const existing = load(context);
        if (existing && !['rejected', 'reverted'].includes(existing.status)) { if (current === generation) { restore(existing); emit(); } return; }
        const before = await wallet.snapshot(); setWallet(before);
        if (!before || !Address(before.address)) throw new LiveError('WALLET_DISCONNECTED');
        if (before.chainId !== context.chainId) throw new LiveError('CHAIN_MISMATCH');
        const revision = state.walletRevision;
        const prepared = await api.prepare(context.cardId, { walletAddress: before.address, chainId: before.chainId, nickname });
        const after = await wallet.snapshot(); setWallet(after);
        if (current !== generation || disposed || revision !== state.walletRevision || !after || !same(before.address, after.address) || before.chainId !== after.chainId) throw new LiveError('WALLET_CHANGED');
        const tx = prepared.transaction;
        if (prepared.cardId !== context.cardId || prepared.nickname !== nickname || tx.chainId !== context.chainId || !same(tx.from, before.address) || !same(tx.to, context.contract) || tx.value !== '0' || !same(tx.data, contract.encodeFunctionData('register', [context.cardId, nickname]))) throw new LiveError('TRANSACTION_MISMATCH');
        const sending = { version: 1, ...context, account: before.address, nickname, hash: null, status: 'approval' };
        save(sending); attempt = sending; registration({ kind: 'approval' });
        try {
          const hash = await wallet.send(tx, { address: before.address, chainId: before.chainId });
          if (!TransactionHash(hash)) throw new LiveError('INVALID_TRANSACTION_HASH');
          sending.hash = hash; sending.status = 'pending';
          try { save(sending); } catch { if (current === generation) registration({ kind: 'unknown', hash, errorCode: 'STORAGE_UNAVAILABLE' }); return; }
          if (current !== generation || disposed) return;
          attempt = sending; polls = 0; registration({ kind: 'pending', hash }); await recheck();
        } catch (error) {
          sending.status = error?.code === 4001 ? 'rejected' : 'unknown';
          try { save(sending); } catch { /* Original approval marker still prevents blind resend. */ }
          if (current === generation && !disposed) registration({ kind: sending.status, ...(sending.hash ? { hash: sending.hash } : {}), errorCode: code(error) });
        }
      });
    } catch (error) { if (current === generation && !disposed) registration({ kind: 'failed', errorCode: code(error) }); }
    finally { submitting = false; emit(); }
  }
  async function recheck(hash) {
    if (checking === generation || disposed || state.read.kind !== 'ready') return;
    if (hash !== undefined) {
      if (!TransactionHash(hash) || !attempt) { registration({ kind: 'unknown', errorCode: 'INVALID_INPUT' }); return; }
      attempt = { ...attempt, hash, status: 'unknown' };
      try { save(attempt); } catch (error) { registration({ kind: 'unknown', hash, errorCode: code(error) }); return; }
    }
    if (!attempt?.hash) {
      try {
        const stored = load(identity(state.read.card, state.read.connection));
        if (stored?.hash) { attempt = stored; restore(stored); emit(); }
      } catch (error) {
        if (attempt || code(error) !== 'STORAGE_UNAVAILABLE') registration({ kind: 'unknown', errorCode: code(error) });
        return;
      }
    }
    if (!attempt?.hash) return;
    const current = generation, active = attempt;
    checking = current; clearTimer(timer);
    try {
      const result = await api.transaction(active.cardId, active.hash);
      if (current !== generation || disposed) return;
      if (result.cardId !== active.cardId || !same(result.transactionHash, active.hash)) throw new LiveError('RECORD_MISMATCH');
      if (result.status === 'confirmed') {
        const card = await api.card(active.cardId);
        if (current !== generation || disposed) return;
        identity(card, state.read.connection);
        if (card.status !== 'registered' || !same(card.owner.address, active.account) || card.owner.nickname !== active.nickname || !same(result.owner.address, active.account) || result.owner.nickname !== active.nickname) throw new LiveError('RECORD_MISMATCH');
        state.read = { ...state.read, card };
      }
      active.status = result.status; save(active); registration({ kind: result.status, hash: active.hash });
      if (result.status === 'pending' && ++polls < 12) timer = setTimer(() => void recheck(), 2500);
      else if (result.status === 'pending') registration({ kind: 'unknown', hash: active.hash, errorCode: 'CONFIRMATION_TIMEOUT' });
    } catch (error) { if (current === generation && !disposed) registration({ kind: 'unknown', hash: active.hash, errorCode: code(error) }); }
    finally { if (checking === current) checking = null; }
  }
  async function disconnect() { if (wallet) await wallet.disconnect(); setWallet(null); }
  function dispose() { disposed = true; generation++; clearTimer(timer); wallet?.dispose(); }
  return { open, connect, switchChain, register, recheck, disconnect, dispose, getSnapshot: snapshot };
}
