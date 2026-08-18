import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import App from "./App";
import {
  clearRhAuthSession,
  setRhAuthSession,
} from "./session/rhSessionStorage";

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
  },
};

describe("post-OTP route protection", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    clearRhAuthSession();
  });

  it.each([
    "/en/account",
    "/en/scanner",
    "/en/scan-review",
    "/en/confirm-address",
    "/en/findings-overview",
    "/en/findings-review",
  ])("redirects unauthenticated deep-link %s to login", async (path) => {
    window.history.pushState({}, "", path);
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en/login");
    });
  });

  it("allows protected routes when otp session is valid", async () => {
    setRhAuthSession(tokenPayload);
    window.history.pushState({}, "", "/en/scanner");
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en/scanner");
    });
  });

  it("allows /resume without authentication", async () => {
    window.history.pushState(
      {},
      "",
      "/en/resume?token=test-token&history_id=hist-123"
    );
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/en/resume");
    });
  });
});
