import { act } from "react";
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

import ScanReviewPage from "./ScanReviewPage";
import { AccountApiError } from "../../../api/account";
import * as accountApi from "../../../api/account/api";
import {
  clearRhAuthSession,
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";
import { readScannerStepState, writeScannerStepState } from "./scanReviewState";

const { navigateMock, testHistoryId } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  testHistoryId: "22222222-2222-4222-8222-222222222222",
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

const mockRetakeScanReview = () => {
  vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
    async (_token, _hid, _count, opts) => {
      const response = {
        ...readyScanReviewResponse,
        pages: [
          {
            id: 7,
            extraction_status: "needs_retake" as const,
            needs_retake: true,
            s3_key: `1/${testHistoryId}/page-retake.jpg`,
            start_year: 2018,
            end_year: 2019,
            is_coverpage: false,
          },
        ],
      };
      if (opts?.acceptPartial) {
        return response;
      }
      return response;
    }
  );
};

const waitForScanReviewReady = async () => {
  await waitFor(() => {
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();
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
              extraction_status: "complete" as const,
              needs_retake: false,
              s3_key: `1/${testHistoryId}/page1.jpg`,
              start_year: 2020,
              end_year: 2021,
              is_coverpage: false,
            },
          ],
        };
      }),
    getRhHistoryScanPipelineStatus: vi.fn().mockResolvedValue({
      last_step_reached: "DOCUMENT_SCAN",
      scan_pipeline_status: "complete",
      expected_page_count: 1,
      pages_landed_count: 1,
      pages_terminal_count: 1,
      processing_complete: true,
      uploads_observed_count: 1,
      early_validation: null,
      user_message_key: null,
    }),
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

const renderScanReview = (options?: {
  initialEntries?: MemoryRouterProps["initialEntries"];
}) => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={options?.initialEntries ?? ["/en/scan-review"]}
      >
        <I18nProvider i18n={i18n}>
          <ScanReviewPage />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const advanceToScanReview = async (options?: {
  skipDefaultMock?: boolean;
  allowDisabledNext?: boolean;
}) => {
  writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
  if (!options?.skipDefaultMock) {
    mockBootstrapReady();
  }
  renderScanReview();
  if (options?.allowDisabledNext) {
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Restart scan" })
      ).toBeInTheDocument();
    });
  } else {
    await waitForScanReviewReady();
  }
};

describe("ScanReviewPage finalize", () => {
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

  it("calls finalize-scan and navigates to /compiling when Next is clicked", async () => {
    await advanceToScanReview();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(accountApi.finalizeRhHistoryScan).toHaveBeenCalledWith(
        "access-token",
        finalizeScanRequest(1)
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
        replace: true,
      });
    });
  });

  it("shows backend error message and stays on scan-review when finalize-scan fails", async () => {
    vi.mocked(accountApi.finalizeRhHistoryScan).mockRejectedValue(
      new AccountApiError(400, {
        error: "expected_page_count is below stored page count",
        error_code: "validation_error",
      })
    );

    await advanceToScanReview();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await screen.findByText("expected_page_count is below stored page count");
    expect(navigateMock).not.toHaveBeenCalledWith(
      "/en/compiling",
      expect.anything()
    );
  });
});

describe("ScanReviewPage rescan and restart", () => {
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

  it("decrements expectedPageCount when re-scanning retake pages", async () => {
    mockRetakeScanReview();

    await advanceToScanReview({ skipDefaultMock: true });

    fireEvent.click(screen.getByRole("button", { name: "Re-scan this page" }));

    await waitFor(() => {
      expect(accountApi.deleteRhScannedPages).toHaveBeenCalledWith(
        "access-token",
        historyId,
        [7]
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner", {
        state: { captureIntent: { mode: "rescan", pageIds: [7] } },
      });
    });
  });

  it("resets expectedPageCount when restarting the scan", async () => {
    await advanceToScanReview();

    fireEvent.click(screen.getByRole("button", { name: "Restart scan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Restart scan" })[1]);

    await waitFor(() => {
      expect(accountApi.deleteAllRhScannedPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner", {
        state: { captureIntent: { mode: "restart" } },
      });
    });
  });
});

