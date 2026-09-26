const addressPattern = /^0x[0-9a-f]{40}$/i;
const hashPattern = /^0x[0-9a-f]{64}$/i;
const sameAddress = (a, b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
const failure = (code) => Object.assign(new Error(code), { code });
const hexChain = (chainId) => `0x${chainId.toString(16)}`;

function injectedMetaMask() {
  const ethereum = globalThis.window?.ethereum;
  return ethereum?.providers?.find((provider) => provider.isMetaMask) ?? (ethereum?.isMetaMask ? ethereum : null);
}

async function sdkClient(options) {
  const { createEVMClient } = await import('@metamask/connect-evm');
  return createEVMClient(options);
}

export async function createMetaMaskWallet({ network, dappUrl, onChange = () => {}, injectedProvider = injectedMetaMask, createClient = sdkClient }) {
  if (!Number.isSafeInteger(network?.chainId) || network.chainId <= 0 || !Array.isArray(network.rpcUrls) || !network.rpcUrls.length) throw failure('INVALID_NETWORK');
  let provider;
  let client;
  let initialization;
  let connecting;
  let connected = false;
  let disposed = false;
  let sending = false;
  let revision = 0;
  let session = 0;
  const targetChain = hexChain(network.chainId);

  function ensureActive() {
    if (disposed) throw failure('WALLET_DISPOSED');
  }

  async function snapshot() {
    ensureActive();
    if (!provider || !connected) return null;
    const epoch = revision;
    const [accounts, chain] = await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    ensureActive();
    if (epoch !== revision || !connected) throw failure('WALLET_CHANGED');
    if (!Array.isArray(accounts) || accounts.some((account) => !addressPattern.test(account)) || typeof chain !== 'string' || !/^0x[0-9a-f]+$/i.test(chain)) throw failure('INVALID_WALLET_RESPONSE');
    const chainId = Number(BigInt(chain));
    if (!Number.isSafeInteger(chainId) || chainId <= 0) throw failure('INVALID_WALLET_RESPONSE');
    return accounts.length ? { address: accounts[0], chainId } : null;
  }

  function changed() {
    revision += 1;
    if (disposed || !connected) return;
    onChange(null);
    const epoch = revision;
    snapshot().then((value) => { if (!disposed && connected && epoch === revision) onChange(value); }).catch(() => {});
  }

  function disconnected() {
    revision += 1;
    connected = false;
    if (!disposed) onChange(null);
  }

  function detach() {
    provider?.removeListener?.('accountsChanged', changed);
    provider?.removeListener?.('chainChanged', changed);
    provider?.removeListener?.('disconnect', disconnected);
  }

  async function initialize() {
    ensureActive();
    if (provider) return;
    if (!initialization) initialization = (async () => {
      const injected = injectedProvider();
      if (injected) provider = injected;
      else {
        client = await createClient({
          dapp: { name: '証明くん', url: dappUrl },
          api: { supportedNetworks: { [targetChain]: network.rpcUrls[0] } },
          analytics: { enabled: false },
          ui: { headless: true },
          mobile: { useDeeplink: false },
          skipAutoAnnounce: true,
        });
        ensureActive();
        provider = client.getProvider();
      }
      if (!provider || typeof provider.request !== 'function' || typeof provider.on !== 'function' || typeof provider.removeListener !== 'function') {
        provider = undefined;
        throw failure('INVALID_WALLET_PROVIDER');
      }
      provider.on('accountsChanged', changed);
      provider.on('chainChanged', changed);
      provider.on('disconnect', disconnected);
    })().finally(() => { initialization = undefined; });
    return initialization;
  }

  async function connect() {
    ensureActive();
    if (!connecting) connecting = (async () => {
      const generation = session;
      await initialize();
      if (client) await client.connect({ chainIds: [targetChain] });
      else await provider.request({ method: 'eth_requestAccounts' });
      ensureActive();
      if (generation !== session) throw failure('WALLET_CHANGED');
      connected = true;
      const value = await snapshot();
      onChange(value);
      return value;
    })().finally(() => { connecting = undefined; });
    return connecting;
  }

  async function switchChain() {
    ensureActive();
    if (!provider || !connected) throw failure('WALLET_NOT_CONNECTED');
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetChain }] });
    } catch (error) {
      if (error?.code !== 4902) throw error;
      await provider.request({ method: 'wallet_addEthereumChain', params: [{
        chainId: targetChain, chainName: network.name,
        nativeCurrency: network.nativeCurrency, rpcUrls: network.rpcUrls,
      }] });
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetChain }] });
    }
    const value = await snapshot();
    if (!value || value.chainId !== network.chainId) throw failure('CHAIN_MISMATCH');
    return value;
  }

  async function send(transaction, expected) {
    ensureActive();
    if (sending) throw failure('WALLET_REQUEST_PENDING');
    if (!expected || !addressPattern.test(expected.address) || expected.chainId !== network.chainId || transaction?.chainId !== expected.chainId || !sameAddress(transaction.from, expected.address) || !addressPattern.test(transaction.to) || transaction.value !== '0' || typeof transaction.data !== 'string' || !/^0x(?:[0-9a-f]{2}){4,}$/i.test(transaction.data)) throw failure('INVALID_TRANSACTION');
    sending = true;
    try {
      const epoch = revision;
      const current = await snapshot();
      ensureActive();
      if (epoch !== revision || !current || !sameAddress(current.address, expected.address) || current.chainId !== expected.chainId) throw failure('WALLET_CHANGED');
      const hash = await provider.request({ method: 'eth_sendTransaction', params: [{
        from: current.address, to: transaction.to, data: transaction.data,
        chainId: hexChain(current.chainId), value: '0x0',
      }] });
      if (typeof hash !== 'string' || !hashPattern.test(hash)) throw failure('INVALID_TRANSACTION_HASH');
      return hash;
    } finally { sending = false; }
  }

  async function disconnect() {
    ensureActive();
    session += 1;
    disconnected();
    if (client) await client.disconnect();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    connected = false;
    revision += 1;
    detach();
  }

  return { connect, snapshot, switchChain, send, disconnect, dispose };
}
