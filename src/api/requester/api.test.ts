import { afterEach, describe, expect, it, vi } from "vitest";

import { RequesterApiError, isEmailSendFailedError } from "./errors";
import { getPartnerBySlug, sendRhRequest } from "./api";

const jsonResponse = (body: unknown, init: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

const getMockedFetchRequest = (
  fetchSpy: ReturnType<typeof vi.spyOn>,
  callIndex = 0
): Request => {
  const [input] = fetchSpy.mock.calls[callIndex] as [Request];
  expect(input).toBeInstanceOf(Request);
  return input;
};

describe("getPartnerBySlug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("GETs partner without Authorization header", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          name: "JustFix",
          slug: "j4ac",
          website: "https://justfix.org",
        },
        { status: 200 }
      )
    );

    const partner = await getPartnerBySlug("j4ac");

    expect(partner.slug).toBe("j4ac");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh-request/partners/j4ac/"
    );
    expect(request.method).toBe("GET");
    expect(request.headers.get("Authorization")).toBeNull();
  });
});

describe("sendRhRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("POSTs with bearer token and request body", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");
    vi.stubEnv("VITE_RH_REQUEST_API_TOKEN", "request-token-123");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          email_sent: true,
          latest_year: 2024,
          stabilized_units: 12,
        },
        { status: 200 }
      )
    );

    await sendRhRequest({
      first_name: "Jane",
      last_name: "Doe",
      apartment_number: "4B",
      phone_number: "15554443333",
      address: "123 Main St",
      borough: "Brooklyn",
      bbl: "3012340001",
      locale: "en",
      source: "online",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh-request/send-request"
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe(
      "Bearer request-token-123"
    );
    expect(await request.json()).toMatchObject({
      first_name: "Jane",
      locale: "en",
    });
  });

  it("throws RequesterApiError with email_send_failed on 503", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");
    vi.stubEnv("VITE_RH_REQUEST_API_TOKEN", "request-token-123");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ error: "email_send_failed" }, { status: 503 })
    );

    await expect(
      sendRhRequest({
        first_name: "Jane",
        last_name: "Doe",
        apartment_number: "4B",
        phone_number: "15554443333",
        address: "123 Main St",
        borough: "Brooklyn",
        bbl: "3012340001",
        locale: "en",
        source: "online",
      })
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(RequesterApiError);
      expect(isEmailSendFailedError(error)).toBe(true);
      return true;
    });
  });
});
