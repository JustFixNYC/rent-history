#!/usr/bin/env node
/**
 * Wrap GeoJSONL (one Feature per line) into a FeatureCollection file.
 *
 *   node scripts/geojsonl-to-feature-collection.mjs input.geojsonl output.geojson
 */

import fs from "node:fs";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error(
    "Usage: node scripts/geojsonl-to-feature-collection.mjs input.geojsonl output.geojson"
  );
  process.exit(1);
}

const lines = fs
  .readFileSync(inputPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const features = lines.map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`Invalid JSON on line ${index + 1}: ${error.message}`);
  }
});

fs.writeFileSync(
  outputPath,
  JSON.stringify({ type: "FeatureCollection", features })
);

console.log(`Wrote ${features.length} features to ${outputPath}`);
