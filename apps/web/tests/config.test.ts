// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

for (const mode of [undefined, "", "MOCK", "unknown"]) {
  test(`B11 startup rejects BACKEND_MODE=${String(mode)}`, () => {
    const env = { ...process.env };
    if (mode === undefined) delete env.BACKEND_MODE;
    else env.BACKEND_MODE = mode;
    const result = spawnSync(process.execPath, ["--import", "tsx", "next.config.ts"], { env, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /BACKEND_MODE must be explicitly set to mock/);
  });
}
test("B11 startup accepts explicit mock mode", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "next.config.ts"], { env: { ...process.env, BACKEND_MODE: "mock" }, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("live mode boots without secrets for diagnostic endpoint", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "next.config.ts"], { env: { ...process.env, BACKEND_MODE: "live" }, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
