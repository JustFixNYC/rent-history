import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";
import { PrefRentOcrFields } from "../../shared/PrefRentOcrFields";

import type { Prefrent421aFormState } from "./answers";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type Prefrent421aGetStepsBindings = {
  finding: Finding;
  formState: Prefrent421aFormState;
  onFormStateChange: (patch: Partial<Prefrent421aFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const ID_PREFIX = "prefrent-421a";

const PREF_RENT_OCR_FIELD_KEYS = {
  legalRent: "row0LegalRent",
  prefRent: "row0PrefRent",
  noPrefRent: "row0NoPrefRent",
} as const;

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.context,
    formRowIndex: 0,
    left: "apt_stat" as const,
  },
];

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
  const wireRow = finding.data.rows[ROW_INDEX.context];
  const [ocrRow] = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: ID_PREFIX,
    rows: STANDARD_OCR_ROWS,
  });

  const ocrRows = [
    {
      ...ocrRow,
      renderRight: ({ readonly }: { readonly: boolean }) => (
        <PrefRentOcrFields
          idPrefix={ID_PREFIX}
          formRowIndex={0}
          wireRow={wireRow}
          legalRent={formState.row0LegalRent}
          prefRent={formState.row0PrefRent}
          noPrefRent={formState.row0NoPrefRent}
          readonly={readonly}
          noPrefRentLabel={NO_PREF_RENT_LABEL}
          fieldKeys={PREF_RENT_OCR_FIELD_KEYS}
          onFormStateChange={(patch) =>
            onFormStateChange(patch as Partial<Prefrent421aFormState>)
          }
        />
      ),
    },
  ];

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
