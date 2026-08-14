import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AnalysisFlowProgress } from "./AnalysisFlowProgress";

describe("AnalysisFlowProgress", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Step N label and progress for a mid-flow step", () => {
    render(
      <I18nProvider i18n={i18n}>
        <AnalysisFlowProgress stepId="scanner" />
      </I18nProvider>
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Step 3: Scan/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "38"
    );
    expect(screen.getByTestId("analysis-flow-progress")).toHaveAttribute(
      "data-step-id",
      "scanner"
    );
  });

  it("renders Analysis complete without a Step N prefix on report", () => {
    render(
      <I18nProvider i18n={i18n}>
        <AnalysisFlowProgress stepId="report" />
      </I18nProvider>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Analysis complete" })
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("uses confirm-address as step 1", () => {
    render(
      <I18nProvider i18n={i18n}>
        <AnalysisFlowProgress stepId="confirm-address" />
      </I18nProvider>
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Step 1: Confirm address/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "13"
    );
  });
});
