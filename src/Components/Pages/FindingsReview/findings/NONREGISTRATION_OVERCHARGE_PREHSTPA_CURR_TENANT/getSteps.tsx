import { isVacancyGatedFollowUpVisible } from "../../hooks/stepVisibility";
import { patchGetsVacancyIncrease } from "../../hooks/vacancyFormState";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { SuccessionStep } from "../../steps/SuccessionStep";
import {
  VacancyStep,
  buildVacancySelfTenantSharedCopy,
} from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationOverchargePrehstpaCurrTenantFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

export type NonregistrationOverchargePrehstpaCurrTenantGetStepsBindings = {
  finding: Finding;
  formState: NonregistrationOverchargePrehstpaCurrTenantFormState;
  onFormStateChange: (
    patch: Partial<NonregistrationOverchargePrehstpaCurrTenantFormState>
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
  bindings: NonregistrationOverchargePrehstpaCurrTenantGetStepsBindings
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
    idPrefix: "nonregistration-overcharge-prehstpa-curr-tenant",
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
          idPrefix="nonregistration-overcharge-prehstpa-curr-tenant"
          sharedCopy={buildVacancySelfTenantSharedCopy({
            vacancyYear: lastRegistrationYear,
            leaseSinceYear: year0,
          })}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) =>
            patchGetsVacancyIncrease(value, onFormStateChange, "tookSuccession")
          }
        />
      ),
    },
    {
      id: "succession",
      stepNumber: 3,
      isVisible: isVacancyGatedFollowUpVisible,
      render: ({ isPastStep }) => (
        <SuccessionStep
          stepNumber={3}
          isPastStep={isPastStep}
          idPrefix="nonregistration-overcharge-prehstpa-curr-tenant"
          sharedCopy={{ year: year0 }}
          value={formState.tookSuccession}
          onChange={(value) => onFormStateChange({ tookSuccession: value })}
        />
      ),
    },
  ];
}
