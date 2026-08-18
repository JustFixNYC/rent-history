import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../../../../api/account/api";
import { useScanReview } from "../../ScanReviewPage/hooks/useScanReview";

vi.mock("../../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../api/account/api")
  >("../../../../api/account/api");
  return {
    ...actual,
    getRhHistoryScanReview: vi.fn(),
  };
});

const historyId = "22222222-2222-4222-8222-222222222222";
const accessToken = "access-token";

const pendingResponse = {
  status: "pending" as const,
  db_count: 0,
  expected_page_count: 2,
  processing_complete: false,
  missing_year_ranges: [] as string[],
  pages: [],
};

const readyResponse = {
  status: "ready" as const,
  db_count: 2,
  expected_page_count: 2,
  processing_complete: true,
  missing_year_ranges: [] as string[],
  pages: [
    {
      id: 1,
      extraction_status: "complete" as const,
      needs_retake: false,
      s3_key: `1/${historyId}/page1.jpg`,
      start_year: 2020,
      end_year: 2021,
      is_coverpage: false,
    },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useScanReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useScanReview({
          accessToken,
          historyId,
          expectedPageCount: 2,
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
  });

  it("does not fetch when expectedPageCount is 0", () => {
    renderHook(
      () =>
        useScanReview({
          accessToken,
          historyId,
          expectedPageCount: 0,
        }),
      { wrapper: createWrapper() }
    );

    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
  });

  it("fetches with expected page count when enabled", async () => {
    vi.mocked(accountApi.getRhHistoryScanReview).mockResolvedValue(
      readyResponse
    );

    const { result } = renderHook(
      () =>
        useScanReview({
          accessToken,
          historyId,
          expectedPageCount: 2,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
      accessToken,
      historyId,
      2,
      undefined
    );
  });

  it("polls while scan review is pending", async () => {
    vi.mocked(accountApi.getRhHistoryScanReview).mockResolvedValue(
      pendingResponse
    );

    renderHook(
      () =>
        useScanReview({
          accessToken,
          historyId,
          expectedPageCount: 2,
          maxPollMs: 60_000,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledTimes(1);
    });

    await waitFor(
      () => {
        expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledTimes(2);
      },
      { timeout: 2_500 }
    );
  });

  it("fetches with acceptPartial after maxPollMs while still pending", async () => {
    const startedAt = 1_000_000;
    let dateNowCalls = 0;
    const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => {
      dateNowCalls += 1;
      return dateNowCalls === 1 ? startedAt : startedAt + 2_000;
    });

    vi.mocked(accountApi.getRhHistoryScanReview)
      .mockResolvedValueOnce(pendingResponse)
      .mockResolvedValueOnce(readyResponse);

    const { result } = renderHook(
      () =>
        useScanReview({
          accessToken,
          historyId,
          expectedPageCount: 2,
          maxPollMs: 1_000,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledTimes(2);
    });

    expect(accountApi.getRhHistoryScanReview).toHaveBeenNthCalledWith(
      1,
      accessToken,
      historyId,
      2,
      undefined
    );
    expect(accountApi.getRhHistoryScanReview).toHaveBeenNthCalledWith(
      2,
      accessToken,
      historyId,
      2,
      { acceptPartial: true }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    nowSpy.mockRestore();
  });
});
