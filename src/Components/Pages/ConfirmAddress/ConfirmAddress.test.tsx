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

import * as accountApi from "../../../api/account/api";
import {
  clearRhSessionDocument,
  getRhHistoryId,
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";
import { writeConfirmAddressState } from "./confirmAddressState";
import { ConfirmAddress } from "./ConfirmAddress";

const TEST_ACCESS_TOKEN = "test-access-token";
const TEST_HISTORY_ID = "11111111-1111-1111-1111-111111111111";

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

vi.mock("@justfixnyc/component-library", async () => {
  const actual = await vi.importActual<
    typeof import("@justfixnyc/component-library")
  >("@justfixnyc/component-library");
  return {
    ...actual,
    GeoSearchDropdown: ({
      id,
      onSelect,
      onInputChange,
      initialAddress,
    }: {
      id?: string;
      onSelect?: (selection: unknown) => void;
      onInputChange?: (value: string, meta: { action?: string }) => string;
      initialAddress?: string;
    }) => (
      <div>
        <input
          aria-label="Apartment address"
          data-testid={id}
          defaultValue={initialAddress ?? ""}
          onChange={(event) =>
            onInputChange?.(event.target.value, { action: "input-change" })
          }
        />
        <button
          type="button"
          data-testid={`${id}-select`}
          onClick={() =>
            onSelect?.({
              feature: {
                properties: {
                  housenumber: "123",
                  street: "MAIN ST",
                  borough: "Manhattan",
                  postalcode: "10001",
                  addendum: { pad: { bbl: "1001234567", bin: "1000001" } },
                },
                geometry: { coordinates: [-73.99, 40.75] },
              },
              option: { label: "123 Main St, Manhattan" },
            })
          }
        >
          Select address
        </button>
      </div>
    ),
  };
});

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    createRhHistory: vi.fn(),
    confirmRhHistoryAddress: vi.fn(),
  };
});

const tokenPayload = {
  access_token: TEST_ACCESS_TOKEN,
  refresh_token: "test-refresh-token",
  token_type: "Bearer",
  expires_in: 3600,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15551234567",
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderConfirmAddress = () => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={["/en/confirm-address"]}>
        <I18nProvider i18n={i18n}>
          <ConfirmAddress />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const selectAddressAndContinue = () => {
  fireEvent.click(screen.getByTestId("confirm-address-input-select"));
  fireEvent.change(screen.getByLabelText(/Unit number/i), {
    target: { value: "4B" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
};

describe("ConfirmAddress", () => {
  beforeEach(() => {
    clearRhSessionDocument();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    navigateMock.mockReset();
    vi.mocked(accountApi.createRhHistory).mockReset();
    vi.mocked(accountApi.confirmRhHistoryAddress).mockReset();
    vi.mocked(accountApi.createRhHistory).mockResolvedValue({
      id: TEST_HISTORY_ID,
    });
    vi.mocked(accountApi.confirmRhHistoryAddress).mockResolvedValue({
      address: "123 Main St, Manhattan New York 10001",
      apartment: "4B",
      bbl: "1001234567",
      bin: "1000001",
      unitsres: 10,
      unitstotal: 12,
      is_nycha: false,
      is_subsidized: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("entry Continue makes no history API calls and shows map preview", () => {
    renderConfirmAddress();

    selectAddressAndContinue();

    expect(accountApi.createRhHistory).not.toHaveBeenCalled();
    expect(accountApi.confirmRhHistoryAddress).not.toHaveBeenCalled();
    expect(getRhHistoryId()).toBeNull();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("first map Next creates history then confirms address and navigates", async () => {
    renderConfirmAddress();
    selectAddressAndContinue();

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    await waitFor(() => {
      expect(accountApi.createRhHistory).toHaveBeenCalledTimes(1);
      expect(accountApi.createRhHistory).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN
      );
      expect(accountApi.confirmRhHistoryAddress).toHaveBeenCalledTimes(1);
      expect(accountApi.confirmRhHistoryAddress).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN,
        expect.objectContaining({
          history_id: TEST_HISTORY_ID,
          apartment: "4B",
          bbl: "1001234567",
          bin: "1000001",
        })
      );
      expect(getRhHistoryId()).toBe(TEST_HISTORY_ID);
      expect(navigateMock).toHaveBeenCalledWith("/en/rent-questions");
    });
  });

  it("back → edit → Next again confirms only with the same history_id", async () => {
    renderConfirmAddress();
    selectAddressAndContinue();
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/rent-questions");
    });

    navigateMock.mockReset();
    vi.mocked(accountApi.createRhHistory).mockClear();
    vi.mocked(accountApi.confirmRhHistoryAddress).mockClear();

    // Simulate returning from rent-questions via Back: remount with session.
    cleanup();
    writeConfirmAddressState({
      addressFlowState: "confirmUpdated",
      confirmedAddress: {
        streetAddress: "123 Main St",
        unitNumber: "4B",
        cityStateZip: "Manhattan New York 10001",
        longLat: "-73.99,40.75",
        bbl: "1001234567",
        bin: "1000001",
      },
      draftAddress: {
        streetAddress: "123 Main St",
        unitNumber: "4B",
        cityStateZip: "Manhattan New York 10001",
        longLat: "-73.99,40.75",
        bbl: "1001234567",
        bin: "1000001",
      },
      serverConfirmedKey: null,
    });
    setRhHistoryId(TEST_HISTORY_ID);

    renderConfirmAddress();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(
      screen.getByRole("button", { name: /Continue/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Unit number/i), {
      target: { value: "5A" },
    });
    // Re-select so BBL validation still passes after unit edit.
    fireEvent.click(screen.getByTestId("confirm-address-input-select"));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    await waitFor(() => {
      expect(accountApi.createRhHistory).not.toHaveBeenCalled();
      expect(accountApi.confirmRhHistoryAddress).toHaveBeenCalledTimes(1);
      expect(accountApi.confirmRhHistoryAddress).toHaveBeenCalledWith(
        TEST_ACCESS_TOKEN,
        expect.objectContaining({
          history_id: TEST_HISTORY_ID,
          apartment: "5A",
        })
      );
      expect(getRhHistoryId()).toBe(TEST_HISTORY_ID);
      expect(navigateMock).toHaveBeenCalledWith("/en/rent-questions");
    });
  });

  it("abandoning on entry or map preview before Next creates no server history", () => {
    renderConfirmAddress();
    selectAddressAndContinue();

    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    expect(accountApi.createRhHistory).not.toHaveBeenCalled();
    expect(accountApi.confirmRhHistoryAddress).not.toHaveBeenCalled();
    expect(getRhHistoryId()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(navigateMock).toHaveBeenCalledWith("/en/account");
    expect(accountApi.createRhHistory).not.toHaveBeenCalled();
    expect(getRhHistoryId()).toBeNull();
  });
});
