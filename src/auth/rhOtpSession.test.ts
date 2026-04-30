import { describe, expect, it } from "vitest";
import {
  clearRhOtpSession,
  getRhOtpSession,
  getValidRhAccessToken,
  setRhOtpSession,
} from "./rhOtpSession";

const payload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 60,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15554443333",
    rent_history_id: "rh-1",
  },
};

describe("rhOtpSession", () => {
  it("returns a valid token while session is unexpired", () => {
    clearRhOtpSession();
    setRhOtpSession(payload, 1_000);

    expect(getValidRhAccessToken(1_500)).toBe("access-token");
    expect(getRhOtpSession(1_500)?.profile.phone_number).toBe("15554443333");
  });

  it("expires and clears session when ttl has elapsed", () => {
    clearRhOtpSession();
    setRhOtpSession(payload, 1_000);

    expect(getRhOtpSession(61_001)).toBeNull();
    expect(getValidRhAccessToken(61_001)).toBeNull();
    expect(window.sessionStorage.getItem("rhOtpSession")).toBeNull();
  });
});
