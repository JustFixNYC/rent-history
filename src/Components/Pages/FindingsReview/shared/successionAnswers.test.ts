import { describe, expect, it } from "vitest";

import { applyTookSuccessionToAnswerRow } from "./successionAnswers";

describe("applyTookSuccessionToAnswerRow", () => {
  it("does not set took_succession when vacancy increase is not true", () => {
    const row = { reg_year: 2026, gets_vacancy_increase: false };

    applyTookSuccessionToAnswerRow(row, false, true);

    expect(row).toEqual({ reg_year: 2026, gets_vacancy_increase: false });
    expect(row).not.toHaveProperty("took_succession");
  });

  it("does not set took_succession when succession answer is null", () => {
    const row = { reg_year: 2026, gets_vacancy_increase: true };

    applyTookSuccessionToAnswerRow(row, true, null);

    expect(row).toEqual({ reg_year: 2026, gets_vacancy_increase: true });
    expect(row).not.toHaveProperty("took_succession");
  });

  it("sets took_succession when vacancy increase is true and succession is boolean", () => {
    const row = { reg_year: 2026, gets_vacancy_increase: true };

    applyTookSuccessionToAnswerRow(row, true, true);

    expect(row.took_succession).toBe(true);
  });
});
