import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  Source,
} from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LngLatBoundsLike, MapMouseEvent } from "react-map-gl/mapbox";
import type { CircleLayerSpecification, SymbolLayerSpecification } from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Plural, Trans } from "@lingui/react/macro";
import { Button, GeoSearchDropdown } from "@justfixnyc/component-library";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  buildPointsByBbl,
  loadRentStabilizedMapPoints,
  normalizeBbl,
  RentStabilizedMapPoint,
} from "../../../data/rentStabilizedMap";
import "./RentStabilizedMapPage.scss";

type GeoSearchDropdownSelection = {
  feature: {
    properties?: {
      addendum?: { pad?: { bbl?: string } };
    };
  };
  option: { label: string };
};

const NYC_BOUNDS: LngLatBoundsLike = [
  [-74.259087, 40.477398],
  [-73.700172, 40.917576],
];

const SEARCH_ZOOM = 16;

const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/light-v11";

const getRsMapStyleToken = (): string | undefined =>
  import.meta.env.VITE_MAPBOX_RS_MAP_STYLE as string | undefined;

const getRsTilesetId = (): string | undefined =>
  import.meta.env.VITE_MAPBOX_RS_TILESET as string | undefined;

const getRsTilesetSourceLayer = (): string | undefined =>
  import.meta.env.VITE_MAPBOX_RS_TILESET_SOURCE_LAYER as string | undefined;

/** When set, points render from a Mapbox tileset (not client GeoJSON clustering). */
const isTilesetMapMode = (): boolean =>
  Boolean(getRsMapStyleToken() || getRsTilesetId());

const RS_TILESET_LAYER_ID = "rs-tileset-points";

const getMapStyle = (): string => {
  const rsMapStyle = getRsMapStyleToken();
  if (rsMapStyle) {
    return `mapbox://styles/${rsMapStyle}`;
  }
  const styleToken = import.meta.env.VITE_MAPBOX_STYLE_TOKEN as
    | string
    | undefined;
  if (styleToken) {
    return `mapbox://styles/${styleToken}`;
  }
  return DEFAULT_MAP_STYLE;
};

const clusterLayer: CircleLayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "rent-stab-points",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#43B19F",
      50,
      "#2E9B8A",
      200,
      "#1F7A6C",
    ],
    "circle-radius": ["step", ["get", "point_count"], 18, 50, 24, 200, 32],
    "circle-opacity": 0.85,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0D3B34",
  },
};

const clusterCountLayer: SymbolLayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "rent-stab-points",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

const unclusteredPointLayer: CircleLayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "rent-stab-points",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#43B19F",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0D3B34",
    "circle-opacity": 0.9,
  },
};

const selectedPointLayer: CircleLayerSpecification = {
  id: "selected-point",
  type: "circle",
  source: "rent-stab-points",
  filter: ["==", ["get", "bbl"], ""],
  paint: {
    "circle-color": "#AF59A0",
    "circle-radius": 10,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#0D3B34",
    "circle-opacity": 1,
  },
};

const rsTilesetPointLayer = (
  sourceLayer: string
): CircleLayerSpecification => ({
  id: RS_TILESET_LAYER_ID,
  type: "circle",
  source: "rs-tileset",
  "source-layer": sourceLayer,
  slot: "top",
  paint: {
    "circle-color": "#43B19F",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0D3B34",
    "circle-opacity": 0.9,
    "circle-emissive-strength": 1,
  },
});

const toGeoJson = (
  points: RentStabilizedMapPoint[]
): FeatureCollection<Point> => ({
  type: "FeatureCollection",
  features: points.map((point) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [point.lng, point.lat],
    },
    properties: {
      bbl: normalizeBbl(point.bbl),
      address: point.address,
      borough: point.borough,
      zip: point.zip,
      units_res: point.units_res,
      rs_units: point.rs_units,
    },
  })),
});

const pointFromFeature = (feature: GeoJSON.Feature): RentStabilizedMapPoint | null => {
  const props = feature.properties;
  if (!props || feature.geometry.type !== "Point") return null;
  const [lng, lat] = feature.geometry.coordinates;
  return {
    bbl: String(props.bbl),
    address: String(props.address),
    borough: String(props.borough),
    zip: String(props.zip),
    lat,
    lng,
    units_res: Number(props.units_res),
    rs_units: Number(props.rs_units),
  };
};

const bblFromRenderedFeature = (
  feature: GeoJSON.Feature
): string | null => {
  const bbl = feature.properties?.bbl;
  if (bbl == null || feature.geometry.type !== "Point") return null;
  return normalizeBbl(String(bbl));
};

