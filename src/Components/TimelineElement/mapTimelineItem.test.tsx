import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { TimelineElement } from "./TimelineElement";
import { mapTimelineItemToProps } from "./mapTimelineItem";
import type { TimelineItem } from "./types";

const baseItem = (
  overrides: Partial<TimelineItem> & Pick<TimelineItem, "type" | "pills">
): TimelineItem => ({
  year: 2000,
  data: {
    current_year: 2000,
    current_rent: 1200,
    vacancy_amount: 240,
    longevity_amount: 72,
    max_rent: 1512,
    hrvd_amount: 2500,
  },
  ...overrides,
});

describe("mapTimelineItemToProps", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("maps violation pill to primary variant", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "violation__destab__prehstpa",
        pills: ["violation", "destabilized"],
      })
    );

    expect(props.variant).toBe("primary");
    expect(props.year).toBe(2000);
    expect(props.pills).toEqual(["violation", "destabilized"]);
    expect(props.whatThisMeans).toBeTruthy();
  });

  it("maps absence of violation pill to secondary variant", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "no_violation__destab__prehstpa",
        pills: ["destabilized"],
      })
    );

    expect(props.variant).toBe("secondary");
    expect(props.whatThisMeans).toBeUndefined();
  });

  it("passes end_year through as endYear", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "violation__destab__prehstpa",
        pills: ["violation", "destabilized"],
        end_year: 2005,
      })
    );

    expect(props.endYear).toBe(2005);
  });

  it("renders composed content through TimelineElement", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "violation__destab__prehstpa",
        pills: ["violation", "destabilized"],
      })
    );

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <TimelineElement {...props} defaultOpen />
      </I18nProvider>
    );

    expect(container.textContent).toMatch(
      /may have been improperly destabilized/
    );
    expect(container.textContent).toMatch(/legal regulated rent/);
    expect(screen.getByText(/What this means for you/i)).toBeInTheDocument();
  });
});
