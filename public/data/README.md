# Rent-stabilized map data

`rent-stabilized-map-points.json` powers the public map at `/rent-stabilized-map`. **Update about once per year** when rent-stab counts refresh.

---

## Dev handoff (Jun 2025 spike)

Everything a teammate needs to continue map + tileset work.

### Data volume (prod NYCDB, run `scripts/rent-stabilized-map-counts.sql` to refresh)

NYCDB splits history across `rentstab` (2007–2017) and `rentstab_v2` (2018–2024). There are no `uc2025`/`uc2026` columns yet.

| Metric | Count |
|--------|------:|
| **`rentstab_v2` total rows** | 48,279 |
| **Current RS** (latest year in 2019–2024 coalesce — **current map / JSON export**) | 45,664 BBLs (45,264 with pluto lat/lng) |
| **Current RS** (2020–2024 latest coalesce only) | 44,032 |
| **Ever had RS since 2007** (`rentstab` + `rentstab_v2`, distinct BBL) | 52,754 |
| **Ever RS, map-ready** (with pluto lat/lng) | 51,645 |
| **Likely destabilized** (ever RS, zero in current coalesce) | 6,381 |
| **Tileset export** (all `rentstab_v2` + pluto coords) | 48,039 points |

Two map scopes:

- **Current map (what we ship today):** ~45k buildings with RS units in the latest available year → `rent-stabilized-map-export.sql`
- **All `rentstab_v2` (Joel tileset spike):** 48,039 points → `rent-stabilized-map-v2-tileset-export.sql`
- **All-time since 2007 (future):** ~52k distinct BBLs → needs both tables → `rent-stabilized-map-tileset-export.sql`

### 1. Export GeoJSON for Mapbox (all `rentstab_v2` points)

Requires access to WoW/NYCDB Postgres (`DATABASE_URL` in who-owns-what `.env`).

```bash
cd rent-history
mkdir -p tmp

# All rentstab_v2 BBLs with pluto coordinates (~48k, ~5.5 MB)
psql "$DATABASE_URL" -t -A -f scripts/rent-stabilized-map-v2-tileset-export.sql \
  > tmp/rs-map-v2.geojsonl
node scripts/geojsonl-to-feature-collection.mjs \
  tmp/rs-map-v2.geojsonl tmp/rs-map-v2.geojson
```

Share `tmp/rs-map-v2.geojson` with teammates via Drive/Slack if needed (`tmp/` is gitignored). They can also regenerate from SQL above.

Optional: full sidebar JSON (address, borough, rs_units):

```bash
psql "$DATABASE_URL" -t -A -f scripts/rent-stabilized-map-export.sql \
  | node scripts/jsonl-to-map-array.mjs \
  > public/data/rent-stabilized-map-points.json
```

Re-run counts anytime:

```bash
psql "$DATABASE_URL" -f scripts/rent-stabilized-map-counts.sql
```

### 2. Mapbox Studio — upload tileset + style

**Login:** [console.mapbox.com/studio](https://console.mapbox.com/studio/) — **JustFix org** (credentials in team vault; do not commit passwords).

**Upload tileset**

1. [studio.mapbox.com/tilesets](https://studio.mapbox.com/tilesets/) → **New tileset** → upload `tmp/rs-map-v2.geojson`
   - Or **Console → Data Workbench → Upload**
2. Wait for processing (~5–15 min)

**Create / edit style**

1. **Styles** → duplicate an existing **2D JustFix style**, or **Start from scratch** (avoid Mapbox Standard if Manhattan dots disappear under 3D buildings)
2. **+** → add tileset → layer type **Circle**
3. **Style** tab: radius 6–8, color `#43B19F`, opacity 1
4. If using Standard: layer JSON needs `"slot": "top"` and `"circle-emissive-strength": 1`, or disable 3D buildings under **Imports → Mapbox Standard**
5. **Publish** — share dialog must **not** say "Preview only"; production URL can lag a few minutes

**Spike style (Jun 2025):**

| | |
|--|--|
| Style URL | `mapbox://styles/justfix/cmq1asfej00gt01s68pra3xxq` |
| Style id | `justfix/cmq1asfej00gt01s68pra3xxq` |

**NYC preview** (replace `TOKEN` with JustFix public `pk.` token):

```
https://api.mapbox.com/styles/v1/justfix/cmq1asfej00gt01s68pra3xxq.html?access_token=TOKEN&fresh=true#14/40.758/-73.985
```

### 3. App env vars (`rent-history/.env`)

```bash
VITE_MAPBOX_ACCESS_TOKEN=<JustFix public pk token — same as WoW client>
VITE_MAPBOX_RS_MAP_STYLE=justfix/cmq1asfej00gt01s68pra3xxq
```

Copy from [`.env.sample`](../../.env.sample). Run `yarn dev`, open `/en/rent-stabilized-map`.

The page prefers `VITE_MAPBOX_RS_MAP_STYLE` over `VITE_MAPBOX_STYLE_TOKEN` when set. Client-side clustering JSON (`public/data/rent-stabilized-map-points.json`) still powers the sidebar until a BBL detail API exists.

### 4. What's in the repo vs not

| In repo | Not in repo (generate or share separately) |
|---------|---------------------------------------------|
| `scripts/rent-stabilized-map-*.sql` | `tmp/rs-map-v2.geojson` (~5.5 MB) |
| `scripts/geojsonl-to-feature-collection.mjs` | Mapbox login / secret tokens |
| `scripts/jsonl-to-map-array.mjs` | Full `rent-stabilized-map-points.json` (replace sample before prod) |
| `.env.sample` with style id | |
| `RentStabilizedMapPage.tsx` (reads env) | |

### 5. Known issues / next steps

- **Manhattan under Standard:** 3D buildings hide circles — fix with `slot: "top"` or 2D style (see above)
- **Select data vs Style in Studio:** Select data shows raw geometry overlay; Style is what publishes
- **Future API sketch:** `GET /points` → `{bbl, lat, lng}`; `GET /:bbl` → sidebar details + year history
- **All-time map:** use `rent-stabilized-map-tileset-export.sql` (+6k destabilized BBLs vs current-only)

---

## What is committed today

The repo includes a **small sample** (2 buildings in Queens) so local dev and CI work without a multi‑MB file. **Replace this file with the full citywide export before production release.**

## Plan for the full dataset (~45k current RS buildings)

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

See **Dev handoff** at the top of this file for Mapbox tileset + style workflow.
