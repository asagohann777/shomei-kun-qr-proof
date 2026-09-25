import type { NextConfig } from "next";

if (process.env.BACKEND_MODE !== "mock") {
  throw new Error("BACKEND_MODE must be explicitly set to mock. Live mode is not implemented.");
}

const config: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
};

export default config;
