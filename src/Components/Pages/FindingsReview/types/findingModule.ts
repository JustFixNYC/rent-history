import type { ReactNode } from "react";

import type { FindingIntroPanelProps } from "../FindingIntroPanel";
import type { OcrConfirmPhase } from "../hooks/useOcrConfirmState";

import type { Finding, ValidateFindingAnswers } from "./finding";
import type { FindingStep } from "./step";

export type FindingModuleStepBindings<TForm> = {
  finding: Finding;
  formState: TForm;
  onFormStateChange: (patch: Partial<TForm>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

export type FindingReviewModule<TForm = unknown> = {
  createInitialFormState: (finding: Finding) => TForm;
  getIntro: (finding: Finding) => FindingIntroPanelProps;
  getSteps: (bindings: FindingModuleStepBindings<TForm>) => FindingStep[];
  buildAnswers: (finding: Finding, formState: TForm) => ValidateFindingAnswers;
  isStepComplete: (
    stepId: string,
    formState: TForm,
    ctx: { ocrConfirmed: boolean }
  ) => boolean;
  renderResult: (finding: Finding) => ReactNode;
};

/** Step bindings with erased form state — used by the shared orchestrator. */
export type AnyFindingModuleStepBindings = FindingModuleStepBindings<unknown>;

/**
 * Type-erased module for heterogeneous `FINDING_MODULES` values.
 * Per-type modules stay `FindingReviewModule<TForm>`; register via `registerFindingModule`.
 */
export type AnyFindingReviewModule = {
  createInitialFormState: (finding: Finding) => unknown;
  getIntro: (finding: Finding) => FindingIntroPanelProps;
  getSteps: (bindings: AnyFindingModuleStepBindings) => FindingStep[];
  buildAnswers: (
    finding: Finding,
    formState: unknown
  ) => ValidateFindingAnswers;
  isStepComplete: (
    stepId: string,
    formState: unknown,
    ctx: { ocrConfirmed: boolean }
  ) => boolean;
  renderResult: (finding: Finding) => ReactNode;
};

/** Register a typed module in `FINDING_MODULES` (variance-safe boundary). */
export function registerFindingModule<TForm>(
  module: FindingReviewModule<TForm>
): AnyFindingReviewModule {
  return module as unknown as AnyFindingReviewModule;
}
