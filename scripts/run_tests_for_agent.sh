#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-test-results}"
mkdir -p "$OUT_DIR"

set +e
yarn vitest run "$@" \
  --reporter=verbose \
  --reporter=junit \
  --outputFile.junit="$OUT_DIR/junit.xml" \
  > "$OUT_DIR/latest.log" 2>&1
EXIT=$?
set -e

python3 scripts/summarize_junit.py "$OUT_DIR/junit.xml" \
  --runner vitest --log "$OUT_DIR/latest.log" \
  --out-dir "$OUT_DIR" || true

echo "rent-history: wrote $OUT_DIR/summary.md (exit $EXIT)"
exit $EXIT
