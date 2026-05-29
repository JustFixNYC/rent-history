import { afterEach, describe, expect, it, vi } from "vitest";

import { searchGeosearch } from "./geosearch";

describe("searchGeosearch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null for blank text without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(searchGeosearch("   ")).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("GETs /v2/search with text and size=1", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                housenumber: "120",
                street: "broadway",
                borough: "manhattan",
                postalcode: "10271",
                addendum: { pad: { bbl: "1000120001", bin: "1000120" } },
              },
              geometry: { coordinates: [-74.01, 40.71] },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const feature = await searchGeosearch("120 Broadway");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl] = fetchSpy.mock.calls[0];
    expect(String(requestUrl)).toBe(
      "https://geosearch.planninglabs.nyc/v2/search?text=120+Broadway&size=1"
    );
    expect(feature?.properties?.housenumber).toBe("120");
  });

  it("returns null when features array is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ type: "FeatureCollection", features: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(searchGeosearch("nowhere")).resolves.toBeNull();
  });

  it("throws when GeoSearch returns non-OK status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("error", { status: 503 })
    );

    await expect(searchGeosearch("120 Broadway")).rejects.toThrow(
      "GeoSearch request failed"
    );
  });
});
