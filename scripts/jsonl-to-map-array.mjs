#!/usr/bin/env node
/**
 * Read JSON Lines from stdin (one object per line) and print a JSON array.
 * Used after rent-stabilized-map-export.sql.
 */

import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin });
const rows = [];

for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  rows.push(JSON.parse(trimmed));
}

process.stdout.write(`${JSON.stringify(rows)}\n`);
