// SPDX-License-Identifier: MIT
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const envFile = ".open-next/cloudflare/next-env.mjs";
const compiled = await import(new URL(`../${envFile}`, import.meta.url));
const values = Object.values(compiled).flatMap(env => Object.entries(env)
  .filter(([name, value]) => /KEY|SECRET|PASSWORD|TOKEN|RPC_URL/.test(name) && typeof value === "string" && value.length >= 8)
  .map(([, value]) => value));
await writeFile(envFile, "export const production = {};\nexport const development = {};\nexport const test = {};\n");
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else {
      const bytes = await readFile(path);
      if (values.some(value => bytes.includes(Buffer.from(value)))) throw new Error(`Embedded credential remains in ${path}`);
    }
  }
}
await check(".open-next");
console.log("Worker uses runtime bindings only; embedded credential check passed.");
