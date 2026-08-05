import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VacancyStep } from "./VacancyStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("VacancyStep", () => {
  it("renders copy slots, yes/no field, and default variant", () => {
    const onChange = vi.fn();

    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="test"
        getsVacancyIncrease={null}
        onGetsVacancyIncreaseChange={onChange}
      />
    );

    const step = screen.getByTestId("test-vacancy-step");
    expect(step).toHaveAttribute("data-variant", "default");
    expect(screen.getByText("Vacancy heading")).toBeInTheDocument();
    expect(screen.getByText("Vacancy body copy")).toBeInTheDocument();
    expect(document.getElementById("test-vacancy-yes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("maps No selection to gets_vacancy_increase true", () => {
    const onChange = vi.fn();

    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="test"
        getsVacancyIncrease={null}
        onGetsVacancyIncreaseChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("checks Yes when gets_vacancy_increase is false", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="test"
        getsVacancyIncrease={false}
        onGetsVacancyIncreaseChange={() => {}}
      />
    );

    expect(screen.getByRole("radio", { name: "Yes" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "No" })).not.toBeChecked();
  });

  it("renders extra fields and userRow variant", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="nonreg"
        getsVacancyIncrease={false}
        onGetsVacancyIncreaseChange={() => {}}
        variant="userRow"
        extraFields={<input data-testid="user-row-rent" />}
      />
    );

    const step = screen.getByTestId("nonreg-vacancy-step");
    expect(step).toHaveAttribute("data-variant", "userRow");
    expect(screen.getByTestId("user-row-rent")).toBeInTheDocument();
  });

  it("uses completed shell variant when isPastStep is true", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="test"
        getsVacancyIncrease={true}
        onGetsVacancyIncreaseChange={() => {}}
        isPastStep
      />
    );

    expect(screen.getByTestId("finding-form-shell")).toHaveAttribute(
      "data-variant",
      "completed"
    );
  });
});
