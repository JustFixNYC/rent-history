import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountApiError } from "../../../api/account";
import { setRhAuthSession } from "../../../session/rhSessionStorage";
import {
  clearStoredPageImageUrls,
  flowErrorFromApi,
  requireRhScanContext,
} from "./scannerFlowUtils";

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

describe("clearStoredPageImageUrls", () => {
  it("revokes urls and clears state", () => {
    const urls = { "key-1": "blob:1", "key-2": "blob:2" };
    const revoke = vi.fn();
    const setUrls = vi.fn();

    clearStoredPageImageUrls(urls, revoke, setUrls);

    expect(revoke).toHaveBeenCalledWith(urls);
    expect(setUrls).toHaveBeenCalledWith({});
  });
});
