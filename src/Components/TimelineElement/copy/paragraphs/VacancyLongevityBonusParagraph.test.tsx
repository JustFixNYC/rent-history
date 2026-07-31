import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VacancyLongevityBonusParagraph } from "./VacancyLongevityBonusParagraph";

const renderParagraph = (
  props: Parameters<typeof VacancyLongevityBonusParagraph>[0]
) =>
  render(
    <I18nProvider i18n={i18n}>
      <VacancyLongevityBonusParagraph {...props} />
    </I18nProvider>
  );

describe("VacancyLongevityBonusParagraph", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("includes longevity bonus copy when longevityAmount is set", () => {
    const { container } = renderParagraph({
      vacancyAmount: 240,
      longevityAmount: 72,
    });

    expect(container.textContent).toMatch(/\$240/);
    expect(container.textContent).toMatch(/\$72/);
    expect(
      screen.getByRole("button", { name: /vacancy bonus/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /longevity bonus/i })
    ).toBeInTheDocument();
  });

  it("omits longevity bonus copy when longevityAmount is null", () => {
    const { container } = renderParagraph({
      vacancyAmount: 240,
      longevityAmount: null,
    });

    expect(
      screen.getByRole("button", { name: /vacancy bonus/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /longevity bonus/i })
    ).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/longevity bonus/i);
  });

  it("omits longevity bonus copy when longevityAmount is undefined", () => {
    const { container } = renderParagraph({ vacancyAmount: 240 });

    expect(
      screen.getByRole("button", { name: /vacancy bonus/i })
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/longevity bonus/i);
  });
});
