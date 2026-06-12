import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ValidateFindingAnswers } from "../types/finding";

import {
  filterVisibleSteps,
  isTenancyStartStepVisible,
} from "./stepVisibility";
import { useFindingSteps } from "./useFindingSteps";
import { useOcrConfirmState } from "./useOcrConfirmState";
import { useProgressiveReveal } from "./useProgressiveReveal";

const prehstpaSteps = [
  { id: "ocr_confirm" },
  { id: "vacancy" },
  {
    id: "tenancy_start",
    isVisible: isTenancyStartStepVisible,
  },
];

const vacancyTrueAnswers: ValidateFindingAnswers = {
  rows: [
    { reg_year: 1991, legal_rent: 2283.1 },
    { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: true },
  ],
};

const vacancyFalseAnswers: ValidateFindingAnswers = {
  rows: [
    { reg_year: 1991, legal_rent: 2283.1 },
    { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: false },
  ],
};

describe("filterVisibleSteps", () => {
  it("includes all steps when tenancy branch is true", () => {
    expect(filterVisibleSteps(prehstpaSteps, vacancyTrueAnswers).map((s) => s.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "tenancy_start",
    ]);
  });

  it("omits tenancy_start when gets_vacancy_increase is false", () => {
    expect(filterVisibleSteps(prehstpaSteps, vacancyFalseAnswers).map((s) => s.id)).toEqual([
      "ocr_confirm",
      "vacancy",
    ]);
  });

  it("omits tenancy_start when gets_vacancy_increase is null", () => {
    const answers: ValidateFindingAnswers = {
      rows: [
        { reg_year: 1991, legal_rent: 2283.1 },
        { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: null },
      ],
    };

    expect(filterVisibleSteps(prehstpaSteps, answers).map((s) => s.id)).toEqual([
      "ocr_confirm",
      "vacancy",
    ]);
  });
});

describe("useFindingSteps", () => {
  it("returns filtered visibleSteps from answers", () => {
    const { result, rerender } = renderHook(
      ({ answers }) => useFindingSteps(prehstpaSteps, answers),
      { initialProps: { answers: vacancyFalseAnswers } }
    );

    expect(result.current.visibleSteps.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
    ]);

    rerender({ answers: vacancyTrueAnswers });

    expect(result.current.visibleSteps.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "tenancy_start",
    ]);
  });
});

describe("useOcrConfirmState", () => {
  it("transitions initial → confirmed → initial via Edit", () => {
    const { result } = renderHook(() => useOcrConfirmState());

    expect(result.current.phase).toBe("initial");
    expect(result.current.isConfirmed).toBe(false);

    act(() => {
      result.current.confirm();
    });

    expect(result.current.phase).toBe("confirmed");
    expect(result.current.isConfirmed).toBe(true);

    act(() => {
      result.current.edit();
    });

    expect(result.current.phase).toBe("initial");
    expect(result.current.isConfirmed).toBe(false);
  });
});

describe("useProgressiveReveal", () => {
  it("starts with revealedCount 1 and activeStepIndex 0", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({ stepCount: 3, isActiveStepComplete: true })
    );

    expect(result.current.revealedCount).toBe(1);
    expect(result.current.activeStepIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);
  });

  it("increments revealedCount and activeStepIndex on goNext when active step is complete", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({ stepCount: 3, isActiveStepComplete: true })
    );

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(2);
    expect(result.current.activeStepIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(3);
    expect(result.current.activeStepIndex).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });

  it("does not advance when active step is incomplete", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({ stepCount: 3, isActiveStepComplete: false })
    );

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(1);
    expect(result.current.activeStepIndex).toBe(0);
    expect(result.current.canGoNext).toBe(false);
  });

  it("decrements activeStepIndex on goBack without collapsing revealedCount", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({ stepCount: 3, isActiveStepComplete: true })
    );

    act(() => {
      result.current.goNext();
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(3);
    expect(result.current.activeStepIndex).toBe(2);

    act(() => {
      result.current.goBack();
    });

    expect(result.current.revealedCount).toBe(3);
    expect(result.current.activeStepIndex).toBe(1);
  });

  it("blocks goNext when callback returns false for the current index", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({
        stepCount: 3,
        isActiveStepComplete: (activeStepIndex) => activeStepIndex !== 0,
      })
    );

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(1);
    expect(result.current.activeStepIndex).toBe(0);
    expect(result.current.canGoNext).toBe(false);
  });

  it("advances when callback returns true for the current index", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({
        stepCount: 3,
        isActiveStepComplete: (activeStepIndex) => activeStepIndex === 0,
      })
    );

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(2);
    expect(result.current.activeStepIndex).toBe(1);
    expect(result.current.canGoNext).toBe(false);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(2);
    expect(result.current.activeStepIndex).toBe(1);
  });

  it("does not collapse revealedCount on goBack when using callback form", () => {
    const { result } = renderHook(() =>
      useProgressiveReveal({
        stepCount: 3,
        isActiveStepComplete: () => true,
      })
    );

    act(() => {
      result.current.goNext();
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.revealedCount).toBe(3);

    act(() => {
      result.current.goBack();
    });

    expect(result.current.revealedCount).toBe(3);
    expect(result.current.activeStepIndex).toBe(1);
  });
});
