// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';

const issuer = '0x1111111111111111111111111111111111111111';
const registry = '0x2222222222222222222222222222222222222222';
function run(args: string[], env: NodeJS.ProcessEnv = {}): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'cli/main.ts', ...args], { cwd: process.cwd(), env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.setEncoding('utf8').on('data', data => { stdout += data; });
    child.stderr.setEncoding('utf8').on('data', data => { stderr += data; });
    const timeout = setTimeout(() => { child.kill(); reject(new Error('CLI process timed out')); }, 10_000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('close', code => { clearTimeout(timeout); resolve({ code, stdout, stderr }); });
  });
}
test('actual CLI process prints help and sanitizes invalid commands', async () => {
  const help = await run(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /issuer deploy --state FILE --keystore FILE/);
  assert.match(help.stdout, /issuer resume --state FILE \[--rebroadcast\]/);
  const invalid = await run(['DO_NOT_PRINT']);
  assert.equal(invalid.code, 1);
  assert.equal(invalid.stdout, '');
  assert.match(invalid.stderr, /Issuer operation failed/);
  assert.equal(invalid.stderr.includes('DO_NOT_PRINT'), false);
});
test('actual show CLI reads synthetic local MultiBaas and RPC without a keystore', async () => {
  let rejectApi = false;
  const methods: string[] = [];
  const server = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    response.setHeader('Content-Type', 'application/json');
    if (request.url === '/rpc') {
      const payload = JSON.parse(body);
      const answer = (item: { id: number; method: string }) => ({ jsonrpc: '2.0', id: item.id, result: item.method === 'eth_chainId' ? '0x7a69' : null });
      response.end(JSON.stringify(Array.isArray(payload) ? payload.map(answer) : answer(payload)));
      return;
    }
    if (rejectApi) { response.statusCode = 401; response.end('SECRET_UPSTREAM_BODY'); return; }
    assert.equal(request.headers.authorization, 'Bearer SECRET_API_KEY');
    const method = request.url?.split('/').at(-1) ?? '';
    methods.push(method);
    const result = method === 'status' ? { chainID: 31337 }
      : method === 'issuer' ? { output: issuer }
        : method === 'schemaVersion' ? { output: '1' }
          : { output: [true, issuer, true, issuer, 'おじいちゃんコンビニ'] };
    response.end(JSON.stringify({ status: 200, result }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const origin = `http://127.0.0.1:${address.port}`;
  const env = { MULTIBAAS_BASE_URL: `${origin}/api/v0`, MULTIBAAS_ADMIN_API_KEY: 'SECRET_API_KEY', CURVEGRID_PUBLIC_WEB3_RPC_URL: `${origin}/rpc`, CHAIN_ID: '31337', REGISTRY_ISSUER: issuer, REGISTRY_ADDRESS: registry, REGISTRY_CONTRACT_LABEL: 'registry', REGISTRY_CONTRACT_VERSION: '1', PUBLIC_API_ORIGIN: origin, ISSUER_KEYSTORE_PATH: '' };
  try {
    const show = await run(['show', '--card-id', 'demo-001'], env);
    assert.equal(show.code, 0, show.stderr);
    assert.deepEqual(JSON.parse(show.stdout), { exists: true, allowedWallet: issuer, registered: true, owner: issuer, nickname: 'おじいちゃんコンビニ' });
    assert.deepEqual(methods, ['status', 'issuer', 'schemaVersion', 'getCard']);
    rejectApi = true;
    const failed = await run(['show', '--card-id', 'demo-001'], env);
    assert.equal(failed.code, 1);
    assert.equal(failed.stdout, '');
    assert.equal(failed.stderr.includes('SECRET_'), false);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});

test('terminal deploy, interrupted link, resume, issue and show use a generated encrypted wallet', async () => {
  const { default: hre } = await import('hardhat');
  const { BrowserProvider, Contract, Interface, Wallet, ZeroAddress } = await import('ethers');
  const { mkdtemp, writeFile, rm, stat } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const artifact = await import('../abi/OwnershipRegistry.json');
  const abi = new Interface(artifact.default.abi);
  await hre.network.provider.send('hardhat_reset');
  const provider = new BrowserProvider(hre.network.provider, undefined, { cacheTimeout: -1 });
  const wallet = Wallet.createRandom();
  const allowed = await (await provider.getSigner(1)).getAddress();
  await hre.network.provider.send('hardhat_setBalance', [wallet.address, '0x56BC75E2D63100000']);
  const directory = await mkdtemp(join(tmpdir(), 'issuer-terminal-'));
  const keyFile = join(directory, 'test.keystore.json');
  const password = 'ephemeral-test-password';
  await writeFile(keyFile, await wallet.encrypt(password), { mode: 0o600 });
  let library: unknown = null, linkedContract: string | null = null, startingBlock = 0, failLink = true;
  const server = createServer(async (request, response) => {
    try {
      let body = '';
      for await (const chunk of request) body += chunk;
      const input = body ? JSON.parse(body) : null;
      const path = request.url ?? '';
      response.setHeader('Content-Type', 'application/json');
      if (path === '/rpc') {
        const answer = async (item: { id: number; method: string; params: unknown[] }) => {
          try { return { jsonrpc: '2.0', id: item.id, result: await hre.network.provider.send(item.method, item.params) }; }
          catch { return { jsonrpc: '2.0', id: item.id, error: { code: -32000, message: 'Local RPC test failure' } }; }
        };
        response.end(JSON.stringify(Array.isArray(input) ? await Promise.all(input.map(answer)) : await answer(input)));
        return;
      }
      let result: unknown;
      if (path === '/api/v0/chains/ethereum/status') result = { chainID: 31337 };
      else if (path === '/api/v0/contracts') result = library ? [{ label: 'registry', version: '1' }] : [];
      else if (path === '/api/v0/contracts/registry' && request.method === 'POST') { library = input; result = {}; }
      else if (path === '/api/v0/contracts/registry/versions') result = { versions: ['1'] };
      else if (path === '/api/v0/contracts/registry/1') result = library;
      else if (path.endsWith('/deploy')) result = { submitted: false, tx: { from: wallet.address, to: null, data: artifact.default.bytecode + abi.encodeDeploy([wallet.address]).slice(2), value: '0' } };
      else if (path === '/api/v0/chains/ethereum/addresses') result = linkedContract ? [{ address: linkedContract }] : [];
      else if (path.endsWith('/contracts') && request.method === 'POST') {
        if (failLink) { response.statusCode = 503; response.end('synthetic interrupted link'); return; }
        linkedContract = path.split('/')[6] ?? null;
        startingBlock = Number(input.startingBlock);
        result = {};
      } else if (path.endsWith('/status')) result = { startBlockNumber: startingBlock };
      else if (!path.includes('/methods/')) result = { contracts: [{ label: 'registry', version: '1' }] };
      else {
        const address = path.split('/')[6];
        assert.ok(address);
        const method = path.split('/').at(-1);
        if (method === 'issue') result = { submitted: false, tx: { from: wallet.address, to: address, data: abi.encodeFunctionData('issue', input.args), value: '0' } };
        else {
          assert.ok(method);
          const output = await new Contract(address, abi, provider).getFunction(method)(...input.args);
          result = { output: typeof output === 'bigint' ? output.toString() : output };
        }
      }
      response.end(JSON.stringify({ status: 200, result }));
    } catch { response.statusCode = 500; response.end('Local test adapter failed'); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const origin = `http://127.0.0.1:${address.port}`;
  const env = { MULTIBAAS_BASE_URL: `${origin}/api/v0`, MULTIBAAS_ADMIN_API_KEY: 'test-only-key', CURVEGRID_PUBLIC_WEB3_RPC_URL: `${origin}/rpc`, CHAIN_ID: '31337', REGISTRY_ISSUER: wallet.address, REGISTRY_CONTRACT_LABEL: 'registry', REGISTRY_CONTRACT_VERSION: '1', PUBLIC_API_ORIGIN: origin };
  async function terminal(args: string[]) {
    const python = `import os,pty,select,subprocess,sys,json,time\nx=json.loads(sys.stdin.read())\nm,s=pty.openpty()\np=subprocess.Popen(x['command'],stdin=s,stdout=s,stderr=s,env=os.environ.copy())\nos.close(s)\nout=b''\nsent=False\nend=time.time()+20\nwhile time.time()<end:\n ready,_,_=select.select([m],[],[],0.1)\n if ready:\n  try: data=os.read(m,65536)\n  except OSError: break\n  if not data: break\n  out+=data\n  if not sent and b'Keystore password:' in out:\n   os.write(m,(x['password']+'\\n').encode());sent=True\n if p.poll() is not None and not ready: break\nelse: p.kill()\np.wait()\nos.close(m)\nprint(json.dumps({'code':p.returncode,'output':out.decode()}))`;
    return new Promise<{ code: number; output: string }>((resolve, reject) => {
      const child = spawn('python3', ['-c', python], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
      let output = '', error = '';
      child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk; });
      child.stderr.setEncoding('utf8').on('data', chunk => { error += chunk; });
      child.once('error', reject);
      child.once('close', code => { if (code !== 0) reject(new Error(error)); else resolve(JSON.parse(output)); });
      child.stdin.end(JSON.stringify({ command: [process.execPath, '--import', 'tsx', 'cli/main.ts', ...args], password }));
    });
  }
  try {
    const deploymentState = join(directory, 'deploy.json');
    const deployed = await terminal(['deploy', '--state', deploymentState, '--keystore', keyFile]);
    assert.equal(deployed.code, 1, deployed.output);
    assert.equal(deployed.output.includes(password), false);
    assert.equal(await provider.getTransactionCount(wallet.address), 1);
    assert.equal((await stat(deploymentState)).mode & 0o777, 0o600);
    failLink = false;
    const resumed = await run(['resume', '--state', deploymentState], env);
    assert.equal(resumed.code, 0, resumed.stderr);
    const result = JSON.parse(resumed.stdout);
    assert.equal(result.status, 'complete');
    assert.equal(startingBlock, 1);
    assert.equal(await provider.getTransactionCount(wallet.address), 1);
    Object.assign(env, { REGISTRY_ADDRESS: result.contract });
    const issueState = join(directory, 'issue.json');
    const issued = await terminal(['issue', '--card-id', 'terminal-001', '--wallet', allowed, '--state', issueState, '--keystore', keyFile]);
    assert.equal(issued.code, 0, issued.output);
    assert.match(issued.output, /"status": "complete"/);
    assert.equal(issued.output.includes(password), false);
    const show = await run(['show', '--card-id', 'terminal-001'], env);
    assert.equal(show.code, 0, show.stderr);
    assert.deepEqual(JSON.parse(show.stdout), { exists: true, allowedWallet: allowed, registered: false, owner: ZeroAddress, nickname: '' });
    const confirm = await run(['resume', '--state', issueState], env);
    assert.equal(confirm.code, 0, confirm.stderr);
    assert.equal(JSON.parse(confirm.stdout).status, 'complete');
    assert.equal(await provider.getTransactionCount(wallet.address), 2);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await rm(directory, { recursive: true, force: true });
    provider.destroy();
  }
});
