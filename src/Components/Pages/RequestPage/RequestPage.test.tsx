import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import RequestPage from "./RequestPage";
import "./RequestPage.scss";

const renderRequestPage = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter initialEntries={["/en/request"]}>
        <RequestPage />
      </MemoryRouter>
    </I18nProvider>
  );

describe("RequestPage", () => {
  beforeEach(() => {
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
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
});
