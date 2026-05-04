import { afterEach, describe, expect, it, vi } from "vitest";
import { createRhHistory, verifyRhOtp } from "./rhAuth";

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
