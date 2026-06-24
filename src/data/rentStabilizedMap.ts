export type RentStabilizedMapPoint = {
  bbl: string;
  address: string;
  borough: string;
  zip: string;
  lat: number;
  lng: number;
  units_res: number;
  rs_units: number;
};

export const RENT_STABILIZED_MAP_DATA_URL =
  "/data/rent-stabilized-map-points.json";

/** Normalize BBLs from GeoSearch PAD (may drop leading zeros). */
export const normalizeBbl = (bbl: string): string =>
  bbl.replace(/\D/g, "").padStart(10, "0");

export const buildPointsByBbl = (
  points: RentStabilizedMapPoint[]
): Map<string, RentStabilizedMapPoint> => {
  const byBbl = new Map<string, RentStabilizedMapPoint>();
  for (const point of points) {
    byBbl.set(normalizeBbl(point.bbl), point);
  }
  return byBbl;
};

export async function loadRentStabilizedMapPoints(): Promise<
  RentStabilizedMapPoint[]
> {
  const res = await fetch(RENT_STABILIZED_MAP_DATA_URL);
  if (!res.ok) {
    throw new Error(`Failed to load map data (${res.status})`);
  }
  const data = (await res.json()) as RentStabilizedMapPoint[];
  if (!Array.isArray(data)) {
    throw new Error("Invalid map data format");
  }
  return data;
}
