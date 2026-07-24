import { beforeEach, describe, expect, it } from "vitest";

import {
  getRhScanKeyPrefix,
  sessionPagesMatchHistory,
} from "./rhScanKeyPrefix";
import {
  clearRhAuthSession,
  setRhAuthSession,
} from "../session/rhSessionStorage";

const otpPayload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 60,
  scope: "read write",
  profile: {
    id: 42,
    phone_number: "15554443333",
  },
};

describe("rhScanKeyPrefix", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("getRhScanKeyPrefix returns profileId/historyId when authed", () => {
    setRhAuthSession(otpPayload, Date.now());
    expect(getRhScanKeyPrefix("hist-1")).toBe("42/hist-1");
  });

  it("getRhScanKeyPrefix returns null without auth", () => {
    expect(getRhScanKeyPrefix("hist-1")).toBeNull();
  });

  it("sessionPagesMatchHistory returns true when all keys match history", () => {
    setRhAuthSession(otpPayload, Date.now());
    expect(
      sessionPagesMatchHistory(
        [{ s3_key: "42/hist-1/page1.jpg", start_year: null, end_year: null }],
        "hist-1"
      )
    ).toBe(true);
  });

  it("sessionPagesMatchHistory returns false for mismatched history", () => {
    setRhAuthSession(otpPayload, Date.now());
    expect(
      sessionPagesMatchHistory(
        [{ s3_key: "42/hist-a/page1.jpg", start_year: null, end_year: null }],
        "hist-b"
      )
    ).toBe(false);
  });

  it("sessionPagesMatchHistory returns false for empty pages", () => {
    setRhAuthSession(otpPayload, Date.now());
    expect(sessionPagesMatchHistory([], "hist-1")).toBe(false);
  });
});
