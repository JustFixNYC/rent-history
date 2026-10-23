import { describe, expect, it } from "vitest";

import { getAppNavActiveStates } from "./appNavActive";

describe("getAppNavActiveStates", () => {
  it("marks know-your-rights active on en and es paths", () => {
    expect(
      getAppNavActiveStates("/en/know-your-rights").isKnowYourRightsActive
    ).toBe(true);
    expect(
      getAppNavActiveStates("/es/know-your-rights").isKnowYourRightsActive
    ).toBe(true);
    expect(getAppNavActiveStates("/en/know-your-rights").isAnalyzeActive).toBe(
      false
    );
  });

  it("marks assert-your-rights active", () => {
    expect(
      getAppNavActiveStates("/en/assert-your-rights").isAssertYourRightsActive
    ).toBe(true);
    expect(
      getAppNavActiveStates("/en/assert-your-rights").isAnalyzeActive
    ).toBe(false);
  });

  it("marks analyze active on landing and analyze routes", () => {
    expect(getAppNavActiveStates("/en").isAnalyzeActive).toBe(true);
    expect(getAppNavActiveStates("/en/analyze/login").isAnalyzeActive).toBe(
      true
    );
    expect(getAppNavActiveStates("/es/").isAnalyzeActive).toBe(true);
  });
});
