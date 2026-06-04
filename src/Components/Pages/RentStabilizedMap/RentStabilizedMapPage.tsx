import { useCallback, useEffect, useMemo, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/mapbox";
import type { LngLatBoundsLike, MapMouseEvent } from "react-map-gl/mapbox";
import type { CircleLayerSpecification, SymbolLayerSpecification } from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  fetchRentStabilizedMapPoints,
  RentStabilizedMapPoint,
} from "../../../api/wow";
import "./RentStabilizedMapPage.scss";

const NYC_BOUNDS: LngLatBoundsLike = [
  [-74.259087, 40.477398],
  [-73.700172, 40.917576],
];

const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/light-v11";

const getMapStyle = (): string => {
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
      bbl: point.bbl,
      address: point.address,
      borough: point.borough,
      zip: point.zip,
      units_res: point.units_res,
      rs_units: point.rs_units,
    },
  })),
});

const RentStabilizedMapPage: React.FC = () => {
  const { _ } = useLingui();
  const [points, setPoints] = useState<RentStabilizedMapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] =
    useState<RentStabilizedMapPoint | null>(null);
  const [cursor, setCursor] = useState("");

  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchRentStabilizedMapPoints();
        if (!cancelled) {
          setPoints(result);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : _("Failed to load map data"));
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

  const onMapClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id;
    const map = event.target;

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

    const props = feature.properties;
    if (!props) return;

    setSelectedPoint({
      bbl: String(props.bbl),
      address: String(props.address),
      borough: String(props.borough),
      zip: String(props.zip),
      lat: (feature.geometry as Point).coordinates[1],
      lng: (feature.geometry as Point).coordinates[0],
      units_res: Number(props.units_res),
      rs_units: Number(props.rs_units),
    });
  }, []);

  if (!mapboxAccessToken) {
    return (
      <div className="rent-stab-map-page">
        <p className="rent-stab-map-page__error">
          <Trans>Map is not configured. Set VITE_MAPBOX_ACCESS_TOKEN.</Trans>
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
        {loading && (
          <p className="rent-stab-map-page__status">
            <Trans>Loading map data…</Trans>
          </p>
        )}
        {error && <p className="rent-stab-map-page__error">{error}</p>}
        {!loading && !error && (
          <p className="rent-stab-map-page__status">
            {_(msg`${points.length.toLocaleString()} buildings`)}
          </p>
        )}
      </header>

      <div className="rent-stab-map-page__map-container">
        <Map
          mapboxAccessToken={mapboxAccessToken}
          initialViewState={{
            bounds: NYC_BOUNDS,
            fitBoundsOptions: { padding: 40, maxZoom: 11 },
          }}
          mapStyle={getMapStyle()}
          interactiveLayerIds={[
            clusterLayer.id,
            unclusteredPointLayer.id,
          ]}
          cursor={cursor}
          onClick={onMapClick}
          onMouseEnter={() => setCursor("pointer")}
          onMouseLeave={() => setCursor("")}
          cooperativeGestures
        >
          <NavigationControl showCompass={false} visualizePitch={false} />
          {!loading && !error && (
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
            </Source>
          )}
          {selectedPoint && (
            <Popup
              longitude={selectedPoint.lng}
              latitude={selectedPoint.lat}
              anchor="bottom"
              onClose={() => setSelectedPoint(null)}
              closeOnClick={false}
            >
              <div className="rent-stab-map-page__popup">
                <p className="rent-stab-map-page__popup-address">
                  {selectedPoint.address}
                </p>
                <p>
                  {selectedPoint.borough}, {selectedPoint.zip}
                </p>
                <p>
                  <Trans>
                    {selectedPoint.rs_units} rent-stabilized unit(s) of{" "}
                    {selectedPoint.units_res} residential
                  </Trans>
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default RentStabilizedMapPage;
