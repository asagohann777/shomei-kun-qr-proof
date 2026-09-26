// SPDX-License-Identifier: MIT
export function walletErrorCode(error) {
  const queue = [error];
  const seen = new Set();
  let fallback = 'WALLET_UNAVAILABLE';
  while (queue.length && seen.size < 12) {
    const value = queue.shift();
    if (!value || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);
    for (const code of [value.code, value.rpcCode]) {
      if ([4001, 4902, -32002].includes(Number(code))) return Number(code);
      if (fallback === 'WALLET_UNAVAILABLE' && Number.isInteger(code)) fallback = code;
    }
    queue.push(value.data, value.originalError, value.cause, value.error);
  }
  return typeof error?.code === 'string' && /^[A-Z_]{1,64}$/.test(error.code) ? error.code : fallback;
}

export function createWalletPreparation({ getWallet, chainId, changed, log = () => {}, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let state = { kind: 'idle' };
  let value = null;
  let pending = null;
  let running = false;
  let reconciling = false;
  let visible = true;
  let handedOff = false;
  let disposed = false;
  let nextStep = 'connect';
  let sequence = 0;
  let timer;
  const ready = () => value?.chainId === chainId;
  const emit = next => { state = next; if (!disposed) changed({ ...state }); };
  const paused = () => emit(ready() ? { kind: 'ready' } : { kind: 'paused', step: value ? nextStep === 'add' ? 'add' : 'switch' : 'connect' });
  function arm() {
    clearTimer(timer);
    if (!pending || !visible || pending.slow) return;
    pending.since = now();
    timer = setTimer(() => {
      if (!pending || !visible || disposed) return;
      pending.slow = true;
      log({ operation: 'walletPreparation', stage: pending.step, requestId: pending.id, code: 'RESPONSE_PENDING' });
      emit({ kind: 'pending', step: pending.step, requestId: pending.id, slow: true });
    }, Math.max(0, 60000 - pending.elapsed));
  }
  function setVisible(next) {
    if (visible === next) return;
    if (pending && visible && !pending.slow) pending.elapsed += now() - pending.since;
    visible = next;
    if (!visible) handedOff = true;
    arm();
  }
  async function request(step, call) {
    const id = `wallet-${++sequence}`;
    pending = { id, step, elapsed: 0, since: now(), slow: false };
    log({ operation: 'walletPreparation', stage: step, requestId: id, code: 'REQUESTED' });
    emit({ kind: 'pending', step, requestId: id, slow: false });
    arm();
    try { return await call(); }
    finally {
      clearTimer(timer); pending = null;
      log({ operation: 'walletPreparation', stage: step, requestId: id, code: 'SETTLED' });
    }
  }
  function walletChanged(current) {
    const unchanged = current?.address === value?.address && current?.chainId === value?.chainId;
    value = current;
    if (unchanged || disposed || running || reconciling) return;
    nextStep = value ? 'switch' : 'connect';
    paused();
  }
  async function prepare() {
    if (disposed || running || reconciling || !visible || state.kind === 'blocked') return;
    running = true;
    handedOff = false;
    let step = value ? nextStep === 'add' ? 'add' : 'switch' : 'connect';
    try {
      // Initialization is part of the timed request; a stalled SDK must remain recoverable.
      value = await request('check', async () => (await getWallet()).restore());
      if (disposed) return;
      if (ready()) { emit({ kind: 'ready' }); return; }
      if (!value) step = 'connect';
      else if (step === 'connect') step = 'switch';
      while (!disposed) {
        nextStep = step;
        if (!visible || handedOff) { paused(); return; }
        try {
          value = await request(step, async () => {
            const wallet = await getWallet();
            return step === 'connect' ? wallet.connect() : step === 'add' ? wallet.addChain() : wallet.switchChain();
          });
        } catch (error) {
          if (disposed) return;
          if (step === 'switch' && walletErrorCode(error) === 4902) { step = 'add'; continue; }
          throw error;
        }
        if (disposed) return;
        if (ready()) { emit({ kind: 'ready' }); return; }
        if (!value) throw Object.assign(new Error('Disconnected'), { code: 'WALLET_DISCONNECTED' });
        step = 'switch';
      }
    } catch (error) {
      if (disposed) return;
      const errorCode = walletErrorCode(error);
      nextStep = step;
      log({ operation: 'walletPreparation', stage: step, requestId: `wallet-${sequence}`, code: String(errorCode) });
      emit({ kind: errorCode === 4001 ? 'rejected' : errorCode === -32002 ? 'blocked' : 'failed', step, errorCode });
    } finally { running = false; }
  }
  async function resume() {
    if (disposed || !visible || reconciling) return;
    reconciling = true;
    const previous = state;
    const wasRunning = running;
    const revision = sequence;
    log({ operation: 'walletPreparation', stage: 'resume', code: 'CHECKING' });
    try {
      const read = async () => (await getWallet()).restore();
      const current = running ? await read() : await request('check', read);
      if (disposed || (wasRunning && (!running || revision !== sequence))) return;
      value = current;
      if (!disposed && !running) {
        if (previous.kind === 'blocked' && !ready()) emit(previous);
        else paused();
      }
    } catch (error) {
      if (wasRunning && (!running || revision !== sequence)) return;
      if (!disposed && !running) {
        const errorCode = walletErrorCode(error);
        log({ operation: 'walletPreparation', stage: 'check', code: String(errorCode) });
        emit({ kind: 'failed', step: 'check', errorCode });
      }
    } finally { reconciling = false; }
  }
  function dispose() { disposed = true; clearTimer(timer); }
  return { prepare, resume, setVisible, walletChanged, dispose, getSnapshot: () => ({ ...state }) };
}
