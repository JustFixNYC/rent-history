import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../api";
import { useRhScanReviewBootstrap } from "./scanner";

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return {
    ...actual,
    getRhHistoryScanReview: vi.fn(),
  };
});

const historyId = "22222222-2222-4222-8222-222222222222";
const accessToken = "access-token";

const readyResponse = {
  status: "ready" as const,
  db_count: 2,
  expected_page_count: 2,
  processing_complete: true,
  missing_year_ranges: [] as string[],
  pages: [
    {
      id: 1,
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

describe("useRhScanReviewBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useRhScanReviewBootstrap({
          accessToken,
          historyId,
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
  });

  it("fetches once with accept_partial when enabled", async () => {
    vi.mocked(accountApi.getRhHistoryScanReview).mockResolvedValue(
      readyResponse
    );

    const { result } = renderHook(
      () =>
        useRhScanReviewBootstrap({
          accessToken,
          historyId,
          enabled: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledTimes(1);
    expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
      accessToken,
      historyId,
      1,
      { acceptPartial: true }
    );
    expect(result.current.data).toEqual(readyResponse);
  });
});
