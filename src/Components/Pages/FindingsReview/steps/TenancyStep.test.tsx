import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TenancyStep } from "./TenancyStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("TenancyStep", () => {
  it("renders single-tenant mode without tenant list", () => {
    renderWithI18n(
      <TenancyStep
        stepNumber={3}
        title="Tenancy heading"
        body={<p>Tenancy body for AUDREY JOHNSON</p>}
        tenants={["AUDREY JOHNSON"]}
        idPrefix="test"
        tenancyStart={null}
        onTenancyStartChange={() => {}}
      />
    );

    const step = screen.getByTestId("test-tenancy-step");
    expect(step).toHaveAttribute("data-tenant-mode", "single");
    expect(step.querySelector(".tenancy-step__tenant-list")).toBeNull();
    expect(
      screen.getByText("Tenancy body for AUDREY JOHNSON")
    ).toBeInTheDocument();
    expect(document.getElementById("test-tenancy-start")).toBeInTheDocument();
  });

  it("renders multi-tenant mode with stacked chips", () => {
    renderWithI18n(
      <TenancyStep
        stepNumber={3}
        title="Tenancy heading"
        body={<p>Multi-tenant body copy</p>}
        tenants={["Tenant A", "Tenant B"]}
        idPrefix="test"
        tenancyStart={null}
        onTenancyStartChange={() => {}}
      />
    );

    const step = screen.getByTestId("test-tenancy-step");
    expect(step).toHaveAttribute("data-tenant-mode", "multiple");
    expect(step.querySelector(".tenancy-step__tenant-list")).not.toBeNull();
    expect(screen.getAllByTestId("tenant-chip")).toHaveLength(2);
    expect(screen.getByText("Tenant A")).toBeInTheDocument();
    expect(screen.getByText("Tenant B")).toBeInTheDocument();
  });

  it("uses completed shell variant when isPastStep is true", () => {
    renderWithI18n(
      <TenancyStep
        stepNumber={3}
        title="Tenancy heading"
        body={<p>Tenancy body</p>}
        tenants={["AUDREY JOHNSON"]}
        idPrefix="test"
        tenancyStart={1989}
        onTenancyStartChange={() => {}}
        isPastStep
      />
    );

    expect(screen.getByTestId("finding-form-shell")).toHaveAttribute(
      "data-variant",
      "completed"
    );
  });
});
