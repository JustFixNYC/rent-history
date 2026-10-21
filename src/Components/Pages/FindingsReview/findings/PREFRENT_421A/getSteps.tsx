import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { buildPrefRentOcrRows } from "../../shared/buildPrefRentOcrRows";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { Prefrent421aFormState } from "./answers";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

const ID_PREFIX = "prefrent-421a";

export type Prefrent421aGetStepsBindings = {
  finding: Finding;
  formState: Prefrent421aFormState;
  onFormStateChange: (patch: Partial<Prefrent421aFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

export function getSteps(
  bindings: Prefrent421aGetStepsBindings
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
  ];
}
