import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RhEarlyValidation } from "../../../api/account/types";
import { ScanReviewMode } from "./scanReviewModes";
import { ScanReviewFlow } from "./ScanReviewFlow";
import * as accountApi from "../../../api/account/api";

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

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    confirmRhHistoryLastRegYear: vi.fn(),
  };
});

const warningOnlyEarlyValidation: RhEarlyValidation = {
  passed: true,
  document_total_pages: null,
  missing_page_numbers: [],
  pages_needing_rescan: [],
  scanned_max_reg_year: 2003,
  warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
};

const errorsAndWarningEarlyValidation: RhEarlyValidation = {
  passed: false,
  document_total_pages: null,
  missing_page_numbers: [],
  pages_needing_rescan: [
    {
      id: 7,
      page_number: 2,
      total_pages: null,
    },
  ],
  scanned_max_reg_year: 2003,
  warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderScanReviewFlow = (
  props: Partial<React.ComponentProps<typeof ScanReviewFlow>> = {}
) => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/scan-review"]}>
        <I18nProvider i18n={i18n}>
          <ScanReviewFlow
            flowMode={ScanReviewMode.warningOnly}
            earlyValidation={warningOnlyEarlyValidation}
            accessToken="access-token"
            historyId={testHistoryId}
            expectedPageCount={2}
            onIncrementalRescan={vi.fn()}
            {...props}
          />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const selectLastRegYear = async (year: number) => {
  const combobox = screen.getByRole("combobox");
  fireEvent.mouseDown(combobox);
  fireEvent.click(screen.getByRole("option", { name: String(year) }));
};

describe("ScanReviewFlow", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the year step with Continue disabled until a year is selected", async () => {
    renderScanReviewFlow();

    expect(screen.getByTestId("scan-review-flow")).toBeInTheDocument();
    expect(
      screen.getByText("We may be missing some of your rent history")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "What is the last year of rent registration shown on your document?"
      )
    ).toBeInTheDocument();

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeDisabled();

    await selectLastRegYear(2003);

    expect(continueButton).toBeEnabled();
  });

  it("navigates to compiling when Continue matches scanned max reg year", async () => {
    vi.mocked(accountApi.confirmRhHistoryLastRegYear).mockResolvedValue({
      matched: true,
      declared_last_reg_year: 2003,
      scanned_max_reg_year: 2003,
      scan_pipeline_status: "complete",
    });

    renderScanReviewFlow();

    await selectLastRegYear(2003);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(accountApi.confirmRhHistoryLastRegYear).toHaveBeenCalledWith(
        "access-token",
        {
          history_id: testHistoryId,
          last_reg_year: 2003,
        }
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/compiling", {
        replace: true,
      });
    });
  });

  it("reveals reg year mismatch callout when declared year exceeds scanned max", async () => {
    vi.mocked(accountApi.confirmRhHistoryLastRegYear).mockResolvedValue({
      matched: false,
      declared_last_reg_year: 2020,
      scanned_max_reg_year: 2003,
      missing_reg_year_ranges: ["2004-2020"],
      page_error_reg_year_ranges: [],
      scan_pipeline_status: "needs_rescan",
    });

    renderScanReviewFlow();

    await selectLastRegYear(2020);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-reg-year-error-callout")
      ).toBeInTheDocument();
    });

    const callout = screen.getByTestId("scan-review-reg-year-error-callout");
    expect(within(callout).getAllByText("2004-2020").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Re-scan for these years" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Continue" })
    ).not.toBeInTheDocument();

    const stack = screen.getByTestId("scan-review-module-stack");
    expect(stack).toHaveAttribute("data-revealed-count", "2");
  });

  it("lists only trailing missing ranges when confirm returns both arrays", async () => {
    vi.mocked(accountApi.confirmRhHistoryLastRegYear).mockResolvedValue({
      matched: false,
      declared_last_reg_year: 2020,
      scanned_max_reg_year: 2003,
      missing_reg_year_ranges: ["2004-2020"],
      page_error_reg_year_ranges: [],
      scan_pipeline_status: "needs_rescan",
    });

    renderScanReviewFlow({
      flowMode: ScanReviewMode.errorsAndWarning,
      earlyValidation: errorsAndWarningEarlyValidation,
    });

    await selectLastRegYear(2020);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(
        screen.getByTestId("scan-review-reg-year-error-callout")
      ).toBeInTheDocument();
    });

    const callout = screen.getByTestId("scan-review-reg-year-error-callout");
    expect(within(callout).queryByText("1990-1998")).not.toBeInTheDocument();
    expect(within(callout).getByRole("listitem")).toHaveTextContent("2004-2020");
  });

  it("calls onIncrementalRescan from the mismatch callout CTA", async () => {
    const onIncrementalRescan = vi.fn();

    vi.mocked(accountApi.confirmRhHistoryLastRegYear).mockResolvedValue({
      matched: false,
      declared_last_reg_year: 2020,
      scanned_max_reg_year: 2003,
      missing_reg_year_ranges: ["2004-2020"],
      page_error_reg_year_ranges: [],
      scan_pipeline_status: "needs_rescan",
    });

    renderScanReviewFlow({ onIncrementalRescan });

    await selectLastRegYear(2020);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Re-scan for these years" })
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Re-scan for these years" })
    );

    expect(onIncrementalRescan).toHaveBeenCalledTimes(1);
  });
});
