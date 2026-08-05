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

import { AccountApiError } from "../../../api/account/errors";
import * as findingsReviewHooks from "../../../api/account/hooks/findingsReview";
import * as rhSessionStorage from "../../../session/rhSessionStorage";

import { RentQuestions } from "./RentQuestions";
import "./RentQuestions.scss";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "test-history-id";

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

const mockMutateAsync = vi.fn();

vi.mock("../../../session/rhSessionStorage", async () => {
  const actual = await vi.importActual<
    typeof import("../../../session/rhSessionStorage")
  >("../../../session/rhSessionStorage");
  return {
    ...actual,
    getRhAuthSession: vi.fn(),
    getRhHistoryId: vi.fn(),
    getRhSessionStepState: vi.fn(() => null),
    setRhSessionStepState: vi.fn(),
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

const renderRentQuestions = () => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={["/en/rent-questions"]}>
        <I18nProvider i18n={i18n}>
          <RentQuestions />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const fillAndSubmitRent = async () => {
  const input = screen.getByLabelText(/Current monthly rent/i);
  fireEvent.change(input, { target: { value: "2500" } });
  fireEvent.click(screen.getByRole("button", { name: /Start analysis/i }));
};

describe("RentQuestions", () => {
  beforeEach(() => {
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
    navigateMock.mockReset();
    mockMutateAsync.mockReset();

    vi.mocked(findingsReviewHooks.useRunRhAnalysis).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRunRhAnalysis>);
  });

  afterEach(() => {
    cleanup();
  });

  it("navigates to findings-overview after successful run-analysis", async () => {
    mockMutateAsync.mockResolvedValue({
      findings_current: [],
      review_queue: { ordered_ids: [] },
    });

    renderRentQuestions();
    await fillAndSubmitRent();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        accessToken: TEST_ACCESS_TOKEN,
        historyId: TEST_HISTORY_ID,
      });
      expect(navigateMock).toHaveBeenCalledWith("/en/findings-overview");
    });
  });

  it("shows error and stays on page when analysis was already run", async () => {
    mockMutateAsync.mockRejectedValue(
      new AccountApiError(409, {
        error: "Analysis already run.",
        error_code: "analysis_already_run",
      })
    );

    renderRentQuestions();
    await fillAndSubmitRent();

    expect(
      await screen.findByText(
        /Analysis has already been run for this rent history/i
      )
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
