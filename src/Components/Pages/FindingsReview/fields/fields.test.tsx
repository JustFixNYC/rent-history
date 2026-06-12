import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";

import { CurrencyField } from "./CurrencyField";
import { YesNoField } from "./YesNoField";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

type CurrencyFormValues = { legalRent: string };

const CurrencyFieldFormHarness: React.FC<{
  readonly?: boolean;
  onValueChange?: (value: string) => void;
}> = ({ readonly, onValueChange }) => {
  const form = useForm<CurrencyFormValues>({
    defaultValues: { legalRent: "2283.1" },
  });
  const value = form.watch("legalRent");

  return (
    <CurrencyField
      id="legal-rent"
      labelText="Legal Regulated Rent"
      value={value}
      onChange={(nextValue) => {
        form.setValue("legalRent", nextValue);
        onValueChange?.(nextValue);
      }}
      readonly={readonly}
    />
  );
};

type VacancyFormValues = { getsVacancyIncrease: boolean | null };

const YesNoFieldFormHarness: React.FC<{
  onValueChange?: (value: boolean) => void;
}> = ({ onValueChange }) => {
  const form = useForm<VacancyFormValues>({
    defaultValues: { getsVacancyIncrease: null },
  });
  const value = form.watch("getsVacancyIncrease");

  return (
    <YesNoField
      id="vacancy"
      labelText="Did the tenant receive a vacancy increase?"
      value={value}
      onChange={(nextValue) => {
        form.setValue("getsVacancyIncrease", nextValue);
        onValueChange?.(nextValue);
      }}
      yesLabel="Yes"
      noLabel="No"
    />
  );
};

describe("CurrencyField", () => {
  it("renders inside a useForm wrapper and updates value on change", () => {
    const changes: string[] = [];

    renderWithI18n(
      <CurrencyFieldFormHarness
        onValueChange={(value) => {
          changes.push(value);
        }}
      />
    );

    const input = screen.getByRole("spinbutton", {
      name: "Legal Regulated Rent",
    });
    expect(input).toHaveValue(2283.1);

    fireEvent.change(input, { target: { value: "2500" } });

    expect(changes.at(-1)).toBe("2500");
    expect(input).toHaveValue(2500);
  });

  it("renders readonly variant as disabled with readonly styling class", () => {
    renderWithI18n(<CurrencyFieldFormHarness readonly />);

    const input = screen.getByRole("spinbutton", {
      name: "Legal Regulated Rent",
    });
    expect(input).toBeDisabled();
    expect(
      document.querySelector(".findings-review-currency-field--readonly")
    ).toBeInTheDocument();
  });
});

describe("YesNoField", () => {
  it("renders stacked options and fires onChange when selected", () => {
    const changes: boolean[] = [];

    renderWithI18n(
      <YesNoFieldFormHarness
        onValueChange={(value) => {
          changes.push(value);
        }}
      />
    );

    const yesOption = screen.getByRole("radio", { name: "Yes" });
    const noOption = screen.getByRole("radio", { name: "No" });

    expect(yesOption).not.toBeChecked();
    expect(noOption).not.toBeChecked();

    fireEvent.click(yesOption);

    expect(changes).toEqual([true]);
    expect(yesOption).toBeChecked();
    expect(noOption).not.toBeChecked();

    fireEvent.click(noOption);

    expect(changes).toEqual([true, false]);
    expect(noOption).toBeChecked();
    expect(yesOption).not.toBeChecked();
  });
});
