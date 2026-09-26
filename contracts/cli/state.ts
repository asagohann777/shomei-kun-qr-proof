// SPDX-License-Identifier: MIT
import { constants } from 'node:fs';
import { open, rename, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { z } from 'zod';
import { Transaction, getAddress, keccak256 } from 'ethers';

export const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).transform(getAddress);
const hash = z.string().regex(/^0x[0-9a-fA-F]{64}$/);
export const cardId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const operationSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('deploy'), bytecodeHash: hash }).strict(),
  z.object({ kind: z.literal('issue'), contract: address, cardId, wallet: address }).strict(),
]);
export const stateSchema = z.object({
  version: z.literal(1), chainId: z.number().int().positive().safe(), issuer: address,
  label: z.string().min(1), contractVersion: z.string().min(1), operation: operationSchema,
  nonce: z.number().int().nonnegative(), rawTransaction: z.string().regex(/^0x[0-9a-fA-F]+$/), transactionHash: hash,
}).strict();
export type State = z.infer<typeof stateSchema>;
export type Operation = State['operation'];

export async function loadState(file: string): Promise<State | null> {
  let handle;
  try { handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW); }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw new Error('Cannot open state file');
  }
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || (stat.mode & 0o077) !== 0) throw new Error('State file must have mode 0600');
    const result = stateSchema.safeParse(JSON.parse(await handle.readFile('utf8')));
    if (!result.success) throw new Error('Invalid state file');
    const state = result.data;
    const tx = Transaction.from(state.rawTransaction);
    if (keccak256(state.rawTransaction) !== state.transactionHash || tx.from !== state.issuer || tx.chainId !== BigInt(state.chainId) || tx.nonce !== state.nonce) throw new Error('State transaction mismatch');
    return state;
  } finally { await handle.close(); }
}

export async function saveState(file: string, state: State): Promise<void> {
  const temporary = `${file}.${process.pid}.tmp`;
  const handle = await open(temporary, 'wx', 0o600);
  try { await handle.writeFile(JSON.stringify(state)); await handle.sync(); }
  finally { await handle.close(); }
  await rename(temporary, file);
  const directory = await open(dirname(file), constants.O_RDONLY);
  try { await directory.sync(); } finally { await directory.close(); }
}

export async function withStateLock<T>(file: string, run: () => Promise<T>): Promise<T> {
  const lock = `${file}.lock`;
  const handle = await open(lock, 'wx', 0o600).catch(() => { throw new Error('State is locked. Verify no issuer process is running before removing the lock.'); });
  try { await handle.writeFile(String(process.pid)); return await run(); }
  finally { await handle.close(); await unlink(lock); }
}
