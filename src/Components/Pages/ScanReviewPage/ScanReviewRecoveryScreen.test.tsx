import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScanReviewRecoveryVariant } from "./scanReviewModes";
import { ScanReviewRecoveryScreen } from "./ScanReviewRecoveryScreen";
import { getRecoveryScreenConfig } from "./scanReviewScreenState";

const renderRecoveryScreen = (
  props: Partial<React.ComponentProps<typeof ScanReviewRecoveryScreen>> = {}
) => {
  i18n.load("en", {});
  i18n.activate("en");

  const recoveryConfig = getRecoveryScreenConfig(
    ScanReviewRecoveryVariant.combined
  );

  return render(
    <I18nProvider i18n={i18n}>
      <ScanReviewRecoveryScreen
        recoveryConfig={recoveryConfig}
        onPrimaryAction={vi.fn()}
        {...props}
      />
    </I18nProvider>
  );
};

describe("ScanReviewRecoveryScreen", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders combined variant copy and primary CTA", () => {
    renderRecoveryScreen();

    expect(
      screen.getByTestId("scan-review-recovery-combined")
    ).toBeInTheDocument();
    expect(
      screen.getByText("We weren't able to capture all of your rent history")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Some pages could not be read/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Re-scan document" })
    ).toBeInTheDocument();
  });

  it("renders unknown variant without secondary action", () => {
    renderRecoveryScreen({
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.unknown
      ),
    });

    expect(
      screen.getByTestId("scan-review-recovery-unknown")
    ).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Come back later" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Request rent history" })
    ).not.toBeInTheDocument();
  });

  it("renders all-needs-rescan variant with secondary CTA", () => {
    const onSecondaryAction = vi.fn();

    renderRecoveryScreen({
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.allNeedsRescan
      ),
      onSecondaryAction,
    });

    expect(
      screen.getByTestId("scan-review-recovery-allNeedsRescan")
    ).toBeInTheDocument();
    expect(
      screen.getByText("We weren't able to read your document")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Request rent history" })
    );
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("calls onPrimaryAction when primary CTA is clicked", () => {
    const onPrimaryAction = vi.fn();
    renderRecoveryScreen({ onPrimaryAction });

    fireEvent.click(screen.getByRole("button", { name: "Re-scan document" }));

    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("shows rescan error and disables CTAs while pending", () => {
    renderRecoveryScreen({
      isRescanPending: true,
      rescanError: "Network error",
    });

    expect(screen.getByTestId("scan-review-rescan-error")).toHaveTextContent(
      "Network error"
    );
    expect(
      screen.getByRole("button", { name: "Re-scan document" })
    ).toBeDisabled();
  });
});
