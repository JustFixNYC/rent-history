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
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Scanner from "./Scanner";
import { AccountApiError } from "../../../api/account";
import * as accountApi from "../../../api/account/api";
import * as scannerOverlay from "./scanner-overlay";
import {
  clearRhAuthSession,
  clearRhFlowSession,
  getRhHistoryId,
  getRhSessionAnalysisPages,
  readRhSessionDocument,
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";
import {
  readScannerStepState,
  SCANNER_STEP_STATE_KEY,
  writeScannerStepState,
} from "./scannerState";

const { navigateMock, testHistoryId, scannerHarness } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  testHistoryId: "22222222-2222-4222-8222-222222222222",
  scannerHarness: {
    hangLaunch: false,
    launchResolvers: [] as Array<() => void>,
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
    this: { launch: ReturnType<typeof vi.fn> },
    config?: {
      onDocumentScanned?: (result: {
        correctedImageResult?: { toBlob: (type: string) => Promise<Blob> };
      }) => void | Promise<void>;
    }
  ) {
    scannerHarness.onDocumentScanned = config?.onDocumentScanned ?? null;
    this.launch = vi.fn().mockImplementation(async () => {
      if (scannerHarness.hangLaunch) {
        await new Promise<void>((resolve) => {
          scannerHarness.launchResolvers.push(resolve);
        });
        return;
      }

      await scannerHarness.simulateDocumentScan();
    });
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
  vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
    async (_token, _hid, _count, opts) => {
      if (opts?.acceptPartial) {
        throw new AccountApiError(400, {
          error: "no pages",
          error_code: "validation_error",
        });
      }
      return readyScanReviewResponse;
    }
  );
};

const mockBootstrapReady = (
  response: typeof readyScanReviewResponse = readyScanReviewResponse
) => {
  vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
    async (_token, _hid, _count, opts) => {
      if (opts?.acceptPartial) {
        return response;
      }
      return response;
    }
  );
};

const waitForScanReviewReady = async () => {
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
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
    getRhHistoryScanReview: vi
      .fn()
      .mockImplementation(async (_token, _hid, _count, opts) => {
        if (opts?.acceptPartial) {
          throw new AccountApiError(400, {
            error: "no pages",
            error_code: "validation_error",
          });
        }
        return {
          status: "ready",
          db_count: 1,
          expected_page_count: 1,
          processing_complete: true,
          missing_year_ranges: [],
          pages: [
            {
              id: 1,
              needs_retake: false,
              s3_key: `1/${testHistoryId}/page1.jpg`,
              start_year: 2020,
              end_year: 2021,
              is_coverpage: false,
            },
          ],
        };
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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderScanner = (options?: { strictMode?: boolean }) => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();
  const tree = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/scanner"]}>
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
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).not.toBeDisabled();
  });

  return screen.getByRole("button", { name: "Next" });
};

describe("Scanner Next button", () => {
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

  it("calls combine-pages and navigates to /confirm-address on success", async () => {
    vi.mocked(accountApi.combineRhHistoryPages).mockResolvedValue({
      status: "ok",
    });

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(accountApi.combineRhHistoryPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(accountApi.getRhHistoryAnalysisPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(getRhSessionAnalysisPages()).toEqual([
        {
          s3_key: `1/${testHistoryId}/page1.jpg`,
          start_year: 2020,
          end_year: 2021,
        },
      ]);
      expect(navigateMock).toHaveBeenCalledWith("/en/confirm-address");
    });
  });

  it("shows backend error message and stays on scanner when combine-pages fails", async () => {
    vi.mocked(accountApi.combineRhHistoryPages).mockRejectedValue(
      new AccountApiError(400, {
        error: "reg_year sequence is not contiguous",
        error_code: "validation_error",
      })
    );

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await screen.findByText("reg_year sequence is not contiguous");
    expect(navigateMock).not.toHaveBeenCalled();
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
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("passes incremented upload count to scan-review after a scan", async () => {
    renderScanner();
    await advanceToScanComplete();

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
        "access-token",
        historyId,
        1,
        undefined
      );
    });
  });

  it("decrements expectedPageCount when re-scanning retake pages", async () => {
    vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
      async (_token, _hid, _count, opts) => {
        if (opts?.acceptPartial) {
          throw new AccountApiError(400, {
            error: "no pages",
            error_code: "validation_error",
          });
        }
        return {
          ...readyScanReviewResponse,
          pages: [
            {
              id: 7,
              needs_retake: true,
              s3_key: `1/${testHistoryId}/page-retake.jpg`,
              start_year: 2018,
              end_year: 2019,
              is_coverpage: false,
            },
          ],
        };
      }
    );

    renderScanner();
    await advanceToScanComplete();

    const initialPollCount = vi.mocked(accountApi.getRhHistoryScanReview).mock
      .calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Re-scan this page" }));

    await waitFor(() => {
      expect(accountApi.deleteRhScannedPages).toHaveBeenCalledWith(
        "access-token",
        historyId,
        [7]
      );
    });

    await waitFor(() => {
      expect(
        vi.mocked(accountApi.getRhHistoryScanReview).mock.calls.length
      ).toBeGreaterThan(initialPollCount);
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
        "access-token",
        historyId,
        1,
        undefined
      );
    });
  });

  it("resets expectedPageCount when restarting the scan", async () => {
    renderScanner();
    await advanceToScanComplete();

    const initialPollCount = vi.mocked(accountApi.getRhHistoryScanReview).mock
      .calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Restart scan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Restart scan" })[1]);

    await waitFor(() => {
      expect(accountApi.deleteAllRhScannedPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(
        vi.mocked(accountApi.getRhHistoryScanReview).mock.calls.length
      ).toBeGreaterThan(initialPollCount);
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
        "access-token",
        historyId,
        1,
        undefined
      );
    });
  });
});

