import { afterEach, describe, expect, it, vi } from "vitest";
import {
  combineRhHistoryPages,
  createRhHistory,
  getRhFindingsState,
  getRhHistoryAddress,
  getRhHistoryAnalysisPages,
  getRhHistoryPagesReadiness,
  confirmRhHistoryAddress,
  postRhHistoryRunAnalysis,
  startRhLogin,
  validateRhFinding,
  verifyRhOtp,
} from "./api";
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
      jsonResponse(
        {
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 300,
          scope: "read write",
          profile: {
            id: 1,
            phone_number: "15554443333",
          },
        },
        { status: 200 }
      )
    );

    await verifyRhOtp("15554443333", "123456");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe("https://auth.example.org/rh/verify-otp-token");
    expect(request.method).toBe("POST");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(await request.text()).toBe(
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
      jsonResponse(
        {
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 300,
          scope: "read write",
          profile: {
            id: 1,
            phone_number: "15554443333",
          },
        },
        { status: 200 }
      )
    );

    await verifyRhOtp("15554443333", "123456");
    const request = getMockedFetchRequest(fetchSpy);
    expect(await request.text()).toContain('"client_secret":"top-secret"');
  });
});

describe("createRhHistory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts to rh/history with Bearer authorization and no JSON body", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        jsonResponse(
          { id: "11111111-1111-4111-8111-111111111111" },
          { status: 201 }
        )
      );

    await createRhHistory("access-token");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe("https://auth.example.org/rh/history");
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(await request.text()).toBe("");
  });
});

describe("confirmRhHistoryAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts to rh/history/confirm-address with Bearer authorization and JSON body", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const historyId = "22222222-2222-4222-8222-222222222222";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          bbl_units: 8,
          bin_units: 6,
          is_421a_nycdb: true,
          is_j51_nycdb: false,
        },
        { status: 200 }
      )
    );

    const result = await confirmRhHistoryAddress("access-token", {
      history_id: historyId,
      bbl: "1000010001",
      bin: "1234567",
      address: "123 Main St",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh/history/confirm-address"
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(await request.text())).toEqual({
      history_id: historyId,
      bbl: "1000010001",
      bin: "1234567",
      address: "123 Main St",
    });
    expect(result).toEqual({
      bbl_units: 8,
      bin_units: 6,
      is_421a_nycdb: true,
      is_j51_nycdb: false,
    });
  });
});

describe("combineRhHistoryPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts history_id with Bearer and JSON body to combine-pages", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ status: "ok" }, { status: 200 }));

    const hid = "22222222-2222-4222-8222-222222222222";
    await combineRhHistoryPages("access-token", hid);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh/history/combine-pages"
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(await request.text()).toBe(JSON.stringify({ history_id: hid }));
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
      jsonResponse(
        {
          status: "ready",
          s3: { count: 1, expected: 1, relation: "equal" },
          database: { count: 1, expected: 1, relation: "equal" },
          pages: [
            {
              needs_retake: false,
              s3_key: "1/uuid/page1.jpg",
              start_year: 2020,
              end_year: 2021,
              is_coverpage: false,
            },
          ],
        },
        { status: 200 }
      )
    );

    const result = await getRhHistoryPagesReadiness(
      "access-token",
      historyId,
      1
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      `https://auth.example.org/rh/history/pages-readiness?history_id=${historyId}&num_pages=1`
    );
    expect(request.method).toBe("GET");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");

    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.pages).toHaveLength(1);
    }
  });

  it("returns pending status on 200 while processing", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          status: "pending",
          s3: { count: 1, expected: 2, relation: "less" },
          database: { count: 1, expected: 2, relation: "less" },
        },
        { status: 200 }
      )
    );

    const result = await getRhHistoryPagesReadiness(
      "access-token",
      historyId,
      2
    );

    expect(result.status).toBe("pending");
    if (result.status === "pending") {
      expect(result.s3.relation).toBe("less");
    }
  });

  it("returns excess status on 200 when counts exceed num_pages", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          status: "excess",
          s3: { count: 3, expected: 2, relation: "more" },
          database: { count: 2, expected: 2, relation: "equal" },
        },
        { status: 200 }
      )
    );

    const result = await getRhHistoryPagesReadiness(
      "access-token",
      historyId,
      2
    );

    expect(result.status).toBe("excess");
  });

  it("startRhLogin returns profile, created flag, and otp delivery", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          created: true,
          profile: { id: 1, phone_number: "+15551234567" },
          otp: { status: "sent" },
        },
        { status: 200 }
      )
    );

    const result = await startRhLogin("5551234567");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe("https://auth.example.org/rh/login/start");
    expect(request.method).toBe("POST");
    await expect(request.json()).resolves.toEqual({
      phone_number: "5551234567",
      source: "mobile",
      otp_domain: window.location.hostname,
    });
    expect(result.created).toBe(true);
    expect(result.profile.phone_number).toBe("+15551234567");
    expect(result.otp.status).toBe("sent");
  });

  it("throws AccountApiError on 400 validation (no readiness axes)", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          error: "Validation failed.",
          error_code: "validation_error",
          details: { num_pages: ["Invalid"] },
        },
        { status: 400 }
      )
    );

    await expect(
      getRhHistoryPagesReadiness("access-token", historyId, 0)
    ).rejects.toMatchObject({
      name: "AccountApiError",
      status: 400,
      errorCode: "validation_error",
    });
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

describe("getRhHistoryAnalysisPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const historyId = "22222222-2222-4222-8222-222222222222";

  it("GETs analysis-pages with Bearer and history_id", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          pages: [
            {
              s3_key: "1/uuid/page1.jpg",
              start_year: 2018,
              end_year: 2019,
            },
          ],
        },
        { status: 200 }
      )
    );

    const pages = await getRhHistoryAnalysisPages("access-token", historyId);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      `https://auth.example.org/rh/history/analysis-pages?history_id=${historyId}`
    );
    expect(request.method).toBe("GET");
    expect(pages).toEqual([
      { s3_key: "1/uuid/page1.jpg", start_year: 2018, end_year: 2019 },
    ]);
  });
});

const historyId = "22222222-2222-4222-8222-222222222222";
const findingId = "86f89e90-b6e4-48c0-9bcb-5f33fd2cf60b";

const sampleFinding = {
  id: findingId,
  key: {
    type: "OVERCHARGE_PREHSTPA",
    finding_year: 1992,
    subtype: null,
  },
  type: "OVERCHARGE_PREHSTPA",
  finding_year: 1992,
  status: "pending" as const,
  data: {
    rows: [
      {
        reg_year: 1991,
        apt_stat: "RS",
        legal_rent: 2283.1,
        tenants: ["KEITH ANTOINE"],
        tenancy_start: null,
      },
      {
        reg_year: 1992,
        apt_stat: "RS",
        legal_rent: 2590.86,
        gets_vacancy_increase: null,
      },
    ],
  },
  validated_at: null,
  result: null,
};

describe("postRhHistoryRunAnalysis", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts history_id with Bearer and JSON body to run-analysis", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const responseBody = {
      findings_current: [sampleFinding],
      review_queue: { ordered_ids: [findingId] },
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(responseBody, { status: 200 }));

    const result = await postRhHistoryRunAnalysis("access-token", historyId);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh/history/run-analysis"
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(await request.text()).toBe(
      JSON.stringify({ history_id: historyId })
    );
    expect(result).toEqual(responseBody);
  });
});

describe("validateRhFinding", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const validateBody = {
    history_id: historyId,
    finding_id: findingId,
    answers: {
      rows: [
        { reg_year: 1991, legal_rent: 2283.1 },
        {
          reg_year: 1992,
          legal_rent: 2590.86,
          gets_vacancy_increase: false,
        },
      ],
    },
  };

  it("posts shape-A answers with Bearer to validate-finding", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const responseBody = {
      finding: {
        ...sampleFinding,
        status: "validated",
        result: "no_violation",
        validated_at: "2026-01-01T00:00:00Z",
      },
      queue_delta: { ordered_ids: [] },
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(responseBody, { status: 200 }));

    const result = await validateRhFinding("access-token", validateBody);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      "https://auth.example.org/rh/history/validate-finding"
    );
    expect(request.method).toBe("POST");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(await request.text())).toEqual(validateBody);
    expect(result).toEqual(responseBody);
  });

  it("throws AccountApiError on 400 validation", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          error: "Validation failed.",
          error_code: "validation_error",
          details: { answers: ["Invalid"] },
        },
        { status: 400 }
      )
    );

    await expect(
      validateRhFinding("access-token", validateBody)
    ).rejects.toMatchObject({
      name: "AccountApiError",
      status: 400,
      errorCode: "validation_error",
    });
  });
});

describe("getRhFindingsState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("GETs findings-state with Bearer and history_id query param", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const responseBody = {
      findings_current: [sampleFinding],
      review_queue: { ordered_ids: [findingId] },
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(responseBody, { status: 200 }));

    const result = await getRhFindingsState("access-token", historyId);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      `https://auth.example.org/rh/history/findings-state?history_id=${historyId}`
    );
    expect(request.method).toBe("GET");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(result).toEqual(responseBody);
  });
});

describe("getRhHistoryAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const historyId = "22222222-2222-4222-8222-222222222222";

  it("GETs history/address with Bearer and history_id", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER_BASE_URL", "https://auth.example.org");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          apartment: "4B",
          address: "228 Atlantic Avenue, Brooklyn, NY 11201",
        },
        { status: 200 }
      )
    );

    const result = await getRhHistoryAddress("access-token", historyId);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = getMockedFetchRequest(fetchSpy);
    expect(request.url).toBe(
      `https://auth.example.org/rh/history/address?history_id=${historyId}`
    );
    expect(request.method).toBe("GET");
    expect(request.headers.get("Authorization")).toBe("Bearer access-token");
    expect(result).toEqual({
      apartment: "4B",
      address: "228 Atlantic Avenue, Brooklyn, NY 11201",
    });
  });
});
