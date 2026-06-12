import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { CurrencyField } from "../../fields/CurrencyField";
import { YesNoField } from "../../fields/YesNoField";
import { YearField } from "../../fields/YearField";
import { FindingFormShell } from "../../FindingFormShell";
import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import { StepNumberBadge } from "../../StepNumberBadge";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import {
  OcrConfirmStep,
  type OcrConfirmRowConfig,
} from "../../steps/OcrConfirmStep";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrehstpaFormState } from "./answers";
import {
  OcrHeading,
  TenancyBody,
  TenancyHeading,
  VacancyBody,
  VacancyHeading,
} from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

export type PrehstpaGetStepsBindings = {
  finding: Finding;
  formState: PrehstpaFormState;
  onFormStateChange: (patch: Partial<PrehstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

function buildOcrRows(
  finding: Finding,
  formState: PrehstpaFormState,
  onFormStateChange: (patch: Partial<PrehstpaFormState>) => void
): OcrConfirmRowConfig[] {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const row1 = finding.data.rows[ROW_INDEX.vacancy];

  // Figma OCR left slot is Apt Stat (`apt_stat` Dropdown) — deferred until fixture rows include the field.
  const renderOcrLeftPlaceholder = () => null;

  return [
    {
      regYear: row0.reg_year,
      renderLeft: renderOcrLeftPlaceholder,
      renderRight: ({ readonly }) => (
        <CurrencyField
          id="prehstpa-ocr-rent-0"
          labelText="Legal Regulated Rent"
          value={formState.row0LegalRent}
          onChange={(value) => onFormStateChange({ row0LegalRent: value })}
          readonly={readonly}
        />
      ),
    },
    {
      regYear: row1.reg_year,
      renderLeft: renderOcrLeftPlaceholder,
      renderRight: ({ readonly }) => (
        <CurrencyField
          id="prehstpa-ocr-rent-1"
          labelText="Legal Regulated Rent"
          value={formState.row1LegalRent}
          onChange={(value) => onFormStateChange({ row1LegalRent: value })}
          readonly={readonly}
        />
      ),
    },
  ];
}

type VacancyStepModuleProps = PrehstpaGetStepsBindings & {
  stepNumber: number;
  isPastStep: boolean;
};

const VacancyStepModule = ({
  finding,
  formState,
  onFormStateChange,
  stepNumber,
  isPastStep,
}: VacancyStepModuleProps) => {
  const { year0, year1 } = getIntroValues(finding);

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={<VacancyHeading />}
      body={
        <div className="prehstpa-vacancy-step" data-testid="prehstpa-vacancy-step">
          <VacancyBody year0={year0} year1={year1} />
          <YesNoField
            id="prehstpa-vacancy"
            labelText={
              <span className="prehstpa-yes-no-sr-label">
                Did tenants in the earlier year appear in the later year?
              </span>
            }
            value={formState.getsVacancyIncrease}
            onChange={(value) =>
              onFormStateChange({ getsVacancyIncrease: value })
            }
            disabled={isPastStep}
          />
        </div>
      }
    />
  );
};

type TenancyStepModuleProps = PrehstpaGetStepsBindings & {
  stepNumber: number;
  isPastStep: boolean;
};

const TenancyStepModule = ({
  finding,
  formState,
  onFormStateChange,
  stepNumber,
  isPastStep,
}: TenancyStepModuleProps) => {
  const { _ } = useLingui();
  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const tenant = row0.tenants?.[0] ?? "";

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={<TenancyHeading />}
      body={
        <div
          className="prehstpa-tenancy-step"
          data-testid="prehstpa-tenancy-step"
        >
          <TenancyBody tenant={tenant} />
          <YearField
            id="prehstpa-tenancy-start"
            value={formState.tenancyStart}
            onChange={(value) => onFormStateChange({ tenancyStart: value })}
            placeholder={_(msg`Select Year`)}
            disabled={isPastStep}
          />
        </div>
      }
    />
  );
};

export function getSteps(bindings: PrehstpaGetStepsBindings): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const ocrRows = buildOcrRows(finding, formState, onFormStateChange);

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          title={<OcrHeading />}
          rows={ocrRows}
          isPastStep={isPastStep}
          phase={ocrPhase}
          onConfirm={onOcrConfirm}
          onEdit={onOcrEdit}
        />
      ),
    },
    {
      id: "vacancy",
      stepNumber: 2,
      render: ({ isPastStep }) => (
        <VacancyStepModule
          finding={finding}
          formState={formState}
          onFormStateChange={onFormStateChange}
          stepNumber={2}
          isPastStep={isPastStep}
        />
      ),
    },
    {
      id: "tenancy_start",
      stepNumber: 3,
      isVisible: isTenancyStartStepVisible,
      render: ({ isPastStep }) => (
        <TenancyStepModule
          finding={finding}
          formState={formState}
          onFormStateChange={onFormStateChange}
          stepNumber={3}
          isPastStep={isPastStep}
        />
      ),
    },
  ];
}
