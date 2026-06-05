-- Minimal point export for Mapbox Studio tileset: every rentstab_v2 BBL with pluto coords.
-- One GeoJSON Feature per line (GeoJSONL).
--
-- Usage:
--   psql "$DATABASE_URL" -t -A -f scripts/rent-stabilized-map-v2-tileset-export.sql > rs-map-v2.geojsonl
--   node scripts/geojsonl-to-feature-collection.mjs rs-map-v2.geojsonl rs-map-v2.geojson

SELECT json_build_object(
  'type', 'Feature',
  'geometry', json_build_object(
    'type', 'Point',
    'coordinates', json_build_array(p.longitude, p.latitude)
  ),
  'properties', json_build_object(
    'bbl', trim(r.ucbbl)
  )
)::text
FROM rentstab_v2 AS r
INNER JOIN pluto_latest AS p ON p.bbl = trim(r.ucbbl)
WHERE p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL;
