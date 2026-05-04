import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PreFlow from "./PreFlow";
import { RhAuthApiError } from "../../../api/rhAuth";
import * as rhAuthApi from "../../../api/rhAuth";
import * as rhOtpSession from "../../../auth/rhOtpSession";

vi.mock("../../../api/rhAuth", async () => {
  const actual = await vi.importActual<typeof import("../../../api/rhAuth")>(
    "../../../api/rhAuth",
  );
  return {
    ...actual,
    requestRhOtp: vi.fn(),
    upsertRhPhone: vi.fn(),
    verifyRhOtp: vi.fn(),
  };
});

vi.mock("../../../auth/rhOtpSession", async () => {
  const actual = await vi.importActual<typeof import("../../../auth/rhOtpSession")>(
    "../../../auth/rhOtpSession",
  );
  return {
    ...actual,
    setRhOtpSession: vi.fn(),
  };
});

const renderPreFlow = () => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(
    <MemoryRouter initialEntries={["/en/pre-flow"]}>
      <I18nProvider i18n={i18n}>
        <PreFlow />
      </I18nProvider>
    </MemoryRouter>,
  );
};

describe("PreFlow OTP verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("stores otp session on successful verification", async () => {
    vi.mocked(rhAuthApi.upsertRhPhone).mockResolvedValue({
      existed: false,
      profile: {
        id: 1,
        phone_number: "15554443333",
        rent_history_id: "rh-1",
      },
    });
    vi.mocked(rhAuthApi.requestRhOtp).mockResolvedValue({ status: "sent" });
    const otpPayload = {
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
    vi.mocked(rhAuthApi.verifyRhOtp).mockResolvedValue(otpPayload);

    renderPreFlow();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));

    await screen.findByRole("heading", { name: "Enter verification code" });

    for (let index = 1; index <= 6; index += 1) {
      fireEvent.change(screen.getByLabelText(`Verification digit ${index}`), {
        target: { value: String(index) },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(rhAuthApi.verifyRhOtp).toHaveBeenCalledWith("5554443333", "123456");
      expect(rhOtpSession.setRhOtpSession).toHaveBeenCalledWith(otpPayload);
    });
  });

  it("shows expired-code error message when backend returns expired", async () => {
    vi.mocked(rhAuthApi.upsertRhPhone).mockResolvedValue({
      existed: false,
      profile: {
        id: 1,
        phone_number: "15554443333",
        rent_history_id: "rh-1",
      },
    });
    vi.mocked(rhAuthApi.requestRhOtp).mockResolvedValue({ status: "sent" });
    vi.mocked(rhAuthApi.verifyRhOtp).mockRejectedValue(
      new RhAuthApiError(400, "Code expired"),
    );

    renderPreFlow();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send verification code" }));

    await screen.findByRole("heading", { name: "Enter verification code" });
    for (let index = 1; index <= 6; index += 1) {
      fireEvent.change(screen.getByLabelText(`Verification digit ${index}`), {
        target: { value: String(index) },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await screen.findByText("Your code expired. Request a new code.");
    expect(rhOtpSession.setRhOtpSession).not.toHaveBeenCalled();
  });
});
