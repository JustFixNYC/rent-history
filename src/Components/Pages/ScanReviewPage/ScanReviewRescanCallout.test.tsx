import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScanReviewMode } from "./scanReviewModes";
import {
  formatLabelsForInstruction,
  ScanReviewRescanCallout,
} from "./ScanReviewRescanCallout";

const renderCallout = (
  props: Partial<React.ComponentProps<typeof ScanReviewRescanCallout>> = {}
) => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <I18nProvider i18n={i18n}>
      <ScanReviewRescanCallout
        labels={["Page 2"]}
        variant="page_marker"
        {...props}
      />
    </I18nProvider>
  );
};

describe("formatLabelsForInstruction", () => {
  it("joins multiple labels with conjunction", () => {
    expect(formatLabelsForInstruction(["Page 2", "Page 3"], "and")).toBe(
      "Page 2 and Page 3"
    );
  });
});

describe("ScanReviewRescanCallout", () => {
  it("renders page marker variant", () => {
    renderCallout({ labels: ["Page 2"], variant: "page_marker" });

    const callout = screen.getByTestId("scan-review-page-error-callout");
    expect(callout).toBeInTheDocument();
    expect(within(callout).getAllByText("Page 2").length).toBeGreaterThan(0);
    expect(
      within(callout).getByText((_content, element) =>
        Boolean(
          element?.classList.contains(
            "scan-review-page-error-callout__instruction"
          )
        )
      )
    ).toHaveTextContent("marked Page 2 at the bottom left corner");
    expect(
      screen.queryByRole("button", { name: "Re-scan for these years" })
    ).not.toBeInTheDocument();
  });

  it("renders year coverage variant with rescan CTA", () => {
    const onRescan = vi.fn();
    renderCallout({
      labels: ["2004-2020"],
      variant: "year_coverage",
      flowMode: ScanReviewMode.warningOnly,
      onRescan,
    });

    const callout = screen.getByTestId("scan-review-reg-year-error-callout");
    expect(callout).toBeInTheDocument();
    expect(within(callout).getAllByText("2004-2020").length).toBeGreaterThan(0);
    expect(
      within(callout).getByText((_content, element) =>
        Boolean(
          element?.classList.contains(
            "scan-review-reg-year-error-callout__instruction"
          )
        )
      )
    ).toHaveTextContent("covering 2004-2020");

    fireEvent.click(
      screen.getByRole("button", { name: "Re-scan for these years" })
    );
    expect(onRescan).toHaveBeenCalledTimes(1);
  });

  it("returns null when labels are empty", () => {
    const { container } = renderCallout({ labels: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
