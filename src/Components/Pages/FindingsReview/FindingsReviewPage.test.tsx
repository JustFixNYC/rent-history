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

import { accountQueryKeys } from "../../../api/account/queryKeys";
import * as findingsReviewHooks from "../../../api/account/hooks/findingsReview";
import * as rhSessionStorage from "../../../session/rhSessionStorage";

import findingExamples from "./__fixtures__/findingExamples.json";
import FindingsReviewPage from "./FindingsReviewPage";
import type {
  Finding,
  FindingResult,
  FindingsStateResponse,
  ValidateFindingResponse,
} from "./types/finding";
import "./FindingsReview.scss";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "test-history-id";

const prehstpaFinding = findingExamples.OVERCHARGE_PREHSTPA as Finding;

const secondPrehstpaFinding: Finding = {
  ...prehstpaFinding,
  id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  finding_year: 1993,
  key: {
    ...prehstpaFinding.key,
    finding_year: 1993,
  },
};

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

const mockValidateMutate = vi.fn(
  (
    _vars: unknown,
    options?: { onSuccess?: (data: ValidateFindingResponse) => void }
  ) => {
    options?.onSuccess?.({
      finding: {
        ...prehstpaFinding,
        status: "validated",
        result: "no_violation",
        validated_at: "2026-01-01T00:00:00Z",
      },
      queue_delta: { ordered_ids: [], added: [], removed: [] },
    });
  }
);

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

const seedFindingsState = (state: FindingsStateResponse) => {
  queryClient.setQueryData(
    accountQueryKeys.findingsState(TEST_HISTORY_ID),
    state
  );
};

const renderFindingsReviewPage = (initialEntry = "/en/findings-review") => {
  i18n.load("en", {});
  i18n.activate("en");
  queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <I18nProvider i18n={i18n}>
          <FindingsReviewPage />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const waitForReviewFlow = async () => {
  await waitFor(() => {
    expect(screen.getByTestId("finding-intro-panel")).toBeInTheDocument();
  });
};

const confirmOcr = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Yes, this matches my document" })
  );
};

const clickSubmit = () => {
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
};

const completeVacancyNo = () => {
  fireEvent.click(screen.getByRole("radio", { name: "No" }));
};

const completeVacancyYes = () => {
  fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
};

const completeTenancyYear = async (year = 1989) => {
  await waitFor(() => {
    expect(screen.getByTestId("prehstpa-tenancy-step")).toBeInTheDocument();
  });

  const tenancyStep = screen.getByTestId("prehstpa-tenancy-step");
  const combobox = within(tenancyStep).getByRole("combobox");
  fireEvent.mouseDown(combobox);
  fireEvent.click(screen.getByText(String(year)));
};

const completeFlowThroughVacancyYes = async () => {
  await waitForReviewFlow();
  confirmOcr();
  await waitFor(() => {
    expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
  });
  completeVacancyYes();
};

const clickModalNext = (buttonName = "Next") => {
  const modal = screen.getByTestId("finding-result-modal");
  fireEvent.click(within(modal).getByRole("button", { name: buttonName }));
};

