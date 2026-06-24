import { describe, expect, it } from "vitest";

import { buildPointsByBbl, normalizeBbl } from "./rentStabilizedMap";

describe("rentStabilizedMap", () => {
  it("normalizeBbl strips non-digits and pads to 10 digits", () => {
    expect(normalizeBbl("4116700053")).toBe("4116700053");
    expect(normalizeBbl("4-1167-00053")).toBe("4116700053");
  });

  it("buildPointsByBbl indexes by normalized bbl", () => {
    const byBbl = buildPointsByBbl([
      {
        bbl: "4116700053",
        address: "115-27 126 STREET",
        borough: "Queens",
        zip: "11420",
        lat: 40.67,
        lng: -73.81,
        units_res: 1,
        rs_units: 1,
      },
    ]);
    expect(byBbl.get("4116700053")?.address).toBe("115-27 126 STREET");
  });
});
