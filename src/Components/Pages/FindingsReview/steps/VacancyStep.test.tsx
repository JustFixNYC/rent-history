import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FindingReviewInteractionLockProvider } from "../hooks/useFindingReviewInteractionLock";
import { VacancyStep, resolveVacancyStepCopy } from "./VacancyStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("resolveVacancyStepCopy", () => {
  it("returns shared self-tenant heading and body", () => {
    const { title, body } = resolveVacancyStepCopy({
      variant: "selfTenant",
      vacancyYear: 2019,
      leaseSinceYear: 2015,
    });

    renderWithI18n(
      <div>
        {title}
        {body}
      </div>
    );

    expect(
      screen.getByText(/check if you were the tenant in 2019/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/on the lease for this apartment since 2015/i)
    ).toBeInTheDocument();
  });
});

describe("VacancyStep", () => {
  it("renders copy slots, yes/no field, and inferred singleTenant variant", () => {
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
    expect(step).toHaveAttribute("data-variant", "singleTenant");
    expect(screen.getByText("Vacancy heading")).toBeInTheDocument();
    expect(screen.getByText("Vacancy body copy")).toBeInTheDocument();
    expect(document.getElementById("test-vacancy-yes")).toBeInTheDocument();

    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute(
      "aria-labelledby",
      "test-vacancy-question"
    );

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("disables yes/no when interaction lock is active", () => {
    renderWithI18n(
      <FindingReviewInteractionLockProvider locked>
        <VacancyStep
          stepNumber={2}
          title="Vacancy heading"
          body={<p>Vacancy body copy</p>}
          idPrefix="test"
          getsVacancyIncrease={null}
          onGetsVacancyIncreaseChange={() => {}}
        />
      </FindingReviewInteractionLockProvider>
    );

    expect(screen.getByRole("radio", { name: "Yes" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "No" })).toBeDisabled();
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

  it("renders multipleTenants variant with tenant list and tips before extra fields", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        variant="multipleTenants"
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="multi"
        tenants={["Tenant A", "Tenant B"]}
        tips={<p data-testid="tips-slot">Tips</p>}
        extraFields={<input data-testid="user-row-rent" />}
        getsVacancyIncrease={false}
        onGetsVacancyIncreaseChange={() => {}}
      />
    );

    const step = screen.getByTestId("multi-vacancy-step");
    expect(step).toHaveAttribute("data-variant", "multipleTenants");
    expect(step).toHaveAttribute("data-has-extra-fields", "true");
    expect(step.querySelector(".vacancy-step__tenant-list")).not.toBeNull();
    expect(screen.getAllByTestId("finding-tenant-name")).toHaveLength(2);

    const question = step.querySelector(".vacancy-step__question");
    const tips = screen.getByTestId("tips-slot");
    const extra = screen.getByTestId("user-row-rent");
    const yesNo = step.querySelector(".findings-review-yes-no-field");

    expect(question?.compareDocumentPosition(tips)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(tips.compareDocumentPosition(extra)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(extra.compareDocumentPosition(yesNo!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("wires shared copy via sharedCopy prop", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        idPrefix="shared"
        sharedCopy={{
          variant: "selfTenant",
          vacancyYear: 2018,
          leaseSinceYear: 2010,
        }}
        getsVacancyIncrease={null}
        onGetsVacancyIncreaseChange={() => {}}
      />
    );

    expect(
      screen.getByText(/check if you were the tenant in 2018/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("shared-vacancy-step")).toHaveAttribute(
      "data-variant",
      "selfTenant"
    );
  });

  it("uses legacy yesNoLegend when provided", () => {
    renderWithI18n(
      <VacancyStep
        stepNumber={2}
        title="Vacancy heading"
        body={<p>Vacancy body copy</p>}
        idPrefix="legacy"
        yesNoLegend="Custom SR legend"
        getsVacancyIncrease={null}
        onGetsVacancyIncreaseChange={() => {}}
      />
    );

    expect(screen.getByText("Custom SR legend")).toBeInTheDocument();
    expect(
      screen
        .getByTestId("legacy-vacancy-step")
        .querySelector("[data-hide-legend]")
    ).toBeNull();
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
