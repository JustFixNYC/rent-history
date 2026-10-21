import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { OverchargeExpiredleasePosthstpaCurrTenantFormState } from "./answers";
import { ROW_INDEX } from "./spec";

const ID_PREFIX = "overcharge-expiredlease-posthstpa-curr-tenant";

export type OverchargeExpiredleasePosthstpaCurrTenantGetStepsBindings = {
  finding: Finding;
  formState: OverchargeExpiredleasePosthstpaCurrTenantFormState;
  onFormStateChange: (
    patch: Partial<OverchargeExpiredleasePosthstpaCurrTenantFormState>
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
  bindings: OverchargeExpiredleasePosthstpaCurrTenantGetStepsBindings
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
  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          intro={
            <OcrConfirmIntro
              years={ocrRows.map((row) => row.regYear)}
            />
          }
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
