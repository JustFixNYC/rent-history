import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../../../../api/account/api";
import {
  shouldBootstrapCompiling,
  useScannerBootstrapRestore,
} from "./useScannerBootstrapRestore";
import { writeScannerStepState } from "../../ScanReviewPage/scanReviewState";
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

const terminalPipelineResponse = {
  last_step_reached: "DOCUMENT_SCAN" as const,
  scan_pipeline_status: "complete" as const,
  expected_page_count: 1,
  pages_landed_count: 1,
  pages_terminal_count: 1,
  processing_complete: true,
  uploads_observed_count: 1,
  early_validation: null,
  user_message_key: null,
};

const nonTerminalPipelineResponse = {
  ...terminalPipelineResponse,
  last_step_reached: "COMPILING" as const,
  scan_pipeline_status: "running_analysis" as const,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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

describe("shouldBootstrapCompiling", () => {
  it("returns true when last_step_reached is COMPILING", () => {
    expect(
      shouldBootstrapCompiling({
        last_step_reached: "COMPILING",
        scan_pipeline_status: "complete",
      })
    ).toBe(true);
  });

  it("returns true for non-terminal scan_pipeline_status values", () => {
    expect(
      shouldBootstrapCompiling({
        last_step_reached: "DOCUMENT_SCAN",
        scan_pipeline_status: "awaiting_uploads",
      })
    ).toBe(true);
  });

  it("returns false for terminal complete pipeline", () => {
    expect(
      shouldBootstrapCompiling({
        last_step_reached: "DOCUMENT_SCAN",
        scan_pipeline_status: "complete",
      })
    ).toBe(false);
  });
});

describe("useScannerBootstrapRestore", () => {
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
        useScannerBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling");
      expect(result.current.restoreStatus).toBe("done");
    });
  });

  it("completes restore when pipeline is terminal", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      terminalPipelineResponse
    );

    const { result } = renderHook(
      () =>
        useScannerBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.restoreStatus).toBe("done");
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("blocks restore on pipeline fetch error", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    const { result } = renderHook(
      () =>
        useScannerBootstrapRestore({
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

  it("does not redirect to scan-review when pipeline fails with saved session", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    renderHook(
      () =>
        useScannerBootstrapRestore({
          accessToken: "access-token",
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalled();
    });

    expect(navigateMock).not.toHaveBeenCalledWith("/en/scan-review");
  });

  it("opens gate after retry succeeds", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(terminalPipelineResponse);

    const { result } = renderHook(
      () =>
        useScannerBootstrapRestore({
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
      expect(navigateMock).toHaveBeenCalledWith("/en/scan-review");
      expect(result.current.restoreStatus).toBe("done");
    });
  });
});
