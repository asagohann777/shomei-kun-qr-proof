import { ApiError } from "./domain";

export function parseLiveConfig(env: Record<string, string | undefined>) {
  const required = ["MULTIBAAS_BASE_URL", "MULTIBAAS_API_KEY", "CHAIN_ID", "REGISTRY_ADDRESS", "REGISTRY_CONTRACT_LABEL", "REGISTRY_CONTRACT_VERSION", "REGISTRY_DEPLOYMENT_BLOCK", "REGISTRY_ISSUER", "CURVEGRID_PUBLIC_WEB3_RPC_URL"];
  const missingSettings = required.filter((name) => !env[name]?.trim());
  if (missingSettings.length) throw new ApiError(503, "CONFIGURATION_MISSING", "Live configuration is incomplete", { missingSettings });
  const value = (name: string): string => {
    const result = env[name];
    if (!result) throw new ApiError(503, "CONFIGURATION_MISSING", "Live configuration is incomplete", { missingSettings: [name] });
    return result;
  };
  const invalid = () => new ApiError(503, "CONNECTION_MISMATCH", "Live configuration is invalid");
  const url = (name: string): URL => {
    try {
      const result = new URL(value(name));
      if (result.protocol !== "https:" || result.username || result.password || result.hash) throw invalid();
      return result;
    } catch { throw invalid(); }
  };
  const integer = (name: string, minimum: number): number => {
    const raw = value(name);
    const result = Number(raw);
    if (!/^(0|[1-9][0-9]*)$/.test(raw) || !Number.isSafeInteger(result) || result < minimum) throw invalid();
    return result;
  };
  const address = (name: string): string => {
    const result = value(name);
    if (!/^0x[0-9a-fA-F]{40}$/.test(result) || /^0x0{40}$/i.test(result)) throw invalid();
    return result.toLowerCase();
  };
  const base = url("MULTIBAAS_BASE_URL");
  if (!base.pathname.replace(/\/$/, "").endsWith("/api/v0") || base.search) throw invalid();
  const label = value("REGISTRY_CONTRACT_LABEL");
  const version = value("REGISTRY_CONTRACT_VERSION");
  if (!/^[a-zA-Z0-9_-]+$/.test(label) || !/^[a-zA-Z0-9_.-]+$/.test(version)) throw invalid();
  return {
    baseUrl: base.toString().replace(/\/$/, ""), apiKey: value("MULTIBAAS_API_KEY"),
    chainId: integer("CHAIN_ID", 1), address: address("REGISTRY_ADDRESS"), label, version,
    deploymentBlock: integer("REGISTRY_DEPLOYMENT_BLOCK", 0), issuer: address("REGISTRY_ISSUER"),
    publicRpcUrl: url("CURVEGRID_PUBLIC_WEB3_RPC_URL").toString(),
  };
}
export type LiveConfig = ReturnType<typeof parseLiveConfig>;
