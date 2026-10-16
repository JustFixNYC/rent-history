import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
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

const mockSetRhHistoryApartmentInfo = vi.fn();

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

vi.mock("../../../api/account", async () => {
  const actual = await vi.importActual<typeof import("../../../api/account")>(
    "../../../api/account"
  );
  return {
    ...actual,
    setRhHistoryApartmentInfo: (...args: unknown[]) =>
      mockSetRhHistoryApartmentInfo(...args),
  };
});

const renderRentQuestions = () => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <MemoryRouter initialEntries={["/en/analyze/rent-questions"]}>
      <I18nProvider i18n={i18n}>
        <RentQuestions />
      </I18nProvider>
    </MemoryRouter>
  );
};

const selectLivesInApt = (answer: "Yes" | "No") => {
  fireEvent.click(screen.getByRole("radio", { name: answer }));
};

const clickNext = () => {
  fireEvent.click(screen.getByRole("button", { name: /Next/i }));
};

const fillAndSubmitRent = async (rentValue = "2500") => {
  const input = screen.getByLabelText(/Monthly rent amount/i);
  fireEvent.change(input, { target: { value: rentValue } });
  clickNext();
};

describe("RentQuestions", () => {
  beforeEach(() => {
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
    navigateMock.mockReset();
    mockSetRhHistoryApartmentInfo.mockReset();
    mockSetRhHistoryApartmentInfo.mockResolvedValue({
      lives_in_apt: true,
      current_rent: 2500,
      current_rent_date: "2026-09-23T16:00:00Z",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the lives-in-apartment question first", () => {
    renderRentQuestions();

    expect(
      screen.getByRole("heading", {
        name: /Do you currently live in the apartment associated with this rent history/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Monthly rent amount/i)
    ).not.toBeInTheDocument();
  });

  it("requires a Yes or No selection before continuing", async () => {
    renderRentQuestions();
    clickNext();

    expect(
      await screen.findByText(/Please select Yes or No/i)
    ).toBeInTheDocument();
    expect(mockSetRhHistoryApartmentInfo).not.toHaveBeenCalled();
  });

  it("saves lives_in_apt=false and navigates to scanner when No is selected", async () => {
    renderRentQuestions();
    selectLivesInApt("No");
    clickNext();

    await waitFor(() => {
      expect(mockSetRhHistoryApartmentInfo).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN,
        {
          history_id: TEST_HISTORY_ID,
          lives_in_apt: false,
        }
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/analyze/scanner");
    });
  });

  it("shows the rent question when Yes is selected and saves both fields on submit", async () => {
    renderRentQuestions();
    selectLivesInApt("Yes");
    clickNext();

    expect(
      await screen.findByRole("heading", {
        name: /What is your current monthly rent/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /compare what you pay to what is listed in your rent history/i
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByLabelText(/Monthly rent amount/i)
    ).toBeInTheDocument();
    expect(mockSetRhHistoryApartmentInfo).not.toHaveBeenCalled();

    await fillAndSubmitRent("$2,500");

    await waitFor(() => {
      expect(mockSetRhHistoryApartmentInfo).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN,
        {
          history_id: TEST_HISTORY_ID,
          lives_in_apt: true,
          current_rent: 2500,
        }
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/analyze/scanner");
    });
  });

  it("returns to the lives question when Back is clicked from the rent step", async () => {
    renderRentQuestions();
    selectLivesInApt("Yes");
    clickNext();
    await screen.findByLabelText(/Monthly rent amount/i);

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(
      screen.getByRole("heading", {
        name: /Do you currently live in the apartment associated with this rent history/i,
      })
    ).toBeInTheDocument();
  });

  it("shows error and stays on page when apartment info save fails", async () => {
    mockSetRhHistoryApartmentInfo.mockRejectedValue(
      new AccountApiError(400, {
        error: "Invalid rent amount.",
        error_code: "validation_error",
      })
    );

    renderRentQuestions();
    selectLivesInApt("Yes");
    clickNext();
    await fillAndSubmitRent();

    expect(await screen.findByText(/Invalid rent amount/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
