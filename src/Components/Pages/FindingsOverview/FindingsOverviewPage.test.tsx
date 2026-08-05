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

import * as findingsReviewHooks from "../../../api/account/hooks/findingsReview";
import * as rhSessionStorage from "../../../session/rhSessionStorage";

import findingExamples from "../FindingsReview/__fixtures__/findingExamples.json";
import FindingsOverviewPage from "./FindingsOverviewPage";
import type { Finding } from "../FindingsReview/types/finding";
import "./FindingsOverviewPage.scss";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "test-history-id";

const prehstpaFinding = findingExamples.OVERCHARGE_PREHSTPA as Finding;

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
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

vi.mock("../../../api/account/hooks/findingsReview");

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

let queryClient: QueryClient;

const renderFindingsOverviewPage = (initialEntry = "/en/findings-overview") => {
  i18n.load("en", {});
  i18n.activate("en");
  queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <I18nProvider i18n={i18n}>
          <FindingsOverviewPage />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("FindingsOverviewPage", () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
    navigateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows with-findings copy and navigates to findings-review on Start review", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding],
        review_queue: { ordered_ids: [prehstpaFinding.id] },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsOverviewPage();

    expect(
      await screen.findByText(
        /We've found potential violations in your apartment's rent history/i
      )
    ).toBeInTheDocument();

    const infoBox = screen.getByTestId("findings-overview-info-box");
    expect(infoBox.className).toContain(
      "findings-overview-info-box--with-findings"
    );
    expect(screen.getByText(/Why this is important/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Start review/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/findings-review");
    });
  });

  it("shows no-findings copy and navigates to report on View report", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [],
        review_queue: { ordered_ids: [] },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsOverviewPage();

    expect(
      await screen.findByText(
        /We have not found any potential violations in your apartment's rent history/i
      )
    ).toBeInTheDocument();

    const infoBox = screen.getByTestId("findings-overview-info-box");
    expect(infoBox.className).toContain(
      "findings-overview-info-box--no-findings"
    );
    expect(
      screen.queryByText(/Why this is important/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /View report/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/report");
    });
  });

  it("navigates back to rent-questions", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding],
        review_queue: { ordered_ids: [prehstpaFinding.id] },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsOverviewPage();

    fireEvent.click(await screen.findByRole("button", { name: /Back/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/rent-questions");
    });
  });

  it("redirects to rent-questions when findings are not initialized", async () => {
    const { AccountApiError } = await import("../../../api/account/errors");

    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new AccountApiError(400, {
        error: "Findings not initialized.",
        error_code: "findings_not_initialized",
      }),
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsOverviewPage();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/rent-questions", {
        replace: true,
      });
    });
  });
});
