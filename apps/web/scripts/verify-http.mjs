// SPDX-License-Identifier: MIT
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const target = process.argv[2];
const live = target === "next-live" || target === "worker-live";
const worker = target === "worker" || target === "worker-live";
if (!["next", "worker", "next-live", "worker-live"].includes(target)) throw new Error("Expected next, worker, next-live or worker-live");
const port = worker ? 8789 : 3107;
const base = `http://127.0.0.1:${port}`;
const args = !worker
  ? ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)]
  : ["node_modules/wrangler/bin/wrangler.js", "dev", "--local", "--env-file", "tests/runtime.env", "--ip", "127.0.0.1", "--port", String(port), ...(live ? ["--config", "wrangler.integration.jsonc", "--var", `PUBLIC_API_ORIGIN:${base}`] : [])];
const runtimeEnv = { ...process.env };
for (const key of ["MULTIBAAS_BASE_URL", "MULTIBAAS_API_KEY", "CHAIN_ID", "REGISTRY_ADDRESS", "REGISTRY_ISSUER", "REGISTRY_CONTRACT_LABEL", "REGISTRY_CONTRACT_VERSION", "REGISTRY_DEPLOYMENT_BLOCK", "CURVEGRID_PUBLIC_WEB3_RPC_URL", "ALLOWED_UI_ORIGINS"]) runtimeEnv[key] = "";
const server = spawn(process.execPath, args, {
  env: { ...runtimeEnv, BACKEND_MODE: live ? "live" : "mock", PUBLIC_API_ORIGIN: base, NEXT_TELEMETRY_DISABLED: "1", WRANGLER_SEND_METRICS: "false" },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});
let output = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { output = (output + chunk).slice(-32000); });
const closeServer = () => {
  if (server.pid) {
    try { process.kill(-server.pid, "SIGTERM"); } catch (error) { if (error.code !== "ESRCH") throw error; }
  }
};
process.once("SIGINT", closeServer);
process.once("SIGTERM", closeServer);
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try {
      const response = await fetch(`${base}${live ? "/api/v1/connection" : "/api/v1/cards/SK-2026-001"}`, { signal: AbortSignal.timeout(1000) });
      if (response.ok || (live && response.status === 503)) { ready = true; break; }
    } catch {}
    await setTimeout(500);
  }
  if (!ready) throw new Error(`Server did not become ready: ${output}`);
  const tests = spawn(process.execPath, ["--import", "tsx", "--test", "--experimental-test-isolation=none", "--test-reporter=spec", live ? "tests/live-runtime.integration.ts" : "tests/http.integration.ts"], {
    env: { ...process.env, API_TEST_URL: base }, stdio: "inherit",
  });
  const result = await new Promise((resolve, reject) => {
    tests.once("error", reject);
    tests.once("exit", (code) => resolve(code ?? 1));
  });
  if (result !== 0) console.error(output);
  process.exitCode = result;
} finally {
  closeServer();
}
