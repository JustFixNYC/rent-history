import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../../../../api/account/api";
import { useScanReviewBootstrapRestore } from "./useScanReviewBootstrapRestore";
import { writeScannerStepState } from "../scanReviewState";
import {
  setRhAuthSession,
  setRhHistoryId,
} from "../../../../session/rhSessionStorage";

const { navigateMock, historyId } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  historyId: "22222222-2222-4222-8222-222222222222",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@lingui/react", async () => {
  const actual = await vi.importActual<typeof import("@lingui/react")>(
    "@lingui/react"
  );
  return {
    ...actual,
    useLingui: () => ({ i18n: { locale: "en" } }),
  };
});

vi.mock("../../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../api/account/api")
  >("../../../../api/account/api");
  return {
    ...actual,
    getRhHistoryScanPipelineStatus: vi.fn(),
    getRhHistoryScanReview: vi.fn(),
  };
});

const terminalPipelineResponse = {
  last_step_reached: "DOCUMENT_SCAN" as const,
  scan_pipeline_status: "complete" as const,
  expected_page_count: 2,
  pages_landed_count: 2,
  pages_terminal_count: 2,
  processing_complete: true,
  uploads_observed_count: 2,
  early_validation: null,
  user_message_key: null,
};

const nonTerminalPipelineResponse = {
  ...terminalPipelineResponse,
  last_step_reached: "COMPILING" as const,
  scan_pipeline_status: "running_analysis" as const,
};

const readyScanReviewResponse = {
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

const tokenPayload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 300,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15554443333",
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useScanReviewBootstrapRestore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
  });

  it("redirects to compiling when pipeline is non-terminal", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      nonTerminalPipelineResponse
    );

    const { result } = renderHook(
      () =>
        useScanReviewBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling");
      expect(result.current.restoreStatus).toBe("done");
    });
    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
  });

  it("bootstraps scan-review when pipeline is terminal and pages are restorable", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      terminalPipelineResponse
    );
    vi.mocked(accountApi.getRhHistoryScanReview).mockResolvedValue(
      readyScanReviewResponse
    );

    const { result } = renderHook(
      () =>
        useScanReviewBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.restoreStatus).toBe("done");
      expect(result.current.expectedPageCount).toBe(2);
    });
    expect(accountApi.getRhHistoryScanReview).toHaveBeenCalled();
  });

  it("blocks scan-review bootstrap on pipeline fetch error", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    const { result } = renderHook(
      () =>
        useScanReviewBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.pipelineBootstrapFailed).toBe(true);
    });

    expect(result.current.restoreStatus).toBe("pending");
    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("restores after retry succeeds", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(terminalPipelineResponse);

    const { result } = renderHook(
      () =>
        useScanReviewBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.pipelineBootstrapFailed).toBe(true);
    });

    result.current.retryPipelineBootstrap();

    await waitFor(() => {
      expect(result.current.restoreStatus).toBe("done");
      expect(result.current.expectedPageCount).toBe(2);
      expect(result.current.pipelineBootstrapFailed).toBe(false);
    });
  });
});
