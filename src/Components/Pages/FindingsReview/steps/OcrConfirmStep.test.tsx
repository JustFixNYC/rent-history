import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CurrencyField } from "../fields/CurrencyField";
import { TenantChip } from "../../../InlineChip/TenantChip";
import { OcrConfirmStep } from "./OcrConfirmStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

const StubOcrConfirmHarness = () => {
  const [rent0, setRent0] = useState("2283.1");
  const [rent1, setRent1] = useState("2590.86");

  return (
    <OcrConfirmStep
      stepNumber={1}
      title="First, let's make sure we are working with the right values"
      rows={[
        {
          regYear: 1991,
          renderLeft: () => <TenantChip tenant="KEITH ANTOINE" />,
          renderRight: ({ readonly }) => (
            <CurrencyField
              id="ocr-rent-0"
              labelText="Legal Regulated Rent"
              value={rent0}
              onChange={setRent0}
              readonly={readonly}
            />
          ),
        },
        {
          regYear: 1992,
          renderLeft: () => <TenantChip tenant="CHRISTINE DOE" />,
          renderRight: ({ readonly }) => (
            <CurrencyField
              id="ocr-rent-1"
              labelText="Legal Regulated Rent"
              value={rent1}
              onChange={setRent1}
              readonly={readonly}
            />
          ),
        },
      ]}
    />
  );
};

describe("OcrConfirmStep", () => {
  it("renders initial state with confirm CTA and editable fields", () => {
    renderWithI18n(<StubOcrConfirmHarness />);

    const step = screen.getByTestId("ocr-confirm-step");
    expect(step).toHaveAttribute("data-phase", "initial");

    const shell = screen.getByTestId("finding-form-shell");
    expect(shell).toHaveAttribute("data-variant", "active");

    expect(
      screen.getByRole("button", { name: "Yes, this matches my document" })
    ).toBeInTheDocument();

    const rentInputs = screen.getAllByRole("textbox", {
      name: "Legal Regulated Rent",
    });
    expect(rentInputs).toHaveLength(2);
    expect(rentInputs[0]).not.toBeDisabled();
    expect(rentInputs[1]).not.toBeDisabled();
  });

  it("transitions to confirmed readonly state and back via Edit", () => {
    renderWithI18n(<StubOcrConfirmHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, this matches my document" })
    );

    const step = screen.getByTestId("ocr-confirm-step");
    expect(step).toHaveAttribute("data-phase", "confirmed");

    const shell = screen.getByTestId("finding-form-shell");
    expect(shell).toHaveAttribute("data-variant", "completed");

    expect(
      screen.getByRole("button", { name: "Values confirmed" })
    ).toBeDisabled();

    screen
      .getAllByRole("textbox", { name: "Legal Regulated Rent" })
      .forEach((input) => {
        expect(input).toBeDisabled();
      });

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(step).toHaveAttribute("data-phase", "initial");
    expect(shell).toHaveAttribute("data-variant", "active");
    expect(
      screen.getByRole("button", { name: "Yes, this matches my document" })
    ).toBeInTheDocument();
  });

  it("shows Edit when confirmed even if isPastStep is true", () => {
    renderWithI18n(
      <OcrConfirmStep
        stepNumber={1}
        title="Confirm values"
        isPastStep
        phase="confirmed"
        rows={[
          {
            regYear: 1991,
            renderLeft: () => <TenantChip tenant="KEITH ANTOINE" />,
            renderRight: ({ readonly }) => (
              <CurrencyField
                id="ocr-rent-0"
                labelText="Legal Regulated Rent"
                value="2283.1"
                onChange={() => {}}
                readonly={readonly}
              />
            ),
          },
        ]}
      />
    );

    expect(screen.getByTestId("ocr-confirm-step")).toHaveAttribute(
      "data-phase",
      "confirmed"
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("returns to editable mode when Edit is clicked on a past step", () => {
    const onEdit = vi.fn();

    const { rerender } = renderWithI18n(
      <OcrConfirmStep
        stepNumber={1}
        title="Confirm values"
        isPastStep
        phase="confirmed"
        onEdit={onEdit}
        rows={[
          {
            regYear: 1991,
            renderLeft: () => <TenantChip tenant="KEITH ANTOINE" />,
            renderRight: ({ readonly }) => (
              <CurrencyField
                id="ocr-rent-0"
                labelText="Legal Regulated Rent"
                value="2283.1"
                onChange={() => {}}
                readonly={readonly}
              />
            ),
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    rerender(
      <I18nProvider i18n={i18n}>
        <OcrConfirmStep
          stepNumber={1}
          title="Confirm values"
          isPastStep
          phase="initial"
          onEdit={onEdit}
          rows={[
            {
              regYear: 1991,
              renderLeft: () => <TenantChip tenant="KEITH ANTOINE" />,
              renderRight: ({ readonly }) => (
                <CurrencyField
                  id="ocr-rent-0"
                  labelText="Legal Regulated Rent"
                  value="2283.1"
                  onChange={() => {}}
                  readonly={readonly}
                />
              ),
            },
          ]}
        />
      </I18nProvider>
    );

    expect(screen.getByTestId("ocr-confirm-step")).toHaveAttribute(
      "data-phase",
      "initial"
    );
    expect(
      screen.getByRole("button", { name: "Yes, this matches my document" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Legal Regulated Rent" })
    ).not.toBeDisabled();
  });
});
