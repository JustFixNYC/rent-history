-- Volume estimates for rent-stabilized map options.
-- Run against WoW/NYCDB Postgres: psql "$DATABASE_URL" -f scripts/rent-stabilized-map-counts.sql
--
-- Schema note: NYCDB splits RS counts across two tables:
--   rentstab     — uc2007–uc2017
--   rentstab_v2  — uc2018–uc2024 (extend coalesce when new columns land)

\echo '--- table row counts ---'

SELECT 'rentstab' AS tbl, COUNT(*) FROM rentstab
UNION ALL SELECT 'rentstab_v2', COUNT(*) FROM rentstab_v2
UNION ALL SELECT 'rentstab_summary', COUNT(*) FROM rentstab_summary;

\echo '--- rentstab_v2 only ---'

SELECT COUNT(*) AS current_rs_bbls_2019_2024_coalesce
FROM rentstab_v2 AS r
WHERE coalesce(
  nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
  nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
) > 0;

SELECT COUNT(*) AS has_rs_units_2020_to_2024_latest
FROM rentstab_v2 AS r
WHERE coalesce(
  nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
  nullif(r.uc2021, 0), nullif(r.uc2020, 0), 0
) > 0;

\echo '--- ever had RS since 2007 (rentstab + rentstab_v2, distinct BBL) ---'

SELECT COUNT(DISTINCT ucbbl) AS ever_had_rs_distinct_bbls
FROM (
  SELECT ucbbl FROM rentstab AS r
  WHERE coalesce(
    nullif(r.uc2017, 0), nullif(r.uc2016, 0), nullif(r.uc2015, 0),
    nullif(r.uc2014, 0), nullif(r.uc2013, 0), nullif(r.uc2012, 0),
    nullif(r.uc2011, 0), nullif(r.uc2010, 0), nullif(r.uc2009, 0),
    nullif(r.uc2008, 0), nullif(r.uc2007, 0), 0
  ) > 0
  UNION
  SELECT ucbbl FROM rentstab_v2 AS r
  WHERE coalesce(
    nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
    nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0),
    nullif(r.uc2018, 0), 0
  ) > 0
) AS combined;

\echo '--- map-ready points (pluto join, residential, lat/lng) ---'

SELECT COUNT(*) AS current_map_points
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

SELECT COUNT(*) AS ever_rs_map_points
FROM pluto_latest AS p
WHERE p.unitsres > 0
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL
  AND p.address IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM rentstab AS r
      WHERE r.ucbbl = p.bbl
        AND coalesce(
          nullif(r.uc2017, 0), nullif(r.uc2016, 0), nullif(r.uc2015, 0),
          nullif(r.uc2014, 0), nullif(r.uc2013, 0), nullif(r.uc2012, 0),
          nullif(r.uc2011, 0), nullif(r.uc2010, 0), nullif(r.uc2009, 0),
          nullif(r.uc2008, 0), nullif(r.uc2007, 0), 0
        ) > 0
    )
    OR EXISTS (
      SELECT 1 FROM rentstab_v2 AS r
      WHERE r.ucbbl = p.bbl
        AND coalesce(
          nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
          nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0),
          nullif(r.uc2018, 0), 0
        ) > 0
    )
  );

\echo '--- destabilized (ever had RS, none in current 2019-2024 coalesce) ---'

SELECT COUNT(*) AS likely_destabilized_bbls
FROM pluto_latest AS p
LEFT JOIN rentstab_v2 AS r ON p.bbl = r.ucbbl
WHERE p.unitsres > 0
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL
  AND p.address IS NOT NULL
  AND coalesce(
    nullif(r.uc2024, 0), nullif(r.uc2023, 0), nullif(r.uc2022, 0),
    nullif(r.uc2021, 0), nullif(r.uc2020, 0), nullif(r.uc2019, 0), 0
  ) = 0
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
