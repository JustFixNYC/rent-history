import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { YesNoField } from "../../fields/YesNoField";
import { YearField } from "../../fields/YearField";
import { FindingFormShell } from "../../FindingFormShell";
import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import { StepNumberBadge } from "../../../../StepNumberBadge/StepNumberBadge";
import { TenantChip } from "../../../../InlineChip/TenantChip";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrehstpaFormState } from "./answers";
import {
  OcrHeading,
  TenancyBody,
  TenancyBodyMultiple,
  TenancyHeading,
  VacancyBody,
  VacancyHeading,
} from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { getTenancyRowTenants, ROW_INDEX } from "./spec";

export type PrehstpaGetStepsBindings = {
  finding: Finding;
  formState: PrehstpaFormState;
  onFormStateChange: (patch: Partial<PrehstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.tenancy,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
  {
    dataRowIndex: ROW_INDEX.vacancy,
    formRowIndex: 1,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
];

// TODO later Vacancy and Tenancy modules can be refactored in a similar way as
// OcrConfirmStep to reduce repetition across finding types given similar
// structure
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
  const { _ } = useLingui();
  const { year0, year1 } = getIntroValues(finding);

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={<VacancyHeading />}
      body={
        <div
          className="prehstpa-vacancy-step"
          data-testid="prehstpa-vacancy-step"
        >
          <VacancyBody year0={year0} year1={year1} />
          <YesNoField
            id="prehstpa-vacancy"
            labelText={
              <span className="prehstpa-yes-no-sr-label">
                {_(
                  msg`Did tenants in the earlier year appear in the later year?`
                )}
              </span>
            }
            value={formState.getsVacancyIncrease}
            onChange={(value) => {
              if (value === false) {
                onFormStateChange({
                  getsVacancyIncrease: false,
                  tenancyStart: null,
                });
                return;
              }
              onFormStateChange({ getsVacancyIncrease: value });
            }}
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
  const tenants = getTenancyRowTenants(finding);
  const isMulti = tenants.length > 1;

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={<TenancyHeading />}
      body={
        <div
          className="prehstpa-tenancy-step"
          data-testid="prehstpa-tenancy-step"
          data-tenant-mode={isMulti ? "multiple" : "single"}
        >
          {isMulti ? (
            <TenancyBodyMultiple />
          ) : (
            <TenancyBody tenant={tenants[0] ?? ""} />
          )}
          {isMulti ? (
            <ul
              className="prehstpa-tenancy-step__tenant-list"
              aria-label={_(msg`Tenant names`)}
            >
              {tenants.map((tenant) => (
                <li key={tenant}>
                  <TenantChip tenant={tenant} />
                </li>
              ))}
            </ul>
          ) : null}
          <YearField
            id="prehstpa-tenancy-start"
            value={formState.tenancyStart}
            onChange={(value) => onFormStateChange({ tenancyStart: value })}
            placeholder={_(msg`Select Year`)}
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
  const ocrRows = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: "prehstpa",
    rows: STANDARD_OCR_ROWS,
  });

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
