import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppNavActiveStates } from "./appNavActive";

describe("getAppNavActiveStates", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    [
      "/en/request",
      { isHomeActive: false, isAboutActive: false, isRequestActive: true },
    ],
    [
      "/es/request",
      { isHomeActive: false, isAboutActive: false, isRequestActive: true },
    ],
    [
      "/request",
      { isHomeActive: false, isAboutActive: false, isRequestActive: true },
    ],
  ])("marks request active on %s", (pathname, expected) => {
    expect(getAppNavActiveStates(pathname)).toEqual(expected);
  });

  it.each([
    [
      "/en",
      { isHomeActive: true, isAboutActive: false, isRequestActive: false },
    ],
    [
      "/en/login",
      { isHomeActive: true, isAboutActive: false, isRequestActive: false },
    ],
    [
      "/en/scanner",
      { isHomeActive: true, isAboutActive: false, isRequestActive: false },
    ],
  ])(
    "keeps home active on analyzer flow paths like %s",
    (pathname, expected) => {
      expect(getAppNavActiveStates(pathname)).toEqual(expected);
    }
  );

  it("marks about active and home inactive on about page", () => {
    expect(getAppNavActiveStates("/en/about")).toEqual({
      isHomeActive: false,
      isAboutActive: true,
      isRequestActive: false,
    });
  });

  it("does not mark home active when request and about are both absent but path is unrelated", () => {
    expect(getAppNavActiveStates("/en/privacy_policy")).toEqual({
      isHomeActive: false,
      isAboutActive: false,
      isRequestActive: false,
    });
  });

  it("does not mark request active when rent history request feature is disabled", () => {
    vi.stubEnv("VITE_ENABLE_RENT_HISTORY_REQUEST", "false");

    expect(getAppNavActiveStates("/en/request")).toEqual({
      isHomeActive: false,
      isAboutActive: false,
      isRequestActive: false,
    });
  });
});
