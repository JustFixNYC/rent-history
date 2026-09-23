import { describe, expect, it } from "vitest";

import { historyResumePath } from "./historyResumePath";

describe("historyResumePath", () => {
  it("maps APARTMENT_INFO to rent-questions route", () => {
    expect(historyResumePath("en", "APARTMENT_INFO")).toBe(
      "/en/analyze/rent-questions"
    );
  });

  it("maps COMPILING to the compiling route", () => {
    expect(historyResumePath("en", "COMPILING")).toBe("/en/analyze/compiling");
  });

  it("maps REPORT to the report route", () => {
    expect(historyResumePath("en", "REPORT")).toBe("/en/analyze/report");
  });

  it("does not reference REPORT_GENERATION", () => {
    expect(historyResumePath("en", null)).toBe("/en/analyze/confirm-address");
    expect(historyResumePath("es", "ADDRESS_CONFIRMATION")).toBe(
      "/es/analyze/confirm-address"
    );
  });
});
