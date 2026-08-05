import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { LegalrentPosthstpaFormState } from "./answers";
import { OcrHeading } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type LegalrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: LegalrentPosthstpaFormState;
  onFormStateChange: (patch: Partial<LegalrentPosthstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.row0,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
  {
    dataRowIndex: ROW_INDEX.row1,
    formRowIndex: 1,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
];

export function getSteps(
  bindings: LegalrentPosthstpaGetStepsBindings
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
    idPrefix: "legalrent-posthstpa",
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
  ];
}
