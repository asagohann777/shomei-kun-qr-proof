import contract from "../generated/contract.json";
import * as validate from "../generated/validators.js";
import { ApiError, GatewayUnavailableError, type ApiErrorCode, type PrepareInput, type RegistrationGateway } from "./domain";
import { createMockGateway, isMockScenario, type MockOperation } from "./mock-gateway";
import { createLiveGateway } from "./multibaas-gateway";
import { getCard, getRegistrationTransaction, prepareRegistration } from "./service";

const headers = { "Cache-Control": "no-store" };
const maximumBodyBytes = 16 * 1024;

type Mode = "mock" | "live";

function errorResponse(status: number, code: ApiErrorCode, mode: Mode, details?: { missingSettings: string[] }): Response {
  const message = contract.components.examples[code].value.error.message;
  const error = code === "CONFIGURATION_MISSING" ? { code, message, details } : { code, message };
  return Response.json({ meta: { mode }, error }, { status, headers });
}

function originValue(value: string): string {
  try {
    const url = new URL(value);
    if (url.origin !== value || url.username || url.password ||
        (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))) throw new Error();
    return url.origin;
  } catch {
    throw new ApiError(503, "CONNECTION_MISMATCH", "Invalid origin configuration");
  }
}

function checkOrigin(request: Request, mode: Mode): Headers {
  const result = new Headers(headers);
  result.set("Vary", "Origin");
  const own = process.env.PUBLIC_API_ORIGIN;
  if (mode === "live" && !own) throw new ApiError(503, "CONFIGURATION_MISSING", "Missing origin", { missingSettings: ["PUBLIC_API_ORIGIN"] });
  const allowed = [own ? originValue(own) : new URL(request.url).origin,
    ...(process.env.ALLOWED_UI_ORIGINS ?? "").split(",").map(v => v.trim()).filter(Boolean).map(originValue)];
  const origin = request.headers.get("Origin");
  if (origin !== null) {
    if (!allowed.includes(origin)) throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed");
    result.set("Access-Control-Allow-Origin", origin);
  }
  return result;
}

function gatewayFor(request: Request, operation: MockOperation, mode: Mode): RegistrationGateway {
  if (mode === "live") return createLiveGateway(process.env);
  return createMockGateway({ operation, scenario: scenarioFor(request, operation) });
}

function scenarioFor(request: Request, operation: MockOperation): string {
  const scenario = request.headers.get("X-Mock-Scenario") ?? "default";
  if (!isMockScenario(operation, scenario)) {
    throw new ApiError(400, "INVALID_MOCK_SCENARIO", "Unsupported scenario");
  }
  return scenario;
}

function requireMode(request: Request): Mode {
  const mode = process.env.BACKEND_MODE;
  if (mode !== "mock" && mode !== "live") throw new ApiError(500, "INTERNAL_ERROR", "Backend mode is not configured");
  if (mode === "live" && request.headers.has("X-Mock-Scenario")) {
    throw new ApiError(400, "INVALID_MOCK_SCENARIO", "Mock scenario is unavailable in live mode");
  }
  return mode;
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

async function respond(request: Request, operation: MockOperation | "getConnection", run: (mode: Mode) => Promise<unknown>): Promise<Response> {
  const mode = process.env.BACKEND_MODE === "live" ? "live" : "mock";
  let responseHeaders = new Headers({ ...headers, Vary: "Origin" });
  let response: Response;
  try {
    requireMode(request);
    responseHeaders = checkOrigin(request, mode);
    if (request.method === "OPTIONS") {
      const method = request.headers.get("Access-Control-Request-Method");
      const requestedHeaders = request.headers.get("Access-Control-Request-Headers") ?? "";
      if ((method !== null && method !== "GET" && method !== "POST") ||
          requestedHeaders.split(",").some(h => h.trim() && h.trim().toLowerCase() !== "content-type")) {
        throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Preflight is not allowed");
      }
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST");
      responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");
      return new Response(null, { status: 204, headers: responseHeaders });
    }
    response = Response.json({ meta: { mode }, data: await run(mode) });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status >= 500) console.error("backend_error", { operation, code: error.code });
      response = errorResponse(error.status, error.code, mode, error.details);
    } else {
      const code = error instanceof GatewayUnavailableError ? "UPSTREAM_UNAVAILABLE" : "INTERNAL_ERROR";
      console.error("backend_error", { operation, code });
      response = errorResponse(code === "UPSTREAM_UNAVAILABLE" ? 503 : 500, code, mode);
    }
  }
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export async function handleCardRequest(request: Request, cardId: string): Promise<Response> {
  return respond(request, "getCard", async mode => {
    const id = requireCardId(cardId);
    return getCard({ cardId: id, gateway: gatewayFor(request, "getCard", mode) });
  });
}

export async function handlePrepareRequest(request: Request, cardId: string): Promise<Response> {
  return respond(request, "prepareRegistration", async mode => {
    const id = requireCardId(cardId);
    const input = await readPrepareInput(request);
    if (mode === "live" && (!input.nickname.isWellFormed() || new TextEncoder().encode(input.nickname).byteLength > 96)) {
      throw new ApiError(400, "INVALID_INPUT", "Invalid nickname");
    }
    return prepareRegistration({ cardId: id, input, gateway: gatewayFor(request, "prepareRegistration", mode) });
  });
}

export async function handleTransactionRequest(request: Request, cardId: string, txHash: string): Promise<Response> {
  return respond(request, "getRegistrationTransaction", async mode => {
    const id = requireCardId(cardId);
    const hash = requireTransactionHash(txHash);
    return getRegistrationTransaction({ cardId: id, txHash: hash, gateway: gatewayFor(request, "getRegistrationTransaction", mode) });
  });
}

export async function handleConnectionRequest(request: Request): Promise<Response> {
  return respond(request, "getConnection", async mode => {
    if (mode === "mock") {
      if (request.headers.has("X-Mock-Scenario")) throw new ApiError(400, "INVALID_MOCK_SCENARIO", "No connection scenarios");
      return { status: "mock", registry: createMockGateway({ operation: "getCard", scenario: "default" }).registry };
    }
    return createLiveGateway(process.env).checkConnection();
  });
}
