import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { AptStatField } from "../../fields/AptStatField";
import { CurrencyField } from "../../fields/CurrencyField";
import { YesNoField } from "../../fields/YesNoField";
import { YearField } from "../../fields/YearField";
import { FindingFormShell } from "../../FindingFormShell";
import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import { StepNumberBadge } from "../../StepNumberBadge";
import { TenantChip } from "../../TenantChip";
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

function buildOcrRows(
  finding: Finding,
  formState: PrehstpaFormState,
  onFormStateChange: (patch: Partial<PrehstpaFormState>) => void
): OcrConfirmRowConfig[] {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const row1 = finding.data.rows[ROW_INDEX.vacancy];

  return [
    {
      regYear: row0.reg_year,
      renderLeft: ({ readonly }) => (
        <AptStatField
          id="prehstpa-ocr-apt-stat-0"
          labelText="Apt Stat"
          value={formState.row0AptStat}
          onChange={(value) => onFormStateChange({ row0AptStat: value })}
          disabled={readonly}
        />
      ),
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
      renderLeft: ({ readonly }) => (
        <AptStatField
          id="prehstpa-ocr-apt-stat-1"
          labelText="Apt Stat"
          value={formState.row1AptStat}
          onChange={(value) => onFormStateChange({ row1AptStat: value })}
          disabled={readonly}
        />
      ),
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
