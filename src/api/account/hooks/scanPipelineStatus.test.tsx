import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { NavigationType } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../api";
import * as scannerState from "../../../Components/Pages/ScanReviewPage/scanReviewState";
import { useScanPipelineStatus } from "./scanPipelineStatus";

const historyId = "22222222-2222-4222-8222-222222222222";
const accessToken = "access-token";

const { navigateMock, navigationTypeMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  navigationTypeMock: vi.fn((): NavigationType => NavigationType.Push),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useNavigationType: () => navigationTypeMock(),
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

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return {
    ...actual,
    getRhHistoryScanPipelineStatus: vi.fn(),
  };
});

vi.mock(
  "../../../Components/Pages/ScanReviewPage/scanReviewState",
  async () => {
    const actual = await vi.importActual<
      typeof import("../../../Components/Pages/ScanReviewPage/scanReviewState")
    >("../../../Components/Pages/ScanReviewPage/scanReviewState");
    return {
      ...actual,
      writeScannerStepState: vi.fn(),
    };
  }
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const passedEarlyValidation = {
  passed: true,
  missing_page_numbers: [],
  pages_needing_rescan: [],
  scanned_max_reg_year: 2020,
  warnings: [],
};

describe("useScanPipelineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationTypeMock.mockReturnValue(NavigationType.Push);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(accountApi.getRhHistoryScanPipelineStatus).not.toHaveBeenCalled();
  });

  it("polls while pipeline is non-terminal", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      declared_last_reg_year: null,
      scan_pipeline_status: "awaiting_uploads",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 1,
      pages_terminal_count: 0,
      processing_complete: false,
      user_message_key: null,
      last_step_reached: "COMPILING",
      early_validation: null,
    });

    renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalledTimes(
        1
      );
    });

    await waitFor(
      () => {
        expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalledTimes(
          2
        );
      },
      { timeout: 2_500 }
    );
  });

  it("does not auto-navigate on complete", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      declared_last_reg_year: null,
      scan_pipeline_status: "complete",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 2,
      pages_terminal_count: 2,
      processing_complete: true,
      user_message_key: null,
      last_step_reached: "FINDINGS_OVERVIEW",
      early_validation: passedEarlyValidation,
    });

    const { result } = renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.showFlowNav).toBe(true);
  });

  it("shows FlowNav whenever pipeline is complete", async () => {
    navigationTypeMock.mockReturnValue(NavigationType.Pop);

    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      declared_last_reg_year: null,
      scan_pipeline_status: "complete",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 2,
      pages_terminal_count: 2,
      processing_complete: true,
      user_message_key: null,
      last_step_reached: "REPORT",
      early_validation: passedEarlyValidation,
    });

    const { result } = renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.showFlowNav).toBe(true);
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("hides FlowNav while pipeline is still processing", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      declared_last_reg_year: null,
      scan_pipeline_status: "running_analysis",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 2,
      pages_terminal_count: 2,
      processing_complete: false,
      user_message_key: null,
      last_step_reached: "COMPILING",
      early_validation: passedEarlyValidation,
    });

    const { result } = renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.showFlowNav).toBe(false);
  });

  it("navigates to scan-review with rescan metadata on needs_rescan", async () => {
    const earlyValidation = {
      passed: false,
      missing_page_numbers: [],
      pages_needing_rescan: [{ id: 7, page_number: 2 }],
      scanned_max_reg_year: 2020,
      warnings: [],
    };

    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      declared_last_reg_year: null,
      scan_pipeline_status: "needs_rescan",
      expected_page_count: 3,
      uploads_observed_count: 3,
      pages_landed_count: 3,
      pages_terminal_count: 3,
      processing_complete: false,
      user_message_key: null,
      last_step_reached: "SCAN_REVIEW",
      early_validation: earlyValidation,
    });

    renderHook(
      () =>
        useScanPipelineStatus({
          accessToken,
          historyId,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(scannerState.writeScannerStepState).toHaveBeenCalledWith({
        phase: "scan-review",
      });
    });

    expect(navigateMock).toHaveBeenCalledWith("/en/scan-review", {
      replace: true,
      state: {
        earlyValidation,
      },
    });
  });
});
