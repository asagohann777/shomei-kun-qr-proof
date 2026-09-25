import contract from "../generated/contract.json";
import * as validate from "../generated/validators.js";
import { ApiError, GatewayUnavailableError, type ApiErrorCode, type PrepareInput } from "./domain";
import { createMockGateway, isMockScenario, type MockOperation } from "./mock-gateway";
import { getCard, getRegistrationTransaction, prepareRegistration } from "./service";

const headers = { "Cache-Control": "no-store" };
const maximumBodyBytes = 16 * 1024;

function errorResponse(status: number, code: ApiErrorCode): Response {
  const message = contract.components.examples[code].value.error.message;
  return Response.json({ meta: { mode: "mock" }, error: { code, message } }, { status, headers });
}

function successResponse(data: unknown): Response {
  return Response.json({ meta: { mode: "mock" }, data }, { status: 200, headers });
}

function scenarioFor(request: Request, operation: MockOperation): string {
  const scenario = request.headers.get("X-Mock-Scenario") ?? "default";
  if (!isMockScenario(operation, scenario)) {
    throw new ApiError(400, "INVALID_MOCK_SCENARIO", "Unsupported scenario");
  }
  return scenario;
}

function requireMockMode(request: Request): void {
  const mode = process.env.BACKEND_MODE;
  if (mode === "mock") return;
  if (mode === "live" && request.headers.has("X-Mock-Scenario")) {
    throw new ApiError(400, "INVALID_INPUT", "Mock scenario is unavailable in live mode");
  }
  throw new ApiError(500, "INTERNAL_ERROR", "Backend mode is not configured");
}

function requireCardId(cardId: string): string {
  if (!validate.CardId(cardId)) {
    throw new ApiError(400, "INVALID_INPUT", "Invalid card ID");
  }
  return cardId;
}

function requireTransactionHash(txHash: string): string {
  if (!validate.TransactionHash(txHash)) {
    throw new ApiError(400, "INVALID_INPUT", "Invalid transaction hash");
  }
  return txHash.toLowerCase();
}

async function readPrepareInput(request: Request): Promise<PrepareInput> {
  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "JSON required");
  }
  if (!request.body) {
    throw new ApiError(400, "INVALID_INPUT", "Missing JSON body");
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > maximumBodyBytes) {
        await reader.cancel();
        throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Body too large");
      }
      body += decoder.decode(part.value, { stream: true });
    }
    body += decoder.decode();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError) throw new ApiError(400, "INVALID_INPUT", "Invalid UTF-8 body");
    throw error;
  } finally {
    reader.releaseLock();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new ApiError(400, "INVALID_INPUT", "Invalid JSON body");
  }
  if (!validate.PrepareRequest(parsed)) {
    throw new ApiError(400, "INVALID_INPUT", "Invalid registration input");
  }
  return parsed;
}

async function respond(operation: MockOperation, run: () => Promise<unknown>): Promise<Response> {
  try {
    const result = await run();
    return successResponse(result);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status >= 500) console.error("backend_error", { operation, code: error.code });
      return errorResponse(error.status, error.code);
    }
    if (error instanceof GatewayUnavailableError) {
      console.error("backend_error", { operation, code: "UPSTREAM_UNAVAILABLE" });
      return errorResponse(503, "UPSTREAM_UNAVAILABLE");
    }
    console.error("backend_error", { operation, code: "INTERNAL_ERROR" });
    return errorResponse(500, "INTERNAL_ERROR");
  }
}

export async function handleCardRequest(request: Request, cardId: string): Promise<Response> {
  return respond("getCard", async () => {
    requireMockMode(request);
    const id = requireCardId(cardId);
    const scenario = scenarioFor(request, "getCard");
    return getCard({ cardId: id, gateway: createMockGateway({ operation: "getCard", scenario }) });
  });
}

export async function handlePrepareRequest(request: Request, cardId: string): Promise<Response> {
  return respond("prepareRegistration", async () => {
    requireMockMode(request);
    const id = requireCardId(cardId);
    const input = await readPrepareInput(request);
    const scenario = scenarioFor(request, "prepareRegistration");
    return prepareRegistration({ cardId: id, input, gateway: createMockGateway({ operation: "prepareRegistration", scenario }) });
  });
}

export async function handleTransactionRequest(request: Request, cardId: string, txHash: string): Promise<Response> {
  return respond("getRegistrationTransaction", async () => {
    requireMockMode(request);
    const id = requireCardId(cardId);
    const hash = requireTransactionHash(txHash);
    const scenario = scenarioFor(request, "getRegistrationTransaction");
    return getRegistrationTransaction({ cardId: id, txHash: hash, gateway: createMockGateway({ operation: "getRegistrationTransaction", scenario }) });
  });
}
