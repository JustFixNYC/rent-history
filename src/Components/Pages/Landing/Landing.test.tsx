import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as rentHistoryRequest from "../../../features/rentHistoryRequest";
import Landing from "./Landing";

vi.mock("@justfixnyc/component-library", async () => {
  const actual = await vi.importActual<
    typeof import("@justfixnyc/component-library")
  >("@justfixnyc/component-library");

  return {
    ...actual,
    ButtonStyledLink: ({
      href,
      labelText,
      target,
      rel,
    }: {
      href: string;
      labelText: string;
      target?: string;
      rel?: string;
    }) => (
      <a href={href} target={target} rel={rel}>
        {labelText}
      </a>
    ),
  };
});

describe("Landing", () => {
  beforeEach(() => {
    i18n.activate("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("links rent history CTAs to the internal request page", () => {
    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/en"]}>
          <Landing />
        </MemoryRouter>
      </I18nProvider>
    );

    const requestLinks = screen.getAllByRole("link", {
      name: /I don’t have my rent history|Submit request/,
    });

    expect(requestLinks).toHaveLength(2);
    requestLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/en/request");
    });
  });

  it("links rent history CTAs to tenants2 when request feature is disabled", () => {
    vi.spyOn(rentHistoryRequest, "getRentHistoryRequestHref").mockReturnValue(
      "https://app.justfix.org/en/rh/splash"
    );
    vi.spyOn(
      rentHistoryRequest,
      "isRentHistoryRequestExternal"
    ).mockReturnValue(true);

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/en"]}>
          <Landing />
        </MemoryRouter>
      </I18nProvider>
    );

    const requestLinks = screen
      .getAllByRole("link")
      .filter(
        (link) =>
          link.getAttribute("href") === "https://app.justfix.org/en/rh/splash"
      );

    expect(requestLinks).toHaveLength(2);
    requestLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });
  });
});
