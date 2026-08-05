import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { VacancyStep } from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import {
  VacancyBody,
  VacancyYesNoLegend,
} from "../OVERCHARGE_PREHSTPA/ReviewCopy";

import type { PrefrentPosthstpaFormState } from "./answers";
import { OcrHeading, VacancyHeading } from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

export type PrefrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: PrefrentPosthstpaFormState;
  onFormStateChange: (patch: Partial<PrefrentPosthstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.row0,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const, "pref_rent" as const],
  },
  {
    dataRowIndex: ROW_INDEX.row1,
    formRowIndex: 1,
    left: "apt_stat" as const,
    right: ["pref_rent" as const],
  },
];

export function getSteps(
  bindings: PrefrentPosthstpaGetStepsBindings
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
    idPrefix: "prefrent-posthstpa",
    rows: STANDARD_OCR_ROWS,
  });
  const { year0, year1 } = getIntroValues(finding);

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
          idPrefix="prefrent-posthstpa"
          title={<VacancyHeading year0={year0} year1={year1} />}
          body={<VacancyBody year0={year0} year1={year1} />}
          yesNoLegend={<VacancyYesNoLegend />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
  ];
}
