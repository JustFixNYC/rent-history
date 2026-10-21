import { isVacancyGatedFollowUpVisible } from "../../hooks/stepVisibility";
import { patchGetsVacancyIncrease } from "../../hooks/vacancyFormState";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { buildPrefRentOcrRows } from "../../shared/buildPrefRentOcrRows";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { SuccessionStep } from "../../steps/SuccessionStep";
import {
  VacancyStep,
  buildVacancySelfTenantSharedCopy,
} from "../../steps/VacancyStep";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

const ID_PREFIX = "nonregistration-overcharge-prefrent-posthstpa-curr-tenant";

export type NonregistrationOverchargePrefrentPosthstpaCurrTenantGetStepsBindings =
  {
    finding: Finding;
    formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState;
    onFormStateChange: (
      patch: Partial<NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState>
    ) => void;
    ocrPhase?: OcrConfirmPhase;
    onOcrConfirm?: () => void;
    onOcrEdit?: () => void;
  };

export function getSteps(
  bindings: NonregistrationOverchargePrefrentPosthstpaCurrTenantGetStepsBindings
): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;

  const ocrRows = buildPrefRentOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: ID_PREFIX,
    noPrefRentLabel: NO_PREF_RENT_LABEL,
    rows: [
      {
        dataRowIndex: ROW_INDEX.context,
        formRowIndex: 0,
        fieldKeys: {
          legalRent: "row0LegalRent",
          prefRent: "row0PrefRent",
          noPrefRent: "row0NoPrefRent",
        },
      },
    ],
  });

  const { year0, lastRegistrationYear } = getIntroValues(finding);

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          intro={<OcrConfirmIntro years={ocrRows.map((row) => row.regYear)} />}
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
          idPrefix={ID_PREFIX}
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
          idPrefix={ID_PREFIX}
          sharedCopy={{ year: year0 }}
          value={formState.tookSuccession}
          onChange={(value) => onFormStateChange({ tookSuccession: value })}
        />
      ),
    },
  ];
}
