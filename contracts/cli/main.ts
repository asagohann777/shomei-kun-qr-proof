import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { JsonRpcProvider, Wallet, keccak256 } from 'ethers';
import { z } from 'zod';
import artifact from '../abi/OwnershipRegistry.json';
import { execute, resume } from './issuer';
import { MultiBaas } from './multibaas';
import { address, cardId } from './state';

function setting(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing setting ${name}`);
  return value;
}
function url(name: string): string {
  const value = new URL(setting(name));
  if (value.username || value.password || value.hash || (value.protocol !== 'https:' && !(value.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(value.hostname)))) throw new Error(`Invalid setting ${name}`);
  return value.toString().replace(/\/$/, '');
}
async function password(): Promise<string> {
  if (!process.stdin.isTTY) throw new Error('Keystore password requires an interactive terminal');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let text = '';
    function finish() { process.stdin.off('data', onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stderr.write('\n'); }
    function onData(chunk: string) {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') { finish(); resolve(text); return; }
        if (char === '\u0003' || char === '\u0004') { finish(); reject(new Error('Cancelled')); return; }
        if (char === '\u007f' || char === '\b') text = Array.from(text).slice(0, -1).join('');
        else text += char;
      }
    }
    process.stdin.on('data', onData);
    process.stderr.write('Keystore password: ');
  });
}
async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { state: { type: 'string' }, keystore: { type: 'string' }, 'card-id': { type: 'string' }, wallet: { type: 'string' }, rebroadcast: { type: 'boolean', default: false }, help: { type: 'boolean' } } });
  if (values.help) {
    process.stdout.write('issuer deploy --state FILE --keystore FILE\nissuer issue --card-id ID --wallet ADDRESS --state FILE --keystore FILE\nissuer show --card-id ID\nissuer resume --state FILE [--rebroadcast]\n'); return;
  }
  const command = z.enum(['deploy', 'issue', 'show', 'resume']).parse(positionals[0]);
  if (positionals.length !== 1 || (values.rebroadcast && command !== 'resume')) throw new Error('Invalid command arguments');
  const config = { baseUrl: url('MULTIBAAS_BASE_URL'), apiKey: setting('MULTIBAAS_ADMIN_API_KEY'), label: setting('REGISTRY_CONTRACT_LABEL'), version: setting('REGISTRY_CONTRACT_VERSION') };
  if (!config.baseUrl.endsWith('/api/v0')) throw new Error('MULTIBAAS_BASE_URL must end in /api/v0');
  const api = new MultiBaas(config);
  const provider = new JsonRpcProvider(url('CURVEGRID_PUBLIC_WEB3_RPC_URL'), undefined, { cacheTimeout: -1 });
  try {
    const context = { provider, api, chainId: z.coerce.number().int().positive().safe().parse(setting('CHAIN_ID')), issuer: address.parse(setting('REGISTRY_ISSUER')), label: config.label, version: config.version, publicApiOrigin: url('PUBLIC_API_ORIGIN') };
    let result;
    if (command === 'show') {
      if ((await provider.getNetwork()).chainId !== BigInt(context.chainId) || await api.chainId() !== context.chainId) throw new Error('Chain mismatch');
      const contract = address.parse(setting('REGISTRY_ADDRESS'));
      await api.checkRegistry(contract, context.issuer);
      result = await api.getCard(contract, cardId.parse(values['card-id']));
    } else {
      const state = z.string().min(1).parse(values.state);
      if (command === 'resume') result = await resume(context, state, values.rebroadcast);
      else {
        const keyFile = values.keystore ?? setting('ISSUER_KEYSTORE_PATH');
        const signer = await Wallet.fromEncryptedJson(await readFile(keyFile, 'utf8'), await password());
        const operation = command === 'deploy' ? { kind: 'deploy' as const, bytecodeHash: keccak256(artifact.bytecode) } : { kind: 'issue' as const, contract: address.parse(setting('REGISTRY_ADDRESS')), cardId: cardId.parse(values['card-id']), wallet: address.parse(values.wallet) };
        result = await execute(context, operation, state, signer);
      }
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { provider.destroy(); }
}
main().catch(() => { process.stderr.write('Issuer operation failed. Check command, configuration, network, and saved state. No automatic resend was performed.\n'); process.exitCode = 1; });
