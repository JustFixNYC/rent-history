#!/usr/bin/env node
/**
 * Export rent-stabilized map points to public/data/rent-stabilized-map-points.json.
 *
 * Usage (from rent-history root):
 *   node scripts/export-rent-stabilized-map-json.mjs \
 *     --url http://127.0.0.1:8000 \
 *     --token "$SIGNATURE_API_TOKEN"
 *
 * Or after WoW deploy:
 *   node scripts/export-rent-stabilized-map-json.mjs \
 *     --url https://api.justfix.org \
 *     --token "$VITE_WOW_API_TOKEN"
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(
  __dirname,
  "..",
  "public",
  "data",
  "rent-stabilized-map-points.json"
);

const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const tokenIdx = args.indexOf("--token");

if (urlIdx === -1 || tokenIdx === -1) {
  console.error(
    "Usage: node scripts/export-rent-stabilized-map-json.mjs --url <base> --token <bearer>"
  );
  process.exit(1);
}

const baseUrl = args[urlIdx + 1].replace(/\/$/, "");
const token = args[tokenIdx + 1];

const res = await fetch(`${baseUrl}/api/rent-stabilized/map`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!res.ok) {
  console.error(`Request failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const { result } = await res.json();
if (!Array.isArray(result)) {
  console.error("Unexpected response shape (expected { result: [...] })");
  process.exit(1);
}

writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${result.length} buildings to ${outPath}`);
