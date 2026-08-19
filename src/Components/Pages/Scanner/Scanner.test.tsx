import { StrictMode, act } from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Scanner from "./Scanner";
import { AccountApiError } from "../../../api/account";
import * as accountApi from "../../../api/account/api";
import { uploadScan } from "../../../api/account/scanPresign";
import * as scannerOverlay from "./scanner-overlay";
import {
  clearRhAuthSession,
  clearRhFlowSession,
  getRhHistoryId,
  getRhSessionAnalysisPages,
  setRhAuthSession,
  setRhHistoryId,
  setRhSessionAnalysisPages,
  setRhSessionStepState,
  switchRhHistory,
} from "../../../session/rhSessionStorage";
import {
  readScannerStepState,
  SCANNER_STEP_STATE_KEY,
  writeScannerStepState,
} from "../ScanReviewPage/scanReviewState";

const { navigateMock, testHistoryId, scannerHarness, defaultPipelineResponse } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    testHistoryId: "22222222-2222-4222-8222-222222222222",
    defaultPipelineResponse: {
      last_step_reached: "DOCUMENT_SCAN" as const,
      scan_pipeline_status: "complete" as const,
      expected_page_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      processing_complete: true,
      uploads_observed_count: 1,
      early_validation: null,
      user_message_key: null,
    },
    scannerHarness: {
      hangLaunch: false,
      rejectLaunch: false,
      rejectLaunchError: null as Error | null,
      skipAutoScanOnLaunch: false,
      autoScanCount: 1,
      launchResolvers: [] as Array<() => void>,
      lastInstance: null as {
        launch: ReturnType<typeof vi.fn>;
        dispose: ReturnType<typeof vi.fn>;
        stopContinuousScanning: ReturnType<typeof vi.fn>;
      } | null,
      onDocumentScanned: null as
        | ((result: {
            correctedImageResult?: { toBlob: (type: string) => Promise<Blob> };
          }) => void | Promise<void>)
        | null,
      releaseLaunch() {
        const resolve = scannerHarness.launchResolvers.shift();
        resolve?.();
      },
      async simulateDocumentScan() {
        if (!scannerHarness.onDocumentScanned) return;
        await scannerHarness.onDocumentScanned({
          correctedImageResult: {
            toBlob: async () => new Blob(),
          },
        });
      },
    },
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

vi.mock("dynamsoft-document-scanner", () => ({
  DocumentScanner: vi.fn(function DocumentScannerMock(
    this: {
      launch: ReturnType<typeof vi.fn>;
      dispose: ReturnType<typeof vi.fn>;
      stopContinuousScanning: ReturnType<typeof vi.fn>;
    },
    config?: {
      onDocumentScanned?: (result: {
        correctedImageResult?: { toBlob: (type: string) => Promise<Blob> };
      }) => void | Promise<void>;
    }
  ) {
    scannerHarness.onDocumentScanned = config?.onDocumentScanned ?? null;
    this.dispose = vi.fn();
    this.stopContinuousScanning = vi.fn();
    this.launch = vi.fn().mockImplementation(async () => {
      if (scannerHarness.rejectLaunch) {
        throw scannerHarness.rejectLaunchError ?? new Error("launch failed");
      }
      if (scannerHarness.hangLaunch) {
        await new Promise<void>((resolve) => {
          scannerHarness.launchResolvers.push(resolve);
        });
        return;
      }

      if (!scannerHarness.skipAutoScanOnLaunch) {
        for (let i = 0; i < scannerHarness.autoScanCount; i += 1) {
          await scannerHarness.simulateDocumentScan();
        }
      }
    });
    scannerHarness.lastInstance = this;
  }),
}));

vi.mock("../../../api/account/scanPresign", () => ({
  uploadScan: vi.fn().mockResolvedValue(undefined),
  downloadScans: vi.fn().mockResolvedValue([
    {
      key: `1/${testHistoryId}/page1.jpg`,
      response: {
        ok: true,
        status: 200,
        blob: async () => new Blob(),
      },
    },
  ]),
}));

vi.mock("../../EmblaCarousel/EmblaCarousel", () => ({
  default: () => null,
}));

