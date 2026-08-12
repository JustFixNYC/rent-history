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

const mockSetRhHistoryCurrentRent = vi.fn();

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
    setRhHistoryCurrentRent: (...args: unknown[]) =>
      mockSetRhHistoryCurrentRent(...args),
  };
});

const renderRentQuestions = () => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <MemoryRouter initialEntries={["/en/rent-questions"]}>
      <I18nProvider i18n={i18n}>
        <RentQuestions />
      </I18nProvider>
    </MemoryRouter>
  );
};

const fillAndSubmitRent = async (rentValue = "2500") => {
  const input = screen.getByLabelText(/Current monthly rent/i);
  fireEvent.change(input, { target: { value: rentValue } });
  fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
};

describe("RentQuestions", () => {
  beforeEach(() => {
    vi.mocked(rhSessionStorage.getRhAuthSession).mockReturnValue(
      mockAuthSession
    );
    vi.mocked(rhSessionStorage.getRhHistoryId).mockReturnValue(TEST_HISTORY_ID);
    navigateMock.mockReset();
    mockSetRhHistoryCurrentRent.mockReset();
    mockSetRhHistoryCurrentRent.mockResolvedValue({ current_rent: 2500 });
  });

  afterEach(() => {
    cleanup();
  });

  it("saves rent and navigates to scanner", async () => {
    renderRentQuestions();
    await fillAndSubmitRent("$2,500");

    await waitFor(() => {
      expect(mockSetRhHistoryCurrentRent).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN,
        {
          history_id: TEST_HISTORY_ID,
          current_rent: 2500,
        }
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner");
    });
  });

  it("shows error and stays on page when rent save fails", async () => {
    mockSetRhHistoryCurrentRent.mockRejectedValue(
      new AccountApiError(400, {
        error: "Invalid rent amount.",
        error_code: "validation_error",
      })
    );

    renderRentQuestions();
    await fillAndSubmitRent();

    expect(await screen.findByText(/Invalid rent amount/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