const pointFromTileFeature = (
  feature: GeoJSON.Feature,
  details: RentStabilizedMapPoint | undefined
): RentStabilizedMapPoint | null => {
  const bbl = bblFromRenderedFeature(feature);
  if (!bbl) return null;
  if (details) return details;

  const [lng, lat] = (feature.geometry as Point).coordinates;
  return {
    bbl,
    address: "",
    borough: "",
    zip: "",
    lat,
    lng,
    units_res: 0,
    rs_units: 0,
  };
};

const RentStabilizedMapPage: React.FC = () => {
  const { _ } = useLingui();
  const mapRef = useRef<MapRef>(null);
  const tilesetMode = isTilesetMapMode();
  const rsTilesetId = getRsTilesetId();
  const rsTilesetSourceLayer = getRsTilesetSourceLayer();
  const rsTilesetLayer = useMemo(
    () =>
      rsTilesetSourceLayer
        ? rsTilesetPointLayer(rsTilesetSourceLayer)
        : null,
    [rsTilesetSourceLayer]
  );
  const [points, setPoints] = useState<RentStabilizedMapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] =
    useState<RentStabilizedMapPoint | null>(null);
  const [cursor, setCursor] = useState("");

  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  const pointsByBbl = useMemo(() => buildPointsByBbl(points), [points]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadRentStabilizedMapPoints();
        if (!cancelled) {
          setPoints(result);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : _("Failed to load map data")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [_]);

  const geojson = useMemo(() => toGeoJson(points), [points]);

  const selectedBbl = selectedPoint ? normalizeBbl(selectedPoint.bbl) : "";

  const focusPoint = useCallback((point: RentStabilizedMapPoint) => {
    setSelectedPoint(point);
    setSearchNotice(null);
    mapRef.current?.flyTo({
      center: [point.lng, point.lat],
      zoom: SEARCH_ZOOM,
      duration: 1200,
    });
  }, []);

  const onMapClick = useCallback((event: MapMouseEvent) => {
    const map = event.target;

    if (tilesetMode) {
      const features = map.queryRenderedFeatures(event.point);
      const tileFeature = features.find((f) => bblFromRenderedFeature(f));
      if (!tileFeature) return;

      const bbl = bblFromRenderedFeature(tileFeature)!;
      const clicked = pointFromTileFeature(
        tileFeature,
        pointsByBbl.get(bbl)
      );
      if (clicked) {
        focusPoint(clicked);
      }
      return;
    }

    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id;

    if (clusterId != null) {
      const source = map.getSource("rent-stab-points");
      if (source && "getClusterExpansionZoom" in source) {
        source.getClusterExpansionZoom(
          clusterId,
          (err: Error | null | undefined, zoom: number | null | undefined) => {
            if (err || zoom == null) return;
            const coordinates = (feature.geometry as Point).coordinates as [
              number,
              number,
            ];
            map.easeTo({
              center: coordinates,
              zoom,
            });
          }
        );
      }
      return;
    }

    const clicked = pointFromFeature(feature as GeoJSON.Feature);
    if (clicked) {
      focusPoint(clicked);
    }
  }, [focusPoint, pointsByBbl, tilesetMode]);

  const onMapMouseMove = useCallback(
    (event: MapMouseEvent) => {
      if (!tilesetMode) return;
      const hit = event.target
        .queryRenderedFeatures(event.point)
        .some((f) => bblFromRenderedFeature(f));
      setCursor(hit ? "pointer" : "");
    },
    [tilesetMode]
  );

  const onGeosearchSelect = useCallback(
    (selection: GeoSearchDropdownSelection | null) => {
      if (!selection) return;

      const rawBbl = selection.feature.properties?.addendum?.pad?.bbl;
      if (!rawBbl) {
        setSearchNotice(
          _(
            msg`We could not find a building ID for that address. Try another search.`
          )
        );
        return;
      }

      const point = pointsByBbl.get(normalizeBbl(rawBbl));
      if (!point) {
        setSearchNotice(
          _(
            msg`This building is not in our rent-stabilized map dataset (or has no registered RS units in the latest DHCR data).`
          )
        );
        setSelectedPoint(null);
        return;
      }

      focusPoint(point);
    },
    [_, pointsByBbl, focusPoint]
  );

  if (!mapboxAccessToken) {
    return (
      <div className="rent-stab-map-page">
        <p className="rent-stab-map-page__error">
          <Trans>Map is temporarily unavailable.</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="rent-stab-map-page">
      <header className="rent-stab-map-page__header">
        <h1>
          <Trans>Rent-stabilized buildings in NYC</Trans>
        </h1>
        <p className="rent-stab-map-page__disclaimer">
          <Trans>
            Points show residential buildings with at least one rent-stabilized
            unit according to DHCR registration data (latest available year).
            This map is for reference only and does not determine your legal
            rent status.
          </Trans>
        </p>
        <div className="rent-stab-map-page__search">
          <GeoSearchDropdown
            id="rent-stab-map-geosearch"
            className="rent-stab-map-page__geosearch"
            labelText={_(msg`Search for a building`)}
            placeholder={_(msg`Enter an NYC address`)}
            serviceUnavailableText={_(
              msg`Geosearch is temporarily unavailable. Try again in a moment.`
            )}
            onSelect={onGeosearchSelect}
          />
        </div>
        {loading && (
          <p className="rent-stab-map-page__status">
            <Trans>Loading map data…</Trans>
          </p>
        )}
        {error && <p className="rent-stab-map-page__error">{error}</p>}
        {searchNotice && (
          <p className="rent-stab-map-page__notice" role="status">
            {searchNotice}
          </p>
        )}
        {!loading && !error && tilesetMode && !rsTilesetId && (
          <p className="rent-stab-map-page__error">
            <Trans>Building locations could not be loaded.</Trans>
          </p>
        )}
        {!loading && !error && (tilesetMode ? rsTilesetId : true) && (
          <p className="rent-stab-map-page__status">
            {tilesetMode ? (
              <>
                <Trans>Map points from DHCR registration data.</Trans>{" "}
                <Plural
                  value={points.length}
                  one="# building with address and unit details"
                  other="# buildings with address and unit details"
                />
              </>
            ) : (
              <Plural
                value={points.length}
                one="# building"
                other="# buildings"
              />
            )}
          </p>
        )}
      </header>

      <div className="rent-stab-map-page__body">
        <div className="rent-stab-map-page__map-container">
          <Map
            ref={mapRef}
            mapboxAccessToken={mapboxAccessToken}
            initialViewState={{
              bounds: NYC_BOUNDS,
              fitBoundsOptions: { padding: 40, maxZoom: 11 },
            }}
            mapStyle={getMapStyle()}
            interactiveLayerIds={
              tilesetMode
                ? rsTilesetLayer
                  ? [RS_TILESET_LAYER_ID]
                  : undefined
                : [
                    clusterLayer.id,
                    unclusteredPointLayer.id,
                    selectedPointLayer.id,
                  ]
            }
            cursor={tilesetMode ? cursor : undefined}
            onClick={onMapClick}
            onMouseMove={tilesetMode ? onMapMouseMove : undefined}
            onMouseEnter={tilesetMode ? undefined : () => setCursor("pointer")}
            onMouseLeave={tilesetMode ? undefined : () => setCursor("")}
            cooperativeGestures
          >
            <NavigationControl showCompass={false} visualizePitch={false} />
            {tilesetMode && rsTilesetId && rsTilesetLayer && (
              <Source
                id="rs-tileset"
                type="vector"
                url={`mapbox://${rsTilesetId}`}
              >
                <Layer {...rsTilesetLayer} />
              </Source>
            )}
            {!tilesetMode && !loading && !error && (
              <Source
                id="rent-stab-points"
                type="geojson"
                data={geojson}
                cluster
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
                <Layer {...unclusteredPointLayer} />
                <Layer
                  {...selectedPointLayer}
                  filter={["==", ["get", "bbl"], selectedBbl]}
                />
              </Source>
            )}
          </Map>

          {selectedPoint && (
            <aside className="rent-stab-map-page__sidebar" aria-live="polite">
              <div className="rent-stab-map-page__sidebar-header">
                <h2>
                  <Trans>Building details</Trans>
                </h2>
                <Button
                  labelText={_(msg`Close`)}
                  variant="tertiary"
                  onClick={() => setSelectedPoint(null)}
                />
              </div>
              <dl className="rent-stab-map-page__sidebar-details">
                <div>
                  <dt>
                    <Trans>Address</Trans>
                  </dt>
                  <dd>
                    {selectedPoint.address || (
                      <Trans>Address details are not available for this building.</Trans>
                    )}
                  </dd>
                </div>
                {(selectedPoint.borough || selectedPoint.zip) && (
                  <div>
                    <dt>
                      <Trans>Location</Trans>
                    </dt>
                    <dd>
                      {[selectedPoint.borough, selectedPoint.zip]
                        .filter(Boolean)
                        .join(", ")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>
                    <Trans>BBL</Trans>
                  </dt>
                  <dd>{selectedPoint.bbl}</dd>
                </div>
                {selectedPoint.rs_units > 0 && (
                  <div>
                    <dt>
                      <Trans>Rent-stabilized units</Trans>
                    </dt>
                    <dd>{selectedPoint.rs_units}</dd>
                  </div>
                )}
                {selectedPoint.units_res > 0 && (
                  <div>
                    <dt>
                      <Trans>Residential units</Trans>
                    </dt>
                    <dd>{selectedPoint.units_res}</dd>
                  </div>
                )}
              </dl>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentStabilizedMapPage;