describe("FindingsReviewPage integration", () => {
  beforeEach(() => {
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);

    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding],
        review_queue: { ordered_ids: [prehstpaFinding.id] },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    vi.mocked(findingsReviewHooks.useValidateRhFinding).mockReturnValue({
      mutate: mockValidateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useValidateRhFinding>);
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
  });

  it("auto-reveals vacancy when OCR is confirmed", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    confirmOcr();

    await waitFor(() => {
      const stack = screen.getByTestId("finding-module-stack");
      expect(stack).toHaveAttribute("data-revealed-count", "2");
      expect(stack).toHaveAttribute("data-active-step-index", "1");
    });

    expect(screen.getByTestId("ocr-confirm-step")).toBeInTheDocument();
    expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("shows OCR Edit after confirm while vacancy is revealed", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    confirmOcr();

    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    });

    const ocrStep = screen.getByTestId("ocr-confirm-step");
    expect(ocrStep).toHaveAttribute("data-phase", "confirmed");
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("keeps subsequent steps revealed when OCR Edit is clicked", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    confirmOcr();

    await waitFor(() => {
      const stack = screen.getByTestId("finding-module-stack");
      expect(stack).toHaveAttribute("data-revealed-count", "2");
      expect(stack).toHaveAttribute("data-active-step-index", "1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const stack = screen.getByTestId("finding-module-stack");
    expect(stack).toHaveAttribute("data-revealed-count", "2");
    expect(stack).toHaveAttribute("data-active-step-index", "1");
    expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    expect(screen.getByTestId("ocr-confirm-step")).toHaveAttribute(
      "data-phase",
      "initial"
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("keeps Submit disabled until all visible steps are complete", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();

    confirmOcr();
    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    completeVacancyNo();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

    await completeTenancyYear();
    expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
  });

  it("opens result modal after validate when vacancy is Yes", async () => {
    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();

    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("finding-result-modal");
    expect(within(modal).getByTestId("finding-result-panel")).toHaveAttribute(
      "data-outcome",
      "no_violation"
    );
    expect(
      screen.queryByRole("button", { name: "Continue" })
    ).not.toBeInTheDocument();
    expect(mockValidateMutate).toHaveBeenCalledTimes(1);
  });

  it("closes result modal via Back and does not leave inline result in stack", async () => {
    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("finding-result-modal");
    fireEvent.click(within(modal).getByRole("button", { name: "Back" }));

    await waitFor(() => {
      expect(
        screen.queryByTestId("finding-result-modal")
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("finding-result-panel")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
  });

  it("reveals tenancy step when vacancy changes from Yes to No", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();
    confirmOcr();

    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    });

    completeVacancyYes();

    await waitFor(() => {
      expect(
        screen.queryByTestId("prehstpa-tenancy-step")
      ).not.toBeInTheDocument();
    });

    completeVacancyNo();

    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-tenancy-step")).toBeInTheDocument();
    });
  });

  it("allows re-submit after closing the result modal", async () => {
    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("finding-result-modal");
    fireEvent.click(within(modal).getByRole("button", { name: "Back" }));

    await waitFor(() => {
      expect(
        screen.queryByTestId("finding-result-modal")
      ).not.toBeInTheDocument();
    });

    clickSubmit();

    expect(mockValidateMutate).toHaveBeenCalledTimes(2);
  });

  it("sends tenancy_start null when submitting after flipping vacancy to Yes", async () => {
    renderFindingsReviewPage();
    await waitForReviewFlow();
    confirmOcr();

    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-vacancy-step")).toBeInTheDocument();
    });

    completeVacancyNo();

    await waitFor(() => {
      expect(screen.getByTestId("prehstpa-tenancy-step")).toBeInTheDocument();
    });

    await completeTenancyYear();
    completeVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(mockValidateMutate).toHaveBeenCalledTimes(1);
    });

    const firstCall = mockValidateMutate.mock.calls[0]?.[0] as {
      body: { answers: { rows: Array<{ tenancy_start?: number | null }> } };
    };
    expect(firstCall.body.answers.rows[0]?.tenancy_start).toBeNull();
  });

  it.each<[FindingResult, string]>([
    ["potential_violation", "finding-result-panel--confirmed"],
    ["no_violation", "finding-result-panel--explained-away"],
    ["dismissed", "finding-result-panel--explained-away"],
  ])("renders %s result variant in modal", async (result, expectedClass) => {
    mockValidateMutate.mockImplementationOnce(
      (
        _vars,
        options?: { onSuccess?: (data: ValidateFindingResponse) => void }
      ) => {
        options?.onSuccess?.({
          finding: {
            ...prehstpaFinding,
            status: result === "dismissed" ? "dismissed" : "validated",
            result,
            validated_at: "2026-01-01T00:00:00Z",
          },
          queue_delta: { ordered_ids: [], added: [], removed: [] },
        });
      }
    );

    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const panel = within(
      screen.getByTestId("finding-result-modal")
    ).getByTestId("finding-result-panel");
    expect(panel).toHaveAttribute("data-outcome", result);
    expect(panel.className).toContain(expectedClass);
  });

  it.each<[Extract<FindingResult, "no_violation" | "dismissed">, RegExp]>([
    ["no_violation", /explained by allowable bonuses/i],
    ["dismissed", /within the RGB limit/i],
  ])(
    "renders distinct %s result body copy",
    async (result, expectedSnippet) => {
      mockValidateMutate.mockImplementationOnce(
        (
          _vars,
          options?: { onSuccess?: (data: ValidateFindingResponse) => void }
        ) => {
          options?.onSuccess?.({
            finding: {
              ...prehstpaFinding,
              status: result === "dismissed" ? "dismissed" : "validated",
              result,
              validated_at: "2026-01-01T00:00:00Z",
            },
            queue_delta: { ordered_ids: [], added: [], removed: [] },
          });
        }
      );

      renderFindingsReviewPage();
      await completeFlowThroughVacancyYes();
      clickSubmit();

      await waitFor(() => {
        expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
      });

      const panel = within(
        screen.getByTestId("finding-result-modal")
      ).getByTestId("finding-result-panel");
      expect(panel).toHaveTextContent(expectedSnippet);
    }
  );

  it("disables Back and shows spinner on Submit while validating", async () => {
    vi.mocked(findingsReviewHooks.useValidateRhFinding).mockReturnValue({
      mutate: mockValidateMutate,
      isPending: true,
    } as unknown as ReturnType<typeof findingsReviewHooks.useValidateRhFinding>);

    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("resolves the current finding from review_queue head, not findings_current order", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding, secondPrehstpaFinding],
        review_queue: {
          ordered_ids: [secondPrehstpaFinding.id, prehstpaFinding.id],
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsReviewPage();

    await waitForReviewFlow();
    expect(screen.getByText(/Year 1993/)).toBeInTheDocument();
    expect(screen.queryByText(/Year 1992/)).not.toBeInTheDocument();
  });

  it("honors ?finding_id= resume hint when the id exists in findings_current", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding, secondPrehstpaFinding],
        review_queue: {
          ordered_ids: [secondPrehstpaFinding.id, prehstpaFinding.id],
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    renderFindingsReviewPage(
      `/en/findings-review?finding_id=${prehstpaFinding.id}`
    );

    await waitForReviewFlow();
    expect(screen.getByText(/Year 1992/)).toBeInTheDocument();
    expect(screen.queryByText(/Year 1993/)).not.toBeInTheDocument();
  });

  it("modal Next advances to the next queued finding when the queue has remaining items", async () => {
    vi.mocked(findingsReviewHooks.useRhFindingsState).mockReturnValue({
      data: {
        findings_current: [prehstpaFinding, secondPrehstpaFinding],
        review_queue: {
          ordered_ids: [prehstpaFinding.id, secondPrehstpaFinding.id],
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof findingsReviewHooks.useRhFindingsState>);

    mockValidateMutate.mockImplementationOnce(
      (
        _vars,
        options?: { onSuccess?: (data: ValidateFindingResponse) => void }
      ) => {
        seedFindingsState({
          findings_current: [
            {
              ...prehstpaFinding,
              status: "validated",
              result: "no_violation",
              validated_at: "2026-01-01T00:00:00Z",
            },
            secondPrehstpaFinding,
          ],
          review_queue: { ordered_ids: [secondPrehstpaFinding.id] },
        });

        options?.onSuccess?.({
          finding: {
            ...prehstpaFinding,
            status: "validated",
            result: "no_violation",
            validated_at: "2026-01-01T00:00:00Z",
          },
          queue_delta: {
            ordered_ids: [secondPrehstpaFinding.id],
            added: [],
            removed: [],
          },
        });
      }
    );

    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("finding-result-modal");
    expect(
      within(modal).getByRole("button", { name: "Next" })
    ).toBeInTheDocument();
    expect(
      within(modal).queryByRole("button", { name: "View report" })
    ).not.toBeInTheDocument();

    clickModalNext();

    await waitFor(() => {
      expect(
        screen.queryByTestId("finding-result-modal")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Year 1993/)).toBeInTheDocument();
    expect(screen.getByTestId("ocr-confirm-step")).toBeInTheDocument();
    const stack = screen.getByTestId("finding-module-stack");
    expect(stack).toHaveAttribute("data-revealed-count", "1");
    expect(stack).toHaveAttribute("data-active-step-index", "0");
  });

  it("modal Next navigates to /report when the review queue is exhausted", async () => {
    mockValidateMutate.mockImplementationOnce(
      (
        _vars,
        options?: { onSuccess?: (data: ValidateFindingResponse) => void }
      ) => {
        seedFindingsState({
          findings_current: [
            {
              ...prehstpaFinding,
              status: "validated",
              result: "no_violation",
              validated_at: "2026-01-01T00:00:00Z",
            },
          ],
          review_queue: { ordered_ids: [] },
        });

        options?.onSuccess?.({
          finding: {
            ...prehstpaFinding,
            status: "validated",
            result: "no_violation",
            validated_at: "2026-01-01T00:00:00Z",
          },
          queue_delta: { ordered_ids: [], added: [], removed: [] },
        });
      }
    );

    renderFindingsReviewPage();
    await completeFlowThroughVacancyYes();
    clickSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("finding-result-modal")).toBeInTheDocument();
    });

    const modal = screen.getByTestId("finding-result-modal");
    expect(
      within(modal).getByRole("button", { name: "View report" })
    ).toBeInTheDocument();

    clickModalNext("View report");

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/report");
    });
  });
});
