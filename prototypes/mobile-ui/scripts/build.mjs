import { mkdir, rm, cp, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import QRCode from 'qrcode';
import { uiConfig } from './ui-config.mjs';

const config = uiConfig(process.env);
const output = process.argv.includes('--integration') ? 'dist-integration' : 'dist';
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('public', output, { recursive: true });
const cardUrl = new URL(config.publicUrl);
cardUrl.search = config.apiMode === 'live' ? new URLSearchParams({ cardId: config.cardId }) : '?scenario=registered';
await writeFile(`${output}/card-qr.svg`, await QRCode.toString(cardUrl.href, { type: 'svg', margin: 1, color: { dark: '#172b4d', light: '#ffffff' } }));
await build({ entryPoints: ['public/app.js'], bundle: true, splitting: true, format: 'esm', platform: 'browser', target: ['es2022'], outdir: output, minify: true,
  define: { __UI_CONFIG__: JSON.stringify(config), 'process.env.NODE_ENV': '"production"' },
  alias: {
    'ajv/dist/runtime/ucs2length.js': resolve('node_modules/ajv/dist/runtime/ucs2length.js'),
    '@metamask/mobile-wallet-protocol-core': resolve('node_modules/@metamask/mobile-wallet-protocol-core/dist/index.mjs'),
    '@metamask/mobile-wallet-protocol-dapp-client': resolve('node_modules/@metamask/mobile-wallet-protocol-dapp-client/dist/index.mjs'),
    eciesjs: resolve('src/metamask-ecies.js'),
  },
});
if (config.apiMode === 'live') {
  let headers = await readFile('public/_headers', 'utf8');
  const connect = ["'self'", config.apiBaseUrl];
  if (config.walletMode === 'metamask') connect.push(config.rpcOrigin, 'wss://mm-sdk-relay.api.cx.metamask.io');
  headers = headers.replace("connect-src 'self'", `connect-src ${connect.join(' ')}`);
  await writeFile(`${output}/_headers`, headers);
  const html = (await readFile('public/index.html', 'utf8')).replace('証明くん | UIモック', '証明くん | Testnet').replace('証明くんのカード登録・公開確認を相談するためのUIモック。実際の登録は行いません。', 'カードの登録所有者を確認し、本人ウォレットで登録します。');
  await writeFile(`${output}/index.html`, html);
}
execFileSync('node_modules/.bin/tailwindcss', ['-i', 'styles/input.css', '-o', `${output}/style.css`, '--minify'], { stdio: 'inherit' });
console.log(`Built ${config.apiMode}/${config.walletMode} UI in ${output}. Card QR: ${cardUrl.href}`);
