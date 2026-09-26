// SPDX-License-Identifier: MIT
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import { parse } from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";

const source = new URL("../../../specs/openapi.yaml", import.meta.url);
const destination = new URL("../src/generated/", import.meta.url);
const document = parse(await readFile(source, "utf8"));
const checking = process.argv.includes("--check");
const header = "// SPDX-License-Identifier: MIT\n// Generated from specs/openapi.yaml. Run npm run generate.\n";

function resolve(value) {
  if (Array.isArray(value)) return value.map(resolve);
  if (value === null || typeof value !== "object") return value;
  if ("$ref" in value) {
    const { $ref, ...rest } = value;
    if (!$ref.startsWith("#/")) throw new Error("Only local schema references are supported");
    const target = $ref.slice(2).split("/").reduce(
      (node, part) => node[part.replaceAll("~1", "/").replaceAll("~0", "~")], document,
    );
    return { ...resolve(target), ...resolve(rest) };
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
}

const ajv = new Ajv2020({ strict: true, code: { source: true, esm: true, lines: true } });
const names = Object.keys(document.components.schemas);
for (const name of names) ajv.addSchema(resolve(document.components.schemas[name]), name);
const operations = Object.values(document.paths).flatMap((path) => Object.values(path));
const scenarios = Object.fromEntries(operations.map((op) => [op.operationId, op["x-mock-scenarios"]]));
const artifacts = {
  "api.d.ts": header + astToString(await openapiTS(source)),
  "contract.json": JSON.stringify(document, null, 2) + "\n",
  "fixtures.ts": header + `export const sample = ${JSON.stringify(document["x-mock-sample"], null, 2)} as const;\n\n`
    + `export const scenarios = ${JSON.stringify(scenarios, null, 2)} as const;\n`,
  "validators.js": header + 'import ucs2lengthModule from "ajv/dist/runtime/ucs2length.js";\n'
    + standaloneCode(ajv, Object.fromEntries(names.map((name) => [name, name])))
      .replaceAll('require("ajv/dist/runtime/ucs2length").default', 'ucs2lengthModule.default') + "\n",
  "validators.d.ts": header + 'import type { components } from "./api";\n\n'
    + names.map((name) => `export function ${name}(value: unknown): value is components["schemas"]["${name}"];`).join("\n") + "\n",
};
await mkdir(destination, { recursive: true });
for (const [name, contents] of Object.entries(artifacts)) {
  const path = new URL(name, destination);
  if (checking) {
    if (await readFile(path, "utf8") !== contents) throw new Error(`Stale generated file: ${fileURLToPath(path)}`);
  } else {
    await writeFile(path, contents);
  }
}
console.log(`${checking ? "Checked" : "Generated"} OpenAPI types, fixtures and ${names.length} standalone validators.`);
