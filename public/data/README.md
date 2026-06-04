# Rent-stabilized map data

`rent-stabilized-map-points.json` is the static dataset for the rent-stabilized buildings map. It is updated about once per year when DHCR / NYCDB rent-stab counts refresh.

## Regenerate

From the `rent-history` root, after you have a full export source (WoW API, SQL export, etc.):

```bash
node scripts/export-rent-stabilized-map-json.mjs \
  --url https://api.justfix.org \
  --token "$SIGNATURE_API_TOKEN"
```

Each row:

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

The committed file may be a small sample for local dev; replace with the full citywide export before production release.
