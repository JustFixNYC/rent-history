import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SuccessionStep, resolveSuccessionStepCopy } from "./SuccessionStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("resolveSuccessionStepCopy", () => {
  it("returns shared heading and body with year", () => {
    const { title, body } = resolveSuccessionStepCopy({ year: 2015 });

    renderWithI18n(
      <div>
        {title}
        {body}
      </div>
    );

    expect(
      screen.getByText(/took succession of this apartment/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/on the lease in 2015/i)).toBeInTheDocument();
  });
});

describe("SuccessionStep", () => {
  it("renders copy, yes/no field, and aria-labelledby on the question", () => {
    const onChange = vi.fn();

    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        title="Succession heading"
        body={<p>Succession body copy</p>}
        idPrefix="test"
        value={null}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Succession heading")).toBeInTheDocument();
    expect(screen.getByText("Succession body copy")).toBeInTheDocument();
    expect(document.getElementById("test-succession-yes")).toBeInTheDocument();

    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute(
      "aria-labelledby",
      "test-succession-question"
    );
  });

  it("maps Yes selection directly to true", () => {
    const onChange = vi.fn();

    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        title="Succession heading"
        body={<p>Succession body copy</p>}
        idPrefix="test"
        value={null}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("maps No selection directly to false", () => {
    const onChange = vi.fn();

    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        title="Succession heading"
        body={<p>Succession body copy</p>}
        idPrefix="test"
        value={null}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("checks Yes when value is true", () => {
    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        title="Succession heading"
        body={<p>Succession body copy</p>}
        idPrefix="test"
        value={true}
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("radio", { name: "Yes" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "No" })).not.toBeChecked();
  });

  it("wires shared copy via sharedCopy prop", () => {
    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        idPrefix="shared"
        sharedCopy={{ year: 2012 }}
        value={null}
        onChange={() => {}}
      />
    );

    expect(
      screen.getByText(/took succession of this apartment/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/on the lease in 2012/i)).toBeInTheDocument();
  });

  it("uses completed shell variant when isPastStep is true", () => {
    renderWithI18n(
      <SuccessionStep
        stepNumber={4}
        title="Succession heading"
        body={<p>Succession body copy</p>}
        idPrefix="test"
        value={false}
        onChange={() => {}}
        isPastStep
      />
    );

    expect(screen.getByTestId("finding-form-shell")).toHaveAttribute(
      "data-variant",
      "completed"
    );
  });
});
