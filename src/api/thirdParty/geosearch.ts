const GEOSEARCH_SEARCH_URL = "https://geosearch.planninglabs.nyc/v2/search";

export type GeosearchFeatureProperties = {
  housenumber?: string;
  street?: string;
  borough?: string;
  postalcode?: string;
  name?: string;
  addendum?: { pad?: { bbl?: string; bin?: string } };
};

export type GeosearchFeature = {
  type?: "Feature";
  properties?: GeosearchFeatureProperties;
  geometry?: { type?: string; coordinates?: number[] };
};

export type GeosearchFeatureCollection = {
  type: "FeatureCollection";
  features?: GeosearchFeature[];
};

/**
 * Forward-geocode a complete address via GeoSearch `/v2/search`.
 * @see https://geosearch.planninglabs.nyc/docs#search
 */
export const searchGeosearch = async (
  text: string
): Promise<GeosearchFeature | null> => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const url = new URL(GEOSEARCH_SEARCH_URL);
  url.searchParams.set("text", trimmed);
  url.searchParams.set("size", "1");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GeoSearch request failed with status ${response.status}.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return null;
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("features" in data) ||
    !Array.isArray((data as GeosearchFeatureCollection).features)
  ) {
    return null;
  }

  const feature = (data as GeosearchFeatureCollection).features?.[0];
  if (!feature) {
    return null;
  }

  return feature;
};