vi.mock("./scanner-overlay", async () => {
  const actual = await vi.importActual<typeof import("./scanner-overlay")>(
    "./scanner-overlay"
  );
  return {
    ...actual,
    probeCameraAccess: vi.fn().mockResolvedValue(true),
    isDynamsoftScannerLiveViewVisible: vi.fn().mockReturnValue(false),
    isRetakeOrSavePreviewVisible: vi.fn().mockReturnValue(false),
  };
});

const readyScanReviewPage = {
  id: 1,
  extraction_status: "complete" as const,
  needs_retake: false,
  s3_key: `1/${testHistoryId}/page1.jpg`,
  start_year: 2020,
  end_year: 2021,
  is_coverpage: false,
};

const readyScanReviewResponse = {
  status: "ready" as const,
  db_count: 1,
  expected_page_count: 1,
  processing_complete: true,
  missing_year_ranges: [] as string[],
  pages: [readyScanReviewPage],
};

const mockBootstrapNoRestorablePages = () => {
  vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
    ...defaultPipelineResponse,
    pages_landed_count: 0,
    pages_terminal_count: 0,
    processing_complete: false,
    expected_page_count: 0,
  });
};

const mockBootstrapReady = (
  overrides: Partial<typeof defaultPipelineResponse> = defaultPipelineResponse
) => {
  vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
    ...defaultPipelineResponse,
    ...overrides,
  });
};

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    combineRhHistoryPages: vi.fn(),
    createRhHistory: vi.fn(),
    deleteAllRhScannedPages: vi.fn().mockResolvedValue({
      deleted_pages: 1,
      s3_cleanup_status: "ok",
      s3_deleted_versions: 1,
    }),
    deleteRhScannedPages: vi.fn().mockResolvedValue({
      deleted_pages: 1,
      s3_cleanup_status: "ok",
      s3_deleted_keys: 1,
    }),
    getRhHistoryScanPipelineStatus: vi
      .fn()
      .mockResolvedValue(defaultPipelineResponse),
    finalizeRhHistoryScan: vi.fn().mockResolvedValue({
      status: "ok",
      expected_page_count: 1,
      uploads_observed_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      scan_pipeline_status: "awaiting_uploads",
    }),
    getRhHistoryAnalysisPages: vi.fn().mockResolvedValue([
      {
        s3_key: `1/${testHistoryId}/page1.jpg`,
        start_year: 2020,
        end_year: 2021,
      },
    ]),
  };
});

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

const historyId = testHistoryId;

const finalizeScanRequest = (expectedPageCount: number) => ({
  history_id: historyId,
  expected_page_count: expectedPageCount,
  accept_partial: false,
  locale: "en",
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderScanner = (options?: {
  strictMode?: boolean;
  initialEntries?: MemoryRouterProps["initialEntries"];
  initialIndex?: number;
}) => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();
  const tree = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={options?.initialEntries ?? ["/en/scanner"]}
        initialIndex={options?.initialIndex}
      >
        <I18nProvider i18n={i18n}>
          <Scanner />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(options?.strictMode ? <StrictMode>{tree}</StrictMode> : tree);
};

const clickStartScanning = async () => {
  const startButton = await screen.findByRole("button", {
    name: "Start scanning",
  });
  fireEvent.click(startButton);
};

const advanceToScanComplete = async () => {
  await clickStartScanning();

  await waitFor(() => {
    expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledWith(
      "access-token",
      finalizeScanRequest(1)
    );
    expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
      replace: true,
    });
  });
};

describe("Scanner zero-page completion", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    scannerHarness.skipAutoScanOnLaunch = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
    scannerHarness.skipAutoScanOnLaunch = false;
  });

  it("returns to pre-scan when scanner completes with zero pages", async () => {
    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("scan-review-loading")).not.toBeInTheDocument();
    expect(readScannerStepState()).toBeNull();
  });
});

describe("Scanner happy path finalize", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("calls finalize-scan and navigates to /compiling after Dynamsoft exit", async () => {
    renderScanner();
    await advanceToScanComplete();
    expect(readScannerStepState()).toBeNull();
    expect(accountApi.getRhHistoryScanPipelineStatus).not.toHaveBeenCalledWith(
      "access-token",
      historyId,
      1,
      undefined
    );
  });
});