describe("Scanner scan-review callouts", () => {
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

  it("disables Next when missing_year_ranges is non-empty", async () => {
    vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
      async (_token, _hid, _count, opts) => {
        if (opts?.acceptPartial) {
          throw new AccountApiError(400, {
            error: "no pages",
            error_code: "validation_error",
          });
        }
        return {
          ...readyScanReviewResponse,
          missing_year_ranges: ["2015-2016"],
        };
      }
    );

    renderScanner();
    await clickStartScanning();

    await waitFor(() => {
      expect(
        screen.getByText("Missing registration years")
      ).toBeInTheDocument();
      expect(screen.getByText(/2015-2016/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });
  });

  it("shows a warning callout after accept-partial timeout when processing is incomplete", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    let acceptPartialCalls = 0;
    vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
      async (_token, _hid, _count, opts) => {
        if (opts?.acceptPartial) {
          acceptPartialCalls += 1;
          if (acceptPartialCalls === 1) {
            throw new AccountApiError(400, {
              error: "no pages",
              error_code: "validation_error",
            });
          }
          return {
            ...readyScanReviewResponse,
            processing_complete: false,
          };
        }
        return {
          status: "pending",
          db_count: 0,
          expected_page_count: 1,
        };
      }
    );

    renderScanner();
    await clickStartScanning();

    await screen.findByTestId("scan-review-loading");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(181_000);
    });

    await waitFor(() => {
      expect(screen.getByText("Still processing pages")).toBeInTheDocument();
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
        "access-token",
        historyId,
        1,
        { acceptPartial: true }
      );
    });

    vi.useRealTimers();
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

  it("restores scan-review from session without showing pre-scan", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    mockBootstrapReady({
      ...readyScanReviewResponse,
      db_count: 2,
      expected_page_count: 2,
    });

    renderScanner();

    expect(
      screen.queryByRole("button", { name: "Start scanning" })
    ).not.toBeInTheDocument();
    await waitForScanReviewReady();
    expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
      "access-token",
      historyId,
      1,
      { acceptPartial: true }
    );
    expect(readScannerStepState()).toEqual({
      phase: "scan-review",
      expectedPageCount: 2,
    });
  });

  it("restores scan-review after unmount and remount with session seeded", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
    mockBootstrapReady();

    const first = renderScanner();
    await waitForScanReviewReady();
    first.unmount();

    renderScanner();
    await waitForScanReviewReady();
    expect(
      screen.queryByRole("button", { name: "Start scanning" })
    ).not.toBeInTheDocument();
  });

  it("bootstraps scan-review from DB when session step is missing", async () => {
    mockBootstrapReady();

    renderScanner();

    await waitFor(() => {
      expect(
        screen.queryByTestId("scanner-restore-loading")
      ).not.toBeInTheDocument();
    });
    await waitForScanReviewReady();
    expect(readScannerStepState()).toEqual({
      phase: "scan-review",
      expectedPageCount: 1,
    });
  });

  it("clears stale session and falls back to pre-scan when bootstrap fails", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });
    mockBootstrapNoRestorablePages();

    renderScanner();

    await screen.findByRole("button", { name: "Start scanning" });
    expect(readScannerStepState()).toBeNull();
    expect(
      readRhSessionDocument()?.flow.steps[SCANNER_STEP_STATE_KEY]
    ).toBeUndefined();
  });

  it("keeps scan-review session after Next so remount restores review", async () => {
    mockBootstrapNoRestorablePages();
    vi.mocked(accountApi.combineRhHistoryPages).mockResolvedValue({
      status: "ok",
    });

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/confirm-address");
    });
    expect(readScannerStepState()).toEqual({
      phase: "scan-review",
      expectedPageCount: 1,
    });

    cleanup();
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
    mockBootstrapReady();
    renderScanner();
    await waitForScanReviewReady();
    expect(
      screen.queryByRole("button", { name: "Start scanning" })
    ).not.toBeInTheDocument();
  });

  it("clears scanner step state when restart is confirmed", async () => {
    mockBootstrapNoRestorablePages();

    renderScanner();
    await advanceToScanComplete();

    fireEvent.click(screen.getByRole("button", { name: "Restart scan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Restart scan" })[1]);

    await waitFor(() => {
      expect(readScannerStepState()).toBeNull();
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
    expect(accountApi.getRhHistoryScanReview).not.toHaveBeenCalled();
  });
});
