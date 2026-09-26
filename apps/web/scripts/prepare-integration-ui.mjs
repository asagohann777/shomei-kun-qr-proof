import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { parseEnv } from 'node:util';

const ui = new URL('../../../prototypes/mobile-ui/', import.meta.url);
let local = {};
try { local = parseEnv(await readFile('.env.local', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const env = { ...local, ...process.env };
const origin = env.UI_API_BASE_URL ?? 'https://shomei-kun-integration.dptr.workers.dev';
const rpcOrigin = env.UI_RPC_ORIGIN ?? (env.CURVEGRID_PUBLIC_WEB3_RPC_URL ? new URL(env.CURVEGRID_PUBLIC_WEB3_RPC_URL).origin : undefined);
execFileSync(process.execPath, ['scripts/build.mjs', '--integration'], {
  cwd: ui,
  stdio: 'inherit',
  env: {
    PATH: process.env.PATH, HOME: process.env.HOME,
    UI_CAMERA_MODE: env.UI_CAMERA_MODE ?? 'mock',
    UI_API_MODE: 'live', UI_WALLET_MODE: env.UI_WALLET_MODE ?? 'metamask',
    UI_API_BASE_URL: origin, UI_PUBLIC_URL: env.UI_PUBLIC_URL ?? `${origin}/ui/`,
    UI_SAMPLE_CARD_ID: env.UI_SAMPLE_CARD_ID ?? 'mobile-ui-20260926-manual',
    ...(rpcOrigin ? { UI_RPC_ORIGIN: rpcOrigin } : {}),
  },
});
await mkdir('public', { recursive: true });
await rm('public/ui', { recursive: true, force: true });
await cp(new URL('dist-integration/', ui), 'public/ui', { recursive: true });
const headers = await readFile('public/ui/_headers', 'utf8');
await writeFile('public/_headers', headers.replace(/^\/\*/, '/ui/*'));
await rm('public/ui/_headers');
console.log('Integration UI assets prepared. Only public settings passed to UI build.');
