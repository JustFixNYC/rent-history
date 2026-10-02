import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { describe, expect, it, vi } from "vitest";

import { PreScanScreen } from "./PreScanScreen";

const renderPreScan = (
  props: Partial<React.ComponentProps<typeof PreScanScreen>> = {}
) => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <I18nProvider i18n={i18n}>
      <PreScanScreen onBack={vi.fn()} onStartScanning={vi.fn()} {...props} />
    </I18nProvider>
  );
};

describe("PreScanScreen", () => {
  it("shows Start scanning in default variant", () => {
    renderPreScan();
    expect(
      screen.getByRole("button", { name: "Start scanning" })
    ).toBeInTheDocument();
  });

  it("shows Skip or Re-scan in postCompileReturn variant", () => {
    const onSkipOrRescan = vi.fn();
    renderPreScan({
      variant: "postCompileReturn",
      onSkipOrRescan,
    });

    fireEvent.click(screen.getByRole("button", { name: "Skip or Re-scan" }));
    expect(onSkipOrRescan).toHaveBeenCalledTimes(1);
  });
});
