# Rent-stabilized map data

`rent-stabilized-map-points.json` powers the public map at `/rent-stabilized-map`. It should list every NYC residential building with at least one rent-stabilized unit (DHCR / `rentstab_v2`, latest available year). **Update about once per year** when rent-stab counts refresh.

## What is committed today

The repo includes a **small sample** (2 buildings in Queens) so local dev and CI work without a multi‑MB file. **Replace this file with the full citywide export before production release.**

## Plan for the full dataset (~60–80k buildings)

### Option A — SQL export from WoW/NYCDB Postgres (recommended)

No API deploy required. Anyone with access to the WoW database (local `builddb`, staging, or prod read replica) can run:

1. Confirm `pluto_latest` and `rentstab_v2` are loaded.
2. Run [`scripts/rent-stabilized-map-export.sql`](../../scripts/rent-stabilized-map-export.sql) (one JSON object per line).
3. Wrap lines into a JSON array and write `public/data/rent-stabilized-map-points.json`.

Example:

```bash
cd rent-history
psql "$WOW_DATABASE_URL" -t -A -f scripts/rent-stabilized-map-export.sql \
  | node scripts/jsonl-to-map-array.mjs \
  > public/data/rent-stabilized-map-points.json
```

If `builddb` fails on `postcode`, use `zipcode` instead (some NYCDB versions name the column differently) — match other WoW SQL such as `create_gce_screener.sql`.

### Option B — Export script from WoW API (optional)

If the WoW `GET /api/rent-stabilized/map` endpoint exists (e.g. from a one-off branch or internal deploy):

```bash
yarn export-rent-stab-map --url https://api.justfix.org --token "$SIGNATURE_API_TOKEN"
```

### Option C — Manual handoff

Data team runs the same SQL, delivers a JSON array, PR replaces `public/data/rent-stabilized-map-points.json`.

## Row shape

```json
{
  "bbl": "4116700053",
  "address": "115-27 126 STREET",
  "borough": "Queens",
  "zip": "11420",
  "lat": 40.6780643,
  "lng": -73.8128145,
  "units_res": 1,
  "rs_units": 1
}
```

## After updating the file

- Commit the new JSON (expect ~5–15 MB depending on formatting).
- Smoke test: search a known RS address on `/en/rent-stabilized-map`, confirm building count in the header matches row count.
- No app redeploy logic change — the frontend only fetches `/data/rent-stabilized-map-points.json`.
