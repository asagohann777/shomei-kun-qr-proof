import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MultiBaasGateway } from "../src/backend/multibaas-gateway";
import { parseLiveConfig } from "../src/backend/live-config";
import { getCard, getRegistrationTransaction } from "../src/backend/service";

const recorded = new Map<string, unknown>(Object.entries(JSON.parse(readFileSync(new URL("../../../specs/assets/curvegrid-connectivity/api-responses.json", import.meta.url), "utf8"))));
const cardId = "connectivity-20260926-001";
const txHash = "0x83f7601a0eae1123029e0f407ecd5e72ebd4d9b34e5181363bf8cabab6a9cb12";
const owner = { address: "0xf12904ef7abfd79b68dccdc7b30cfde2d6beeeb8", nickname: "おじいちゃんコンビニ" };
function gateway() {
  const config = parseLiveConfig({
    MULTIBAAS_BASE_URL: "https://recorded.example/api/v0", MULTIBAAS_API_KEY: "unused",
    CHAIN_ID: "2017072401", REGISTRY_ADDRESS: "0xe226abd4e3866568c7bd53a57f2ca4b619efb47e",
    REGISTRY_CONTRACT_LABEL: "shomeikuncardregistry", REGISTRY_CONTRACT_VERSION: "1.0.0",
    REGISTRY_DEPLOYMENT_BLOCK: "18766", REGISTRY_ISSUER: "0x742685df0832515184334faa2d28931ad2605100",
    CURVEGRID_PUBLIC_WEB3_RPC_URL: "https://rpc.example",
  });
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.hostname === "rpc.example") {
      const body = JSON.parse(String(init?.body));
      return Response.json({ jsonrpc: "2.0", id: 1, result: body.method === "eth_chainId" ? "0x783a1511" : "0x6000" });
    }
    const path = url.pathname.replace(/^\/api\/v0/, "") + url.search;
    assert.ok(recorded.has(path), `No recorded response for ${path}`);
    return Response.json(recorded.get(path));
  };
  return new MultiBaasGateway(config, fetcher);
}

test("recorded MultiBaas responses reproduce public ownership and evidence", async () => {
  const card = await getCard({ cardId, gateway: gateway() });
  assert.equal(card.status, "registered");
  assert.deepEqual(card.owner, owner);
  assert.deepEqual(card.evidence, { status: "available", transactionHash: txHash, blockNumber: 18768 });
});
test("recorded MultiBaas transaction and receipt confirm registration", async () => {
  assert.deepEqual(await getRegistrationTransaction({ cardId, txHash, gateway: gateway() }), {
    cardId, transactionHash: txHash, status: "confirmed", owner, blockNumber: 18768,
  });
});
