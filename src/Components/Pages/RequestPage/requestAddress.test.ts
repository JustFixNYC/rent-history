import { describe, expect, it } from "vitest";

import type { GeosearchFeature } from "../../../api/thirdParty/geosearch";
import { geosearchFeatureToRequestPayload } from "./requestAddress";

const sampleFeature = (
  overrides: Partial<GeosearchFeature["properties"]> = {}
): GeosearchFeature => ({
  type: "Feature",
  properties: {
    housenumber: "123",
    street: "MAIN ST",
    borough: "manhattan",
    postalcode: "10001",
    addendum: { pad: { bbl: "1012340001" } },
    ...overrides,
  },
});

describe("geosearchFeatureToRequestPayload", () => {
  it("maps a GeoSearch feature to POST address fields", () => {
    expect(geosearchFeatureToRequestPayload(sampleFeature())).toEqual({
      address: "123 Main St",
      borough: "Manhattan",
      zipcode: "10001",
      bbl: "1012340001",
    });
  });

  it("returns null when bbl is missing", () => {
    expect(
      geosearchFeatureToRequestPayload(
        sampleFeature({ addendum: { pad: { bbl: "" } } })
      )
    ).toBeNull();
  });

  it("returns null when street address is empty", () => {
    expect(
      geosearchFeatureToRequestPayload(
        sampleFeature({ housenumber: "", street: "" })
      )
    ).toBeNull();
  });

  it("returns null when borough is missing", () => {
    expect(
      geosearchFeatureToRequestPayload(sampleFeature({ borough: undefined }))
    ).toBeNull();
  });

  it("trims whitespace from bbl", () => {
    expect(
      geosearchFeatureToRequestPayload(
        sampleFeature({ addendum: { pad: { bbl: " 1012340001 " } } })
      )
    ).toEqual({
      address: "123 Main St",
      borough: "Manhattan",
      zipcode: "10001",
      bbl: "1012340001",
    });
  });
});
