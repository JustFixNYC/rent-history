import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RequesterApiError } from "../../../api/requester/errors";

vi.mock("../../../api/requester/api", () => ({
  getPartnerBySlug: vi.fn(),
}));

import { getPartnerBySlug } from "../../../api/requester/api";
import {
  REFERRAL_STORAGE_KEY,
  captureReferralFromSearchParams,
  clearStoredReferral,
  getReferralSlugForSubmit,
  getStoredReferral,
  stripPartnerParamFromUrl,
} from "./referralStorage";

const mockGetPartnerBySlug = vi.mocked(getPartnerBySlug);

describe("referralStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/en/request");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("stores partner on GET 200 and strips partner from URL", async () => {
    window.history.replaceState({}, "", "/en/request?partner=hri&foo=bar");
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    mockGetPartnerBySlug.mockResolvedValue({
      slug: "hri",
      name: "Housing Rights Initiative",
      website: "https://example.org",
    });

    await captureReferralFromSearchParams("?partner=hri&foo=bar");

    expect(mockGetPartnerBySlug).toHaveBeenCalledWith("hri");
    expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/en/request?foo=bar");
    expect(getStoredReferral()).toEqual({
      slug: "hri",
      name: "Housing Rights Initiative",
      website: "https://example.org",
    });
    expect(getReferralSlugForSubmit()).toBe("hri");
  });

  it("does nothing for unknown slug on 404", async () => {
    mockGetPartnerBySlug.mockRejectedValue(
      new RequesterApiError(404, { error: "not_found" })
    );

    await captureReferralFromSearchParams("?partner=unknown");

    expect(sessionStorage.getItem(REFERRAL_STORAGE_KEY)).toBeNull();
    expect(getStoredReferral()).toBeNull();
  });

  it("does nothing for network errors", async () => {
    mockGetPartnerBySlug.mockRejectedValue(new Error("network down"));

    await captureReferralFromSearchParams("?partner=hri");

    expect(getStoredReferral()).toBeNull();
  });

  it("clears stored referral on opt-out", () => {
    sessionStorage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({
        slug: "hri",
        name: "Housing Rights Initiative",
        website: "https://example.org",
      })
    );

    clearStoredReferral();

    expect(getStoredReferral()).toBeNull();
    expect(getReferralSlugForSubmit()).toBeUndefined();
  });

  it("stripPartnerParamFromUrl removes only partner param", () => {
    window.history.replaceState({}, "", "/en/request?partner=hri&foo=bar#faq");
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    stripPartnerParamFromUrl();

    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      "",
      "/en/request?foo=bar#faq"
    );
  });
});
