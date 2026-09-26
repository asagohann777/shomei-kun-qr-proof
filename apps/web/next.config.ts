import type { NextConfig } from "next";

if (process.env.BACKEND_MODE !== "mock" && process.env.BACKEND_MODE !== "live") {
  throw new Error("BACKEND_MODE must be explicitly set to mock or live.");
}

const config: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
};

export default config;
