import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InfoModal } from "./InfoModal";

describe("InfoModal", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders children instead of the coming soon placeholder", () => {
    render(
      <I18nProvider i18n={i18n}>
        <InfoModal isOpen title="Custom modal" onClose={() => undefined}>
          <p>Custom body</p>
        </InfoModal>
      </I18nProvider>
    );

    expect(screen.getByText("Custom body")).toBeInTheDocument();
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("keeps the coming soon placeholder when children are omitted", () => {
    render(
      <I18nProvider i18n={i18n}>
        <InfoModal isOpen title="Placeholder modal" onClose={() => undefined} />
      </I18nProvider>
    );

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();

    render(
      <I18nProvider i18n={i18n}>
        <InfoModal isOpen title="Closable modal" onClose={onClose} />
      </I18nProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("portals the dialog to document.body when rendered inside a paragraph", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { container } = render(
      <I18nProvider i18n={i18n}>
        <p data-testid="inline-copy">
          Inline copy{" "}
          <InfoModal isOpen title="Nested modal" onClose={() => undefined} />
        </p>
      </I18nProvider>
    );

    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(document.body).toContainElement(dialog);
    expect(container.querySelector("p")).not.toContainElement(dialog);

    const nestingWarnings = consoleError.mock.calls
      .map((args) => args.join(" "))
      .filter(
        (message) =>
          message.includes("validateDOMNesting") &&
          message.includes("dialog") &&
          message.includes("p")
      );
    expect(nestingWarnings).toHaveLength(0);

    consoleError.mockRestore();
  });
});
