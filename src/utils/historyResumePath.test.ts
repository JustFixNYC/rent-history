import { describe, expect, it } from "vitest";

import { historyResumePath } from "./historyResumePath";

describe("historyResumePath", () => {
  it("maps APARTMENT_INFO to rent-questions route", () => {
    expect(historyResumePath("en", "APARTMENT_INFO")).toBe(
      "/en/analyze/rent-questions"
    );
  });

  it("maps REPORT_GENERATION to the report route", () => {
    expect(historyResumePath("en", "REPORT_GENERATION")).toBe(
      "/en/analyze/report"
    );
  });

  it("falls back to confirm-address for null or unknown steps", () => {
    expect(historyResumePath("en", null)).toBe("/en/analyze/confirm-address");
    expect(historyResumePath("es", "ADDRESS_CONFIRMATION")).toBe(
      "/es/analyze/confirm-address"
    );
  });
});
