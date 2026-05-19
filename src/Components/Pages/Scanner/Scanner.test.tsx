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

import Scanner from "./Scanner";
import { RhAuthApiError } from "../../../api/rhAuth";
import * as rhAuthApi from "../../../api/rhAuth";
import {
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("dynamsoft-document-scanner", () => ({
  DocumentScanner: vi.fn().mockImplementation(() => ({
    launch: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../../api/presignedS3", () => ({
  uploadScan: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../EmblaCarousel/EmblaCarousel", () => ({
  default: () => null,
}));

vi.mock("../../../api/rhAuth", async () => {
  const actual = await vi.importActual<typeof import("../../../api/rhAuth")>(
    "../../../api/rhAuth"
  );
  return {
    ...actual,
    combineRhHistoryPages: vi.fn(),
    deleteRhHistoryPages: vi.fn(),
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
    rent_history_id: "rh-1",
  },
};

const historyId = "22222222-2222-4222-8222-222222222222";

const renderScanner = () => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(
    <MemoryRouter initialEntries={["/en/scanner"]}>
      <I18nProvider i18n={i18n}>
        <Scanner />
      </I18nProvider>
    </MemoryRouter>
  );
};

const advanceToScanComplete = async () => {
  const startButton = await screen.findByRole("button", {
    name: "Start scanning",
  });
  fireEvent.click(startButton);
  return screen.findByRole("button", { name: "Next" });
};

describe("Scanner Next button", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls combine-pages and navigates to /confirm-address on success", async () => {
    vi.mocked(rhAuthApi.combineRhHistoryPages).mockResolvedValue({
      status: "ok",
    });

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(rhAuthApi.combineRhHistoryPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(navigateMock).toHaveBeenCalledWith("/en/confirm-address");
    });
  });

  it("shows backend error message and stays on scanner when combine-pages fails", async () => {
    vi.mocked(rhAuthApi.combineRhHistoryPages).mockRejectedValue(
      new RhAuthApiError(400, "reg_year sequence is not contiguous")
    );

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await screen.findByText("reg_year sequence is not contiguous");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
