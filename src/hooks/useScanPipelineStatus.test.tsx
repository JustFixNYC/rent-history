import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../api/account/api";
import * as scannerState from "../Components/Pages/Scanner/scannerState";
import {
  parseEarlyValidationFailures,
  shouldAutoNavigateOnComplete,
  shouldShowCompilingFlowNav,
  useScanPipelineStatus,
} from "./useScanPipelineStatus";

const historyId = "22222222-2222-4222-8222-222222222222";
const accessToken = "access-token";

const { navigateMock, navigationTypeMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  navigationTypeMock: vi.fn(() => "PUSH" as const),
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

vi.mock("../api/account/api", async () => {
  const actual = await vi.importActual<typeof import("../api/account/api")>(
    "../api/account/api"
  );
  return {
    ...actual,
    getRhHistoryScanPipelineStatus: vi.fn(),
  };
});

vi.mock("../Components/Pages/Scanner/scannerState", async () => {
  const actual = await vi.importActual<
    typeof import("../Components/Pages/Scanner/scannerState")
  >("../Components/Pages/Scanner/scannerState");
  return {
    ...actual,
    writeScannerStepState: vi.fn(),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("parseEarlyValidationFailures", () => {
  it("extracts code/message pairs from early_validation", () => {
    expect(
      parseEarlyValidationFailures({
        passed: false,
        failures: [
          { code: "reg_year_gaps", message: "Missing years" },
          { code: "invalid", message: 123 },
        ],
      })
    ).toEqual([{ code: "reg_year_gaps", message: "Missing years" }]);
  });
});

describe("FlowNav visibility helpers", () => {
  it("shows FlowNav only on POP when complete", () => {
    expect(shouldShowCompilingFlowNav("POP", "complete")).toBe(true);
    expect(shouldShowCompilingFlowNav("PUSH", "complete")).toBe(false);
    expect(shouldShowCompilingFlowNav("POP", "running_analysis")).toBe(false);
  });

  it("auto-navigates on complete for forward visits only", () => {
    expect(shouldAutoNavigateOnComplete("PUSH", "complete")).toBe(true);
    expect(shouldAutoNavigateOnComplete("REPLACE", "complete")).toBe(true);
    expect(shouldAutoNavigateOnComplete("POP", "complete")).toBe(false);
    expect(shouldAutoNavigateOnComplete("PUSH", "running_analysis")).toBe(
      false
    );
  });
});

describe("useScanPipelineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationTypeMock.mockReturnValue("PUSH");
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

  it("auto-navigates on complete for forward visits", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      scan_pipeline_status: "complete",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 2,
      pages_terminal_count: 2,
      processing_complete: true,
      user_message_key: null,
      last_step_reached: "FINDINGS_OVERVIEW",
      early_validation: { passed: true, failures: [] },
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
      expect(navigateMock).toHaveBeenCalledWith("/en/findings-overview", {
        replace: true,
      });
    });
  });

  it("does not auto-navigate on complete when user returned via back", async () => {
    navigationTypeMock.mockReturnValue("POP");

    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      scan_pipeline_status: "complete",
      expected_page_count: 2,
      uploads_observed_count: 2,
      pages_landed_count: 2,
      pages_terminal_count: 2,
      processing_complete: true,
      user_message_key: null,
      last_step_reached: "REPORT",
      early_validation: { passed: true, failures: [] },
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

  it("navigates to scan-review with failures on needs_rescan", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      scan_pipeline_status: "needs_rescan",
      expected_page_count: 3,
      uploads_observed_count: 3,
      pages_landed_count: 3,
      pages_terminal_count: 3,
      processing_complete: false,
      user_message_key: null,
      last_step_reached: "SCAN_REVIEW",
      early_validation: {
        passed: false,
        failures: [{ code: "needs_retake", message: "Re-scan page 2" }],
      },
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
        expectedPageCount: 3,
      });
    });

    expect(navigateMock).toHaveBeenCalledWith("/en/scanner", {
      replace: true,
      state: {
        scanPipelineFailures: [
          { code: "needs_retake", message: "Re-scan page 2" },
        ],
      },
    });
  });
});
