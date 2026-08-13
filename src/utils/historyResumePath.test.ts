import { describe, expect, it } from "vitest";

import { historyResumePath } from "./historyResumePath";

describe("historyResumePath", () => {
  it("maps COMPILING to the compiling route", () => {
    expect(historyResumePath("en", "COMPILING")).toBe("/en/compiling");
  });

  it("maps REPORT to the report route", () => {
    expect(historyResumePath("en", "REPORT")).toBe("/en/report");
  });

  it("does not reference REPORT_GENERATION", () => {
    expect(historyResumePath("en", null)).toBe("/en/confirm-address");
    expect(historyResumePath("es", "ADDRESS_CONFIRMATION")).toBe(
      "/es/confirm-address"
    );
  });
});
