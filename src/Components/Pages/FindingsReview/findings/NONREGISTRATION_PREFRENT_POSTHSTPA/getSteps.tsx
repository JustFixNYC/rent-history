import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { VacancyStep } from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationPrefrentPosthstpaFormState } from "./answers";
import {
  OcrHeading,
  VacancyBody,
  VacancyHeading,
  VacancyYesNoLegend,
} from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

export type NonregistrationPrefrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: NonregistrationPrefrentPosthstpaFormState;
  onFormStateChange: (
    patch: Partial<NonregistrationPrefrentPosthstpaFormState>
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
    right: ["legal_rent" as const, "pref_rent" as const],
  },
];

export function getSteps(
  bindings: NonregistrationPrefrentPosthstpaGetStepsBindings
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
    idPrefix: "nonregistration-prefrent-posthstpa",
    rows: STANDARD_OCR_ROWS,
  });
  const { year0 } = getIntroValues(finding);

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
        <VacancyStep
          stepNumber={2}
          isPastStep={isPastStep}
          idPrefix="nonregistration-prefrent-posthstpa"
          title={<VacancyHeading year0={year0} />}
          body={<VacancyBody year0={year0} />}
          yesNoLegend={<VacancyYesNoLegend year0={year0} />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
  ];
}
