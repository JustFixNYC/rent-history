import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import App from "./App";
import { clearRhOtpSession, setRhOtpSession } from "./auth/rhOtpSession";

vi.mock("@rollbar/react", () => ({
  useRollbar: () => ({ error: vi.fn() }),
}));

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

describe("post-OTP route protection", () => {
  beforeEach(() => {
    cleanup();
    clearRhOtpSession();
  });

  it.each(["/en/account", "/en/scanner", "/en/review", "/en/post-scan"])(
    "redirects unauthenticated deep-link %s to login",
    async (path) => {
      window.history.pushState({}, "", path);
      render(<App />);

      await waitFor(() => {
        expect(window.location.pathname).toBe("/en/login");
      });
    }
  );

  it("allows protected routes when otp session is valid", async () => {
    setRhOtpSession(tokenPayload);
    window.history.pushState({}, "", "/en/scanner");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en/scanner");
    });
  });
});
