import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TenancyStep, resolveTenancyStepCopy } from "./TenancyStep";
import "../FindingsReview.scss";

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("resolveTenancyStepCopy", () => {
  it("returns shared single-tenant heading and body", () => {
    const { title, body } = resolveTenancyStepCopy({
      variant: "singleTenant",
      tenant: "AUDREY JOHNSON",
    });

    renderWithI18n(
      <div>
        {title}
        {body}
      </div>
    );

    expect(
      screen.getByText(/how long the previous tenant lived there/i)
    ).toBeInTheDocument();
    expect(screen.getByText("AUDREY JOHNSON")).toBeInTheDocument();
  });
});

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
    expect(step).toHaveAttribute("data-variant", "singleTenant");
    expect(step).toHaveAttribute("data-tenant-mode", "single");
    expect(step.querySelector(".tenancy-step__tenant-list")).toBeNull();
    expect(
      screen.getByText("Tenancy body for AUDREY JOHNSON")
    ).toBeInTheDocument();
    expect(document.getElementById("test-tenancy-start")).toBeInTheDocument();
  });

  it("renders multi-tenant mode with stacked tenant names", () => {
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
    expect(step).toHaveAttribute("data-variant", "multipleTenants");
    expect(step).toHaveAttribute("data-tenant-mode", "multiple");
    expect(step.querySelector(".tenancy-step__tenant-list")).not.toBeNull();
    expect(screen.getAllByTestId("finding-tenant-name")).toHaveLength(2);
    expect(screen.getByText("Tenant A")).toBeInTheDocument();
    expect(screen.getByText("Tenant B")).toBeInTheDocument();
  });

  it("renders tips slot between body and tenant list", () => {
    renderWithI18n(
      <TenancyStep
        stepNumber={2}
        title="Tenancy heading"
        body={<p data-testid="tenancy-body">Tenancy body</p>}
        tips={<p data-testid="tips-slot">Tips link placeholder</p>}
        tenants={["Tenant A", "Tenant B"]}
        idPrefix="test"
        tenancyStart={null}
        onTenancyStartChange={() => {}}
      />
    );

    const step = screen.getByTestId("test-tenancy-step");
    const body = screen.getByTestId("tenancy-body");
    const tips = screen.getByTestId("tips-slot");
    const list = step.querySelector(".tenancy-step__tenant-list");
    const year = document.getElementById("test-tenancy-start");

    expect(tips).toBeInTheDocument();
    expect(body.compareDocumentPosition(tips)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(tips.compareDocumentPosition(list!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(list!.compareDocumentPosition(year!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("wires shared copy via sharedCopy prop", () => {
    renderWithI18n(
      <TenancyStep
        stepNumber={3}
        idPrefix="shared"
        sharedCopy={{ variant: "multipleTenants" }}
        tenants={["Tenant A", "Tenant B"]}
        tenancyStart={null}
        onTenancyStartChange={() => {}}
      />
    );

    expect(
      screen.getByText(/how long the previous tenants lived there/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("shared-tenancy-step")).toHaveAttribute(
      "data-variant",
      "multipleTenants"
    );
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