describe("Scanner history create on mount", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    vi.mocked(accountApi.createRhHistory).mockResolvedValue({
      id: testHistoryId,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("reaches ready under StrictMode after createRhHistory succeeds", async () => {
    renderScanner({ strictMode: true });

    const startButton = await screen.findByRole("button", {
      name: "Start scanning",
    });

    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
      expect(
        screen.queryByText("Preparing your rent history record…")
      ).not.toBeInTheDocument();
    });

    expect(accountApi.createRhHistory).toHaveBeenCalledTimes(1);
    expect(accountApi.createRhHistory).toHaveBeenCalledWith("access-token");
    expect(getRhHistoryId()).toBe(testHistoryId);
  });
});

describe("Scanner overlay visibility", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    scannerHarness.hangLaunch = true;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(scannerOverlay.isDynamsoftScannerLiveViewVisible).mockReturnValue(
      false
    );
    vi.mocked(scannerOverlay.isRetakeOrSavePreviewVisible).mockReturnValue(
      false
    );
  });

  afterEach(() => {
    scannerHarness.hangLaunch = false;
    scannerHarness.releaseLaunch();
    vi.useRealTimers();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows the in-progress fallback while scanning before live view is visible", async () => {
    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
      expect(screen.getByText("Scanning in process")).toBeInTheDocument();
    });

    expect(
      document.body.querySelector(".scanner-scan-guide")
    ).not.toBeInTheDocument();

    scannerHarness.releaseLaunch();
  });

  it("hides the overlay while retake/save preview is visible and shows it again on live capture", async () => {
    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
    });

    expect(
      document.body.querySelector(".scanner-scan-guide")
    ).not.toBeInTheDocument();

    vi.mocked(scannerOverlay.isDynamsoftScannerLiveViewVisible).mockReturnValue(
      true
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    await waitFor(() => {
      expect(
        document.body.querySelector(".scanner-scan-guide")
      ).toBeInTheDocument();
      expect(screen.getByText("Looking for your document")).toBeInTheDocument();
    });

    vi.mocked(scannerOverlay.isRetakeOrSavePreviewVisible).mockReturnValue(
      true
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    await waitFor(() => {
      expect(
        document.body.querySelector(".scanner-scan-guide")
      ).not.toBeInTheDocument();
    });

    vi.mocked(scannerOverlay.isRetakeOrSavePreviewVisible).mockReturnValue(
      false
    );
    vi.mocked(scannerOverlay.isDynamsoftScannerLiveViewVisible).mockReturnValue(
      true
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    await waitFor(() => {
      expect(
        document.body.querySelector(".scanner-scan-guide")
      ).toBeInTheDocument();
    });

    scannerHarness.releaseLaunch();
  }, 10_000);
});

