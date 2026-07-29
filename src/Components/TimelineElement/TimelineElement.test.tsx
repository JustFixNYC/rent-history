import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { TimelineElement } from "./TimelineElement";

const renderElement = (props: ComponentProps<typeof TimelineElement>) =>
  render(
    <I18nProvider i18n={i18n}>
      <TimelineElement {...props} />
    </I18nProvider>
  );

describe("TimelineElement", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders year, title, and pills", () => {
    renderElement({
      variant: "primary",
      year: 2000,
      title: "Sample title",
      pills: ["violation", "destabilized"],
    });

    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText("Sample title")).toBeInTheDocument();
    expect(screen.getByText("Potential Violation")).toBeInTheDocument();
    expect(screen.getByText("Destabilized")).toBeInTheDocument();
  });

  it("formats a year range when endYear is provided", () => {
    renderElement({
      variant: "secondary",
      year: 2008,
      endYear: 2015,
      title: "Range title",
    });

    expect(screen.getByText("2008-2015")).toBeInTheDocument();
  });

  it("does not render a toggle when description is omitted", () => {
    renderElement({
      variant: "primary",
      year: 2000,
      title: "No accordion",
    });

    expect(
      screen.queryByRole("button", { name: /supporting evidence|details/i })
    ).not.toBeInTheDocument();
  });

  it("toggles the panel and aria-expanded on primary", () => {
    renderElement({
      variant: "primary",
      year: 2000,
      title: "Expandable",
      description: "Evidence body",
      footnote: "A footnote",
      whatThisMeans: "Implications copy",
    });

    const toggle = screen.getByRole("button", {
      name: /show supporting evidence/i,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Evidence body")).not.toBeVisible();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /hide supporting evidence/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence body")).toBeVisible();
    expect(screen.getByText("A footnote")).toBeVisible();
    expect(screen.getByText("What this means for you")).toBeVisible();
    expect(screen.getByText("Implications copy")).toBeVisible();
    expect(screen.getByTestId("timeline-element").className).toContain(
      "timeline-element--open"
    );
  });

  it("uses Details toggle on secondary and omits implications callout", () => {
    renderElement({
      variant: "secondary",
      year: 2016,
      title: "Secondary item",
      description: "Secondary evidence",
      whatThisMeans: "Should not show",
    });

    const toggle = screen.getByRole("button", { name: /details/i });
    fireEvent.click(toggle);

    expect(screen.getByText("Secondary evidence")).toBeVisible();
    expect(
      screen.queryByText("What this means for you")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Should not show")).not.toBeInTheDocument();
  });

  it("renders a decorative rail that is hidden from assistive tech", () => {
    renderElement({
      variant: "primary",
      year: 2000,
      title: "With rail",
    });

    const rail = document.querySelector(".timeline-element__rail");
    expect(rail).toBeTruthy();
    expect(rail).toHaveAttribute("aria-hidden", "true");
  });
});
