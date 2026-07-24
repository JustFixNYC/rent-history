import { beforeEach, describe, expect, it } from "vitest";

import { AccountApiError } from "../../../api/account";
import { setRhAuthSession } from "../../../session/rhSessionStorage";
import { flowErrorFromApi, requireRhScanContext } from "./scannerFlowUtils";

const tokenPayload = {
  access_token: "test-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 300,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15554443333",
  },
};

describe("requireRhScanContext", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("returns token and historyId when session and history id are present", () => {
    setRhAuthSession(tokenPayload);

    expect(requireRhScanContext("history-1")).toEqual({
      token: "test-token",
      historyId: "history-1",
    });
  });

  it("returns null when history id is missing", () => {
    setRhAuthSession(tokenPayload);

    expect(requireRhScanContext(null)).toBeNull();
  });

  it("returns null when session is missing", () => {
    expect(requireRhScanContext("history-1")).toBeNull();
  });
});

describe("flowErrorFromApi", () => {
  it("returns API error message for AccountApiError", () => {
    const error = new AccountApiError(400, { error: "Bad request" });

    expect(flowErrorFromApi(error, "fallback")).toBe("Bad request");
  });

  it("returns fallback for non-API errors", () => {
    expect(flowErrorFromApi(new Error("nope"), "fallback")).toBe("fallback");
  });
});
