import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { SuccessionStep } from "../../steps/SuccessionStep";
import { VacancyStep } from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationPrehstpaCurrTenantFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import {
  SuccessionBody,
  SuccessionHeading,
  VacancyBody,
  VacancyHeading,
} from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type NonregistrationPrehstpaCurrTenantGetStepsBindings = {
  finding: Finding;
  formState: NonregistrationPrehstpaCurrTenantFormState;
  onFormStateChange: (
    patch: Partial<NonregistrationPrehstpaCurrTenantFormState>
  ) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.context,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
];

export function getSteps(
  bindings: NonregistrationPrehstpaCurrTenantGetStepsBindings
): FindingStep[] {
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
    idPrefix: "nonregistration-prehstpa-curr-tenant",
    rows: STANDARD_OCR_ROWS,
  });
  const { year0, lastRegistrationYear } = getIntroValues(finding);

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          intro={<OcrConfirmIntro years={[year0]} />}
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
        <VacancyStep
          stepNumber={2}
          isPastStep={isPastStep}
          idPrefix="nonregistration-prehstpa-curr-tenant"
          variant="selfTenant"
          title={<VacancyHeading lastRegistrationYear={lastRegistrationYear} />}
          body={<VacancyBody year0={year0} />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            if (value === false) {
              onFormStateChange({
                getsVacancyIncrease: false,
                tookSuccession: null,
              });
              return;
            }
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
    {
      id: "succession",
      stepNumber: 3,
      isVisible: isTenancyStartStepVisible,
      render: ({ isPastStep }) => (
        <SuccessionStep
          stepNumber={3}
          isPastStep={isPastStep}
          idPrefix="nonregistration-prehstpa-curr-tenant"
          title={<SuccessionHeading />}
          body={<SuccessionBody year={year0} />}
          value={formState.tookSuccession}
          onChange={(value) => onFormStateChange({ tookSuccession: value })}
        />
      ),
    },
  ];
}
