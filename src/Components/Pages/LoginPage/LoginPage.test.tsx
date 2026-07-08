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
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { AccountApiError } from "../../../api/account";
import * as accountApi from "../../../api/account/api";
import * as rhSessionStorage from "../../../session/rhSessionStorage";

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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

vi.mock("../../../api/account/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../api/account/api")
  >("../../../api/account/api");
  return {
    ...actual,
    startRhLogin: vi.fn(),
    verifyRhOtp: vi.fn(),
  };
});

vi.mock("../../../session/rhSessionStorage", async () => {
  const actual = await vi.importActual<
    typeof import("../../../session/rhSessionStorage")
  >("../../../session/rhSessionStorage");
  return {
    ...actual,
    setRhAuthSession: vi.fn(),
  };
});

const renderLoginPage = () => {
  i18n.load("en", {});
  i18n.activate("en");
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/en/login"]}>
        <I18nProvider i18n={i18n}>
          <LoginPage />
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// `useIsDesktop` reads `window.matchMedia`; jsdom has no implementation, so we
// stub it to force the desktop (matches: true) or mobile (matches: false) path.
const setMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const enterVerificationCode = (code: string) => {
  fireEvent.change(
    screen.getByRole("textbox", { name: /verification code/i }),
    { target: { value: code } }
  );
};

const advanceToVerificationStep = async () => {
  fireEvent.change(screen.getByLabelText("Phone number (required)"), {
    target: { value: "(555) 444-3333" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Send verification code" })
  );
  await screen.findByRole("heading", { name: "Enter verification code" });
};

describe("LoginPage OTP verification", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    setMatchMedia(false);
  });

  it("shows initial verification subtitle after phone submit", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();
    await advanceToVerificationStep();

    const subtitle = screen.getByRole("status");
    expect(subtitle).toHaveTextContent("We sent a code to");
    expect(subtitle).toHaveTextContent("(555) 444-3333");
    expect(subtitle).not.toHaveTextContent("new code");
  });

  it("updates verification subtitle after resend", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();
    await advanceToVerificationStep();

    fireEvent.click(screen.getByRole("button", { name: "Resend" }));

    await waitFor(() => {
      const subtitle = screen.getByRole("status");
      expect(subtitle).toHaveTextContent("We sent a new code to");
      expect(subtitle).toHaveTextContent("(555) 444-3333");
    });
  });

  it("stores otp session on successful verification", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: {
        id: 1,
        phone_number: "15554443333",
      },
      otp: { status: "sent" },
    });
    const otpPayload = {
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "Bearer",
      expires_in: 300,
      scope: "read write",
      profile: {
        id: 1,
        phone_number: "15554443333",
      },
    };
    vi.mocked(accountApi.verifyRhOtp).mockResolvedValue(otpPayload);

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification code" })
    );

    await screen.findByRole("heading", { name: "Enter verification code" });

    enterVerificationCode("123456");

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(accountApi.verifyRhOtp).toHaveBeenCalledWith(
        "5554443333",
        "123456"
      );
      expect(rhSessionStorage.setRhAuthSession).toHaveBeenCalledWith(
        otpPayload
      );
    });
  });

  it("shows expired-code error message when backend returns expired", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: {
        id: 1,
        phone_number: "15554443333",
      },
      otp: { status: "sent" },
    });
    vi.mocked(accountApi.verifyRhOtp).mockRejectedValue(
      new AccountApiError(400, {
        error: "Code expired.",
        error_code: "otp_expired",
      })
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification code" })
    );

    await screen.findByRole("heading", { name: "Enter verification code" });
    enterVerificationCode("123456");

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await screen.findByText("Your code expired. Request a new code.");
    expect(rhSessionStorage.setRhAuthSession).not.toHaveBeenCalled();
  });

  it("clears the OTP field when resend is clicked", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification code" })
    );

    await screen.findByRole("heading", { name: "Enter verification code" });

    enterVerificationCode("123");

    fireEvent.click(screen.getByRole("button", { name: "Resend" }));

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /verification code/i })
      ).toHaveValue("");
    });
  });

  it("mobile submit calls startRhLogin with source 'mobile'", async () => {
    setMatchMedia(false);
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification code" })
    );

    // Mobile always advances to the verification step regardless of report.
    await screen.findByRole("heading", { name: "Enter verification code" });
    expect(accountApi.startRhLogin).toHaveBeenCalledWith(
      "5554443333",
      "mobile"
    );
  });
});

describe("LoginPage desktop variant", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    setMatchMedia(true);
  });

  it("renders the two-card desktop layout with the QR lockup", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: "Analyze a new rent history" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Access completed or in-progress reports",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Or")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows the no-report notice and stays on the phone step when has_viewable_report is false", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: false,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "skipped" },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await screen.findByText(/We don't have any reports associated/);
    expect(accountApi.startRhLogin).toHaveBeenCalledWith(
      "5554443333",
      "desktop"
    );
    // Stays on the phone step — no verification heading, no navigation.
    expect(
      screen.queryByRole("heading", { name: "Enter verification code" })
    ).not.toBeInTheDocument();
    expect(rhSessionStorage.setRhAuthSession).not.toHaveBeenCalled();
  });

  it("advances to the verification step when has_viewable_report is true", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: false,
      has_viewable_report: true,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await screen.findByRole("heading", { name: "Enter verification code" });
    expect(accountApi.startRhLogin).toHaveBeenCalledWith(
      "5554443333",
      "desktop"
    );
    expect(
      screen.queryByText(/We don't have any reports associated/)
    ).not.toBeInTheDocument();
  });
});

describe("LoginPage post-verification navigation", () => {
  const otpPayload = {
    access_token: "access-token",
    refresh_token: "refresh-token",
    token_type: "Bearer",
    expires_in: 300,
    scope: "read write",
    profile: {
      id: 1,
      phone_number: "15554443333",
    },
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    setMatchMedia(false);
    vi.mocked(accountApi.verifyRhOtp).mockResolvedValue(otpPayload);
  });

  const completeMobileLogin = async () => {
    fireEvent.change(screen.getByLabelText("Phone number (required)"), {
      target: { value: "(555) 444-3333" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send verification code" })
    );
    await screen.findByRole("heading", { name: "Enter verification code" });
    enterVerificationCode("123456");
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
  };

  it("navigates to scanner when the user has no viewable report", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: true,
      has_viewable_report: false,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();
    await completeMobileLogin();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/scanner");
    });
  });

  it("navigates to account when the user has a viewable report", async () => {
    vi.mocked(accountApi.startRhLogin).mockResolvedValue({
      created: false,
      has_viewable_report: true,
      profile: { id: 1, phone_number: "15554443333" },
      otp: { status: "sent" },
    });

    renderLoginPage();
    await completeMobileLogin();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/en/account");
    });
  });
});
