import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLegacyRentHistoryRequestUrl,
  getRentHistoryRequestHref,
  isRentHistoryRequestEnabled,
  isRentHistoryRequestExternal,
} from "./rentHistoryRequest";

describe("rentHistoryRequest feature flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is enabled by default when env is unset", () => {
    expect(isRentHistoryRequestEnabled()).toBe(true);
    expect(isRentHistoryRequestExternal()).toBe(false);
  });

  it("is enabled when env is explicitly true", () => {
    vi.stubEnv("VITE_ENABLE_RENT_HISTORY_REQUEST", "true");

    expect(isRentHistoryRequestEnabled()).toBe(true);
    expect(isRentHistoryRequestExternal()).toBe(false);
  });

  it("is disabled only when env is explicitly false", () => {
    vi.stubEnv("VITE_ENABLE_RENT_HISTORY_REQUEST", "false");

    expect(isRentHistoryRequestEnabled()).toBe(false);
    expect(isRentHistoryRequestExternal()).toBe(true);
  });

  it("returns internal href when enabled", () => {
    expect(getRentHistoryRequestHref("en")).toBe("/en/request");
    expect(getRentHistoryRequestHref("es")).toBe("/es/request");
  });

  it("returns tenants2 splash href when disabled", () => {
    vi.stubEnv("VITE_ENABLE_RENT_HISTORY_REQUEST", "false");

    expect(getRentHistoryRequestHref("en")).toBe(
      getLegacyRentHistoryRequestUrl("en")
    );
    expect(getLegacyRentHistoryRequestUrl("en")).toBe(
      "https://app.justfix.org/en/rh/splash"
    );
    expect(getLegacyRentHistoryRequestUrl("es")).toBe(
      "https://app.justfix.org/es/rh/splash"
    );
  });
});
