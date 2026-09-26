// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { test } from "node:test";
import { ErrorResponse } from "../src/generated/validators.js";
const base = process.env.API_TEST_URL;
assert.ok(base && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base));
for (const path of ["/api/v1/connection", "/api/v1/cards/card-1"]) {
  test(`live runtime reports missing settings at ${path}`, async () => {
    const response: Response = await fetch(base + path, { headers: { Origin: base } });
    const value: unknown = await response.json();
    assert.equal(response.status, 503); assert.ok(ErrorResponse(value));
    assert.equal(value.meta.mode, "live"); assert.equal(value.error.code, "CONFIGURATION_MISSING");
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    assert.equal(response.headers.get("access-control-allow-origin"), base);
  });
}
test("live runtime preflight reaches explicit CORS handler", async () => {
  const response: Response = await fetch(base + "/api/v1/cards/card-1/registration/prepare", { method: "OPTIONS", headers: { Origin: base, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "Content-Type" } });
  assert.equal(response.status, 204); assert.equal(response.headers.get("access-control-allow-origin"), base);
  assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST");
});
test("live runtime rejects mock controls and forbidden origins", async () => {
  for (const headers of [new Headers({ "X-Mock-Scenario": "default" }), new Headers({ Origin: "https://bad.example" })]) {
    const response: Response = await fetch(base + "/api/v1/connection", { headers });
    const value: unknown = await response.json(); assert.ok(ErrorResponse(value));
    assert.equal(response.status, headers.has("Origin") ? 403 : 400);
    assert.equal(value.error.code, headers.has("Origin") ? "ORIGIN_NOT_ALLOWED" : "INVALID_MOCK_SCENARIO");
  }
});
