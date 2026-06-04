-- One-off export query for public/data/rent-stabilized-map-points.json
-- Run against a Postgres DB with pluto_latest + rentstab_v2 (e.g. WoW NYCDB).
--
-- Example:
--   psql "$DATABASE_URL" -t -A -f scripts/rent-stabilized-map-export.sql > /tmp/rs-map.jsonl
-- Then convert to a JSON array (see public/data/README.md).

SELECT json_build_object(
  'bbl', p.bbl,
  'address', p.address,
  'borough', CASE p.borough
    WHEN 'MN' THEN 'Manhattan'
    WHEN 'BX' THEN 'Bronx'
    WHEN 'BK' THEN 'Brooklyn'
    WHEN 'QN' THEN 'Queens'
    WHEN 'SI' THEN 'Staten Island'
    ELSE p.borough
  END,
  'zip', TRIM(p.postcode::text),
  'lat', p.latitude,
  'lng', p.longitude,
  'units_res', p.unitsres::int,
  'rs_units', coalesce(
    nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
    nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
  )::int
)::text
FROM pluto_latest AS p
LEFT JOIN rentstab_v2 AS r ON p.bbl = r.ucbbl
WHERE p.unitsres > 0
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL
  AND p.address IS NOT NULL
  AND coalesce(
    nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
    nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
  ) > 0;
