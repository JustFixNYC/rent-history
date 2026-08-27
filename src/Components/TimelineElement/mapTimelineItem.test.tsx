import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { timelineComposers } from "./copy/compose/registry";
import { TimelineElement } from "./TimelineElement";
import { mapTimelineItemToProps } from "./mapTimelineItem";
import { mockTimelineElements } from "./mockData";
import type { TimelineItem } from "./types";

const baseItem = (
  overrides: Partial<TimelineItem> & Pick<TimelineItem, "type" | "pills">
): TimelineItem => ({
  year: 2000,
  data: {
    legal_rent: 1200,
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
        type: "destab__viol__prehstpa",
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
        type: "destab__no_viol__prehstpa",
        pills: ["destabilized"],
      })
    );

    expect(props.variant).toBe("secondary");
    expect(props.whatThisMeans).toBeUndefined();
  });

  it("passes end_year through as endYear", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "destab__viol__prehstpa",
        pills: ["violation", "destabilized"],
        end_year: 2005,
      })
    );

    expect(props.endYear).toBe(2005);
  });

  it("renders composed content through TimelineElement", () => {
    const props = mapTimelineItemToProps(
      baseItem({
        type: "destab__viol__prehstpa",
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
    expect(
      document.querySelector(".timeline-element__evidence")?.textContent
    ).toMatch(/^Supporting evidence/);
    expect(screen.getByText(/What this means for you/i)).toBeInTheDocument();
  });

  it("registry covers every TimelineFindingType", () => {
    const registryTypes = Object.keys(timelineComposers).sort();
    const mockTypes = [
      ...new Set(mockTimelineElements.map((item) => item.type)),
    ].sort();

    expect(registryTypes).toHaveLength(16);
    expect(mockTypes).toHaveLength(16);
    expect(registryTypes).toEqual(mockTypes);
  });

  it("composes every mock timeline item without throwing", () => {
    for (const item of mockTimelineElements) {
      expect(() => mapTimelineItemToProps(item)).not.toThrow();
    }
  });
});

describe("CurrentRentRgbComparisonParagraph variants", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders exceeds and within outcomes differently", async () => {
    const { CurrentRentRgbComparisonParagraph } = await import(
      "./copy/paragraphs/CurrentRentRgbComparisonParagraph"
    );

    const { rerender, container } = render(
      <I18nProvider i18n={i18n}>
        <CurrentRentRgbComparisonParagraph
          comparisonYear={2026}
          currentRent={2800}
          maxRent={2100}
          outcome="exceeds"
        />
      </I18nProvider>
    );

    expect(container.textContent).toMatch(/appears to be more than/);

    rerender(
      <I18nProvider i18n={i18n}>
        <CurrentRentRgbComparisonParagraph
          comparisonYear={2026}
          currentRent={2000}
          maxRent={2100}
          outcome="within"
        />
      </I18nProvider>
    );

    expect(container.textContent).toMatch(/equal to or less than/);
  });
});

describe("TenantChangeParagraph variants", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders changed and unchanged copy", async () => {
    const { TenantChangeParagraph } = await import(
      "./copy/paragraphs/IncreasePreferentialParagraphs"
    );

    const { rerender, container } = render(
      <I18nProvider i18n={i18n}>
        <TenantChangeParagraph changed={false} />
      </I18nProvider>
    );

    expect(container.textContent).toMatch(/did not change/);

    rerender(
      <I18nProvider i18n={i18n}>
        <TenantChangeParagraph changed />
      </I18nProvider>
    );

    expect(container.textContent).toMatch(/changed from the prior year/);
  });
});