describe("Scanner expectedPageCount lifecycle", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    vi.mocked(accountApi.finalizeRhHistoryScan).mockResolvedValue({
      status: "ok",
      expected_page_count: 1,
      uploads_observed_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      scan_pipeline_status: "awaiting_uploads",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("passes incremented upload count to finalize-scan after a scan", async () => {
    renderScanner();
    await advanceToScanComplete();

    await waitFor(() => {
      expect(uploadScan).toHaveBeenCalledWith(
        expect.stringMatching(/^1\/.+\/.+\.jpg$/),
        expect.any(Blob),
        { retries: 1 }
      );
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledWith(
        "access-token",
        finalizeScanRequest(1)
      );
    });
  });
});

describe("Scanner upload failures", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    vi.mocked(uploadScan).mockResolvedValue(undefined);
    vi.mocked(accountApi.finalizeRhHistoryScan).mockResolvedValue({
      status: "ok",
      expected_page_count: 1,
      uploads_observed_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      scan_pipeline_status: "awaiting_uploads",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
    scannerHarness.autoScanCount = 1;
  });

  it("returns to pre-scan when all uploads fail and no pages are saved", async () => {
    vi.mocked(uploadScan).mockRejectedValue(new Error("upload failed"));

    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(uploadScan).toHaveBeenCalledWith(
        expect.stringMatching(/^1\/.+\/.+\.jpg$/),
        expect.any(Blob),
        { retries: 1 }
      );
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("scan-review-upload-failure")
    ).not.toBeInTheDocument();
    expect(accountApi.getRhHistoryScanPipelineStatus).not.toHaveBeenCalledWith(
      "access-token",
      historyId,
      1,
      undefined
    );
  });

  it("finalizes with successful upload count when some uploads fail on happy path", async () => {
    scannerHarness.autoScanCount = 2;
    vi.mocked(uploadScan)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("upload failed"));

    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(uploadScan).toHaveBeenCalledTimes(2);
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledWith(
        "access-token",
        finalizeScanRequest(1)
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
        replace: true,
      });
    });

    expect(
      screen.queryByTestId("scan-review-upload-failure")
    ).not.toBeInTheDocument();
  });

  it("navigates to scan-review with failedUploadCount when finalize fails after uploads", async () => {
    scannerHarness.autoScanCount = 2;
    vi.mocked(uploadScan)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("upload failed"));
    vi.mocked(accountApi.finalizeRhHistoryScan).mockRejectedValueOnce(
      new AccountApiError(400, {
        error: "finalize failed",
        error_code: "validation_error",
      })
    );

    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scan-review", {
        replace: true,
        state: expect.objectContaining({
          failedUploadCount: 1,
        }),
      });
    });
  });
});

describe("Scanner phase persistence", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("redirects to scan-review from session without showing pre-scan", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    mockBootstrapReady({
      ...readyScanReviewResponse,
      db_count: 2,
      expected_page_count: 2,
    });

    renderScanner();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scan-review");
    });
  });

  it("shows pre-scan after clearRhFlowSession even when DB has pages", async () => {
    mockBootstrapReady();
    clearRhFlowSession();
    vi.mocked(accountApi.createRhHistory).mockResolvedValue({
      id: testHistoryId,
    });

    renderScanner();

    await screen.findByRole("button", { name: "Start scanning" });
    expect(readScannerStepState()).toBeNull();
    expect(accountApi.getRhHistoryScanPipelineStatus).not.toHaveBeenCalled();
  });

  it("shows pre-scan after switching histories clears stale scanner step and pages", async () => {
    const historyA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const historyB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

    setRhHistoryId(historyA);
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 3 });
    setRhSessionAnalysisPages([
      {
        s3_key: `1/${historyA}/page1.jpg`,
        start_year: 2020,
        end_year: 2021,
      },
    ]);

    switchRhHistory(historyB);
    mockBootstrapNoRestorablePages();

    renderScanner();

    await screen.findByRole("button", { name: "Start scanning" });
    expect(readScannerStepState()).toBeNull();
    expect(getRhSessionAnalysisPages()).toEqual([]);
  });

  it("ignores scanner step state when stored historyId does not match active session", async () => {
    const historyA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const historyB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

    setRhHistoryId(historyB);
    setRhSessionStepState(SCANNER_STEP_STATE_KEY, {
      historyId: historyA,
      phase: "scan-review",
      expectedPageCount: 3,
    });
    mockBootstrapNoRestorablePages();

    renderScanner();

    await screen.findByRole("button", { name: "Start scanning" });
    expect(readScannerStepState()).toBeNull();
  });
});

