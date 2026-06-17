import type { GeosearchFeature } from "../../../api/thirdParty/geosearch";
import type { AddressState } from "./confirmAddressState";

const toTitleCase = (value: string) =>
  value.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

/** Map a GeoSearch feature (autocomplete or /search) to AddressState. */
export const geosearchFeatureToAddressState = (
  feature: GeosearchFeature,
  previousState: AddressState,
  labelFallback?: string
): AddressState => {
  const featureProperties = feature.properties ?? {};
  const coordinates = feature.geometry?.coordinates ?? [];
  const longitude = coordinates[0];
  const latitude = coordinates[1];
  const longLat =
    typeof longitude === "number" && typeof latitude === "number"
      ? `${longitude},${latitude}`
      : null;

  const streetAddress = toTitleCase(
    `${featureProperties.housenumber ?? ""} ${featureProperties.street ?? ""}`
  ).trim();
  const cityStateZip = [
    featureProperties.borough ? toTitleCase(featureProperties.borough) : "",
    "New York",
    featureProperties.postalcode ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...previousState,
    streetAddress:
      streetAddress ||
      toTitleCase(featureProperties.name ?? "") ||
      labelFallback ||
      previousState.streetAddress,
    cityStateZip: cityStateZip || previousState.cityStateZip,
    bbl: featureProperties.addendum?.pad?.bbl ?? null,
    bin: featureProperties.addendum?.pad?.bin ?? null,
    longLat,
  };
};
