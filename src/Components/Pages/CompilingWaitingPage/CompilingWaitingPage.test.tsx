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
import { MemoryRouter, NavigationType } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../../../api/account/api";
import * as rhSessionStorage from "../../../session/rhSessionStorage";
import CompilingWaitingPage from "./CompilingWaitingPage";
import "./CompilingWaitingPage.scss";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "test-history-id";

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

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    getRhHistoryScanPipelineStatus: vi.fn(),
  };
});

vi.mock("../../../session/rhSessionStorage", async () => {
  const actual = await vi.importActual<
    typeof import("../../../session/rhSessionStorage")
  >("../../../session/rhSessionStorage");
  return {
    ...actual,
    getRhAuthSession: vi.fn(),
    getRhHistoryId: vi.fn(),
  };
});

const mockAuthSession: rhSessionStorage.RhSessionAuth = {
  accessToken: TEST_ACCESS_TOKEN,
  refreshToken: "test-refresh-token",
  tokenType: "Bearer",
  scope: "read write",
  expiresAtMs: Date.now() + 60 * 60 * 1000,
  profile: {
    id: 1,
    phone_number: "15551234567",
  },
};

const passedEarlyValidation = {
  passed: true,
  missing_page_numbers: [],
  pages_needing_rescan: [],
  scanned_max_reg_year: 2020,
  warnings: [],
};

const processingResponse = {
  declared_last_reg_year: null,
  scan_pipeline_status: "processing_terminal" as const,
  expected_page_count: 2,
  uploads_observed_count: 2,
  pages_landed_count: 2,
  pages_terminal_count: 1,
  processing_complete: false,
  user_message_key: "extracting_details",
  last_step_reached: "COMPILING" as const,
  early_validation: passedEarlyValidation,
};

const completeResponse = {
  declared_last_reg_year: null,
  scan_pipeline_status: "complete" as const,
  expected_page_count: 2,
  uploads_observed_count: 2,
  pages_landed_count: 2,
  pages_terminal_count: 2,
  processing_complete: true,
  user_message_key: null,
  last_step_reached: "FINDINGS_OVERVIEW" as const,
  early_validation: passedEarlyValidation,
};

const failedResponse = {
  declared_last_reg_year: null,
  scan_pipeline_status: "failed" as const,
  expected_page_count: 2,
  uploads_observed_count: 2,
  pages_landed_count: 2,
  pages_terminal_count: 2,
  processing_complete: false,
  user_message_key: null,
  last_step_reached: "COMPILING" as const,
  early_validation: null,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

let queryClient: QueryClient;

const renderCompilingWaitingPage = (initialEntry = "/en/compiling") => {
  i18n.load("en", {});
  i18n.activate("en");
  queryClient = createTestQueryClient();

  return render(
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <CompilingWaitingPage />
        </MemoryRouter>
      </QueryClientProvider>
    </I18nProvider>
  );
};

describe("CompilingWaitingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationTypeMock.mockReturnValue(NavigationType.Push);
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      processingResponse
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders milestone checklist and SMS callout while polling", async () => {
    renderCompilingWaitingPage();

    expect(
      await screen.findByText("Securely compiling your rent history")
    ).toBeInTheDocument();
    expect(screen.getByText("Checking scan quality")).toBeInTheDocument();
    expect(screen.getByText("Extracting data")).toBeInTheDocument();
    expect(screen.getByText("Analyzing rent history")).toBeInTheDocument();
    expect(screen.getByTestId("compiling-sms-callout")).toBeInTheDocument();
    expect(screen.queryByTestId("flow-nav")).not.toBeInTheDocument();
  });

  it("shows unknown recovery screen on failed status without auto-navigating", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      failedResponse
    );

    renderCompilingWaitingPage();

    expect(
      await screen.findByTestId("scan-review-recovery-unknown")
    ).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Come back later" })
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("compiling-sms-callout")).toBeInTheDocument();
  });

  it("navigates to account when user taps Come back later on failed status", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      failedResponse
    );

    renderCompilingWaitingPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Come back later" })
    );

    expect(navigateMock).toHaveBeenCalledWith("/en/account");
  });

  it("shows FlowNav when pipeline is complete without auto-navigating", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      completeResponse
    );

    renderCompilingWaitingPage();

    expect(await screen.findByTestId("flow-nav")).toBeInTheDocument();
    expect(screen.getByText("Restart")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("navigates via historyResumePath when user taps Next on complete status", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue({
      ...completeResponse,
      last_step_reached: "REPORT",
    });

    renderCompilingWaitingPage();

    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    expect(navigateMock).toHaveBeenCalledWith("/en/report");
  });

  it("navigates to scanner return mode when user taps Restart", async () => {
    vi.mocked(accountApi.getRhHistoryScanPipelineStatus).mockResolvedValue(
      completeResponse
    );

    renderCompilingWaitingPage();

    fireEvent.click(await screen.findByRole("button", { name: "Restart" }));

    expect(navigateMock).toHaveBeenCalledWith("/en/scanner", {
      state: { postCompileReturn: true },
    });
  });
});
