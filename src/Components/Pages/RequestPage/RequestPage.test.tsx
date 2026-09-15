import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RequestPage from "./RequestPage";
import "./RequestPage.scss";

vi.mock("../../../api/requester/api", () => ({
  getPartnerBySlug: vi.fn(),
}));

import { getPartnerBySlug } from "../../../api/requester/api";
import { REFERRAL_STORAGE_KEY } from "./referralStorage";

const mockGetPartnerBySlug = vi.mocked(getPartnerBySlug);

const renderRequestPage = (initialEntry = "/en/request") =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <RequestPage />
      </MemoryRouter>
    </I18nProvider>
  );

describe("RequestPage", () => {
  beforeEach(() => {
    i18n.activate("en");
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("renders static sections from the Figma layout", () => {
    renderRequestPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /request your rent history/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/request your rent history from dhcr for free/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("request-form-stub")).toBeInTheDocument();
    const smsCta = screen
      .getByText(/text us to get your rent history document/i)
      .closest(".request-page__sms-cta");
    expect(smsCta).not.toBeNull();
    expect(smsCta).toHaveTextContent("RENT HISTORY");
    expect(smsCta).toHaveTextContent("(855) 610-2450");

    const faqSection = document.getElementById("request-faq");
    expect(faqSection).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /what happens after you request your rent history/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /analyze your rent history/i })
    ).toHaveAttribute("href", "/en");
  });

  it("shows partner callout after ?partner= resolves and hides on opt-out", async () => {
    mockGetPartnerBySlug.mockResolvedValue({
      slug: "hri",
      name: "Housing Rights Initiative",
      website: "https://example.org",
    });

    renderRequestPage("/en/request?partner=hri");

    expect(
      await screen.findByTestId("partner-referral-callout")
    ).toHaveTextContent("Housing Rights Initiative");

    await userEvent.click(
      screen.getByRole("button", {
        name: /don't share my information with this partner/i,
      })
    );

    await waitFor(() => {
      expect(screen.queryByTestId("partner-referral-callout")).toBeNull();
    });
    expect(sessionStorage.getItem(REFERRAL_STORAGE_KEY)).toBeNull();
  });

  it("does not show callout for unknown partner slug", async () => {
    mockGetPartnerBySlug.mockRejectedValue(new Error("404"));

    renderRequestPage("/en/request?partner=unknown");

    await waitFor(() => {
      expect(mockGetPartnerBySlug).toHaveBeenCalledWith("unknown");
    });
    expect(screen.queryByTestId("partner-referral-callout")).toBeNull();
  });
});
