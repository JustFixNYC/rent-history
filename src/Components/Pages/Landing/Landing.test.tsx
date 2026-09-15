import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    }: {
      href: string;
      labelText: string;
    }) => <a href={href}>{labelText}</a>,
  };
});

describe("Landing", () => {
  beforeEach(() => {
    i18n.activate("en");
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
});
