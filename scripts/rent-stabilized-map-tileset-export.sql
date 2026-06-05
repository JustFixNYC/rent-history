-- Minimal GeoJSON-friendly export for Mapbox Studio tileset upload.
-- One Feature per line (GeoJSONL). Properties kept small for tile size.
-- Includes all BBLs that ever had RS since 2007 (rentstab + rentstab_v2).
--
-- Usage:
--   psql ... -t -A -f scripts/rent-stabilized-map-tileset-export.sql > rs-map.geojsonl

SELECT json_build_object(
  'type', 'Feature',
  'geometry', json_build_object(
    'type', 'Point',
    'coordinates', json_build_array(p.longitude, p.latitude)
  ),
  'properties', json_build_object(
    'bbl', p.bbl,
    'rs_latest', coalesce(
      nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
      nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
    )::int,
    'rs_ever', CASE
      WHEN coalesce(
        nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
        nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
      ) > 0 THEN 'current'
      ELSE 'lost'
    END
  )
)::text
FROM pluto_latest AS p
LEFT JOIN rentstab_v2 AS r ON p.bbl = r.ucbbl
WHERE p.unitsres > 0
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM rentstab AS rs
      WHERE rs.ucbbl = p.bbl
        AND coalesce(
          nullif(rs.uc2017, 0), nullif(rs.uc2016, 0), nullif(rs.uc2015, 0),
          nullif(rs.uc2014, 0), nullif(rs.uc2013, 0), nullif(rs.uc2012, 0),
          nullif(rs.uc2011, 0), nullif(rs.uc2010, 0), nullif(rs.uc2009, 0),
          nullif(rs.uc2008, 0), nullif(rs.uc2007, 0), 0
        ) > 0
    )
    OR EXISTS (
      SELECT 1 FROM rentstab_v2 AS rv
      WHERE rv.ucbbl = p.bbl
        AND coalesce(
          nullif(rv.uc2024, 0), nullif(rv.uc2023, 0), nullif(rv.uc2022, 0),
          nullif(rv.uc2021, 0), nullif(rv.uc2020, 0), nullif(rv.uc2019, 0),
          nullif(rv.uc2018, 0), 0
        ) > 0
    )
  );
