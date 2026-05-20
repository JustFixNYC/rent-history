import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import {
  clearRhAuthSession,
  clearRhHistoryId,
  clearRhSessionDocument,
  clearRhSessionPages,
  getRhAuthSession,
  getRhHistoryId,
  getRhSessionAnalysisPages,
  getRhSessionStepState,
  getValidRhAccessToken,
  parseRhSessionDocumentJson,
  readRhSessionDocument,
  RH_SESSION_STORAGE_KEY,
  setRhAuthSession,
  setRhHistoryId,
  setRhSessionAnalysisPages,
  setRhSessionExtension,
  setRhSessionStepState,
} from "./rhSessionStorage";

const otpPayload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 60,
  scope: "read write",
  profile: {
    id: 42,
    phone_number: "15554443333",
    rent_history_id: "rh-1",
  },
};

describe("rhSessionStorage", () => {
  beforeEach(() => {
    clearRhAuthSession();
    clearRhHistoryId();
    window.sessionStorage.clear();
  });

  it("parses a v1 document with pages", () => {
    const doc = parseRhSessionDocumentJson({
      version: 1,
      auth: {
        accessToken: "a",
        refreshToken: "r",
        tokenType: "Bearer",
        scope: "read",
        expiresAtMs: 1000,
        profile: otpPayload.profile,
      },
      flow: {
        historyId: "h1",
        pages: [
          {
            s3_key: "42/h1/page1.jpg",
            start_year: 2018,
            end_year: 2019,
          },
        ],
        formDraft: { rows: [1] },
        extensions: { postScan: { step: 2 } },
        steps: { upload: { current: 1 } },
      },
    });
    expect(doc?.flow.pages).toEqual([
      { s3_key: "42/h1/page1.jpg", start_year: 2018, end_year: 2019 },
    ]);
    expect(doc?.flow.extensions.postScan).toEqual({ step: 2 });
  });

  it("returns null for unsupported version", () => {
    expect(parseRhSessionDocumentJson({ version: 999 })).toBeNull();
  });

  it("returns null for unknown legacy shape", () => {
    expect(parseRhSessionDocumentJson({ unexpected: true })).toBeNull();
  });

  it("clears unknown legacy storage on read", () => {
    window.sessionStorage.setItem(
      RH_SESSION_STORAGE_KEY,
      JSON.stringify({ version: 1, old: true })
    );
    expect(readRhSessionDocument()).toBeNull();
    expect(window.sessionStorage.getItem(RH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("stores auth session and valid access token", () => {
    setRhAuthSession(otpPayload, 1_000);
    expect(getRhAuthSession(1_500)?.profile.phone_number).toBe("15554443333");
    expect(getValidRhAccessToken(1_500)).toBe("access-token");
  });

  it("expires auth session and clears it", () => {
    setRhAuthSession(otpPayload, 1_000);
    expect(getRhAuthSession(61_001)).toBeNull();
    expect(getValidRhAccessToken(61_001)).toBeNull();
    expect(readRhSessionDocument()?.auth).toBeNull();
  });

  it("setRhSessionAnalysisPages persists analysis pages", () => {
    setRhAuthSession(otpPayload, Date.now());
    setRhHistoryId("hist-1");
    setRhSessionAnalysisPages([
      {
        s3_key: "42/hist-1/page1.jpg",
        start_year: 2018,
        end_year: 2019,
      },
    ]);
    const doc = readRhSessionDocument();
    expect(getRhSessionAnalysisPages()).toEqual([
      { s3_key: "42/hist-1/page1.jpg", start_year: 2018, end_year: 2019 },
    ]);
    expect(doc?.flow.historyId).toBe("hist-1");
  });

  it("isolates extension slices", () => {
    setRhSessionExtension("featureA", { nested: { x: 1 } });
    setRhSessionExtension("featureB", [2, 3]);
    const doc = readRhSessionDocument();
    expect(doc?.flow.extensions.featureA).toEqual({ nested: { x: 1 } });
    expect(doc?.flow.extensions.featureB).toEqual([2, 3]);
  });

  it("typed step helpers read/write with schema validation", () => {
    setRhSessionStepState("postScan", { completed: true, pages: 2 });
    const valid = getRhSessionStepState(
      "postScan",
      z.object({ completed: z.boolean(), pages: z.number() })
    );
    const invalid = getRhSessionStepState(
      "postScan",
      z.object({ foo: z.string() })
    );
    expect(valid).toEqual({ completed: true, pages: 2 });
    expect(invalid).toBeNull();
  });

  it("clears pages with clearRhSessionPages", () => {
    setRhAuthSession(otpPayload, Date.now());
    setRhHistoryId("hist-1");
    setRhSessionAnalysisPages([
      { s3_key: "42/hist-1/page1.jpg", start_year: null, end_year: null },
    ]);
    clearRhSessionPages();
    expect(readRhSessionDocument()?.flow.pages).toEqual([]);
  });

  it("clearRhSessionDocument removes the key", () => {
    setRhAuthSession(otpPayload, Date.now());
    setRhHistoryId("hist-1");
    setRhSessionAnalysisPages([
      { s3_key: "42/hist-1/page1.jpg", start_year: null, end_year: null },
    ]);
    clearRhSessionDocument();
    expect(window.sessionStorage.getItem(RH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("can clear auth and history independently", () => {
    setRhAuthSession(otpPayload, Date.now());
    setRhHistoryId("hist-1");
    clearRhAuthSession();
    clearRhHistoryId();
    expect(getRhAuthSession()).toBeNull();
    expect(getRhHistoryId()).toBeNull();
  });
});
