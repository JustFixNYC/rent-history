import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LocaleButtonStyledLink,
  LocaleLink,
  RouterButtonStyledLink,
  RouterJfclLink,
} from "./index";

vi.mock("@lingui/react", async () => {
  const actual = await vi.importActual<typeof import("@lingui/react")>(
    "@lingui/react"
  );
  return {
    ...actual,
    useLingui: () => ({
      i18n: { locale: "en" },
      _: (message: { message?: string } | string) =>
        typeof message === "string" ? message : message.message ?? "",
    }),
  };
});

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderWithRouter(ui: React.ReactNode, initialEntry = "/en") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/en"
          element={
            <>
              {ui}
              <LocationDisplay />
            </>
          }
        />
        <Route path="/en/about" element={<LocationDisplay />} />
        <Route path="/en/analyze/login" element={<LocationDisplay />} />
        <Route path="/en/privacy_policy" element={<LocationDisplay />} />
        <Route path="/en/request" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RouterLinks", () => {
  afterEach(() => {
    cleanup();
  });

  it("RouterJfclLink renders href from to", () => {
    renderWithRouter(
      <RouterJfclLink to="/en/about" data-testid="router-link">
        Learn more
      </RouterJfclLink>
    );

    expect(screen.getByTestId("router-link")).toHaveAttribute(
      "href",
      "/en/about"
    );
    expect(screen.getByTestId("router-link")).toHaveClass("jfcl-link");
  });

  it("RouterJfclLink navigates on left click", () => {
    renderWithRouter(
      <RouterJfclLink to="/en/about">Learn more</RouterJfclLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "Learn more" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/en/about");
  });

  it("RouterJfclLink does not navigate on modifier click", () => {
    renderWithRouter(
      <RouterJfclLink to="/en/about">Learn more</RouterJfclLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "Learn more" }), {
      ctrlKey: true,
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/en");
  });

  it("RouterButtonStyledLink renders href and navigates on left click", () => {
    renderWithRouter(
      <RouterButtonStyledLink to="/en/analyze/login" labelText="Get started" />
    );

    const link = screen.getByTestId("jfcl-button-styled-link");
    expect(link).toHaveAttribute("href", "/en/analyze/login");

    fireEvent.click(link);

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/en/analyze/login"
    );
  });

  it("LocaleLink prefixes locale and uses JFCL styling", () => {
    renderWithRouter(
      <LocaleLink to="privacy_policy">Privacy policy</LocaleLink>
    );

    const link = screen.getByRole("link", { name: "Privacy policy" });
    expect(link).toHaveAttribute("href", "/en/privacy_policy");
    expect(link).toHaveClass("jfcl-link");
  });

  it("LocaleButtonStyledLink prefixes locale", () => {
    renderWithRouter(
      <LocaleButtonStyledLink to="request" labelText="Submit request" />
    );

    const link = screen.getByTestId("jfcl-button-styled-link");
    expect(link).toHaveAttribute("href", "/en/request");

    fireEvent.click(link);

    expect(screen.getByTestId("location")).toHaveTextContent("/en/request");
  });
});
