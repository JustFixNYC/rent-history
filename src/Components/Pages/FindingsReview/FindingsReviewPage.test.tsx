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

import * as rhSessionStorage from "../../../session/rhSessionStorage";

import FindingsReviewPage from "./FindingsReviewPage";
import "./FindingsReview.scss";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "test-history-id";

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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderFindingsReviewPage = () => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/findings-review"]}>
        <I18nProvider i18n={i18n}>
          <FindingsReviewPage />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const waitForReviewFlow = async () => {
  await waitFor(
    () => {
      expect(screen.getByTestId("finding-intro-panel")).toBeInTheDocument();
    },
    { timeout: 10000 }
  );
};

const confirmOcr = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Yes, this matches my document" })
  );
};

const clickNext = () => {
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
};

describe("FindingsReviewPage integration", () => {
  beforeEach(() => {
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders pinned intro and only the OCR module on load", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    expect(screen.getByText("Large rent increase")).toBeInTheDocument();
    expect(screen.getByText(/Year 1992/)).toBeInTheDocument();

    const stack = screen.getByTestId("finding-module-stack");
    expect(stack).toHaveAttribute("data-revealed-count", "1");
    expect(stack).toHaveAttribute("data-active-step-index", "0");

    expect(screen.getByTestId("ocr-confirm-step")).toBeInTheDocument();
    expect(
      screen.queryByTestId("prehstpa-vacancy-step")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("prehstpa-tenancy-step")
    ).not.toBeInTheDocument();
  }, 15000);

  it("enables Next after OCR confirm and reveals vacancy on advance", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();

    confirmOcr();
    expect(nextButton).not.toBeDisabled();

    clickNext();

    const stack = screen.getByTestId("finding-module-stack");
    expect(stack).toHaveAttribute("data-revealed-count", "2");
    expect(stack).toHaveAttribute("data-active-step-index", "1");
    expect(screen.getByTestId("ocr-confirm-step")).toBeInTheDocument();
    expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
  }, 15000);

  it("reveals result panel after validate when vacancy is No", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    confirmOcr();
    clickNext();

    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    clickNext();

    await waitFor(
      () => {
        expect(screen.getByTestId("finding-result-panel")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByTestId("finding-result-panel")).toHaveAttribute(
      "data-outcome",
      "no_violation"
    );
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  }, 15000);
});
