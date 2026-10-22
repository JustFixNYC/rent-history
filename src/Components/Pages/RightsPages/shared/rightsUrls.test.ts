import { describe, expect, it } from "vitest";

import {
  goodCauseNycUrl,
  goodCauseLetterSenderUrl,
  goodCauseRentCalculatorUrl,
  letterOfComplaintUrl,
  rentHistoryRequestUrl,
} from "./rightsUrls";

describe("rightsUrls", () => {
  it("builds locale-aware rent history request URL", () => {
    expect(rentHistoryRequestUrl("en")).toBe("https://app.justfix.org/en/rh");
    expect(rentHistoryRequestUrl("es")).toBe("https://app.justfix.org/es/rh");
  });

  it("points Good Cause CTA to goodcausenyc.org", () => {
    expect(goodCauseNycUrl).toBe("https://goodcausenyc.org/");
  });

  it("builds locale-aware Good Cause tool URLs", () => {
    expect(goodCauseRentCalculatorUrl("es")).toBe(
      "https://goodcausenyc.org/es/rent_calculator"
    );
    expect(goodCauseLetterSenderUrl("en")).toBe(
      "https://goodcausenyc.org/en/letter"
    );
  });

  it("builds locale-aware letter of complaint URL", () => {
    expect(letterOfComplaintUrl("es")).toBe("https://app.justfix.org/es/loc");
  });
});