describe("Scanner unmount cleanup", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    scannerHarness.hangLaunch = false;
    scannerHarness.lastInstance = null;
    mockBootstrapNoRestorablePages();
  });

  afterEach(() => {
    scannerHarness.hangLaunch = false;
    scannerHarness.releaseLaunch();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("does not persist scan-review when unmounting during active scan with pages", async () => {
    scannerHarness.hangLaunch = true;
    const view = renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
    });

    await act(async () => {
      await scannerHarness.simulateDocumentScan();
    });

    await waitFor(() => {
      expect(readScannerStepState()).toBeNull();
    });

    view.unmount();

    expect(
      scannerHarness.lastInstance?.stopContinuousScanning
    ).toHaveBeenCalled();
    expect(scannerHarness.lastInstance?.dispose).toHaveBeenCalled();
    expect(readScannerStepState()).toBeNull();
  });

  it("disposes without persisting step state when unmounting during active scan with no pages", async () => {
    scannerHarness.hangLaunch = true;
    const view = renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
    });

    view.unmount();

    expect(scannerHarness.lastInstance?.dispose).toHaveBeenCalled();
    expect(
      scannerHarness.lastInstance?.stopContinuousScanning
    ).toHaveBeenCalled();
    expect(readScannerStepState()).toBeNull();
  });

  it("does not initialize Dynamsoft when saved scan-review redirects away from scanner", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    mockBootstrapReady({
      ...readyScanReviewResponse,
      db_count: 2,
      expected_page_count: 2,
    });

    const view = renderScanner();
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scan-review");
    });
    view.unmount();

    expect(scannerHarness.lastInstance).toBeNull();
    expect(readScannerStepState()).toEqual({
      historyId,
      phase: "scan-review",
      expectedPageCount: 2,
    });
  });

  it("does not restore scan-review after unmounting mid-scan with pages", async () => {
    scannerHarness.hangLaunch = true;

    const first = renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
    });

    await act(async () => {
      await scannerHarness.simulateDocumentScan();
    });

    first.unmount();

    expect(readScannerStepState()).toBeNull();

    mockBootstrapNoRestorablePages();
    renderScanner();
    await screen.findByRole("button", { name: "Start scanning" });
  });

  it("disposes when unmounting from pre-scan", async () => {
    const view = renderScanner();
    await screen.findByRole("button", { name: "Start scanning" });
    view.unmount();

    expect(scannerHarness.lastInstance?.dispose).toHaveBeenCalled();
  });
});

describe("Scanner tab hide during active scan", () => {
  const originalVisibilityState = document.visibilityState;

  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    scannerHarness.hangLaunch = true;
    scannerHarness.lastInstance = null;
    mockBootstrapNoRestorablePages();
  });

  afterEach(() => {
    scannerHarness.hangLaunch = false;
    scannerHarness.releaseLaunch();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: originalVisibilityState,
    });
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  const startActiveScanWithPage = async () => {
    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-in-progress")).toBeInTheDocument();
    });

    await act(async () => {
      await scannerHarness.simulateDocumentScan();
    });
  };

  it("does not finalize on visibilitychange while Dynamsoft launch is active", async () => {
    await startActiveScanWithPage();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(accountApi.finalizeRhHistoryScan).not.toHaveBeenCalled();
  });

  it("does not finalize on pagehide while Dynamsoft launch is active", async () => {
    await startActiveScanWithPage();

    window.dispatchEvent(new Event("pagehide"));

    expect(accountApi.finalizeRhHistoryScan).not.toHaveBeenCalled();
  });

  it("finalizes once on normal Dynamsoft exit after tab hide events", async () => {
    await startActiveScanWithPage();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pagehide"));
    expect(accountApi.finalizeRhHistoryScan).not.toHaveBeenCalled();

    await act(async () => {
      scannerHarness.releaseLaunch();
    });

    await waitFor(() => {
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledTimes(1);
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledWith(
        "access-token",
        finalizeScanRequest(1)
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
        replace: true,
      });
    });
  });
});

