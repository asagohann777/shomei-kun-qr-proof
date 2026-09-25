import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import QRCode from 'qrcode';

const publicUrl = process.env.MOCK_PUBLIC_URL || 'https://shomei-kun-ui-mock.dptr.workers.dev';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await writeFile('dist/card-qr.svg', await QRCode.toString(`${publicUrl}/?scenario=registered`, { type: 'svg', margin: 1, color: { dark: '#172b4d', light: '#ffffff' } }));
execFileSync('node_modules/.bin/tailwindcss', ['-i', 'styles/input.css', '-o', 'dist/style.css', '--minify'], { stdio: 'inherit' });
console.log(`Built mobile mock. Card QR: ${publicUrl}/?scenario=registered`);
