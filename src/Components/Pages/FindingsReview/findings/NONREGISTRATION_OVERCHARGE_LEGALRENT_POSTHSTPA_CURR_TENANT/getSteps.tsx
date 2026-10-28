import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

const ID_PREFIX = "nonregistration-overcharge-legalrent-posthstpa-curr-tenant";

export type NonregistrationOverchargeLegalrentPosthstpaCurrTenantGetStepsBindings =
  {
    finding: Finding;
    formState: NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState;
    onFormStateChange: (
      patch: Partial<NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState>
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
  bindings: NonregistrationOverchargeLegalrentPosthstpaCurrTenantGetStepsBindings
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
    idPrefix: ID_PREFIX,
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
