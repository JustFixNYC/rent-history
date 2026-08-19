import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScanReviewPage from "./ScanReviewPage";
import * as accountApi from "../../../api/account/api";
import {
  clearRhAuthSession,
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";
import { writeScannerStepState } from "./scanReviewState";

const { navigateMock, testHistoryId, defaultPipelineResponse } = vi.hoisted(
  () => ({
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
  })
);

const partialEarlyValidation = {
  passed: false,
  document_total_pages: 6,
  missing_page_numbers: [3, 5],
  pages_needing_rescan: [
    { id: 7, page_number: 2, total_pages: 6 },
    { id: null, page_number: 5, total_pages: 6 },
  ],
};

const needsRescanPipelineResponse = {
  last_step_reached: "COMPILING" as const,
  scan_pipeline_status: "needs_rescan" as const,
  expected_page_count: 4,
  pages_landed_count: 4,
  pages_terminal_count: 4,
  processing_complete: true,
  uploads_observed_count: 4,
  early_validation: partialEarlyValidation,
  user_message_key: null,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    getRhHistoryScanPipelineStatus: vi
      .fn()
      .mockResolvedValue(defaultPipelineResponse),
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

describe("ScanReviewPage error states", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 4 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      needsRescanPipelineResponse
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows partial error with Page N of M labels from pipeline early_validation", async () => {
    renderScanReview();

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-partial-error")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("We weren't able to capture all of your rent history.")
    ).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 6")).toBeInTheDocument();
    expect(screen.getByText("Page 5 of 6")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Re-scan these pages" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("analysis-flow-progress")).toHaveAttribute(
      "data-step-id",
      "compiling"
    );
  });

  it("shows single-page CTA when one page needs rescan", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      ...needsRescanPipelineResponse,
      early_validation: {
        passed: false,
        document_total_pages: 1,
        missing_page_numbers: [],
        pages_needing_rescan: [{ id: 7, page_number: 1, total_pages: 1 }],
      },
    });

    renderScanReview();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Re-scan this page" })
      ).toBeInTheDocument();
    });
  });

  it("shows total failure for non-pipeline entry paths", async () => {
    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state: { showLaunchFailure: true },
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByTestId("scan-review-total-error")).toBeInTheDocument();
    });

    expect(
      screen.getByText("We weren't able to read your document")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Re-scan document" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request your rent history" })
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("scan-review-page-error-callout")
    ).not.toBeInTheDocument();
  });

  it("shows total failure when pages lack readable page_number labels", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      ...needsRescanPipelineResponse,
      early_validation: {
        passed: false,
        document_total_pages: null,
        missing_page_numbers: [],
        pages_needing_rescan: [{ id: 7, page_number: null, total_pages: null }],
      },
    });

    renderScanReview();

    await waitFor(() => {
      expect(screen.getByTestId("scan-review-total-error")).toBeInTheDocument();
    });
  });

  it("uses early_validation from location state without requiring scan-review API", async () => {
    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state: { earlyValidation: partialEarlyValidation },
        },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-partial-error")
      ).toBeInTheDocument();
    });

    expect(accountApi.getRhHistoryScanPipelineStatus).toHaveBeenCalled();
  });
});

describe("ScanReviewPage bootstrap error", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it("shows bootstrap error when pipeline fetch fails", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockRejectedValue(
      new Error("network error")
    );

    renderScanReview();

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-bootstrap-error")
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("scan-review-partial-error")
    ).not.toBeInTheDocument();
  });

  it("retries pipeline bootstrap and renders error UI on success", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(needsRescanPipelineResponse);

    renderScanReview();

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-bootstrap-error")
      ).toBeInTheDocument();
    });

    screen.getByRole("button", { name: "Try again" }).click();

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-partial-error")
      ).toBeInTheDocument();
    });
  });
});

describe("ScanReviewPage non-pipeline failures", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      defaultPipelineResponse
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it.each([
    { reviewError: "finalize failed" },
    { failedUploadCount: 2 },
    { awaitingRescanSuccess: true },
  ])("renders total failure for location state %#", async (state) => {
    renderScanReview({
      initialEntries: [
        {
          pathname: "/en/scan-review",
          state,
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByTestId("scan-review-total-error")).toBeInTheDocument();
    });
  });
});
