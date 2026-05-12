import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRhHistory,
  getRhHistoryPagesReadiness,
  RhAuthApiError,
  verifyRhOtp,
} from "./rhAuth";

describe("verifyRhOtp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts to verify-otp-token with required oauth fields", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");
    vi.stubEnv("VITE_RH_OAUTH_CLIENT_ID", "client-id-123");
    vi.stubEnv("VITE_RH_OAUTH_CLIENT_SECRET", "");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 300,
          scope: "read write",
          profile: {
            id: 1,
            phone_number: "15554443333",
            rent_history_id: "abc",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await verifyRhOtp("15554443333", "123456");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0];
    expect(String(requestUrl)).toBe(
      "https://auth.example.org/rh/verify-otp-token"
    );
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(requestInit?.body).toBe(
      JSON.stringify({
        phone_number: "15554443333",
        code: "123456",
        client_id: "client-id-123",
        grant_type: "password",
      })
    );
  });

  it("includes client_secret when configured", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");
    vi.stubEnv("VITE_RH_OAUTH_CLIENT_ID", "client-id-123");
    vi.stubEnv("VITE_RH_OAUTH_CLIENT_SECRET", "top-secret");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 300,
          scope: "read write",
          profile: {
            id: 1,
            phone_number: "15554443333",
            rent_history_id: "abc",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await verifyRhOtp("15554443333", "123456");
    const [, requestInit] = fetchSpy.mock.calls[0];
    expect(requestInit?.body).toContain('"client_secret":"top-secret"');
  });
});

describe("createRhHistory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts to rh/history with Bearer authorization and no JSON body", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          created_at: "2026-05-01T12:00:00.000Z",
          updated_at: "2026-05-01T12:00:00.000Z",
          profile_id: 1,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await createRhHistory("access-token");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0];
    expect(String(requestUrl)).toBe("https://auth.example.org/rh/history");
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.headers).toEqual({
      Authorization: "Bearer access-token",
    });
    expect(requestInit?.body).toBeUndefined();
  });
});

describe("getRhHistoryPagesReadiness", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const historyId = "22222222-2222-4222-8222-222222222222";

  it("GETs pages-readiness with Bearer and query params", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          s3: { count: 1, expected: 1, relation: "equal" },
          database: { count: 1, expected: 1, relation: "equal" },
          pages: [
            {
              needs_retake: false,
              scan_url: "https://bucket.s3.amazonaws.com/1/uuid/page1.jpg",
              start_year: 2020,
              end_year: 2021,
              is_coverpage: false,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getRhHistoryPagesReadiness(
      "access-token",
      historyId,
      1
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0];
    expect(String(requestUrl)).toBe(
      `https://auth.example.org/rh/history/pages-readiness?history_id=${historyId}&num_pages=1`
    );
    expect(requestInit?.method).toBe("GET");
    expect(requestInit?.headers).toEqual({
      Authorization: "Bearer access-token",
    });

    expect(result.outcome).toBe("ready");
    if (result.outcome === "ready") {
      expect(result.body.pages).toHaveLength(1);
    }
  });

  it("returns mismatch outcome on 400 with s3 and database axes", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          s3: { count: 1, expected: 2, relation: "less" },
          database: { count: 2, expected: 2, relation: "equal" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getRhHistoryPagesReadiness(
      "access-token",
      historyId,
      2
    );

    expect(result.outcome).toBe("mismatch");
    if (result.outcome === "mismatch") {
      expect(result.body.s3.relation).toBe("less");
    }
  });

  it("throws RhAuthApiError on 400 validation (no readiness axes)", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ num_pages: ["Invalid"] }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(
      getRhHistoryPagesReadiness("access-token", historyId, 0)
    ).rejects.toThrow(RhAuthApiError);
  });

  it("throws on 401", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );

    await expect(
      getRhHistoryPagesReadiness("access-token", historyId, 1)
    ).rejects.toMatchObject({ status: 401 });
  });
});