describe("ScanReviewPage upload failure callouts", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapReady();
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows upload failure callout when returning from failed add-more capture", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });

    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state: { failedUploadCount: 1 },
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-upload-failure")
      ).toBeInTheDocument();
    });
  });

  it("navigates to scanner with addMore capture intent when add a page is clicked", async () => {
    await advanceToScanReview();

    fireEvent.click(screen.getByRole("button", { name: "add a page" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner", {
        state: { captureIntent: { mode: "addMore" } },
      });
    });
  });
});

describe("ScanReviewPage callouts", () => {
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
        const response = {
          ...readyScanReviewResponse,
          missing_year_ranges: ["2015-2016"],
        };
        if (opts?.acceptPartial) {
          return response;
        }
        return response;
      }
    );

    await advanceToScanReview({
      skipDefaultMock: true,
      allowDisabledNext: true,
    });

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

    vi.mocked(accountApi.getRhHistoryScanReview).mockImplementation(
      async (_token, _hid, _count, opts) => {
        if (opts?.acceptPartial) {
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

    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });

    renderScanReview();
    await waitFor(() => {
      expect(screen.getByTestId("scan-review-loading")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalled();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000);
    });

    await waitFor(() => {
      expect(accountApi.getRhHistoryScanReview).toHaveBeenCalledWith(
        "access-token",
        historyId,
        1,
        { acceptPartial: true }
      );
      expect(screen.getByText("Still processing pages")).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ScanReviewPage bootstrap and session persistence", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
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

  it("redirects to scanner when scan-review bootstrap fails", async () => {
    mockBootstrapNoRestorablePages();

    renderScanReview();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner");
    });
    expect(readScannerStepState()).toBeNull();
  });

  it("restores scan-review after unmount and remount with session seeded", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
    mockBootstrapReady();

    const first = renderScanReview();
    await waitForScanReviewReady();
    first.unmount();

    renderScanReview();
    await waitForScanReviewReady();
    expect(
      screen.queryByRole("button", { name: "Start scanning" })
    ).not.toBeInTheDocument();
  });

  it("bootstraps scan-review from DB when session step is missing", async () => {
    mockBootstrapReady();

    renderScanReview();

    await waitFor(() => {
      expect(
        screen.queryByTestId("scanner-restore-loading")
      ).not.toBeInTheDocument();
    });
    await waitForScanReviewReady();
    expect(readScannerStepState()).toEqual({
      historyId,
      phase: "scan-review",
      expectedPageCount: 1,
    });
  });

  it("clears scan-review session after successful finalize", async () => {
    mockBootstrapReady();
    await advanceToScanReview();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
        replace: true,
      });
    });
    expect(readScannerStepState()).toBeNull();
  });

  it("clears scanner step state when restart is confirmed", async () => {
    mockBootstrapNoRestorablePages();

    await advanceToScanReview();

    fireEvent.click(screen.getByRole("button", { name: "Restart scan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Restart scan" })[1]);

    await waitFor(() => {
      expect(readScannerStepState()).toBeNull();
    });
  });
});

describe("ScanReviewPage launch failure callouts", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    mockBootstrapReady();
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows launch failure InfoBox when rescan capture returns with showLaunchFailure", async () => {
    mockBootstrapReady({
      ...readyScanReviewResponse,
      pages: [
        {
          id: 7,
          extraction_status: "needs_retake",
          needs_retake: true,
          s3_key: `1/${testHistoryId}/page-retake.jpg`,
          start_year: 2018,
          end_year: 2019,
          is_coverpage: false,
        },
      ] as unknown as typeof readyScanReviewResponse.pages,
    });

    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });

    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state: { showLaunchFailure: true },
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-launch-failure")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  it("shows launch failure InfoBox when add-more capture returns with showLaunchFailure", async () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });

    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state: { showLaunchFailure: true },
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-launch-failure")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  it("shows scan review error callout when rescan delete API fails", async () => {
    mockRetakeScanReview();
    vi.mocked(accountApi.deleteRhScannedPages).mockRejectedValueOnce(
      new AccountApiError(500, {
        error: "delete failed",
        error_code: "storage_write_failed",
      })
    );

    await advanceToScanReview({ skipDefaultMock: true });

    fireEvent.click(screen.getByRole("button", { name: "Re-scan this page" }));

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load scan review")
      ).toBeInTheDocument();
      expect(screen.getByText("delete failed")).toBeInTheDocument();
      expect(
        screen.queryByTestId("scan-review-launch-failure")
      ).not.toBeInTheDocument();
    });
  });
});