describe("Scanner launch failure handling", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    scannerHarness.rejectLaunch = false;
    scannerHarness.rejectLaunchError = null;
    vi.mocked(accountApi.finalizeRhHistoryScan).mockResolvedValue({
      status: "ok",
      expected_page_count: 1,
      uploads_observed_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      scan_pipeline_status: "awaiting_uploads",
    });
  });

  afterEach(() => {
    scannerHarness.rejectLaunch = false;
    scannerHarness.rejectLaunchError = null;
    delete (globalThis as { __scannerTestInitDelay?: Promise<void> })
      .__scannerTestInitDelay;
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows init error on pre-scan when scanner fails to initialize", async () => {
    const { DocumentScanner } = await import("dynamsoft-document-scanner");
    vi.mocked(DocumentScanner).mockImplementationOnce(() => {
      throw new Error("Scanner init failed");
    });

    renderScanner();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to load the scanner. Please refresh the page and try again."
      );
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).toBeDisabled();
      expect(
        screen.queryByTestId("scan-review-launch-failure")
      ).not.toBeInTheDocument();
    });
  });

  it("disables Start scanning while scanner is initializing", async () => {
    let releaseInit!: () => void;
    (
      globalThis as { __scannerTestInitDelay?: Promise<void> }
    ).__scannerTestInitDelay = new Promise<void>((resolve) => {
      releaseInit = resolve;
    });

    renderScanner();

    await waitFor(() => {
      expect(
        screen.queryByTestId("scanner-restore-loading")
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Loading scanner…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start scanning" })
    ).toBeDisabled();

    releaseInit();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).not.toBeDisabled();
    });
    expect(screen.queryByText("Loading scanner…")).not.toBeInTheDocument();

    delete (globalThis as { __scannerTestInitDelay?: Promise<void> })
      .__scannerTestInitDelay;
  });

  it("routes permission errors to camera-access without launch failure InfoBox", async () => {
    scannerHarness.rejectLaunch = true;
    scannerHarness.rejectLaunchError = new DOMException(
      "Permission denied",
      "NotAllowedError"
    );
    renderScanner();

    await clickStartScanning();

    await waitFor(() => {
      expect(screen.getByText("Camera access")).toBeInTheDocument();
      expect(
        screen.queryByTestId("scan-review-launch-failure")
      ).not.toBeInTheDocument();
    });

    scannerHarness.rejectLaunch = false;
    scannerHarness.rejectLaunchError = null;
    fireEvent.click(screen.getByRole("button", { name: "Start scanning" }));

    await waitFor(() => {
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalled();
    });
  });

  it("shows launch error on pre-scan when launch rejects", async () => {
    scannerHarness.rejectLaunch = true;
    renderScanner();

    await clickStartScanning();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("scan-review-launch-failure")
      ).not.toBeInTheDocument();
    });
  });
});

describe("Scanner postCompileReturn mode", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      last_step_reached: "FINDINGS_OVERVIEW",
      scan_pipeline_status: "complete",
      expected_page_count: 3,
      pages_landed_count: 3,
      pages_terminal_count: 3,
      processing_complete: true,
      uploads_observed_count: 3,
      early_validation: null,
      user_message_key: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("opens SkipOrRescanModal and navigates via historyResumePath on Skip", async () => {
    renderScanner({
      initialEntries: [
        {
          pathname: "/en/scanner",
          state: { postCompileReturn: true },
        },
      ],
    });

    await screen.findByRole("button", { name: "Skip or Re-scan" });
    fireEvent.click(screen.getByRole("button", { name: "Skip or Re-scan" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/findings-overview");
    });
  });

  it("calls delete-all-scanned-pages when Re-scan is chosen", async () => {
    renderScanner({
      initialEntries: [
        {
          pathname: "/en/scanner",
          state: { postCompileReturn: true },
        },
      ],
    });

    await screen.findByRole("button", { name: "Skip or Re-scan" });
    fireEvent.click(screen.getByRole("button", { name: "Skip or Re-scan" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-scan" }));

    await waitFor(() => {
      expect(accountApi.deleteAllRhScannedPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
    });
  });
});

describe("Scanner pipeline bootstrap error", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapNoRestorablePages();
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows bootstrap error and blocks pre-scan when pipeline fetch fails", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    renderScanner();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-bootstrap-error")).toBeInTheDocument();
      expect(
        screen.getByText("Unable to load compile status")
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Start scanning" })
    ).not.toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalledWith("/en/scan-review");
  });

  it("does not redirect to scan-review when pipeline fails with saved session", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    renderScanner();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-bootstrap-error")).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalledWith("/en/scan-review");
  });

  it("retries pipeline bootstrap and shows pre-scan on success", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({
        last_step_reached: "DOCUMENT_SCAN",
        scan_pipeline_status: "complete",
        expected_page_count: 1,
        pages_landed_count: 1,
        pages_terminal_count: 1,
        processing_complete: true,
        uploads_observed_count: 1,
        early_validation: null,
        user_message_key: null,
      });

    renderScanner();

    await waitFor(() => {
      expect(screen.getByTestId("scanner-bootstrap-error")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Start scanning" })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("scanner-bootstrap-error")
    ).not.toBeInTheDocument();
  });
});
