import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FindingFormShell } from "./FindingFormShell";
import { StepNumberBadge } from "./StepNumberBadge";
import "./FindingsReview.scss";

afterEach(() => {
  cleanup();
});

describe("FindingFormShell", () => {
  it("renders badge, title, body, and CTA slots", () => {
    render(
      <FindingFormShell
        badge={<StepNumberBadge stepNumber={1} />}
        title="Confirm values"
        body={<p>Body content</p>}
        cta={<button type="button">Continue</button>}
      />
    );

    expect(screen.getByTestId("step-number-badge")).toHaveTextContent("1");
    expect(
      screen.getByRole("heading", { name: "Confirm values" })
    ).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" })
    ).toBeInTheDocument();
  });

  it("uses active border variant by default", () => {
    render(<FindingFormShell title="Active step" body={<p>Body</p>} />);

    const shell = screen.getByTestId("finding-form-shell");
    expect(shell).toHaveClass("finding-form-shell--active");
    expect(shell).toHaveAttribute("data-variant", "active");
  });

  it("uses completed border variant when specified", () => {
    render(
      <FindingFormShell
        variant="completed"
        title="Completed step"
        body={<p>Body</p>}
      />
    );

    const shell = screen.getByTestId("finding-form-shell");
    expect(shell).toHaveClass("finding-form-shell--completed");
    expect(shell).toHaveAttribute("data-variant", "completed");
  });
});
