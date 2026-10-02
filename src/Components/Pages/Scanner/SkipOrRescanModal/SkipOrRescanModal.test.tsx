import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SkipOrRescanModal } from "./SkipOrRescanModal";

const renderModal = (
  props: Partial<React.ComponentProps<typeof SkipOrRescanModal>> = {}
) => {
  i18n.load("en", {});
  i18n.activate("en");

  return render(
    <I18nProvider i18n={i18n}>
      <SkipOrRescanModal
        isOpen
        onClose={vi.fn()}
        onSkip={vi.fn()}
        onRescan={vi.fn()}
        {...props}
      />
    </I18nProvider>
  );
};

describe("SkipOrRescanModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls onSkip when Skip is clicked", () => {
    const onSkip = vi.fn();
    const { container } = renderModal({ onSkip });

    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    fireEvent.click(
      within(dialog as HTMLElement).getByRole("button", { name: "Skip" })
    );
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("calls onRescan when Re-scan is clicked", () => {
    const onRescan = vi.fn();
    const { container } = renderModal({ onRescan });

    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    fireEvent.click(
      within(dialog as HTMLElement).getByRole("button", { name: "Re-scan" })
    );
    expect(onRescan).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Close is clicked", () => {
    const onClose = vi.fn();
    const { container } = renderModal({ onClose });

    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    fireEvent.click(
      within(dialog as HTMLElement).getByRole("button", { name: "Close" })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
