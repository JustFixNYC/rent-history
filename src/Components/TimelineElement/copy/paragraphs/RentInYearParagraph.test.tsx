import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { RentInYearParagraph } from "./RentInYearParagraph";

const renderParagraph = (props: Parameters<typeof RentInYearParagraph>[0]) =>
  render(
    <I18nProvider i18n={i18n}>
      <RentInYearParagraph {...props} />
    </I18nProvider>
  );

describe("RentInYearParagraph", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders legal regulated rent wording", () => {
    renderParagraph({ rentKind: "legal", year: 2000, amount: 1200 });

    expect(
      screen.getByText(/The legal regulated rent in year 2000 was \$1,200/)
    ).toBeInTheDocument();
  });

  it("renders preferential rent wording", () => {
    renderParagraph({ rentKind: "preferential", year: 2020, amount: 1500 });

    expect(
      screen.getByText(/The preferential rent in year 2020 was \$1,500/)
    ).toBeInTheDocument();
  });
});
