import type { GeosearchFeature } from "../../../api/thirdParty/geosearch";

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

/** Map a GeoSearch feature to POST send-request address fields. */
export function geosearchFeatureToRequestPayload(feature: GeosearchFeature): {
  address: string;
  borough: string;
  zipcode: string;
  bbl: string;
} | null {
  const properties = feature.properties ?? {};
  const bbl = properties.addendum?.pad?.bbl?.trim();
  if (!bbl) {
    return null;
  }

  const address = toTitleCase(
    `${properties.housenumber ?? ""} ${properties.street ?? ""}`
  ).trim();
  const borough = properties.borough ? toTitleCase(properties.borough) : "";
  const zipcode = properties.postalcode ?? "";

  if (!address || !borough) {
    return null;
  }

  return { address, borough, zipcode, bbl };
}
