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
  };
});

const needsRescanPipelineResponse = {
  last_step_reached: "COMPILING" as const,
  scan_pipeline_status: "needs_rescan" as const,
  expected_page_count: 2,
  pages_landed_count: 2,
  pages_terminal_count: 2,
  processing_complete: true,
  uploads_observed_count: 2,
  early_validation: {
    passed: false,
    document_total_pages: 2,
    missing_page_numbers: [],
    pages_needing_rescan: [{ id: 1, page_number: 1, total_pages: 2 }],
  },
  user_message_key: null,
};

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
    expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalled();
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
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("exposes pipeline data when status is needs_rescan", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      needsRescanPipelineResponse
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
      expect(result.current.pipelineData?.scan_pipeline_status).toBe(
        "needs_rescan"
      );
      expect(result.current.expectedPageCount).toBe(2);
    });
    expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalled();
  });

  it("keeps saved scan-review session when pipeline is terminal without needs_rescan", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      terminalPipelineResponse
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
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("restores after retry succeeds", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(needsRescanPipelineResponse);

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
      expect(result.current.pipelineData?.scan_pipeline_status).toBe(
        "needs_rescan"
      );
      expect(result.current.pipelineBootstrapFailed).toBe(false);
    });
  });
});
