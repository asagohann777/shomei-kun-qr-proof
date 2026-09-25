import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const target = process.argv[2];
if (target !== "next" && target !== "worker") throw new Error("Expected next or worker");
const port = target === "next" ? 3107 : 8789;
const base = `http://127.0.0.1:${port}`;
const args = target === "next"
  ? ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)]
  : ["node_modules/wrangler/bin/wrangler.js", "dev", "--local", "--ip", "127.0.0.1", "--port", String(port)];
const server = spawn(process.execPath, args, {
  env: { ...process.env, BACKEND_MODE: "mock", NEXT_TELEMETRY_DISABLED: "1", WRANGLER_SEND_METRICS: "false" },
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
      const response = await fetch(`${base}/api/v1/cards/SK-2026-001`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Retry until the local server accepts connections. */ }
    await setTimeout(500);
  }
  if (!ready) throw new Error(`Server did not become ready: ${output}`);
  const tests = spawn(process.execPath, ["--import", "tsx", "--test", "--experimental-test-isolation=none", "--test-reporter=spec", "tests/http.integration.ts"], {
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
