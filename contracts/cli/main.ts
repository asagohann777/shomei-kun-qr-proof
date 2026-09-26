// SPDX-License-Identifier: MIT
import { createInterface } from 'node:readline/promises';
import { createEnsResolver, confirmEnsRecipient, recheckEnsRecipient, EnsError } from './ens';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { JsonRpcProvider, Wallet, ZeroAddress, keccak256 } from 'ethers';
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
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { state: { type: 'string' }, keystore: { type: 'string' }, 'card-id': { type: 'string' }, wallet: { type: 'string' }, 'recipient-ens': { type: 'string' }, rebroadcast: { type: 'boolean', default: false }, help: { type: 'boolean' } } });
  if (values.help) {
    process.stdout.write('issuer deploy --state FILE --keystore FILE\nissuer issue --card-id ID [--wallet ADDRESS | --recipient-ens NAME] --state FILE --keystore FILE\nissuer show --card-id ID\nissuer resume --state FILE [--rebroadcast]\n'); return;
  }
  const command = z.enum(['deploy', 'issue', 'show', 'resume']).parse(positionals[0]);
  if (positionals.length !== 1 || (values.rebroadcast && command !== 'resume')) throw new Error('Invalid command arguments');
  if (values['recipient-ens'] !== undefined && (values.wallet !== undefined || command !== 'issue')) throw new Error('ENS and wallet are mutually exclusive and only valid for issue');
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
        const ens = values['recipient-ens'] !== undefined ? createEnsResolver(process.env.ENS_SEPOLIA_RPC_URL) : undefined;
        try {
          const recipient = ens ? await confirmEnsRecipient({
            name: values['recipient-ens'] ?? '', resolve: ens.resolve,
            requireEoa: async wallet => { await ens.requireEoa(wallet); if (await provider.getCode(wallet) !== '0x') throw new Error('ENS recipient must be an EOA on both chains'); },
            confirm: async resolved => {
              if (!process.stdin.isTTY) throw new Error('ENS confirmation requires an interactive terminal');
              const prompt = createInterface({ input: process.stdin, output: process.stderr });
              try { return (await prompt.question(`Sepolia ENS ${resolved.name} resolves to ${resolved.address}. Allow this wallet on chain ${context.chainId}? Type yes: `)).trim() === 'yes'; }
              finally { prompt.close(); }
            },
          }) : undefined;
          const keyFile = values.keystore ?? setting('ISSUER_KEYSTORE_PATH');
          const signer = await Wallet.fromEncryptedJson(await readFile(keyFile, 'utf8'), await password());
          const operation = command === 'deploy' ? { kind: 'deploy' as const, bytecodeHash: keccak256(artifact.bytecode) } : { kind: 'issue' as const, contract: address.parse(setting('REGISTRY_ADDRESS')), cardId: cardId.parse(values['card-id']), wallet: address.parse(recipient?.address ?? values.wallet ?? ZeroAddress) };
          result = await execute(context, operation, state, signer, ens && recipient ? { recipient, recheck: () => recheckEnsRecipient(recipient, ens.resolve) } : undefined);
        } finally { ens?.destroy(); }
      }
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { provider.destroy(); }
}
main().catch(error => { if (error instanceof EnsError) process.stderr.write(`${error.code}\n`); process.stderr.write('Issuer operation failed. Check command, configuration, network, and saved state. No automatic resend was performed.\n'); process.exitCode = 1; });
